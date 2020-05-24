import fs from 'fs';
import { expect } from 'chai';

import { L4toMermaid } from './mermaid';
import { isFailure, isOk } from '../shared/result';

describe('L4 MER', () => {
    it('eval empty', () => {
        expect(L4toMermaid("")).to.satisfy(isFailure);
    });
    it('empty program', () => {
        const res = L4toMermaid(`(L4)`);
        expect(res).to.satisfy(isFailure);
    });
    it('empty program with space', () => {
        const res = L4toMermaid(`(L4 )`);
        expect(res).to.satisfy(isFailure);
    });
    it('ex 1 - program, atomic', () => {
        const res = L4toMermaid(`(L4 1 #t "hello")`);
        const mer = fs.readFileSync('part2/mers/mer1').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 2 - if', () => {
        const res = L4toMermaid(`(if #t 1 2)`);
        const mer = fs.readFileSync('part2/mers/mer2').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 3 - proc, app', () => {
        const res = L4toMermaid(`(if (< x 2) (+ x 3) (lambda (x) (+ x 1)))`);
        const mer = fs.readFileSync('part2/mers/mer3').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 4', () => {
        const res = L4toMermaid(`(+ (+ 1 2) (- 4 3))`);
        const mer = fs.readFileSync('part2/mers/mer4').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 5', () => {
        const res = L4toMermaid(`( lambda (x y) (+ x y) 1 (- x y))`);
        const mer = fs.readFileSync('part2/mers/mer5').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 6', () => {
        const res = L4toMermaid(`(lambda (x y) ((lambda (x) (+ x y)) (+ x x)) 1)`);
        const mer = fs.readFileSync('part2/mers/mer6').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 7 - letrec', () => {
        const res = L4toMermaid(`(letrec ((fact (lambda (n) (if (= n 0) 1 (* n (fact (- n 1)))))))(fact 3))`);
        const mer = fs.readFileSync('part2/mers/mer7').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 8 - let', () => {
        const res = L4toMermaid(`(let ((x 3) (y 5)) 3)`);
        const mer = fs.readFileSync('part2/mers/mer8').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 9', () => {
        const res = L4toMermaid(`(let ((x 3) (y 5)) (+ x y))`);
        const mer = fs.readFileSync('part2/mers/mer9').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 10', () => {
        const res = L4toMermaid(`1`);
        const mer = fs.readFileSync('part2/mers/mer10').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 11 - define', () => {
        const res = L4toMermaid(`(L4 (define square (lambda (x) (* x x))) (square 3))`);
        const mer = fs.readFileSync('part2/mers/mer11').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 12', () => {
        const res = L4toMermaid(`(L4 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (not b) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`);
        const mer = fs.readFileSync('part2/mers/mer12').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 13', () => {
        const res = L4toMermaid(`(L4 (lambda (z) (x z)))`);
        const mer = fs.readFileSync('part2/mers/mer13').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 14', () => {
        const res = L4toMermaid(`(L4 ((lambda (x) (number? x y)) x))`);
        const mer = fs.readFileSync('part2/mers/mer14').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 15', () => {
        const res = L4toMermaid(`(define my-list '(1 2 3 4 5))`);
        const mer = fs.readFileSync('part2/mers/mer15').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 16', () => {
        const res = L4toMermaid(`(define my-list '(1 2))`);
        const mer = fs.readFileSync('part2/mers/mer16').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 17', () => {
        const res = L4toMermaid(`(+ 3 5 7)`);
        const mer = fs.readFileSync('part2/mers/mer17').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
    it('ex 18 - set', () => {
        const res = L4toMermaid(`(L4 (set! x 5)  (+ x 5))`);
        const mer = fs.readFileSync('part2/mers/mer18').toString();
        expect(res).to.satisfy(isOk);
        expect('value' in res && res.value).to.equal(mer);
    });
});