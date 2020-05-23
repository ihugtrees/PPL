import { Parsed, isProgram, isAtomicExp, isNumExp, isBoolExp, isStrExp, isPrimOp, isVarRef, Exp, isAppExp, DefineExp, isDefineExp, isIfExp, isProcExp, isLetExp, isLetrecExp, isLitExp, isSetExp, Program, LitExp, ProcExp, isExp, VarDecl, isBinding, AppExp, IfExp, Binding, LetExp, LetrecExp, SetExp, parseL4, parseL4Exp } from "./L4-ast";
import { Result, bind, makeOk, makeFailure, isOk } from "../shared/result";
import { Graph, GraphContent, makeGraph, makeDir, makeCompoundGraph, makeAtomicGraph, makeNodeDecl, Edge, makeNodeRef, makeEdge, isAtomicGraph, NodeDecl, NodeRef, isNodeDecl, Node } from "./mermaid-ast";
import { SExpValue, isCompoundSExp, isEmptySExp, isSymbolSExp, CompoundSExp, isClosure } from "./L4-value";
import { isEmpty, rest } from "../shared/list";
import { makeVarGen } from "../L3/substitute";
import { map } from "ramda";
import { parse as p } from "../shared/parser";

export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
	bind(l4GraphContent(exp), (graphCont: GraphContent) => makeOk(makeGraph(makeDir("TD"), graphCont)))

const l4GraphContent = (exp: Parsed): Result<GraphContent> =>
	isAtomicExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(varGenerator(exp.tag), generateNodeDeclLabel(exp)))) :
		isProgram(exp) ? makeOk(makeCompoundGraph(createProgram(exp, varGenerator("Exps")))) :
			isExp(exp) ? makeOk(makeCompoundGraph(createExpEdges(exp, ""))) :
				makeFailure("error")

const createProgram = (prog: Program, expsId: string): Edge[] =>
	[makeEdge(
		makeNodeDecl(varGenerator(prog.tag), "Program"),
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
		makeNodeDecl(varGenerator("Var"), `"VarDecl(${vardecl.var})"`))]

const generateNodeDeclLabel = (exp: Exp | SExpValue): string =>
	isNumExp(exp) ? `NumExp(${exp.val})` :
		isBoolExp(exp) ? `BoolExp(${exp.val})` :
			isStrExp(exp) ? `StrExp(${exp.val})` :
				isPrimOp(exp) ? `PrimOp(${exp.op})` :
					isVarRef(exp) ? `VarRef(${exp.var})` :
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
																isSymbolSExp(exp) ? `Symbol(${exp.val})` :
																	isCompoundSExp(exp) ? "CompoundSexp" :
																		isClosure(exp) ? "Closure" :
																			typeof (exp) === 'string' ? `string(${exp})` :
																				typeof (exp) === 'boolean' ? `boolean(${exp})` :
																					typeof (exp) === 'number' ? `number(${exp})` :
																						""

const createExpEdges = (exp: Exp | Binding, father: string): Edge[] =>
	isAtomicExp(exp) ? [] :
		isDefineExp(exp) || isBinding(exp) ? createDefineOrBinding(exp, father, varGenerator(exp.tag), varGenerator("Var"), varGenerator(exp.val.tag)) :
			isProcExp(exp) ? createProc(exp, father, varGenerator(exp.tag), varGenerator("Params"), varGenerator("Body")) :
				isAppExp(exp) ? createApp(exp, father, varGenerator(exp.tag), varGenerator(exp.rator.tag), varGenerator("Rands")) :
					isIfExp(exp) ? createIf(exp, father, varGenerator(exp.tag), varGenerator(exp.test.tag), varGenerator(exp.then.tag), varGenerator(exp.alt.tag)) :
						isLetExp(exp) || isLetrecExp(exp) ? createLet(exp, father, varGenerator(exp.tag), varGenerator("Bindings"), varGenerator("Body")) :
							isSetExp(exp) ? createSet(exp, father, varGenerator(exp.tag), varGenerator(exp.var.tag), varGenerator(exp.val.tag)) :
								isLitExp(exp) ? createLit(exp, father, varGenerator(exp.tag), sexpGenerator(exp.val)) :
									[]

const createSSExpEdges = (exp: SExpValue, father: string): Edge[] =>
	isCompoundSExp(exp) ? createCompoundSExp(exp, father, sexpGenerator(exp.val1), sexpGenerator(exp.val2)) :
		//isClosure(exp) ? createClosure
		[]

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
		makeNodeDecl(varID, `"VarDecl(${exp.var.var})"`), "var")].concat(
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
					makeNodeDecl(varID, `"VarDecl(${exp.var.var})"`), "var")],
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

