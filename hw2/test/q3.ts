import { ForExp, AppExp, Exp, Program, CExp } from "./L21-ast";
import { Result, mapResult, makeFailure, makeOk, bind, safe2, safe3 } from "../imp/result";
import { makeNumExp, makeProgram, makeAppExp, makeProcExp, makeDefineExp, makeIfExp } from "./L21-ast";
import { isIfExp, isForExp, isProgram, isAppExp, isDefineExp, isAtomicExp, isProcExp } from "./L21-ast";

/*
Purpose: transform for exp to app exp
Signature: for2app(forExp)
Type: [ForExp -> AppExp]
*/
export const for2app = (forExp: ForExp): AppExp => {
	let body: CExp[] = [];

	for (let i: number = forExp.start.val; i <= forExp.end.val; i++) {
		body = body.concat(makeAppExp(makeProcExp([forExp.var], [forExp.body]), [makeNumExp(i)]))
	}

	return makeAppExp(makeProcExp([], body), []);
}

/*
Purpose: transform l21 program to l2
Signature: L21ToL2(exp)
Type: [Exp | Program -> Result<Exp | Program>]
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
	isProgram(exp) ? L21ToL2Program(exp) : L21toL2Exp(exp)

const L21ToL2Program = (prog: Program): Result<Program> =>
	bind(mapResult(L21toL2Exp, prog.exps), (exps: Exp[]) => makeOk(makeProgram(exps)));


const L21toL2Exp = (exp: Exp): Result<Exp> =>
	isDefineExp(exp) ? bind(L21ToL2CExp(exp.val), (cexp: CExp) => makeOk(makeDefineExp(exp.var, cexp))) :
		L21ToL2CExp(exp)

const L21ToL2CExp = (exp: CExp): Result<CExp> =>
	isAtomicExp(exp) ? makeOk(exp) :
		isProcExp(exp) ? bind(mapResult(L21ToL2CExp, exp.body), (cexp: CExp[]) => makeOk(makeProcExp(exp.args, cexp))) :
			isAppExp(exp) ? safe2((rator: CExp, rands: CExp[]) => makeOk(makeAppExp(rator, rands)))
				(L21ToL2CExp(exp.rator), mapResult(L21ToL2CExp, exp.rands)) :
				isIfExp(exp) ? safe3((test: CExp, then: CExp, alt: CExp) => makeOk(makeIfExp(test, then, alt)))
					(L21ToL2CExp(exp.test), L21ToL2CExp(exp.then), L21ToL2CExp(exp.alt)) :
					isForExp(exp) ? (exp.start.val <= exp.end.val ? L21ToL2CExp(for2app(exp)) : makeFailure("x must be smaller than y")) :
						makeFailure("Some error")