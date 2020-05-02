"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const L2_ast_1 = require("./L2-ast");
const ramda_1 = require("ramda");
const result_1 = require("./result");
exports.unparseL2 = (exp) => L2_ast_1.isProgram(exp) ? result_1.bind(result_1.mapResult(exports.unparseL2, exp.exps), (exps) => result_1.makeOk(exps.join("\n"))) :
    L2_ast_1.isBoolExp(exp) ? result_1.makeOk(exp.val ? "#t" : "#f") :
        L2_ast_1.isNumExp(exp) ? result_1.makeOk(exp.val.toString()) :
            L2_ast_1.isVarRef(exp) ? result_1.makeOk(exp.var) :
                L2_ast_1.isPrimOp(exp) ? result_1.makeOk(exp.op) :
                    L2_ast_1.isDefineExp(exp) ? result_1.bind(exports.unparseL2(exp.val), (val) => result_1.makeOk(`(define ${exp.var.var} ${val})`)) :
                        L2_ast_1.isProcExp(exp) ? result_1.bind(result_1.mapResult(exports.unparseL2, exp.body), (body) => result_1.makeOk(`(lambda (${ramda_1.map(v => v.var, exp.args).join(" ")}) ${body.join(" ")})`)) :
                            L2_ast_1.isIfExp(exp) ? result_1.safe3((test, then, alt) => result_1.makeOk(`(if ${test} ${then} ${alt})`))(exports.unparseL2(exp.test), exports.unparseL2(exp.then), exports.unparseL2(exp.alt)) :
                                L2_ast_1.isAppExp(exp) ? result_1.safe2((rator, rands) => result_1.makeOk(`(${rator} ${rands.join(" ")})`))(exports.unparseL2(exp.rator), result_1.mapResult(exports.unparseL2, exp.rands)) :
                                    result_1.makeFailure(`Unknown expression: ${exp}`);
