import { Parsed, isProgram, Program, CExp, Exp, isDefineExp, isNumExp, isAtomicExp, AtomicExp, isBoolExp, isStrExp, isPrimOp, isVarRef, isCompoundExp, isProcExp } from "./L4-ast";
import { Result, makeOk, bind, mapResult, makeFailure } from "../shared/result";
import { is } from "ramda";


export type GraphContent = AtomicGraph | CompoundGraph;
export type Node = NodeDecl | NodeRef;

export interface Graph { tag: "Graph"; dir: Dir; content: GraphContent; }
export interface Dir { tag: "Dir"; direction: string; }
export interface AtomicGraph { tag: "AtomicGraph"; nodeDecl: NodeDecl; }
export interface CompoundGraph { tag: "CompoundGraph"; edges: Edge[]; }
export interface Edge { tag: "Edge"; from: Node; to: Node; label?: string; }
export interface NodeDecl { tag: "NodeDecl"; id: string; label: string; }
export interface NodeRef { tag: "NodeRef"; id: string; }

//make
export const makeGraph = (dir: Dir, content: GraphContent): Graph => ({ tag: "Graph", dir: dir, content: content });
export const makeDir = (direction: string): Dir => ({ tag: "Dir", direction: direction + "\n" })
export const makeAtomicGraph = (nodeDecl: NodeDecl): AtomicGraph => ({ tag: "AtomicGraph", nodeDecl: nodeDecl });
export const makeCompoundGraph = (edges: Edge[]): CompoundGraph => ({ tag: "CompoundGraph", edges: edges });
export const makeEdge = (from: Node, to: Node, label?: string): Edge => ({ tag: "Edge", from: from, to: to, label: label + "\n" });
export const makeNodeDecl = (id: string, label: string): NodeDecl => ({ tag: "NodeDecl", id: id, label: label });
export const makeNodeRef = (id: string): NodeRef => ({ tag: "NodeRef", id: id });

//is
export const isGraph = (x: any): x is Graph => x.tag === "Graph";
export const isDir = (x: any): x is Dir => x.tag === "Dir";
export const isAtomicGraph = (x: any): x is AtomicGraph => x.tag === "AtomicGraph";
export const isCompoundGraph = (x: any): x is CompoundGraph => x.tag === "CompoundGraph";
export const isEdge = (x: any): x is Edge => x.tag === "Edge";
export const isNodeDecl = (x: any): x is NodeDecl => x.tag === "NodeDecl";
export const isNodeRef = (x: any): x is NodeRef => x.tag === "NodeRef";

// Type predicates for type unions
export const isGraphContent = (x: any): x is GraphContent => isAtomicGraph(x) || isCompoundGraph(x);
export const isNode = (x: any): x is Node => isNodeDecl(x) || isNodeRef(x);

export const makeGen = (): (v: string) => string => {
	let Program: number = 0;
	let Exps: number = 0;
	let PrimOp: number = 0;
	let VarRef: number = 0;
	let VarDecl: number = 0;
	let AppExp: number = 0;
	let count: number = 0;

	return (v: string) => {
		switch (v) {
			case "Program": Program++; count = Program;
			case "Exps": Exps++; count = Exps;
			case "PrimOp": PrimOp++; count = PrimOp;
			case "VarRef": VarRef++; count = VarRef;
			case "VarDecl": VarDecl++; count = VarDecl;
			case "AppExp": AppExp++; count = AppExp;
				break;
			default:
				break;
		}
		return `${v}__${count}`;
	};
};


export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
	bind(l4GraphContent(exp), (graphCont: GraphContent) => makeOk(makeGraph(makeDir("TD"), graphCont)))


const l4GraphContent = (exp: Parsed): Result<GraphContent> =>
	isProgram(exp) ? bind(mapResult(makeCompoundTree, exp.exps), (edges: CompoundGraph[]) => makeOk(makeCompoundGraph(edges))) :
		isAtomicExp(exp) ? makeAtomicTree(exp) : 
		isCompoundExp(exp) ?  makeFailure("some error")


const makeAtomicTree = (exp: AtomicExp): Result<AtomicGraph> =>
	isNumExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeGen()("number"), `number("${exp.val}")`))) :
		isBoolExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeGen()("boolean"), `boolean("${exp.val}")`))) :
			isStrExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeGen()("number"), `string("${exp.val}")`))) :
				isPrimOp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeGen()("number"), `PrimOp("${exp.op}")`))) :
					isVarRef(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeGen()("number"), `VarRef("${exp.var}")`))) :
						makeFailure("atomic tree failure")

const makeCompoundTree = (exp: Exp): Result<CompoundGraph> =>
isDefineExp(exp) ? makeOk(makeCompoundGraph()) :
	isProcExp(exp) ? 















//export const unparseMermaid = (exp: Graph): Result<string> => { }


  //  export const L4toMermaid = (concrete: string): Result<string> => { }