const varProgram = makeVarGen();
const varDefine = makeVarGen();
const varNumExp = makeVarGen();
const varBoolExp = makeVarGen();
const varStrExp = makeVarGen();
const varPrimOp = makeVarGen();
const varVarRef = makeVarGen();
const varVarDecl = makeVarGen();
const varAppExp = makeVarGen();
const varIfExp = makeVarGen();
const varProcExp = makeVarGen();
const varBinding = makeVarGen();
const varBindings = makeVarGen();
const varLetExp = makeVarGen();
const varLitExp = makeVarGen();
const varLetrecExp = makeVarGen();
const varSetExp = makeVarGen();
const varParams = makeVarGen();
const varBody = makeVarGen();
const varCompoundExp = makeVarGen();
const varNumber = makeVarGen();
const varBoolean = makeVarGen();
const varString = makeVarGen();
const varClosure = makeVarGen();
const varSymbolSExp = makeVarGen();
const varEmptySExp = makeVarGen();
const varCompoundSExp = makeVarGen();
const varVar = makeVarGen();
const varRands = makeVarGen();

export const varGenerator = (exp: string): string =>
	exp === "ProgramExp" ? varProgram("ProgramExp") :
		exp === "DefineExp" ? varDefine("DefineExp") :
			exp === "NumExp" ? varNumExp("NumExp") :
				exp === "BoolExp" ? varBoolExp("BoolExp") :
					exp === "StrExp" ? varStrExp("StrExp") :
						exp === "PrimOp" ? varPrimOp("PrimOp") :
							exp === "VarRef" ? varVarRef("VarRef") :
								exp === "VarDecl" ? varVarDecl("VarDecl") :
									exp === "AppExp" ? varAppExp("AppExp") :
										exp === "IfExp" ? varIfExp("IfExp") :
											exp === "ProcExp" ? varProcExp("ProcExp") :
												exp === "Binding" ? varBinding("Binding") :
													exp === "Bindings" ? varBindings("Bindings") :
														exp === "LetExp" ? varLetExp("LetExp") :
															exp === "LitExp" ? varLitExp("LitExp") :
																exp === "LetrecExp" ? varLetrecExp("LetrecExp") :
																	exp === "SetExp" ? varSetExp("SetExp") :
																		exp === "Params" ? varParams("Params") :
																			exp === "Body" ? varBody("Body") :
																				exp === "CompoundExp" ? varCompoundExp("CompoundExp") :
																					exp === "Number" ? varNumber("Number") :
																						exp === "Boolean" ? varBoolean("Boolean") :
																							exp === "String" ? varString("String") :
																								exp === "Closure" ? varClosure("Closure") :
																									exp === "SymbolSExp" ? varSymbolSExp("SymbolSExp") :
																										exp === "EmptySExp" ? varEmptySExp("EmptySExp") :
																											exp === "CompoundSExp" ? varCompoundSExp("CompoundSExp") :
																												exp === "Var" ? varVar("Var") :
																													exp === "Rands" ? varRands("Rands") :
																														""

export const sexpGenerator = (exp: SExpValue): string =>
	isSymbolSExp(exp) ? varGenerator("SymbolSExp") :
		isCompoundSExp(exp) ? varGenerator("CompoundSExp") :
			isEmptySExp(exp) ? varGenerator("EmptySExp") :
				isPrimOp(exp) ? varGenerator("PrimOp") :
					isClosure(exp) ? varGenerator("Closure") :
						typeof (exp) === 'string' ? varGenerator("String") :
							typeof (exp) === 'boolean' ? varGenerator("Boolean") :
								typeof (exp) === 'number' ? varGenerator("Number") :
									""

/************************* Q2.3 *************************/

export const unparseMermaid = (exp: Graph): Result<string> =>
	makeOk(`graph ${exp.dir.direction}${unparseGraphContent(exp.content)}`)

const unparseGraphContent = (content: GraphContent): string =>
	isAtomicGraph(content) ? unparseNode(content.nodeDecl) :
		map(unparseEdge, content.edges).join(`\n`)

const unparseEdge = (edge: Edge) =>
	(edge.label == undefined) ? `${unparseNode(edge.from)}-->${unparseNode(edge.to)}` :
		`${unparseNode(edge.from)}-->|${edge.label}|${unparseNode(edge.to)}`

const unparseNode = (node: Node): string =>
	isNodeDecl(node) ? unparseNodeDecl(node) : unparseNodeRef(node)

const unparseNodeRef = (ref: NodeRef): string => `${ref.id}`

const unparseNodeDecl = (decl: NodeDecl): string => `${decl.id}["${decl.label}"]`

export const L4toMermaid = (concrete: string): Result<string> =>
	bind(bind(ExpOrProgram(concrete), mapL4toMermaid), unparseMermaid)

const ExpOrProgram = (concrete: string): Result<Parsed> => 
!isOk(parseL4(concrete)) ? bind(p(concrete), parseL4Exp) : parseL4(concrete)





