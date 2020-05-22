import { Parsed, isProgram, isAtomicExp, isCompoundExp, AtomicExp, isNumExp, isBoolExp, isStrExp, isPrimOp, isVarRef, Exp, isAppExp, DefineExp, isDefineExp, isIfExp, isProcExp, isLetExp, isLetrecExp, isLitExp, isSetExp, Program, LitExp, CExp, isVarDecl, ProcExp, isExp, VarDecl, makeVarRef, isBinding } from "./L4-ast";
import { Result, bind, makeOk, mapResult, makeFailure } from "../shared/result";
import { Graph, GraphContent, makeGraph, makeDir, CompoundGraph, makeCompoundGraph, AtomicGraph, makeAtomicGraph, makeNodeDecl, Edge, makeNodeRef, makeEdge, Node, NodeDecl, NodeRef } from "./mermaid-ast";
import { SExpValue, isCompoundSExp } from "./L4-value";
import { map, concat } from "ramda";
import { isEmpty, rest } from "../shared/list";
import { makeVarGen } from "../L3/substitute";

export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
	bind(l4GraphContent(exp), (graphCont: GraphContent) => makeOk(makeGraph(makeDir("TD"), graphCont)))

const l4GraphContent = (exp: Parsed): Result<GraphContent> =>
	isAtomicExp(exp) ? makeOk(makeAtomicGraph(makeAtomicDecl(exp))) :
		isProgram(exp) ? makeOk(makeCompoundGraph(createProgram(exp, counter("Exps")))) :
			isExp(exp) ? makeOk(makeCompoundGraph(createExpEdges(exp, ""))) :
				makeFailure("error")

const makeAtomicDecl = (exp: AtomicExp): NodeDecl =>
	isNumExp(exp) ? makeNodeDecl(varMakeByTag(exp.tag), `number(${exp.val})`) :
		isBoolExp(exp) ? makeNodeDecl(varMakeByTag(exp.tag), `boolean("${exp.val}")`) :
			isStrExp(exp) ? makeNodeDecl(varMakeByTag(exp.tag), `string("${exp.val}")`) :
				isPrimOp(exp) ? makeNodeDecl(varMakeByTag(exp.tag), `PrimOp("${exp.op}")`) :
					makeNodeDecl(varMakeByTag(exp.tag), `VarRef("${exp.var}")`)


const createProgram = (prog: Program, expsId: string): Edge[] =>
	[makeEdge(
		makeNodeDecl(varMakeByTag(prog.tag), "Program"),
		makeNodeDecl(expsId, ":"), "exps")].concat(
			listLoop(prog.exps, expsId))

const listLoop = (exps: Exp[], father: string): Edge[] =>
	isEmpty(exps) ? [] : createExpEdges(exps[0], father).concat(listLoop(rest(exps), father))

const listLoopVarDecl = (vars: VarDecl[], father: string): Edge[] =>
	isEmpty(vars) ? [] : createExpEdges(vars[0], father).concat(listLoopVarDecl(rest(vars), father))

const createVarDeclEdge = (vardecl: VarDecl, id: string): Edge[] =>
	[makeEdge(
		makeNodeRef(id),
		makeNodeDecl(counter("Var"), `["VarDecl(${vardecl.var})"]`))]

const createExpEdges = (exp: Exp | SExpValue | VarDecl, father: string): Edge[] =>
	isAtomicExp(exp) ? createAtomicEdge(exp, father) :
		isDefineExp(exp) ? createDefine(exp, father, varMakeByTag("Define"), varMakeByTag("Var"), varMakeByTag(exp.val.tag)) :
			isProcExp(exp) ? createProc(exp, father, varMakeByTag(exp.tag), varMakeByTag("Params"), varMakeByTag("Body")) :
				//isLitExp(exp) 
				//isAppExp(exp) 
				//isIfExp(exp) 
				//isLetExp(exp) 
				//isLetrecExp(exp) 
				//isSetExp(exp) 
				isVarDecl(exp) ? createVarDeclEdge(exp, father) :
					[]

const createAtomicEdge = (exp: AtomicExp, father: string): Edge[] =>
	isNumExp(exp) ? [makeEdge(makeNodeRef(father), makeNodeDecl(varMakeByTag(exp.tag), `["number(${exp.val})"]`))] :
		isBoolExp(exp) ? [makeEdge(makeNodeRef(father), makeNodeDecl(varMakeByTag(exp.tag), `["boolean(${exp.val})"]`))] :
			isStrExp(exp) ? [makeEdge(makeNodeRef(father), makeNodeDecl(varMakeByTag(exp.tag), `["string(${exp.val})"]`))] :
				isPrimOp(exp) ? [makeEdge(makeNodeRef(father), makeNodeDecl(varMakeByTag(exp.tag), `["PrimOp(${exp.op})"]`))] :
					[makeEdge(makeNodeRef(father), makeNodeDecl(varMakeByTag(exp.tag), `["VarRef(${exp.var})"]`))]


