"use strict";
// L2 Parser
// =========
Object.defineProperty(exports, "__esModule", { value: true });
// A parser provides 2 components to the clients:
// - Type definitions for the AST of the language (with type predicates, constructors, getters)
// - A parser function which constructs AST values from strings.
const ramda_1 = require("ramda");
const type_predicates_1 = require("./type-predicates");
const list_1 = require("./list");
const result_1 = require("./result");
;
;
// Type value constructors for disjoint types
exports.makeProgram = (exps) => ({ tag: "Program", exps: exps });
exports.makeDefineExp = (v, val) => ({ tag: "DefineExp", var: v, val: val });
exports.makeNumExp = (n) => ({ tag: "NumExp", val: n });
exports.makeBoolExp = (b) => ({ tag: "BoolExp", val: b });
exports.makePrimOp = (op) => ({ tag: "PrimOp", op: op });
exports.makeVarRef = (v) => ({ tag: "VarRef", var: v });
exports.makeVarDecl = (v) => ({ tag: "VarDecl", var: v });
exports.makeAppExp = (rator, rands) => ({ tag: "AppExp", rator: rator, rands: rands });
// L2
exports.makeIfExp = (test, then, alt) => ({ tag: "IfExp", test: test, then: then, alt: alt });
exports.makeProcExp = (args, body) => ({ tag: "ProcExp", args: args, body: body });
// Type predicates for disjoint types
exports.isProgram = (x) => x.tag === "Program";
exports.isDefineExp = (x) => x.tag === "DefineExp";
exports.isNumExp = (x) => x.tag === "NumExp";
exports.isBoolExp = (x) => x.tag === "BoolExp";
exports.isPrimOp = (x) => x.tag === "PrimOp";
exports.isVarRef = (x) => x.tag === "VarRef";
exports.isVarDecl = (x) => x.tag === "VarDecl";
exports.isAppExp = (x) => x.tag === "AppExp";
// L2
exports.isIfExp = (x) => x.tag === "IfExp";
exports.isProcExp = (x) => x.tag === "ProcExp";
// Type predicates for type unions
exports.isExp = (x) => exports.isDefineExp(x) || exports.isCExp(x);
exports.isAtomicExp = (x) => exports.isNumExp(x) || exports.isBoolExp(x) ||
    exports.isPrimOp(x) || exports.isVarRef(x);
exports.isCompoundExp = (x) => exports.isAppExp(x) || exports.isIfExp(x) || exports.isProcExp(x);
exports.isCExp = (x) => exports.isAtomicExp(x) || exports.isCompoundExp(x);
const parser_1 = require("./parser");
// combine Sexp parsing with the L2 parsing
exports.parseL2 = (x) => result_1.bind(parser_1.parse(x), exports.parseL2Program);
// L2 concrete syntax
// <Program> -> (L2 <Exp>+)
// <Exp> -> <DefineExp> | <CExp>
// <DefineExp> -> (define <VarDecl> <CExp>)
// <CExp> -> <AtomicExp> | <CompoundExp>
// <AtomicExp> -> <number> | <boolean> | <PrimOp> | <VarRef>
// <CompoundExp> -> <AppExp> | <IfExp> | <ProcExp>
// <AppExp> -> (<CExp>+)
// <IfExp> -> (if <CExp> <CExp> <CExp>)
// <ProcExp> -> (lambda (<VarDecl>*) <CExp>+)
// <Program> -> (L2 <Exp>+)
exports.parseL2Program = (sexp) => sexp === "" || list_1.isEmpty(sexp) ? result_1.makeFailure("Unexpected empty program") :
    parser_1.isToken(sexp) ? result_1.makeFailure("Program cannot be a single token") :
        type_predicates_1.isArray(sexp) ? parseL2GoodProgram(list_1.first(sexp), list_1.rest(sexp)) :
            result_1.makeFailure("Unexpected type " + sexp);
const parseL2GoodProgram = (keyword, body) => keyword === "L2" && !list_1.isEmpty(body) ? result_1.bind(result_1.mapResult(exports.parseL2Exp, body), (exps) => result_1.makeOk(exports.makeProgram(exps))) :
    result_1.makeFailure("Program must be of the form (L2 <exp>+)");
