"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const L3_ast_1 = require("./L3-ast");
const ramda_1 = require("ramda");
const result_1 = require("./result");
const L3_value_1 = require("./L3-value");
exports.unparseL3 = (exp) => L3_ast_1.isProgram(exp) ? result_1.bind(result_1.mapResult(exports.unparseL3, exp.exps), (exps) => result_1.makeOk(exps.join("\n"))) :
    L3_ast_1.isBoolExp(exp) ? result_1.makeOk(exp.val ? "#t" : "#f") :
        L3_ast_1.isNumExp(exp) ? result_1.makeOk(exp.val.toString()) :
            L3_ast_1.isStrExp(exp) ? result_1.makeOk(exp.val) :
                L3_ast_1.isVarRef(exp) ? result_1.makeOk(exp.var) :
                    L3_ast_1.isPrimOp(exp) ? result_1.makeOk(exp.op) :
                        L3_ast_1.isLitExp(exp) ? result_1.makeOk(L3_value_1.valueToString(exp.val)) :
                            L3_ast_1.isDefineExp(exp) ? result_1.bind(exports.unparseL3(exp.val), (val) => result_1.makeOk(`(define ${exp.var} ${val})`)) :
                                L3_ast_1.isProcExp(exp) ? result_1.bind(result_1.mapResult(exports.unparseL3, exp.body), (body) => result_1.makeOk(`(lambda (${ramda_1.map(v => v.var, exp.args).join(" ")} ${body.join(" ")}))`)) :
                                    L3_ast_1.isIfExp(exp) ? result_1.safe3((test, then, alt) => result_1.makeOk(`(if ${test} ${then} ${alt})`))(exports.unparseL3(exp.test), exports.unparseL3(exp.then), exports.unparseL3(exp.alt)) :
                                        L3_ast_1.isAppExp(exp) ? result_1.safe2((rator, rands) => result_1.makeOk(`(${rator} ${rands.join(" ")})`))(exports.unparseL3(exp.rator), result_1.mapResult(exports.unparseL3, exp.rands)) :
                                            L3_ast_1.isLetExp(exp) ? result_1.safe3((vars, vals, body) => result_1.makeOk(`(let (${ramda_1.zipWith((v, val) => `(${v} ${val})`, vars, vals)}) ${body.join(" ")})`))(result_1.mapResult(b => result_1.makeOk(b.var.var), exp.bindings), result_1.mapResult(b => exports.unparseL3(b.val), exp.bindings), result_1.mapResult(exports.unparseL3, exp.body)) :
                                                result_1.makeFailure(`Unknown expression: ${exp}`);
