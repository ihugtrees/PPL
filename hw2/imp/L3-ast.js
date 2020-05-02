"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ===========================================================
// AST type models
const ramda_1 = require("ramda");
const L3_value_1 = require("./L3-value");
const list_1 = require("./list");
const type_predicates_1 = require("./type-predicates");
const result_1 = require("./result");
const parser_1 = require("./parser");
// Type value constructors for disjoint types
exports.makeProgram = (exps) => ({ tag: "Program", exps: exps });
exports.makeDefineExp = (v, val) => ({ tag: "DefineExp", var: v, val: val });
exports.makeNumExp = (n) => ({ tag: "NumExp", val: n });
exports.makeBoolExp = (b) => ({ tag: "BoolExp", val: b });
exports.makeStrExp = (s) => ({ tag: "StrExp", val: s });
exports.makePrimOp = (op) => ({ tag: "PrimOp", op: op });
exports.makeVarRef = (v) => ({ tag: "VarRef", var: v });
exports.makeVarDecl = (v) => ({ tag: "VarDecl", var: v });
exports.makeAppExp = (rator, rands) => ({ tag: "AppExp", rator: rator, rands: rands });
// L2
exports.makeIfExp = (test, then, alt) => ({ tag: "IfExp", test: test, then: then, alt: alt });
exports.makeProcExp = (args, body) => ({ tag: "ProcExp", args: args, body: body });
exports.makeBinding = (v, val) => ({ tag: "Binding", var: exports.makeVarDecl(v), val: val });
exports.makeLetExp = (bindings, body) => ({ tag: "LetExp", bindings: bindings, body: body });
// L3
exports.makeLitExp = (val) => ({ tag: "LitExp", val: val });
// Type predicates for disjoint types
exports.isProgram = (x) => x.tag === "Program";
exports.isDefineExp = (x) => x.tag === "DefineExp";
exports.isNumExp = (x) => x.tag === "NumExp";
exports.isBoolExp = (x) => x.tag === "BoolExp";
exports.isStrExp = (x) => x.tag === "StrExp";
exports.isPrimOp = (x) => x.tag === "PrimOp";
exports.isVarRef = (x) => x.tag === "VarRef";
exports.isVarDecl = (x) => x.tag === "VarDecl";
exports.isAppExp = (x) => x.tag === "AppExp";
// L2
exports.isIfExp = (x) => x.tag === "IfExp";
exports.isProcExp = (x) => x.tag === "ProcExp";
exports.isBinding = (x) => x.tag === "Binding";
exports.isLetExp = (x) => x.tag === "LetExp";
// L3
exports.isLitExp = (x) => x.tag === "LitExp";
// Type predicates for type unions
exports.isExp = (x) => exports.isDefineExp(x) || exports.isCExp(x);
exports.isAtomicExp = (x) => exports.isNumExp(x) || exports.isBoolExp(x) || exports.isStrExp(x) ||
    exports.isPrimOp(x) || exports.isVarRef(x);
exports.isCompoundExp = (x) => exports.isAppExp(x) || exports.isIfExp(x) || exports.isProcExp(x) || exports.isLitExp(x) || exports.isLetExp(x);
exports.isCExp = (x) => exports.isAtomicExp(x) || exports.isCompoundExp(x);
// ========================================================
// Parsing
exports.parseL3 = (x) => result_1.bind(parser_1.parse(x), exports.parseL3Program);
exports.parseL3Program = (sexp) => sexp === "" || list_1.isEmpty(sexp) ? result_1.makeFailure("Unexpected empty program") :
    parser_1.isToken(sexp) ? result_1.makeFailure("Program cannot be a single token") :
        type_predicates_1.isArray(sexp) ? parseL3GoodProgram(list_1.first(sexp), list_1.rest(sexp)) :
            result_1.makeFailure("Unexpected type " + sexp);
const parseL3GoodProgram = (keyword, body) => keyword === "L3" && !list_1.isEmpty(body) ? result_1.bind(result_1.mapResult(exports.parseL3Exp, body), (exps) => result_1.makeOk(exports.makeProgram(exps))) :
    result_1.makeFailure("Program must be of the form (L3 <exp>+)");
// Exp -> <DefineExp> | <Cexp>
exports.parseL3Exp = (sexp) => list_1.isEmpty(sexp) ? result_1.makeFailure("Exp cannot be an empty list") :
    type_predicates_1.isArray(sexp) ? exports.parseL3CompoundExp(list_1.first(sexp), list_1.rest(sexp)) :
        parser_1.isToken(sexp) ? exports.parseL3Atomic(sexp) :
            result_1.makeFailure("Unexpected type " + sexp);
