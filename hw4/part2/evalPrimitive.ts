import { PrimOp } from "./L5-ast";
import { Value, isSymbolSExp, isCompoundSExp, makeCompoundSExp, makeEmptySExp, isEmptySExp, CompoundSExp, EmptySExp, makeValuesSExp, ValuesSExp } from "./L5-value";
import { Result, makeFailure, makeOk } from "../shared/result";
import { allT, first, rest } from "../shared/list";
import { isNumber, isString, isBoolean } from "../shared/type-predicates";
import { reduce } from "ramda";

export const applyPrimitive = (proc: PrimOp, args: Value[]): Result<Value> =>
    proc.op === "+" ? (allT(isNumber, args) ? makeOk(reduce((x, y) => x + y, 0, args)) : makeFailure("+ expects numbers only")) :
        proc.op === "-" ? minusPrim(args) :
            proc.op === "*" ? (allT(isNumber, args) ? makeOk(reduce((x, y) => x * y, 1, args)) : makeFailure("* expects numbers only")) :
                proc.op === "/" ? divPrim(args) :
                    proc.op === ">" ? makeOk(args[0] > args[1]) :
                        proc.op === "<" ? makeOk(args[0] < args[1]) :
                            proc.op === "=" ? makeOk(args[0] === args[1]) :
                                proc.op === "not" ? makeOk(!args[0]) :
                                    proc.op === "eq?" ? makeOk(eqPrim(args)) :
                                        proc.op === "string=?" ? makeOk(args[0] === args[1]) :
                                            proc.op === "cons" ? makeOk(consPrim(args[0], args[1])) :
                                                proc.op === "car" ? carPrim(args[0]) :
                                                    proc.op === "cdr" ? cdrPrim(args[0]) :
                                                        proc.op === "list" ? makeOk(listPrim(args)) :
                                                            proc.op === "list?" ? makeOk(isListPrim(args[0])) :
                                                                proc.op === "pair?" ? makeOk(isPairPrim(args[0])) :
                                                                    proc.op === "number?" ? makeOk(typeof (args[0]) === 'number') :
                                                                        proc.op === "boolean?" ? makeOk(typeof (args[0]) === 'boolean') :
                                                                            proc.op === "symbol?" ? makeOk(isSymbolSExp(args[0])) :
                                                                                proc.op === "string?" ? makeOk(isString(args[0])) :
                                                                                    proc.op === "values" ? makeOk(valuesPrim(args)) :
                                                                                        // display, newline
                                                                                        makeFailure("Bad primitive op " + proc.op);

const consPrim = (v1: Value, v2: Value): CompoundSExp =>
    makeCompoundSExp(v1, v2);

const valuesPrim = (v1: Value[]): ValuesSExp =>
    makeValuesSExp(v1);

const minusPrim = (args: Value[]): Result<number> => {
    // TODO complete
    const x = args[0], y = args[1];
    if (isNumber(x) && isNumber(y)) {
        return makeOk(x - y);
    } else {
        return makeFailure(`Type error: - expects numbers ${args}`)
    }
}

const divPrim = (args: Value[]): Result<number> => {
    // TODO complete
    const x = args[0], y = args[1];
    if (isNumber(x) && isNumber(y)) {
        return makeOk(x / y);
    } else {
        return makeFailure(`Type error: / expects numbers ${args}`)
    }
}

const eqPrim = (args: Value[]): boolean => {
    const x = args[0], y = args[1];
    if (isSymbolSExp(x) && isSymbolSExp(y)) {
        return x.val === y.val;
    } else if (isEmptySExp(x) && isEmptySExp(y)) {
        return true;
    } else if (isNumber(x) && isNumber(y)) {
        return x === y;
    } else if (isString(x) && isString(y)) {
        return x === y;
    } else if (isBoolean(x) && isBoolean(y)) {
        return x === y;
    } else {
        return false;
    }
}

const carPrim = (v: Value): Result<Value> =>
    isCompoundSExp(v) ? makeOk(v.val1) :
        makeFailure(`Car: param is not compound ${v}`);

const cdrPrim = (v: Value): Result<Value> =>
    isCompoundSExp(v) ? makeOk(v.val2) :
        makeFailure(`Cdr: param is not compound ${v}`);

export const listPrim = (vals: Value[]): EmptySExp | CompoundSExp =>
    vals.length === 0 ? makeEmptySExp() :
        makeCompoundSExp(first(vals), listPrim(rest(vals)))

const isListPrim = (v: Value): boolean =>
    isEmptySExp(v) || isCompoundSExp(v);

const isPairPrim = (v: Value): boolean =>
    isCompoundSExp(v);