const createDefine = (defineExp: DefineExp, father: string, defineID: string, varID: string, valID: string): Edge[] =>		//what if the define is atomic
	isAtomicExp(defineExp.val) ?//var or val cosema shlahem??
		father === "" ? [makeEdge(											//asumes it is not atomic
			makeNodeDecl(defineID, "DefineExp"),
			makeNodeDecl(varID, `["VarDecl(${defineExp.var.var})"]`), "var")].concat(
				[makeEdge(
					makeNodeRef(defineID),
					makeNodeDecl(valID, defineExp.val.tag), "val")]).concat(
						createExpEdges(defineExp.val, valID))
			:
			[makeEdge(
				makeNodeRef(father),
				makeNodeDecl(defineID, "DefineExp"))].concat(
					[makeEdge(
						makeNodeRef(defineID),
						makeNodeDecl(varID, `["VarDecl(${defineExp.var.var})"]`), "var")]).concat(
							[makeEdge(
								makeNodeRef(defineID),
								makeNodeDecl(valID, defineExp.val.tag), "val")]).concat(
									createExpEdges(defineExp.val, valID))
		:	//the value is atomic 
		father === "" ? [makeEdge(											//asumes it is not atomic
			makeNodeDecl(defineID, "DefineExp"),
			makeNodeDecl(varID, `["VarDecl(${defineExp.var.var})"]`), "var")].concat(
				[makeEdge(
					makeNodeRef(defineID),
					makeNodeDecl(valID, defineExp.val.tag), "val")]).concat(
						createExpEdges(defineExp.val, valID))
			:
			[makeEdge(
				makeNodeRef(father),
				makeNodeDecl(defineID, "DefineExp"))].concat(
					[makeEdge(
						makeNodeRef(defineID),
						makeNodeDecl(varID, `["VarDecl(${defineExp.var.var})"]`), "var")]).concat(
							[makeEdge(
								makeNodeRef(defineID),
								makeNodeDecl(valID, defineExp.val.tag), "val")]).concat(
									createExpEdges(defineExp.val, valID))


const createProc = (exp: ProcExp, father: string, procID: string, paramsID: string, bodyID: string): Edge[] =>
	father === "" ? [makeEdge(
		makeNodeDecl(procID, "ProcExp"),
		makeNodeDecl(paramsID, ":"), "args")].concat(
			[makeEdge(
				makeNodeRef(procID),
				makeNodeDecl(bodyID, ":"), "body")]).concat(
					listLoopVarDecl(exp.args, paramsID)).concat(
						listLoop(exp.body, bodyID))
		:
		[makeEdge(
			makeNodeRef(father),
			makeNodeDecl(procID, "ProcExp"))].concat(
				[makeEdge(
					makeNodeRef(procID),
					makeNodeDecl(paramsID, ":"), "args")]).concat(
						[makeEdge(
							makeNodeRef(procID),
							makeNodeDecl(bodyID, ":"), "body")]).concat(
								listLoopVarDecl(exp.args, paramsID)).concat(
									listLoop(exp.body, bodyID))


//const createLit = (exp: LitExp): Edge[] =>



// let count: number = 0;
// let Program: number = 0;
// let Exps: number = 0;
// let PrimOp: number = 0;
// let VarRef: number = 0;
// let VarDecl: number = 0;
// let AppExp: number = 0;
// let LitExp: number = 0;

// export const counter = (s: string): string => {
// 	switch (s) {
// 		case "Program": Program++; count = Program
// 		case "Exps": Exps++; count = Exps
// 		case "PrimOp": PrimOp++; count = PrimOp
// 		case "VarRef": VarRef++; count = VarRef
// 		case "VarDecl": VarDecl++; count = VarDecl
// 		case "AppExp": AppExp++; count = AppExp
// 		case "LitExp": LitExp++; count = LitExp
// 			break;
// 		default:
// 			break;
// 	}

// 	return `${s}__${count}`
// }

// export const getCounter = (s: string): string => {
// 	switch (s) {
// 		case "Program": count = Program
// 		case "Exps": count = Exps
// 		case "PrimOp": count = PrimOp
// 		case "VarRef": count = VarRef
// 		case "VarDecl": count = VarDecl
// 		case "AppExp": count = AppExp
// 		case "LitExp": count = LitExp
// 			break;
// 		default:
// 			break;
// 	}

// 	return `${s}__${count}`
// }

//app, let


const counterProgram = makeVarGen();
const counterDefine = makeVarGen();
const counterNumExp = makeVarGen();
const counterBoolExp = makeVarGen();
const counterStrExp = makeVarGen();
const counterPrimOp = makeVarGen();
const counterVarRef = makeVarGen();
const counterVarDecl = makeVarGen();
const counterAppExp = makeVarGen();
const counterIfExp = makeVarGen();
const counterProcExp = makeVarGen();
const counterBinding = makeVarGen();
const counterLetExp = makeVarGen();
const counterLitExp = makeVarGen();
const counterLetrecExp = makeVarGen();
const counterSetExp = makeVarGen();
const counterVarID = makeVarGen();

export const varMakeByTag = (exp: string): string =>
	exp === "ProgramExp" ? counterProgram("ProgramExp") :
		exp === "DefineExp" ? counterDefine("DefineExp") :
			"something"