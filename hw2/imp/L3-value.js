"use strict";
// ========================================================
// Value type definition for L3
Object.defineProperty(exports, "__esModule", { value: true });
const L3_ast_1 = require("./L3-ast");
const type_predicates_1 = require("./type-predicates");
const ramda_1 = require("ramda");
exports.isFunctional = (x) => L3_ast_1.isPrimOp(x) || exports.isClosure(x);
exports.makeClosure = (params, body) => ({ tag: "Closure", params: params, body: body });
exports.isClosure = (x) => x.tag === "Closure";
exports.isSExp = (x) => typeof (x) === 'string' || typeof (x) === 'boolean' || typeof (x) === 'number' ||
    exports.isSymbolSExp(x) || exports.isCompoundSExp(x) || exports.isEmptySExp(x) || L3_ast_1.isPrimOp(x) || exports.isClosure(x);
exports.makeCompoundSExp = (val1, val2) => ({ tag: "CompoundSexp", val1: val1, val2: val2 });
exports.isCompoundSExp = (x) => x.tag === "CompoundSexp";
exports.makeEmptySExp = () => ({ tag: "EmptySExp" });
exports.isEmptySExp = (x) => x.tag === "EmptySExp";
exports.makeSymbolSExp = (val) => ({ tag: "SymbolSExp", val: val });
exports.isSymbolSExp = (x) => x.tag === "SymbolSExp";
// Printable form for values
exports.closureToString = (c) => 
// `<Closure ${c.params} ${L3unparse(c.body)}>`
`<Closure ${c.params} ${c.body}>`;
exports.compoundSExpToArray = (cs, res) => exports.isEmptySExp(cs.val2) ? ramda_1.append(exports.valueToString(cs.val1), res) :
    exports.isCompoundSExp(cs.val2) ? exports.compoundSExpToArray(cs.val2, res.concat([exports.valueToString(cs.val1)])) :
        ({ s1: res.concat([exports.valueToString(cs.val1)]), s2: exports.valueToString(cs.val2) });
exports.compoundSExpToString = (cs, css = exports.compoundSExpToArray(cs, [])) => type_predicates_1.isArray(css) ? `(${css.join(' ')})` :
    `(${css.s1.join(' ')} . ${css.s2})`;
exports.valueToString = (val) => type_predicates_1.isNumber(val) ? val.toString() :
    val === true ? '#t' :
        val === false ? '#f' :
            type_predicates_1.isString(val) ? `"${val}"` :
                exports.isClosure(val) ? exports.closureToString(val) :
                    L3_ast_1.isPrimOp(val) ? val.op :
                        exports.isSymbolSExp(val) ? val.val :
                            exports.isEmptySExp(val) ? "'()" :
                                exports.isCompoundSExp(val) ? exports.compoundSExpToString(val) :
                                    "Error: unknown value type " + val;