// Compound -> DefineExp | CompoundCExp
exports.parseL3CompoundExp = (op, params) => op === "define" ? exports.parseDefine(params) :
    exports.parseL3CompoundCExp(op, params);
// CompoundCExp -> IfExp | ProcExp | LetExp | LitExp | AppExp
exports.parseL3CompoundCExp = (op, params) => type_predicates_1.isString(op) && isSpecialForm(op) ? exports.parseL3SpecialForm(op, params) :
    parseAppExp(op, params);
exports.parseL3SpecialForm = (op, params) => list_1.isEmpty(params) ? result_1.makeFailure("Empty args for special form") :
    op === "if" ? parseIfExp(params) :
        op === "lambda" ? parseProcExp(list_1.first(params), list_1.rest(params)) :
            op === "let" ? parseLetExp(list_1.first(params), list_1.rest(params)) :
                op === "quote" ? exports.parseLitExp(list_1.first(params)) :
                    result_1.makeFailure("Never");
// DefineExp -> (define <varDecl> <CExp>)
exports.parseDefine = (params) => list_1.isEmpty(params) ? result_1.makeFailure("define missing 2 arguments") :
    list_1.isEmpty(list_1.rest(params)) ? result_1.makeFailure("define missing 1 arguments") :
        !list_1.isEmpty(list_1.rest(list_1.rest(params))) ? result_1.makeFailure("define has too many arguments") :
            parseGoodDefine(list_1.first(params), list_1.second(params));
const parseGoodDefine = (variable, val) => !type_predicates_1.isIdentifier(variable) ? result_1.makeFailure("First arg of define must be an identifier") :
    result_1.bind(exports.parseL3CExp(val), (value) => result_1.makeOk(exports.makeDefineExp(exports.makeVarDecl(variable), value)));
exports.parseL3CExp = (sexp) => list_1.isEmpty(sexp) ? result_1.makeFailure("CExp cannot be an empty list") :
    type_predicates_1.isArray(sexp) ? exports.parseL3CompoundCExp(list_1.first(sexp), list_1.rest(sexp)) :
        parser_1.isToken(sexp) ? exports.parseL3Atomic(sexp) :
            result_1.makeFailure("Unexpected type " + sexp);
// Atomic -> number | boolean | primitiveOp | string
exports.parseL3Atomic = (token) => token === "#t" ? result_1.makeOk(exports.makeBoolExp(true)) :
    token === "#f" ? result_1.makeOk(exports.makeBoolExp(false)) :
        type_predicates_1.isString(token) && type_predicates_1.isNumericString(token) ? result_1.makeOk(exports.makeNumExp(+token)) :
            type_predicates_1.isString(token) && isPrimitiveOp(token) ? result_1.makeOk(exports.makePrimOp(token)) :
                type_predicates_1.isString(token) ? result_1.makeOk(exports.makeVarRef(token)) :
                    result_1.makeOk(exports.makeStrExp(token.toString()));
/*
    ;; <prim-op>  ::= + | - | * | / | < | > | = | not | and | or | eq? | string=?
    ;;                  | cons | car | cdr | pair? | number? | list
    ;;                  | boolean? | symbol? | string?      ##### L3
*/
const isPrimitiveOp = (x) => ["+", "-", "*", "/", ">", "<", "=", "not", "and", "or",
    "eq?", "string=?", "cons", "car", "cdr", "list", "pair?",
    "number?", "boolean?", "symbol?", "string?"].includes(x);
const isSpecialForm = (x) => ["if", "lambda", "let", "quote"].includes(x);
const parseAppExp = (op, params) => result_1.safe2((rator, rands) => result_1.makeOk(exports.makeAppExp(rator, rands)))(exports.parseL3CExp(op), result_1.mapResult(exports.parseL3CExp, params));
const parseIfExp = (params) => params.length !== 3 ? result_1.makeFailure("Expression not of the form (if <cexp> <cexp> <cexp>)") :
    result_1.bind(result_1.mapResult(exports.parseL3CExp, params), (cexps) => result_1.makeOk(exports.makeIfExp(cexps[0], cexps[1], cexps[2])));
const parseProcExp = (vars, body) => type_predicates_1.isArray(vars) && list_1.allT(type_predicates_1.isString, vars) ? result_1.bind(result_1.mapResult(exports.parseL3CExp, body), (cexps) => result_1.makeOk(exports.makeProcExp(ramda_1.map(exports.makeVarDecl, vars), cexps))) :
    result_1.makeFailure(`Invalid vars for ProcExp`);
const isGoodBindings = (bindings) => type_predicates_1.isArray(bindings) &&
    list_1.allT(type_predicates_1.isArray, bindings) &&
    list_1.allT(type_predicates_1.isIdentifier, ramda_1.map(list_1.first, bindings));