// <Exp> -> <DefineExp> | <CExp>
exports.parseL2Exp = (sexp) => list_1.isEmpty(sexp) ? result_1.makeFailure("Exp cannot be an empty list") :
    type_predicates_1.isArray(sexp) ? exports.parseL2CompoundExp(list_1.first(sexp), list_1.rest(sexp)) :
        parser_1.isToken(sexp) ? exports.parseL2Atomic(sexp) :
            result_1.makeFailure("Unexpected type " + sexp);
// <CompoundExp> -> <DefineExp> | <CompoundCExp>
exports.parseL2CompoundExp = (op, params) => op === "define" ? exports.parseDefine(params) :
    exports.parseL2CompoundCExp(op, params);
// <CompoundCExp> -> <AppExp> | <IfExp> | <ProcExp>
exports.parseL2CompoundCExp = (op, params) => op === "if" ? parseIfExp(params) :
    op === "lambda" ? parseProcExp(list_1.first(params), list_1.rest(params)) :
        exports.parseAppExp(op, params);
// <DefineExp> -> (define <VarDecl> <CExp>)
exports.parseDefine = (params) => list_1.isEmpty(params) ? result_1.makeFailure("define missing 2 arguments") :
    list_1.isEmpty(list_1.rest(params)) ? result_1.makeFailure("define missing 1 arguments") :
        !list_1.isEmpty(list_1.rest(list_1.rest(params))) ? result_1.makeFailure("define has too many arguments") :
            parseGoodDefine(list_1.first(params), list_1.second(params));
const parseGoodDefine = (variable, val) => !type_predicates_1.isIdentifier(variable) ? result_1.makeFailure("First arg of define must be an identifier") :
    result_1.bind(exports.parseL2CExp(val), (value) => result_1.makeOk(exports.makeDefineExp(exports.makeVarDecl(variable), value)));
// <CExp> -> <AtomicExp> | <CompondCExp>
exports.parseL2CExp = (sexp) => list_1.isEmpty(sexp) ? result_1.makeFailure("CExp cannot be an empty list") :
    type_predicates_1.isArray(sexp) ? exports.parseL2CompoundCExp(list_1.first(sexp), list_1.rest(sexp)) :
        parser_1.isToken(sexp) ? exports.parseL2Atomic(sexp) :
            result_1.makeFailure("Unexpected type " + sexp);
// <Atomic> -> <number> | <boolean> | <PrimOp> | <VarRef>
exports.parseL2Atomic = (token) => token === "#t" ? result_1.makeOk(exports.makeBoolExp(true)) :
    token === "#f" ? result_1.makeOk(exports.makeBoolExp(false)) :
        type_predicates_1.isString(token) && type_predicates_1.isNumericString(token) ? result_1.makeOk(exports.makeNumExp(+token)) :
            type_predicates_1.isString(token) && exports.isPrimitiveOp(token) ? result_1.makeOk(exports.makePrimOp(token)) :
                type_predicates_1.isString(token) ? result_1.makeOk(exports.makeVarRef(token)) :
                    result_1.makeFailure("Invalid atomic token: " + token);
exports.isPrimitiveOp = (x) => ["+", "-", "*", "/", ">", "<", "=", "not", "and", "or",
    "eq?", "number?", "boolean?"].includes(x);
// <AppExp> -> (<CExp>+)
exports.parseAppExp = (op, params) => result_1.safe2((rator, rands) => result_1.makeOk(exports.makeAppExp(rator, rands)))(exports.parseL2CExp(op), result_1.mapResult(exports.parseL2CExp, params));
// <IfExp> -> (if <CExp> <CExp> <CExp>)
const parseIfExp = (params) => params.length !== 3 ? result_1.makeFailure("Expression not of the form (if <cexp> <cexp> <cexp>)") :
    result_1.bind(result_1.mapResult(exports.parseL2CExp, params), (cexps) => result_1.makeOk(exports.makeIfExp(cexps[0], cexps[1], cexps[2])));
// <ProcExp> -> (lambda (<VarDecl>*) <CExp>+)
const parseProcExp = (vars, body) => type_predicates_1.isArray(vars) && list_1.allT(type_predicates_1.isIdentifier, vars) ?
    result_1.bind(result_1.mapResult(exports.parseL2CExp, body), (cexps) => result_1.makeOk(exports.makeProcExp(ramda_1.map(exports.makeVarDecl, vars), cexps))) :
    result_1.makeFailure("Invalid vars for ProcExp");
