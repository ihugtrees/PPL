import { Parsed, isProgram, isAtomicExp, isCompoundExp, AtomicExp, isNumExp, isBoolExp, isStrExp, isPrimOp, isVarRef, Exp, isAppExp, DefineExp, isDefineExp, isIfExp, isProcExp, isLetExp, isLetrecExp, isLitExp, isSetExp, Program, LitExp, CExp, isVarDecl, ProcExp, isExp, VarDecl, makeVarRef, isBinding, AppExp, IfExp, Binding, LetExp, LetrecExp, SetExp } from "./L4-ast";
import { Result, bind, makeOk, mapResult, makeFailure } from "../shared/result";
import { Graph, GraphContent, makeGraph, makeDir, CompoundGraph, makeCompoundGraph, AtomicGraph, makeAtomicGraph, makeNodeDecl, Edge, makeNodeRef, makeEdge, Node, NodeDecl, NodeRef } from "./mermaid-ast";
import { SExpValue, isCompoundSExp, LitSExp, isEmptySExp, isSymbolSExp, EmptySExp, SymbolSExp, CompoundSExp, isSExp, isClosure } from "./L4-value";
import { map, concat } from "ramda";
import { isEmpty, rest } from "../shared/list";
import { makeVarGen } from "../L3/substitute";
import { createInflate } from "zlib";

export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
	bind(l4GraphContent(exp), (graphCont: GraphContent) => makeOk(makeGraph(makeDir("TD"), graphCont)))

const l4GraphContent = (exp: Parsed): Result<GraphContent> =>
	isAtomicExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeVar(exp.tag), generateNodeDeclLabel(exp)))) :
		isProgram(exp) ? makeOk(makeCompoundGraph(createProgram(exp, makeVar("Exps")))) :
			isExp(exp) ? makeOk(makeCompoundGraph(createExpEdges(exp, ""))) :
				makeFailure("error")

const createProgram = (prog: Program, expsId: string): Edge[] =>
	[makeEdge(
		makeNodeDecl(makeVar(prog.tag), "Program"),
		makeNodeDecl(expsId, ":"), "Exps")].concat(
			listLoop(prog.exps, expsId))

const listLoop = (exps: Exp[], father: string): Edge[] =>
	isEmpty(exps) ? [] : createExpEdges(exps[0], father).concat(listLoop(rest(exps), father))

const listLoopBinding = (exps: Binding[], father: string): Edge[] =>
	isEmpty(exps) ? [] : createExpEdges(exps[0], father).concat(listLoopBinding(rest(exps), father))

const listLoopVarDecl = (vars: VarDecl[], father: string): Edge[] =>
	isEmpty(vars) ? [] : createVarDeclEdge(vars[0], father).concat(listLoopVarDecl(rest(vars), father))

const createVarDeclEdge = (vardecl: VarDecl, id: string): Edge[] =>
	[makeEdge(
		makeNodeRef(id),
		makeNodeDecl(makeVar("Var"), `"VarDecl(${vardecl.var})"`))]

const generateNodeDeclLabel = (exp: Exp | SExpValue): string =>
	isNumExp(exp) ? `"number(${exp.val})"` :
		isBoolExp(exp) ? `"boolean(${exp.val})"` :
			isStrExp(exp) ? `"string(${exp.val})"` :
				isPrimOp(exp) ? `"PrimOp(${exp.op})"` :
					isVarRef(exp) ? `"VarRef(${exp.var})"` :
						isDefineExp(exp) ? "DefineExp" :
							isProcExp(exp) ? "ProcExp" :
								isAppExp(exp) ? "AppExp" :
									isLitExp(exp) ? "LitExp" :
										isIfExp(exp) ? "IfExp" :
											isLetExp(exp) ? "LetExp" :
												isLetrecExp(exp) ? "LetrecExp" :
													isSetExp(exp) ? "SetExp" :
														isBinding(exp) ? "Binding" :
															isEmptySExp(exp) ? "EmptySExp" :
																isSymbolSExp(exp) ? "SymbolSExp" :
																	isCompoundSExp(exp) ? "CompoundSexp" :
																		isClosure(exp) ? "Closure" :
																			""

const createExpEdges = (exp: Exp | Binding, father: string): Edge[] =>
	isAtomicExp(exp) ? [] :
		isDefineExp(exp) || isBinding(exp) ? createDefineOrBinding(exp, father, makeVar(exp.tag), makeVar("Var"), makeVar(exp.val.tag)) :
			isProcExp(exp) ? createProc(exp, father, makeVar(exp.tag), makeVar("Params"), makeVar("Body")) :
				isAppExp(exp) ? createApp(exp, father, makeVar(exp.tag), makeVar(exp.rator.tag), makeVar("Rands")) :
					isIfExp(exp) ? createIf(exp, father, makeVar(exp.tag), makeVar(exp.test.tag), makeVar(exp.then.tag), makeVar(exp.alt.tag)) :
						isLetExp(exp) || isLetrecExp(exp) ? createLet(exp, father, makeVar(exp.tag), makeVar("Bindings"), makeVar("Body")) :
							isSetExp(exp) ? createSet(exp, father, makeVar(exp.tag), makeVar("VarRef"), makeVar(exp.val.tag)) :
								isLitExp(exp) ? createLit(exp, father, makeVar(exp.tag), sexpGenerator(exp.val)) :
									[]