const parseLetExp = (bindings, body) => {
    if (!isGoodBindings(bindings)) {
        return result_1.makeFailure('Malformed bindings in "let" expression');
    }
    const vars = ramda_1.map(b => b[0], bindings);
    const valsResult = result_1.mapResult(binding => exports.parseL3CExp(list_1.second(binding)), bindings);
    const bindingsResult = result_1.bind(valsResult, (vals) => result_1.makeOk(ramda_1.zipWith(exports.makeBinding, vars, vals)));
    return result_1.safe2((bindings, body) => result_1.makeOk(exports.makeLetExp(bindings, body)))(bindingsResult, result_1.mapResult(exports.parseL3CExp, body));
};
// sexps has the shape (quote <sexp>)
exports.parseLitExp = (param) => result_1.bind(exports.parseSExp(param), (sexp) => result_1.makeOk(exports.makeLitExp(sexp)));
exports.isDottedPair = (sexps) => sexps.length === 3 &&
    sexps[1] === ".";
exports.makeDottedPair = (sexps) => result_1.safe2((val1, val2) => result_1.makeOk(L3_value_1.makeCompoundSExp(val1, val2)))(exports.parseSExp(sexps[0]), exports.parseSExp(sexps[2]));
// x is the output of p (sexp parser)
exports.parseSExp = (sexp) => sexp === "#t" ? result_1.makeOk(true) :
    sexp === "#f" ? result_1.makeOk(false) :
        type_predicates_1.isString(sexp) && type_predicates_1.isNumericString(sexp) ? result_1.makeOk(+sexp) :
            parser_1.isSexpString(sexp) ? result_1.makeOk(sexp.toString()) :
                type_predicates_1.isString(sexp) ? result_1.makeOk(L3_value_1.makeSymbolSExp(sexp)) :
                    sexp.length === 0 ? result_1.makeOk(L3_value_1.makeEmptySExp()) :
                        exports.isDottedPair(sexp) ? exports.makeDottedPair(sexp) :
                            type_predicates_1.isArray(sexp) ? (
                            // fail on (x . y z)
                            sexp[0] === '.' ? result_1.makeFailure("Bad dotted sexp: " + sexp) :
                                result_1.safe2((val1, val2) => result_1.makeOk(L3_value_1.makeCompoundSExp(val1, val2)))(exports.parseSExp(list_1.first(sexp)), exports.parseSExp(list_1.rest(sexp)))) :
                                result_1.makeFailure(`Bad literal expression: ${sexp}`);
// ==========================================================================
// Unparse: Map an AST to a concrete syntax string.
const L3_value_2 = require("./L3-value");
// Add a quote for symbols, empty and compound sexp - strings and numbers are not quoted.
const unparseLitExp = (le) => L3_value_2.isEmptySExp(le.val) ? `'()` :
    L3_value_2.isSymbolSExp(le.val) ? `'${L3_value_1.valueToString(le.val)}` :
        L3_value_2.isCompoundSExp(le.val) ? `'${L3_value_1.valueToString(le.val)}` :
            `${le.val}`;
const unparseLExps = (les) => ramda_1.map(exports.unparseL3, les).join(" ");
const unparseProcExp = (pe) => `(lambda (${ramda_1.map((p) => p.var, pe.args).join(" ")}) ${unparseLExps(pe.body)})`;
const unparseLetExp = (le) => `(let (${ramda_1.map((b) => `(${b.var.var} ${exports.unparseL3(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`;
exports.unparseL3 = (exp) => exports.isBoolExp(exp) ? L3_value_1.valueToString(exp.val) :
    exports.isNumExp(exp) ? L3_value_1.valueToString(exp.val) :
        exports.isStrExp(exp) ? L3_value_1.valueToString(exp.val) :
            exports.isLitExp(exp) ? unparseLitExp(exp) :
                exports.isVarRef(exp) ? exp.var :
                    exports.isProcExp(exp) ? unparseProcExp(exp) :
                        exports.isIfExp(exp) ? `(if ${exports.unparseL3(exp.test)} ${exports.unparseL3(exp.then)} ${exports.unparseL3(exp.alt)})` :
                            exports.isAppExp(exp) ? `(${exports.unparseL3(exp.rator)} ${unparseLExps(exp.rands)})` :
                                exports.isPrimOp(exp) ? exp.op :
                                    exports.isLetExp(exp) ? unparseLetExp(exp) :
                                        exports.isDefineExp(exp) ? `(define ${exp.var.var} ${exports.unparseL3(exp.val)})` :
                                            exports.isProgram(exp) ? `(L3 ${unparseLExps(exp.exps)})` :
                                                "";
