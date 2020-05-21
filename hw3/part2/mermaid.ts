import { Parsed, isProgram, isAtomicExp, isCompoundExp, AtomicExp, isNumExp, isBoolExp, isStrExp, isPrimOp, isVarRef, Exp, isAppExp, DefineExp, isDefineExp, isIfExp, isProcExp, isLetExp, isLetrecExp, isLitExp, isSetExp, Program, LitExp, CExp } from "./L4-ast";
import { Result, bind, makeOk, mapResult, makeFailure } from "../shared/result";
import { Graph, GraphContent, makeGraph, makeDir, CompoundGraph, makeCompoundGraph, AtomicGraph, makeAtomicGraph, makeNodeDecl, Edge, makeNodeRef, makeEdge, Node, NodeDecl } from "./mermaid-ast";
import { is } from "ramda";
import { SExpValue } from "./L4-value";


export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
    bind(l4GraphContent(exp), (graphCont: GraphContent) => makeOk(makeGraph(makeDir("TD"), graphCont)))


const l4GraphContent = (exp: Parsed): Result<GraphContent> =>
    isAtomicExp(exp) ? makeAtomicTree(exp) :
        isProgram(exp) ? makeOk(makeCompoundGraph(createProgram(exp))) :
            isDefineExp(exp) ? makeOk(makeCompoundGraph(createExp(exp))) :
                isAppExp(exp) ? makeOk(makeCompoundGraph(createApp(exp))) :
                    isIfExp(exp) ? makeOk(makeCompoundGraph(createIf(exp))) :
                        isProcExp(exp) ? makeOk(makeCompoundGraph(createProc(exp))) :
                            isLetExp(exp) ? makeOk(makeCompoundGraph(createLet(exp))) :
                                isLetrecExp(exp) ? makeOk(makeCompoundGraph(createLetrec(exp))) :
                                    isLitExp(exp) ? makeOk(makeCompoundGraph(createLit(exp))) :
                                        isSetExp(exp) ? makeOk(makeCompoundGraph(createSet(exp))) :
                                            makeFailure("error")


const makeAtomicTree = (exp: AtomicExp): Result<AtomicGraph> =>
    isNumExp(exp) ? makeOk(makeAtomicGraph(makeNodeDec(counter("number"), `number("${exp.val}")`))) :
        isBoolExp(exp) ? makeOk(makeAtomicGraph(makeNodeDec(counter("boolean"), `boolean("${exp.val}")`))) :
            isStrExp(exp) ? makeOk(makeAtomicGraph(makeNodeDec(counter("string"), `string("${exp.val}")`))) :
                isPrimOp(exp) ? makeOk(makeAtomicGraph(makeNodeDec(counter("PrimOp"), `PrimOp("${exp.op}")`))) :
                    isVarRef(exp) ? makeOk(makeAtomicGraph(makeNodeDec(counter("VarRef"), `VarRef("${exp.var}")`))) :
                        makeFailure("atomic tree failure")

//const createProgram = (exp: Program: (s: string) => string): Edge[] =>

const createExp = (exp: Exp | SExpValue): Edge[] => {
    isDefineExp(exp) ? createDefine(exp) :
        isLitExp(exp) ? createLit(exp) :
            undefined
}

const createDefine = (exp: DefineExp): Edge[] => {
    let id: string = counter("Define")
    let lnode: Node = makeNodeDecl(id, "DefineExp")
    let rnode: Node = makeNodeDecl(counter("Var"), `[VarDecl(${exp.var})]`)
    let edges: Edge[] = [makeEdge(lnode, rnode, "-->|var|")]

    let lnode1: Node = makeNodeRef(id)
    let rnode1: Node = createAtomicNode(exp.val,id)

    edges.concat([makeEdge(lnode1, rnode1, "-->|val|")])
    return edges.concat(createExp(exp.val))
}

const createLit = (exp: LitExp): Edge[] => {
    let lnode: Node = makeNodeDecl(counter("Define"), "DefineExp")
    let rnode: Node = makeNodeDecl(counter("Var"), `[VarDecl(${exp.var})]`)
    let edges: Edge[] = [makeEdge(lnode, rnode, "-->|var|")]
    return edges.concat(createExp(exp.val))
}

const createAtomicNode = (exp: CExp): NodeDecl => {
    isLitExp(exp) ? makeNodeDecl(counter("LitExp"), "LitExp") :
    undefined
}


export const counter = (s: string): string => {
    let count: number = 0;
    let Program: number = 0;
    let Exps: number = 0;
    let PrimOp: number = 0;
    let VarRef: number = 0;
    let VarDecl: number = 0;
    let AppExp: number = 0;
    let LitExp: number = 0;

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