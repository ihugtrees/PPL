import { expect } from "chai";
import sinon from "sinon";
import * as O from "../src/part3/optional";
import * as R from "../src/part3/result";

const nonTagValues = (x: any): any[] =>
    Object.entries(x)
          .filter(([k, _]) => k !== "tag")
          .map(([_, v]) => v);

const validateSome = <T>(o: O.Optional<T>, value: T): void => {
    const values = nonTagValues(o)
    expect(values.length).to.equal(1);
    expect(values[0]).to.equal(value);
}

const validateOk = <T>(r: R.Result<T>, value: T): void => {
    const values = nonTagValues(r);
    expect(values.length).to.equal(1);
    expect(values[0]).to.equal(value);
}

const validateFailure = <T>(r: R.Result<T>, message: string): void => {
    const values = nonTagValues(r);
    expect(values.length).to.equal(1);
    expect(values[0]).to.equal(message);
}

describe("Assignment 1 Part 3", () => {
    describe("Optional", () => {
        describe("Type Constructors and Predicates", () => {
            it("checks the types returned from constructors", () => {
                const s1 = O.makeSome(5);
                const s2 = O.makeSome("abc");

                expect(s1).to.satisfy(O.isSome);
                expect(s2).to.satisfy(O.isSome);
                expect(O.makeNone()).to.satisfy(O.isNone);
            });
        });

        describe("bind", () => {
            type Exp = Add | Sub | Mul | Div | Const
            interface Add { tag: "add"; a: Exp; b: Exp; }
            interface Sub { tag: "sub"; a: Exp; b: Exp; }
            interface Mul { tag: "mul"; a: Exp; b: Exp; }
            interface Div { tag: "div"; a: Exp; b: Exp; }
            interface Const { tag: "const", n: number }

            const safeDiv = (x: number, y: number): O.Optional<number> =>
                y === 0 ? O.makeNone() : O.makeSome(x / y);
        
            const safeEvalExp = (e: Exp): O.Optional<number> =>
                e.tag === "add" ? O.bind(safeEvalExp(e.a), a => O.bind(safeEvalExp(e.b), b => O.makeSome(a + b))) :
                e.tag === "sub" ? O.bind(safeEvalExp(e.a), a => O.bind(safeEvalExp(e.b), b => O.makeSome(a - b))) :
                e.tag === "mul" ? O.bind(safeEvalExp(e.a), a => O.bind(safeEvalExp(e.b), b => O.makeSome(a * b))) :
                e.tag === "div" ? O.bind(safeEvalExp(e.a), a => O.bind(safeEvalExp(e.b), b => safeDiv(a, b))) :
                O.makeSome(e.n);
            
            it("returns None when dividing by zero", () => {
                const exp: Exp = {
                    tag: "div",
                    a: {
                        tag: "const",
                        n: 1
                    },
                    b: {
                        tag: "sub",
                        a: {
                            tag: "const",
                            n: 2
                        },
                        b: {
                            tag: "const",
                            n: 2
                        }
                    }
                }
                
                const evaluated = safeEvalExp(exp);
                expect(evaluated).to.satisfy(O.isNone);
            });

            it("returns Some(2) when evaluating 2", () => {
                const exp: Exp = {
                    tag: "const",
                    n: 2
                }

                const evaluated = safeEvalExp(exp);
                expect(evaluated).to.satisfy(O.isSome);
                validateSome(evaluated, 2);
            });

            it("checks the signature of bind", () => {
                const o1 = O.makeSome("abc");
                const o2 = O.bind(o1, s => O.makeSome(s.length));
                validateSome(o2, 3);
            });
        });
    });

    describe("Result", () => {
        afterEach(() => {
            sinon.restore();
        });

        describe("Type Constructors and Predicates", () => {
            it("checks the types returned from constructors", () => {
                const ok1 = R.makeOk(5);
                const ok2 = R.makeOk("abc");

                expect(ok1).to.satisfy(R.isOk);
                expect(ok2).to.satisfy(R.isOk);
                expect(R.makeFailure("message")).to.satisfy(R.isFailure);
            });
        });

        describe("bind", () => {
            it("checks the signature of bind", () => {
                const r1 = R.makeOk("abc");
                const r2 = R.bind(r1, s => R.makeOk(s.length));
                validateOk(r2, 3);
            });
        });

        describe("naiveValidateUser", () => {
            it("doesn't use bind for OK case", () => {
                const spy = sinon.spy(R, "bind");
                const user = {
                    name: "Ben",
                    email: "bene@post.bgu.ac.il",
                    handle: "bene"
                };
                const result = R.naiveValidateUser(user);
                expect(result).to.satisfy(R.isOk);
                validateOk(result, user);
                expect(spy.notCalled).to.be.true;
            });

            it("doesn't use bind for Failure case", () => {
                const spy = sinon.spy(R, "bind");
                const user = {
                    name: "Ben",
                    email: "bene@post.bgu.ac.il",
                    handle: "@bene"
                };
                const result = R.naiveValidateUser(user);
                expect(result).to.satisfy(R.isFailure);
                validateFailure(result, "This isn't Twitter");
                expect(spy.notCalled).to.be.true;
            });
        });

        describe("monadicValidateUser", () => {
            it("uses bind for the OK case", () => {
                const spy = sinon.spy(R, "bind");
                const user = {
                    name: "Ben",
                    email: "bene@post.bgu.ac.il",
                    handle: "bene"
                };
                const result = R.monadicValidateUser(user);
                expect(result).to.satisfy(R.isOk);
                validateOk(result, user);
                expect(spy.called).to.be.true;
            });

            it("uses bind for the Failure case", () => {
                const spy = sinon.spy(R, "bind");
                const user = {
                    name: "Ben",
                    email: "bene@post.bgu.ac.il",
                    handle: "@bene"
                };
                const result = R.monadicValidateUser(user);
                expect(result).to.satisfy(R.isFailure);
                validateFailure(result, "This isn't Twitter");
                expect(spy.called).to.be.true;
            });
        });
    });
});