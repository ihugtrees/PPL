import { Parsed } from "./L4-ast";
import { Result } from "../shared/result";


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
export const makeGraph = (dir: Dir, content: GraphContent) => ({ tag: "Graph", dir: dir, content: content });
export const makeDir = (direction: string) => ({ tag: "Dir", direction: direction + "\n" })
export const makeAtomicGraph = (nodeDecl: NodeDecl) => ({ tag: "AtomicGraph", nodeDecl: nodeDecl });
export const makeCompoundGraph = (edges: Edge[]) => ({ tag: "CompoundGraph", edges: edges });
export const makeEdge = (from: Node, to: Node, label?: string) => ({ tag: "Edge", from: from, to: to, label: label + "\n" });
export const makeNodeDecl = (id: string, label: string) => ({ tag: "NodeDecl", id: id, label: label });
export const makeNodeRef = (id: string) => ({ tag: "NodeRef", id: id });

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

export const makeVarGen = (): (v: string) => string => {
    let count: number = 0;
    return (v: string) => {
        count++;
        return `${v}__${count}`;
    };
};

export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>{}


export const unparseMermaid = (exp: Graph): Result<string> =>{}


export const L4toMermaid = (concrete: string): Result<string> =>{}
