import { isOk } from "../shared/result";
import { L4toMermaid } from "./mermaid";

const p1 = L4toMermaid('(L4 (define x 1) (define y (if #t 1 +)) (+ 1 2) #t 3 x y)');
const p2 = L4toMermaid('(/ #t 2)');
const p3 = L4toMermaid(`(define x 1)`);
const p4 = L4toMermaid('(lambda (x y) ((lambda (x) (+ x y)) (+ x x)) 1) ');
const p5 = L4toMermaid('"Hello"');
const p6 = L4toMermaid('(if #t 1 +)');
const p7 = L4toMermaid('(lambda (x y) (+ x y))');
const p8 = L4toMermaid('(L4 1 (lambda (x y) (+ x y)))');
const p9 = L4toMermaid('(let ((x 3) (y 2)) (+ x y))');
const p10 = L4toMermaid('(L4 (let ((x 3) (y 2)) (+ x y) (/ y x)))');
const p11 = L4toMermaid('(L4 1)');
const p12 = L4toMermaid('(L4 1 (+ 1 2))');
const p14 = L4toMermaid(`(L4 '+)`);
const p15 = L4toMermaid(`(L4 '(Buchris (+ 1 2)))`);
const p16 = L4toMermaid(`'1`);
const p17 = L4toMermaid('(L4 (letrec ((x 3) (y 2)) (+ x y) (/ y x)))');
const p18 = L4toMermaid('(L4 (set! x 5))');
const p19 = L4toMermaid('(set! x 5)');
const p20 = L4toMermaid('(lambda (x y)    ((lambda(x)(+ x y))        (+ x x)) 1)');
const p21 = L4toMermaid(`(define my-list '(1 2))`);
const p22 = L4toMermaid('1');
const p23 = L4toMermaid('(L4 1 #t “hello”)');

isOk(p1) ? console.log(p1.value) : console.log(p1.message)
isOk(p2) ? console.log(p2.value) : console.log(p2.message)
isOk(p3) ? console.log(p3.value) : console.log(p3.message)
isOk(p4) ? console.log(p4.value) : console.log(p4.message)
isOk(p5) ? console.log(p5.value) : console.log(p5.message)
isOk(p6) ? console.log(p6.value) : console.log(p6.message)
isOk(p7) ? console.log(p7.value) : console.log(p7.message)
isOk(p8) ? console.log(p8.value) : console.log(p8.message)
isOk(p9) ? console.log(p9.value) : console.log(p9.message)
isOk(p10) ? console.log(p10.value) : console.log(p10.message)
isOk(p11) ? console.log(p11.value) : console.log(p11.message)
isOk(p12) ? console.log(p12.value) : console.log(p12.message)
isOk(p14) ? console.log(p14.value) : console.log(p14.message)
isOk(p15) ? console.log(p15.value) : console.log(p15.message)
isOk(p16) ? console.log(p16.value) : console.log(p16.message)
isOk(p17) ? console.log(p17.value) : console.log(p17.message)
isOk(p18) ? console.log(p18.value) : console.log(p18.message)
isOk(p19) ? console.log(p19.value) : console.log(p19.message)
isOk(p20) ? console.log(p20.value) : console.log(p20.message)
isOk(p21) ? console.log(p21.value) : console.log(p21.message)
isOk(p22) ? console.log(p22.value) : console.log(p22.message)
isOk(p23) ? console.log(p23.value) : console.log(p23.message)