const createSSExpEdges = (exp: SExpValue, father: string): Edge[] =>
	isEmptySExp(exp) ? [] :
		isSymbolSExp(exp) ? createSymbolSExp(exp, father, sexpGenerator(exp.tag)) :
			isCompoundSExp(exp) ? createCompoundSExp(exp, father, sexpGenerator(exp.val1), sexpGenerator(exp.val2)) :
				[]

const createSymbolSExp = (exp: SymbolSExp, father: string, ID: string): Edge[] =>
	[makeEdge(
		makeNodeRef(father),
		makeNodeDecl(ID, exp.val))
	]

const createCompoundSExp = (exp: CompoundSExp, father: string, ID1: string, ID2: string): Edge[] =>
	[makeEdge(
		makeNodeRef(father),
		makeNodeDecl(ID1, generateNodeDeclLabel(exp.val1)), "val1"),
	makeEdge(
		makeNodeRef(father),
		makeNodeDecl(ID2, generateNodeDeclLabel(exp.val2)), "val2")
	].concat(createSSExpEdges(exp.val1, ID1), createSSExpEdges(exp.val2, ID2))

const createLit = (exp: LitExp, father: string, ID: string, sexpID: string): Edge[] =>
	father === "" ? [makeEdge(
		makeNodeDecl(ID, "LitExp"),
		makeNodeDecl(sexpID, generateNodeDeclLabel(exp.val)), "val")].concat(createSSExpEdges(exp.val, sexpID))
		:
		[makeEdge(
			makeNodeRef(father),
			makeNodeDecl(ID, "LitExp")),
		makeEdge(
			makeNodeRef(ID),
			makeNodeDecl(sexpID, generateNodeDeclLabel(exp.val)), "val")].concat(createSSExpEdges(exp.val, sexpID))

const createSet = (exp: SetExp, father: string, ID: string, varrefID: string, valID: string): Edge[] =>
	father === "" ? [makeEdge(
		makeNodeDecl(ID, "SetExp"),
		makeNodeDecl(varrefID, generateNodeDeclLabel(exp.var)), "var")].concat(
			[makeEdge(
				makeNodeRef(ID),
				makeNodeDecl(valID, generateNodeDeclLabel(exp.val)), "val")]).concat(
					createExpEdges(exp.val, valID))
		:
		[makeEdge(
			makeNodeRef(father),
			makeNodeDecl(ID, "SetExp"))].concat(
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(varrefID, generateNodeDeclLabel(exp.var)), "var")],
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(valID, generateNodeDeclLabel(exp.val)), "val")]).concat(
						createExpEdges(exp.val, valID))

const createLet = (exp: LetExp | LetrecExp, father: string, ID: string, bindingID: string, bodyID: string): Edge[] =>
	father === "" ? [makeEdge(
		(isLetExp(exp) ? makeNodeDecl(ID, "LetExp") : makeNodeDecl(ID, "LetrecExp")),
		makeNodeDecl(bindingID, ":"), "bindings")].concat(
			[makeEdge(
				makeNodeRef(ID),
				makeNodeDecl(bodyID, ":"), "body")]).concat(
					listLoopBinding(exp.bindings, bindingID), listLoop(exp.body, bodyID))
		:
		[makeEdge(
			makeNodeRef(father),
			(isLetExp(exp) ? makeNodeDecl(ID, "LetExp") : makeNodeDecl(ID, "LetrecExp")))].concat(
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(bindingID, ":"), "bindings")],
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(bodyID, ":"), "body")]).concat(
						listLoopBinding(exp.bindings, bindingID), listLoop(exp.body, bodyID))


const createIf = (exp: IfExp, father: string, ID: string, testID: string, thenID: string, altID: string): Edge[] =>
	father === "" ? [makeEdge(
		makeNodeDecl(ID, "IfExp"),
		makeNodeDecl(testID, generateNodeDeclLabel(exp.test)), "test")].concat(
			[makeEdge(
				makeNodeRef(ID),
				makeNodeDecl(thenID, generateNodeDeclLabel(exp.then)), "then")],
			[makeEdge(
				makeNodeRef(ID),
				makeNodeDecl(altID, generateNodeDeclLabel(exp.alt)), "alt")]).concat(
					createExpEdges(exp.test, testID), createExpEdges(exp.then, thenID), createExpEdges(exp.alt, altID)
				)
		:
		[makeEdge(
			makeNodeRef(father),
			makeNodeDecl(ID, "IfExp"))].concat(
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(testID, generateNodeDeclLabel(exp.test)), "test")],
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(thenID, generateNodeDeclLabel(exp.then)), "then")],
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(altID, generateNodeDeclLabel(exp.alt)), "alt")]).concat(
						createExpEdges(exp.test, testID), createExpEdges(exp.then, thenID), createExpEdges(exp.alt, altID)
					)

