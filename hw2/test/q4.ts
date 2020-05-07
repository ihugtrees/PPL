import { Exp, Program, isDefineExp, isNumExp, isBoolExp, isPrimOp, isProgram, isVarRef, isAppExp, isIfExp, isProcExp, PrimOp, AppExp, IfExp, ProcExp, DefineExp } from '../imp/L2-ast';
import { Result, mapResult, makeOk, makeFailure, bind, safe3, safe2 } from '../imp/result';
import { map } from 'ramda';

/*
Purpose: transform l2 program/expression to compatible javascript code string
Signature: l2ToJS(exp)
Type: [Exp | Program -> Result<string>]
*/
export const l2ToJS = (exp: Exp | Program): Result<string> =>
	isProgram(exp) ? ProgramToJS(exp) : ExpToJS(exp)


const ProgramToJS = (prog: Program): Result<string> =>
	bind(mapResult(l2ToJS, prog.exps), (exps: string[]) => { exps[exps.length - 1] = "console.log(" + exps[exps.length - 1] + ");"; return makeOk(exps.join(";\n")) })


const ExpToJS = (exp: Exp): Result<string> =>
	isNumExp(exp) ? makeOk("" + exp.val) :
		isBoolExp(exp) ? makeOk(exp.val ? "true" : "false") :
			isVarRef(exp) ? makeOk(exp.var) :
				isDefineExp(exp) ? defineToJS(exp) :
					isAppExp(exp) ? appToJS(exp) :
						isIfExp(exp) ? ifToJS(exp) :
							isProcExp(exp) ? procToJS(exp) :
								isPrimOp(exp) ? primOpToJS(exp) :
									makeFailure("What is this?")


//"+", "-", "*", "/", ">", "<", stays the same
//  "=", "not", "and", "or" ,"eq?", done
const primOpToJS = (operator: PrimOp): Result<string> =>
	makeOk(operator.op === "=" ? "===" :
		operator.op === "not" ? "!" :
			operator.op === "and" ? "&&" :
				operator.op === "or" ? "||" :
					operator.op === "eq?" ? "===" :
						operator.op)

//const merge3 = safe3((a: string, b: string, c: string) => makeOk(`(${a} ${b} ${c})`))
const merge2 = safe2((a: string, b: string) => makeOk(`(${a}${b})`))
const isFuncOp = (op: PrimOp): boolean => !["+", "-", "*", "/", ">", "<", "=", "not", "and", "or", "eq?"].includes(op.op)

//  "number?", "boolean?
const makeBoolOrNum = (app: AppExp): Result<string> =>
	bind(l2ToJS(app.rands[0]), (rand: string) => makeOk((app.rator as PrimOp).op === "boolean?" ? `(typeof ${rand} === 'boolean')` : `(typeof ${rand} === 'number')`))

const appToJS = (app: AppExp): Result<string> =>
	isPrimOp(app.rator) ? (app.rands.length === 1 ? (!isFuncOp(app.rator) ? merge2(l2ToJS(app.rator), l2ToJS(app.rands[0])) : makeBoolOrNum(app)) :
		safe2((rator: string, rands: string[]) => makeOk("(" + rands.join(" " + rator + " ") + ")"))
			(l2ToJS(app.rator), mapResult(l2ToJS, app.rands))) :
		safe2((rands: string[], rator: string) => makeOk(`${rator}(${rands.join(",")})`))
			(mapResult(l2ToJS, app.rands), l2ToJS(app.rator))


// isPrimOp(app.rator) ? !isFuncOp(app.rator) ? (app.rands.length === 1 ? merge2(l2ToJS(app.rator), l2ToJS(app.rands[0])) :
// 	safe2((rator: string, rands: string[]) => makeOk(rands.join(" " + rator + " ")))
// 		(l2ToJS(app.rator), mapResult(l2ToJS, app.rands))) :
// 	makeBoolOrNum(app) :
// 	safe2((rands: string[], rator: string) => makeOk(`${rator}(${rands.join(",")})`))
// 		(mapResult(l2ToJS, app.rands), l2ToJS(app.rator))

const ifToJS = (myif: IfExp): Result<string> =>
	safe3((test: string, then: string, alt: string) => makeOk(`(${test} ? ${then} : ${alt})`))
		(l2ToJS(myif.test), l2ToJS(myif.then), l2ToJS(myif.alt))

const procToJS = (proc: ProcExp): Result<string> =>
	proc.body.length === 1 ? bind(mapResult(l2ToJS, proc.body), (body: string[]) => makeOk(`((${map(v => v.var, proc.args).join(",")}) => ${body})`)) :
		proc.body.length > 1 ? bind(mapResult(l2ToJS, proc.body), (body: string[]) => { body[body.length - 1] = "return " + body[body.length - 1] + ";"; return makeOk(`((${map(v => v.var, proc.args).join(",")}) => {${body.join("; ")}})`) }) :
			makeFailure("Lambda body cant be empty")

const defineToJS = (def: DefineExp): Result<string> =>
	bind(l2ToJS(def.val), (val: string) => makeOk(`const ${def.var.var} = ${val}`))