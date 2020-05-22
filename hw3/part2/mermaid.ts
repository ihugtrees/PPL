import { Parsed, isProgram, isAtomicExp, isCompoundExp, AtomicExp, isNumExp, isBoolExp, isStrExp, isPrimOp, isVarRef, Exp, isAppExp, DefineExp, isDefineExp, isIfExp, isProcExp, isLetExp, isLetrecExp, isLitExp, isSetExp, Program, LitExp, CExp, isVarDecl, ProcExp, isExp, VarDecl } from "./L4-ast";
import { Result, bind, makeOk, mapResult, makeFailure } from "../shared/result";
import { Graph, GraphContent, makeGraph, makeDir, CompoundGraph, makeCompoundGraph, AtomicGraph, makeAtomicGraph, makeNodeDecl, Edge, makeNodeRef, makeEdge, Node, NodeDecl, NodeRef } from "./mermaid-ast";
import { SExpValue, isCompoundSExp } from "./L4-value";
import { map, concat } from "ramda";
import { isEmpty, rest } from "../shared/list";

export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
	bind(l4GraphContent(exp), (graphCont: GraphContent) => makeOk(makeGraph(makeDir("TD"), graphCont)))

const l4GraphContent = (exp: Parsed): Result<GraphContent> =>
	isAtomicExp(exp) ? makeAtomicTree(exp) :
		isProgram(exp) ? makeOk(makeCompoundGraph(createProgram(exp, counter("Exps")))) :
			isExp(exp) ? makeOk(makeCompoundGraph(createExp(exp, ""))) :
				// isDefineExp(exp) ? makeOk(makeCompoundGraph(createExp(exp,""))) :
				//     isAppExp(exp) ? makeOk(makeCompoundGraph(createExp(exp))) :
				//         isIfExp(exp) ? makeOk(makeCompoundGraph(createExp(exp))) :
				//             isProcExp(exp) ? makeOk(makeCompoundGraph(createExp(exp))) :
				//                 isLetExp(exp) ? makeOk(makeCompoundGraph(createExp(exp))) :
				//                     isLetrecExp(exp) ? makeOk(makeCompoundGraph(createExp(exp))) :
				//                         isLitExp(exp) ? makeOk(makeCompoundGraph(createExp(exp))) :
				//                             isSetExp(exp) ? makeOk(makeCompoundGraph(createExp(exp))) :
				makeFailure("error")

const makeAtomicTree = (exp: AtomicExp): Result<AtomicGraph> =>
	isNumExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(counter("number"), `number("${exp.val}")`))) :
		isBoolExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(counter("boolean"), `boolean("${exp.val}")`))) :
			isStrExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(counter("string"), `string("${exp.val}")`))) :
				isPrimOp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(counter("PrimOp"), `PrimOp("${exp.op}")`))) :
					isVarRef(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(counter("VarRef"), `VarRef("${exp.var}")`))) :
						makeFailure("atomic tree failure")


const createProgram = (prog: Program, expsId: string): Edge[] =>
	makeEdge(makeNodeDecl(counter("program"), "Program"), makeNodeDecl(expsId, ":"), "exps").concat(concatAll(map(createExp, prog.exps)))

const concatAll = (array: Edge[][]): Edge[] =>
	array.reduce(concat, [])

const createExp = (exp: Exp | SExpValue, father: string): Edge[] => {
	isDefineExp(exp) ? createDefine(exp, father) :
		isProcExp(exp) ? createProc(exp, counter("ProcExp"), counter("Params")) :
			isLitExp(exp) ? createLit(exp) :
				undefined
}

const createDefine = (exp: DefineExp, father: string): Edge[] =>
	father === "" ? [makeEdge(
		makeNodeDecl(counter("DefineExp"), "DefineExp"), 
		makeNodeDecl(counter("Var"), `[VarDecl(${exp.var.var})]`), "var")].concat(
			[makeEdge(
				makeNodeRef(getCounter("DefineExp")), 
				makeNodeDecl(counter(exp.val.tag), exp.val.tag), "val")]).concat(
					createExp(exp.val, getCounter(exp.val.tag))) :
		[makeEdge(
			makeNodeRef(father),
			makeNodeDecl(counter(exp.tag), "DefineExp"))].concat(
				[makeEdge(
					makeNodeRef(getCounter(exp.tag)), 
					makeNodeDecl(counter("Var"), `[VarDecl(${exp.var.var})]`), "var")]).concat(
						[makeEdge(
							makeNodeRef(getCounter(exp.tag)), 
							createNodeDecl(exp.val), "val")]).concat(
								createExp(exp.val, getCounter(exp.val.tag)))

const createProc = (exp: ProcExp, id: string, paramsID: string): Edge[] =>
	[makeEdge(makeNodeDecl(id, "ProcExp"), makeNodeDecl(paramsID, ":"), "args")].concat([makeEdge(makeNodeRef(id), createNodeDecl(exp.body[0]), ":")]).concat(createVarDeclList(exp.args, paramsID)).concat(concatAll(map(createExp, exp.body)))

const createLit = (exp: LitExp): Edge[] =>
	[makeEdge(createNodeDecl(exp), createNodeDecl(exp.val), "val")].concat(createExp(exp.val.toString))

const createVarDeclList = (vars: VarDecl[], id: string): Edge[] =>
	isEmpty(vars) ? [] :
		[makeEdge(makeNodeRef(id), makeNodeDecl(counter("Var"), `[VarDecl(${vars[0].var})]`))].concat(createVarDeclList(rest(vars), id))

const createNodeDecl = (exp: CExp | SExpValue): NodeDecl => {
	isLitExp(exp) ? makeNodeDecl(counter("LitExp"), "LitExp") :
		isCompoundSExp(exp) ? makeNodeDecl(counter("CompoundSExp"), "CompoundSExp") :
			undefined
}

let count: number = 0;
let Program: number = 0;
let Exps: number = 0;
let PrimOp: number = 0;
let VarRef: number = 0;
let VarDecl: number = 0;
let AppExp: number = 0;
let LitExp: number = 0;

export const counter = (s: string): string => {
	switch (s) {
		case "Program": Program++; count = Program
		case "Exps": Exps++; count = Exps
		case "PrimOp": PrimOp++; count = PrimOp
		case "VarRef": VarRef++; count = VarRef
		case "VarDecl": VarDecl++; count = VarDecl
		case "AppExp": AppExp++; count = AppExp
		case "LitExp": LitExp++; count = LitExp
			break;
		default:
			break;
	}

	return `${s}__${count}`
}

export const getCounter = (s: string): string => {
	switch (s) {
		case "Program": count = Program
		case "Exps": count = Exps
		case "PrimOp": count = PrimOp
		case "VarRef": count = VarRef
		case "VarDecl": count = VarDecl
		case "AppExp": count = AppExp
		case "LitExp": count = LitExp
			break;
		default:
			break;
	}

	return `${s}__${count}`
}