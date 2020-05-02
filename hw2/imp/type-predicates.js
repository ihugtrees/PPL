"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ========================================================
// Type utilities
exports.isArray = Array.isArray;
exports.isString = (x) => typeof x === "string";
exports.isNumber = (x) => typeof x === "number";
exports.isBoolean = (x) => typeof x === "boolean";
exports.isError = (x) => x instanceof Error;
// A weird method to check that a string is a string encoding of a number
exports.isNumericString = (x) => JSON.stringify(+x) === x;
exports.isIdentifier = (x) => /[A-Za-z][A-Za-z0-9]*/i.test(x);
