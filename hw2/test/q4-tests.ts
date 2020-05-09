import { expect } from 'chai';
import { parseL2, parseL2Exp } from '../imp/L2-ast';
import { l2ToJS } from './q4';
import { bind, Result, makeOk, makeFailure, isFailure } from '../imp/result';
import { parse as p } from "../imp/parser";

const l2toJSResult = (x: string): Result<string> =>
    bind(bind(p(x), parseL2Exp), l2ToJS);

describe('Q4 Tests', () => {
    it('parses primitive ops', () => {
        expect(l2toJSResult(`(+ 3 5 7)`)).to.deep.equal(makeOk(`(3 + 5 + 7)`));
        expect(l2toJSResult(`(= 3 (+ 1 2))`)).to.deep.equal(makeOk(`(3 === (1 + 2))`));
        expect(l2toJSResult(`(* 3 5 7)`)).to.deep.equal(makeOk(`(3 * 5 * 7)`));
        expect(l2toJSResult(`(/ 3 5 7)`)).to.deep.equal(makeOk(`(3 / 5 / 7)`));
        expect(l2toJSResult(`(> 3 5)`)).to.deep.equal(makeOk(`(3 > 5)`));
        expect(l2toJSResult(`(> 3 5 7)`)).to.deep.equal(makeOk(`(3 > 5 > 7)`));
        expect(l2toJSResult(`(= 3 5)`)).to.deep.equal(makeOk(`(3 === 5)`));
        expect(l2toJSResult(`(not 3)`)).to.deep.equal(makeOk(`(!3)`));
        expect(l2toJSResult(`(and 3 5 7)`)).to.deep.equal(makeOk(`(3 && 5 && 7)`));
        expect(l2toJSResult(`(and #t #t #f)`)).to.deep.equal(makeOk(`(true && true && false)`));
        expect(l2toJSResult(`(or 3 5 7)`)).to.deep.equal(makeOk(`(3 || 5 || 7)`));
        expect(l2toJSResult(`(eq? 3 5)`)).to.deep.equal(makeOk(`(3 === 5)`));
        expect(l2toJSResult(`(boolean? #t)`)).to.deep.equal(makeOk(`(typeof true === 'boolean')`));
        expect(l2toJSResult(`(number? 5)`)).to.deep.equal(makeOk(`(typeof 5 === 'number')`));
        expect(l2toJSResult(`(> (+ x 1) (* x x))`)).to.deep.equal(makeOk(`((x + 1) > (x * x))`));
    
        expect(l2toJSResult(`(= 3 (< 1 2))`)).to.deep.equal(makeOk(`(3 === (1 < 2))`));
    });

    it("checks a multiple operands appExp", () => {
       // expect(l2toJSResult(`(< 1 2 6 3 4)`)).to.deep.equal(makeOk(`((1 < 2) && (2 < 6) && (6 < 3) && (3 < 4))`));
        expect(l2toJSResult(`(not 6)`)).to.deep.equal(makeOk(`(!6)`));
        expect(l2toJSResult(`(and #t 2 (- 3 2) 3 77)`)).to.deep.equal(makeOk(`(true && 2 && (3 - 2) && 3 && 77)`));

    });

    it('parses "if" expressions', () => {
        expect(l2toJSResult(`(if (> x 3) 4 5)`)).to.deep.equal(makeOk(`((x > 3) ? 4 : 5)`));
        expect(l2toJSResult(`(if #t 4 5)`)).to.deep.equal(makeOk(`(true ? 4 : 5)`));
        expect(l2toJSResult(`(if #f 4 5)`)).to.deep.equal(makeOk(`(false ? 4 : 5)`));
        expect(l2toJSResult(`(if 1 4 5)`)).to.deep.equal(makeOk(`(1 ? 4 : 5)`));
        expect(l2toJSResult(`(if 3 4)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(if (< x 2) x 2)`)).to.deep.equal(makeOk(`((x < 2) ? x : 2)`));
       // expect(l2toJSResult(`(if (< 1 2 6 3 4) 4 8)`)).to.deep.equal(makeOk(`(((1 < 2) && (2 < 6) && (6 < 3) && (3 < 4)) ? 4 : 8)`));

    });

    it('parses "lambda" expressions', () => {
        expect(l2toJSResult(`(lambda (x y) (* x y))`)).to.deep.equal(makeOk(`((x,y) => (x * y))`));
        expect(l2toJSResult(`((lambda (x y) (* x y)) 3 4)`)).to.deep.equal(makeOk(`((x,y) => (x * y))(3,4)`));
        expect(l2toJSResult(`((lambda (x y) ()))`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(lambda () 1)`)).to.deep.equal(makeOk(`(() => 1)`));
        expect(l2toJSResult(`(lambda (x) x x)`)).to.deep.equal(makeOk(`((x) => {x; return x;})`));
        expect(l2toJSResult(`((lambda (x y var) (or x y var)) 3 4 23)`)).to.deep.equal(makeOk(`((x,y,var) => (x || y || var))(3,4,23)`));

    });

    it("defines constants", () => {
        expect(l2toJSResult(`(define pi 3.14)`)).to.deep.equal(makeOk(`const pi = 3.14`));

        expect(l2toJSResult(`(define x 1)`)).to.deep.equal(makeOk(`const x = 1`));

        expect(l2toJSResult(`(define x)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define x y z)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define "1" y)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define 1 y)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define 3 321)`)).to.satisfy(isFailure);
        //expect(l2toJSResult(`(define 3h 0.18)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define)`)).to.satisfy(isFailure);
    });

    it("defines functions", () => {
        expect(l2toJSResult(`(define f (lambda (x y) (* x y)))`)).to.deep.equal(makeOk(`const f = ((x,y) => (x * y))`));
    });

    it("applies user-defined functions", () => {
        expect(l2toJSResult(`(f 3 4)`)).to.deep.equal(makeOk(`f(3,4)`));
        expect(l2toJSResult(`(g 3 4 (* 8 1) i)`)).to.deep.equal(makeOk(`g(3,4,(8 * 1),i)`));
        //expect(l2toJSResult(`(1f 3 4 (* 8 1) i)`)).to.satisfy(isFailure);
    });

    it("parses functions with multiple body expressions", () => {
        expect(l2toJSResult(`(define g (lambda (x y) (+ x 2) (- y 3) (* x y)))`)).to.deep.equal(makeOk(`const g = ((x,y) => {(x + 2); (y - 3); return (x * y);})`));
        //expect(l2toJSResult(`(define g (lambda (x y var) (+ x 2) (and y 3 var) (* 3 x y) (< x y var) (not var)))`)).to.deep.equal(makeOk(`const g = ((x,y,var) => {(x + 2); (y && 3 && var); (3 * x * y); ((x < y) && (y < var)); return (!var);})`));

    });

    it('parses programs', () => {
        expect(bind(parseL2(`(L2 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (not b) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = (3 > 4);\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n((!b) ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
        expect(bind(parseL2(`(L2 ())`), l2ToJS)).to.satisfy(isFailure);

        expect(bind(parseL2(`(L2 (define x 1) (> (+ x 1) (* x x)))`), l2ToJS)).to.deep.equal(makeOk(`const x = 1;\nconsole.log(((x + 1) > (x * x)));`));
        expect(bind(parseL2(`(L2 (define x 1) (define y (+ x x)) (* y y))`), l2ToJS)).to.deep.equal(makeOk(`const x = 1;\nconst y = (x + x);\nconsole.log((y * y));`));
        expect(bind(parseL2(`(L2 (lambda (x) x))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((x) => x));`));
        expect(bind(parseL2(`(L2 ((lambda (x) (* x x)) x))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((x) => (x * x))(x));`));
        expect(bind(parseL2(`(L2 ((lambda (x) (* x x)) 3))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((x) => (x * x))(3));`));
        expect(bind(parseL2(`(L2 (lambda (z) (x z)))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((z) => x(z)));`));
        expect(bind(parseL2(`(L2 (lambda (z) ((lambda (w) (z w)) z)))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((z) => ((w) => z(w))(z)));`));
        expect(bind(parseL2(`(L2 (define square (lambda (x) (* x x))) (square 3))`), l2ToJS)).to.deep.equal(makeOk(`const square = ((x) => (x * x));\nconsole.log(square(3));`));
        expect(bind(parseL2(`(L2 ((lambda (x) (boolean? #t)) x))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((x) => (typeof true === 'boolean'))(x));`));
        expect(bind(parseL2(`(L2 ((lambda (x) (number? #t)) x))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((x) => (typeof true === 'number'))(x));`));
        expect(bind(parseL2(`(L2 ((lambda (x) (boolean? 2)) x))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((x) => (typeof 2 === 'boolean'))(x));`));

    });

    it('parses one line program', () => {
        expect(bind(parseL2(`(L2 (if (> 5 3) 4 8))`), l2ToJS)).to.deep.equal(makeOk(`console.log(((5 > 3) ? 4 : 8));`));
    });
    it('parses programs with boolean', () => {
        expect(bind(parseL2(`(L2 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if #t (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = (3 > 4);\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n(true ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('parses programs with and', () => {
        expect(bind(parseL2(`(L2 (define b (and (> 3 4) (= 5 5))) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if #t (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = ((3 > 4) && (5 === 5));\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n(true ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('parses programs with and', () => {
        expect(bind(parseL2(`(L2 (define b (and (> 3 4) (= 5 5))) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (boolean? #f) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = ((3 > 4) && (5 === 5));\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n((typeof false === 'boolean') ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('Adler test', () => {
        expect(bind(parseL2(`(if 3 4)`), l2ToJS)).to.satisfy(isFailure);
    });
    it('parses programs with or', () => {
        expect(bind(parseL2(`(L2 (define b (or (> 3 4) (= 5 5) #f)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (number? (* 4 5 6)) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = ((3 > 4) || (5 === 5) || false);\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n((typeof (4 * 5 * 6) === 'number') ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('parses programs with eq?', () => {
        expect(bind(parseL2(`(L2 (define b (and (> 3 4) (eq? #t 5))) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if #t (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = ((3 > 4) && (true === 5));\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n(true ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
});