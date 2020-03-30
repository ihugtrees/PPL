import { expect } from "chai";
import { partition, mapMat, composeMany } from "../src/part2/part2";

describe("Assignment 1 Part 2", () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const expMat = [[1, 4, 9], [16, 25, 36], [49, 64, 81]];
    const squareAndHalf = composeMany([(x: number) => x / 2, (x: number) => x * x]);
    const add3 = composeMany([(x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1]);


    it("test for partition function, divide even and odd", () => {
        expect(partition((x: number) => x % 2 === 0, numbers)).to.equals([[2, 4, 6, 8], [1, 3, 5, 7, 9]]);
    });

    it("test for map function, power of 2 on matrix", () => {
        expect(mapMat((x: number) => x * x, mat)).to.equals(expMat);
    });

    it("test for composeMany function, squareAndHalf", () => {
        expect(squareAndHalf(5)).to.equals(12.5);
    });

    it("test for composeMany function, add3", () => {
        expect(add3(5)).to.equals(8);
    });
});