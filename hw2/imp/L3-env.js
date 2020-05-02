"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("./result");
exports.makeEmptyEnv = () => ({ tag: "EmptyEnv" });
exports.makeEnv = (v, val, env) => ({ tag: "Env", var: v, val: val, nextEnv: env });
exports.isEmptyEnv = (x) => x.tag === "EmptyEnv";
exports.isNonEmptyEnv = (x) => x.tag === "Env";
exports.isEnv = (x) => exports.isEmptyEnv(x) || exports.isNonEmptyEnv(x);
exports.applyEnv = (env, v) => exports.isEmptyEnv(env) ? result_1.makeFailure("var not found " + v) :
    env.var === v ? result_1.makeOk(env.val) :
        exports.applyEnv(env.nextEnv, v);
