"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const L3_ast_1 = require("./L3-ast");
const L3_ast_2 = require("./L3-ast");
const list_1 = require("./list");
// For applicative eval - the type of exps should be ValueExp[] | VarRef[];
// where ValueExp is an expression which directly encodes a value:
// export type ValueExp = LitExp | NumExp | BoolExp | StrExp | PrimOp;
// In order to support normal eval as well - we generalize the types to CExp.
// @Pre: vars and exps have the same length
exports.substitute = (body, vars, exps) => {
    const subVarRef = (e) => {
        const pos = ramda_1.indexOf(e.var, vars);
        return ((pos > -1) ? exps[pos] : e);
    };
    const subProcExp = (e) => {
        const argNames = ramda_1.map((x) => x.var, e.args);
        const subst = ramda_1.zip(vars, exps);
        const freeSubst = ramda_1.filter((ve) => !ramda_1.contains(list_1.first(ve), argNames), subst);
        return L3_ast_2.makeProcExp(e.args, exports.substitute(e.body, ramda_1.map((x) => x[0], freeSubst), ramda_1.map((x) => x[1], freeSubst)));
    };
    const sub = (e) => L3_ast_1.isNumExp(e) ? e :
        L3_ast_1.isBoolExp(e) ? e :
            L3_ast_1.isPrimOp(e) ? e :
                L3_ast_1.isLitExp(e) ? e :
                    L3_ast_1.isStrExp(e) ? e :
                        L3_ast_1.isVarRef(e) ? subVarRef(e) :
                            L3_ast_1.isIfExp(e) ? L3_ast_2.makeIfExp(sub(e.test), sub(e.then), sub(e.alt)) :
                                L3_ast_1.isProcExp(e) ? subProcExp(e) :
                                    L3_ast_1.isAppExp(e) ? L3_ast_2.makeAppExp(sub(e.rator), ramda_1.map(sub, e.rands)) :
                                        e;
    return ramda_1.map(sub, body);
};
/*
    Purpose: create a generator of new symbols of the form v__n
    with n incremented at each call.
*/
exports.makeVarGen = () => {
    let count = 0;
    return (v) => {
        count++;
        return `${v}__${count}`;
    };
};
/*
Purpose: Consistently rename bound variables in 'exps' to fresh names.
         Start numbering at 1 for all new var names.
*/
exports.renameExps = (exps) => {
    const varGen = exports.makeVarGen();
    const replace = (e) => L3_ast_1.isIfExp(e) ? L3_ast_2.makeIfExp(replace(e.test), replace(e.then), replace(e.alt)) :
        L3_ast_1.isAppExp(e) ? L3_ast_2.makeAppExp(replace(e.rator), ramda_1.map(replace, e.rands)) :
            L3_ast_1.isProcExp(e) ? replaceProc(e) :
                e;
    // Rename the params and substitute old params with renamed ones.
    //  First recursively rename all ProcExps inside the body.
    const replaceProc = (e) => {
        const oldArgs = ramda_1.map((arg) => arg.var, e.args);
        const newArgs = ramda_1.map(varGen, oldArgs);
        const newBody = ramda_1.map(replace, e.body);
        return L3_ast_2.makeProcExp(ramda_1.map(L3_ast_2.makeVarDecl, newArgs), exports.substitute(newBody, oldArgs, ramda_1.map(L3_ast_2.makeVarRef, newArgs)));
    };
    return ramda_1.map(replace, exps);
};
