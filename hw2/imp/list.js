"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// List operations similar to car/cdr/cadr in Scheme
const ramda_1 = require("ramda");
exports.cons = (x, xs) => [x].concat(xs);
exports.first = (x) => x[0];
exports.second = (x) => x[1];
exports.rest = (x) => x.slice(1);
exports.isEmpty = (x) => Array.isArray(x) && x.length === 0;
// A useful type predicate for homogeneous lists
exports.allT = (isT, x) => ramda_1.all(isT, x);
