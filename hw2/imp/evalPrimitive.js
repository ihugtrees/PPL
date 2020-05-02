"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const L3_value_1 = require("./L3-value");
const list_1 = require("./list");
const type_predicates_1 = require("./type-predicates");
const result_1 = require("./result");
exports.applyPrimitive = (proc, args) => proc.op === "+" ? (list_1.allT(type_predicates_1.isNumber, args) ? result_1.makeOk(ramda_1.reduce((x, y) => x + y, 0, args)) : result_1.makeFailure("+ expects numbers only")) :
    proc.op === "-" ? minusPrim(args) :
        proc.op === "*" ? (list_1.allT(type_predicates_1.isNumber, args) ? result_1.makeOk(ramda_1.reduce((x, y) => x * y, 1, args)) : result_1.makeFailure("* expects numbers only")) :
            proc.op === "/" ? divPrim(args) :
                proc.op === ">" ? result_1.makeOk(args[0] > args[1]) :
                    proc.op === "<" ? result_1.makeOk(args[0] < args[1]) :
                        proc.op === "=" ? result_1.makeOk(args[0] === args[1]) :
                            proc.op === "not" ? result_1.makeOk(!args[0]) :
                                proc.op === "and" ? type_predicates_1.isBoolean(args[0]) && type_predicates_1.isBoolean(args[1]) ? result_1.makeOk(args[0] && args[1]) : result_1.makeFailure('Arguments to "and" not booleans') :
                                    proc.op === "or" ? type_predicates_1.isBoolean(args[0]) && type_predicates_1.isBoolean(args[1]) ? result_1.makeOk(args[0] || args[1]) : result_1.makeFailure('Arguments to "or" not booleans') :
                                        proc.op === "eq?" ? result_1.makeOk(eqPrim(args)) :
                                            proc.op === "string=?" ? result_1.makeOk(args[0] === args[1]) :
                                                proc.op === "cons" ? result_1.makeOk(consPrim(args[0], args[1])) :
                                                    proc.op === "car" ? carPrim(args[0]) :
                                                        proc.op === "cdr" ? cdrPrim(args[0]) :
                                                            proc.op === "list" ? result_1.makeOk(exports.listPrim(args)) :
                                                                proc.op === "pair?" ? result_1.makeOk(isPairPrim(args[0])) :
                                                                    proc.op === "number?" ? result_1.makeOk(typeof (args[0]) === 'number') :
                                                                        proc.op === "boolean?" ? result_1.makeOk(typeof (args[0]) === 'boolean') :
                                                                            proc.op === "symbol?" ? result_1.makeOk(L3_value_1.isSymbolSExp(args[0])) :
                                                                                proc.op === "string?" ? result_1.makeOk(type_predicates_1.isString(args[0])) :
                                                                                    result_1.makeFailure("Bad primitive op " + proc.op);
const minusPrim = (args) => {
    // TODO complete
    let x = args[0], y = args[1];
    if (type_predicates_1.isNumber(x) && type_predicates_1.isNumber(y)) {
        return result_1.makeOk(x - y);
    }
    else {
        return result_1.makeFailure(`Type error: - expects numbers ${args}`);
    }
};
const divPrim = (args) => {
    // TODO complete
    let x = args[0], y = args[1];
    if (type_predicates_1.isNumber(x) && type_predicates_1.isNumber(y)) {
        return result_1.makeOk(x / y);
    }
    else {
        return result_1.makeFailure(`Type error: / expects numbers ${args}`);
    }
};
const eqPrim = (args) => {
    let x = args[0], y = args[1];
    if (L3_value_1.isSymbolSExp(x) && L3_value_1.isSymbolSExp(y)) {
        return x.val === y.val;
    }
    else if (L3_value_1.isEmptySExp(x) && L3_value_1.isEmptySExp(y)) {
        return true;
    }
    else if (type_predicates_1.isNumber(x) && type_predicates_1.isNumber(y)) {
        return x === y;
    }
    else if (type_predicates_1.isString(x) && type_predicates_1.isString(y)) {
        return x === y;
    }
    else if (type_predicates_1.isBoolean(x) && type_predicates_1.isBoolean(y)) {
        return x === y;
    }
    else {
        return false;
    }
};
const carPrim = (v) => L3_value_1.isCompoundSExp(v) ? result_1.makeOk(v.val1) :
    result_1.makeFailure(`Car: param is not compound ${v}`);
const cdrPrim = (v) => L3_value_1.isCompoundSExp(v) ? result_1.makeOk(v.val2) :
    result_1.makeFailure(`Cdr: param is not compound ${v}`);
const consPrim = (v1, v2) => L3_value_1.makeCompoundSExp(v1, v2);
exports.listPrim = (vals) => vals.length === 0 ? L3_value_1.makeEmptySExp() :
    L3_value_1.makeCompoundSExp(list_1.first(vals), exports.listPrim(list_1.rest(vals)));
const isPairPrim = (v) => L3_value_1.isCompoundSExp(v);
