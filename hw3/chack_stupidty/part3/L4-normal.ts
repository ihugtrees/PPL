// ========================================================
// L4 normal eval
import { Sexp } from "s-expression";
import { map } from "ramda";
import { CExp, Exp, IfExp, Program, parseL4Exp, DefineExp, Binding, isLetExp, ProcExp, VarDecl, LetExp } from "./L4-ast";
import { isAppExp, isBoolExp, isCExp, isDefineExp, isIfExp, isLitExp, isNumExp,
         isPrimOp, isProcExp, isStrExp, isVarRef } from "./L4-ast";
import { applyEnv, makeEmptyEnv, Env, makeExtEnv, myPair, isPair, makeMyPair } from './L4-env-normal';
import { applyPrimitive } from "./evalPrimitive";
import { isClosure, makeClosure, Value, Closure } from "./L4-value";
import { first, rest, isEmpty } from '../shared/list';
import { Result, makeOk, makeFailure, bind, mapResult, safe2 } from "../shared/result";
import { parse as p } from "../shared/parser";

export const L4normalEval = (exp: CExp, env: Env): Result<Value> =>
    isBoolExp(exp) ? makeOk(exp.val) :
    isNumExp(exp) ? makeOk(exp.val) :
    isStrExp(exp) ? makeOk(exp.val) :
    isPrimOp(exp) ? makeOk(exp) :
    isLitExp(exp) ? makeOk(exp.val) :
    isVarRef(exp) ? bind( applyEnv(env, exp.var) , (cexpOrPair:CExp | myPair) => 
        isCExp(cexpOrPair) ? L4normalEval(cexpOrPair , env) :       //regular cexp
        L4normalEval(cexpOrPair.cexp , cexpOrPair.env) )         :                       //pair
    isIfExp(exp) ? evalIf(exp, env) :
    isLetExp(exp) ? evalLet(exp, env) :
    isProcExp(exp) ? makeOk(makeClosure(exp.args, exp.body, env)) :
    // This is the difference between applicative-eval and normal-eval
    // Substitute the arguments into the body without evaluating them first.
    isAppExp(exp) ? bind(L4normalEval(exp.rator, env), proc => L4normalApplyProc(proc, exp.rands, env)) :
    makeFailure(`Bad ast: ${exp}`);


export const evalIf = (exp: IfExp, env: Env): Result<Value> =>
bind(L4normalEval(exp.test, env),
        test => isTrueValue(test) ? L4normalEval(exp.then, env) : L4normalEval(exp.alt, env));


export const evalExps = (exps: Exp[], env: Env): Result<Value> =>
isEmpty(exps) ? makeFailure("Empty program") :
isDefineExp(first(exps)) ? evalDefineExps(first(exps), rest(exps), env) :
evalCExps(first(exps), rest(exps), env);


export const evalCExps = (exp1: Exp, exps: Exp[], env: Env): Result<Value> =>
    isCExp(exp1) && isEmpty(exps) ? L4normalEval(exp1, env) :
    isCExp(exp1) ? bind(L4normalEval(exp1, env), _ => evalExps(exps, env)) :
    makeFailure("Never");


export const evalDefineExps = (def: Exp, exps: Exp[], env: Env): Result<Value> =>
    isDefineExp(def) ? evalExps(exps, makeExtEnv([def.var.var] , [def.val], env)) :
    makeFailure("Unexpected " + def);

export const evalLet = (exp: LetExp, env: Env): Result<Value> =>
    evalExps(exp.body, makeExtEnv(map((exp1: Binding) => exp1.var.var, exp.bindings), map((exp1: Binding) => exp1.val, exp.bindings), env));


export const L4normalApplyProc = (proc: Value, args: CExp[], env: Env): Result<Value> =>
    isPrimOp(proc) ? bind(mapResult((arg) => L4normalEval(arg, env), args), (args: Value[]) => applyPrimitive(proc, args)) :
    isClosure(proc) ? 
    evalExps(proc.body, makeExtEnv( map( (varDec: VarDecl) => varDec.var , proc.params ),
        map(( arg: CExp) => makeMyPair(arg, env),args) ,             //args
        proc.env)) :
    makeFailure(`Bad proc applied ${proc}`);


//applicative copy past starts here :

export const evalNormalProgram = (program: Program): Result<Value> =>
    evalExps(program.exps, makeEmptyEnv());

export const evalNormalParse = (s: string): Result<Value> =>
    bind(p(s),
        (parsed: Sexp) => bind(parseL4Exp(parsed),
            (exp: Exp) => evalExps([exp], makeEmptyEnv())));


export const isTrueValue = (x: Value): boolean =>
! (x === false);

// Evaluate a sequence of expressions (in a program)
export const evalSequence = (seq: Exp[], env: Env): Result<Value> =>
    isEmpty(seq) ? makeFailure("Empty sequence") :
    isDefineExp(first(seq)) ? evalDefineExps(first(seq), rest(seq), env) :
    evalCExps(first(seq), rest(seq), env);