const createApp = (exp: AppExp, father: string, ID: string, ratorID: string, randID: string): Edge[] =>
	father === "" ? [makeEdge(
		makeNodeDecl(ID, "AppExp"),
		makeNodeDecl(ratorID, generateNodeDeclLabel(exp.rator)), "rator")].concat(
			[makeEdge(
				makeNodeRef(ID),
				makeNodeDecl(randID, ":"), "rands")]).concat(
					createExpEdges(exp.rator, ratorID)).concat(
						listLoop(exp.rands, randID))
		:
		[makeEdge(
			makeNodeRef(father),
			makeNodeDecl(ID, "AppExp"))].concat(
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(ratorID, generateNodeDeclLabel(exp.rator)), "rator")],
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(randID, ":"), "rands")]).concat(
						createExpEdges(exp.rator, ratorID)).concat(
							listLoop(exp.rands, randID))

const createDefineOrBinding = (exp: DefineExp | Binding, father: string, ID: string, varID: string, valID: string): Edge[] =>
	father === "" ? [makeEdge(
		(isDefineExp(exp) ? makeNodeDecl(ID, "DefineExp") : makeNodeDecl(ID, "Binding")),
		makeNodeDecl(varID, `["VarDecl(${exp.var.var})"]`), "var")].concat(
			[makeEdge(
				makeNodeRef(ID),
				makeNodeDecl(valID, generateNodeDeclLabel(exp.val)), "val")]).concat(
					createExpEdges(exp.val, valID))
		:
		[makeEdge(
			makeNodeRef(father),
			(isDefineExp(exp) ? makeNodeDecl(ID, "DefineExp") : makeNodeDecl(ID, "Binding")))].concat(
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(varID, `["VarDecl(${exp.var.var})"]`), "var")],
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(valID, generateNodeDeclLabel(exp.val)), "val")]).concat(
						createExpEdges(exp.val, valID))



const createProc = (exp: ProcExp, father: string, ID: string, paramsID: string, bodyID: string): Edge[] =>
	father === "" ? [makeEdge(
		makeNodeDecl(ID, "ProcExp"),
		makeNodeDecl(paramsID, ":"), "args")].concat(
			[makeEdge(
				makeNodeRef(ID),
				makeNodeDecl(bodyID, ":"), "body")]).concat(
					listLoopVarDecl(exp.args, paramsID), listLoop(exp.body, bodyID))
		:
		[makeEdge(
			makeNodeRef(father),
			makeNodeDecl(ID, "ProcExp"))].concat(
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(paramsID, ":"), "args")],
				[makeEdge(
					makeNodeRef(ID),
					makeNodeDecl(bodyID, ":"), "body")]).concat(
						listLoopVarDecl(exp.args, paramsID), listLoop(exp.body, bodyID))


const countProgram = makeVarGen();
const countDefine = makeVarGen();
const countNumExp = makeVarGen();
const countBoolExp = makeVarGen();
const countStrExp = makeVarGen();
const countPrimOp = makeVarGen();
const countVarRef = makeVarGen();
const countVarDecl = makeVarGen();
const countAppExp = makeVarGen();
const countIfExp = makeVarGen();
const countProcExp = makeVarGen();
const countBinding = makeVarGen();
const countLetExp = makeVarGen();
const countLitExp = makeVarGen();
const countLetrecExp = makeVarGen();
const countSetExp = makeVarGen();
const countVarID = makeVarGen();

export const sexpGenerator = (exp: SExpValue): string =>
	isSymbolSExp(exp) ? makeVar("SymbolSExp") :
		isCompoundSExp(exp) ? makeVar("CompoundSExp") :
			isEmptySExp(exp) ? makeVar("EmptySExp") :
				isPrimOp(exp) ? makeVar("PrimOp") :
					isClosure(exp) ? makeVar("Closure") :
						typeof (exp) === 'string' ? `"${exp}"` :
							typeof (exp) === 'boolean' ? `"${exp}"` :
								typeof (exp) === 'number' ? `"${exp}"` :
									""


export const makeVar = (exp: string): string =>
	exp === "ProgramExp" ? countProgram("ProgramExp") :
		exp === "DefineExp" ? countDefine("DefineExp") :
			""