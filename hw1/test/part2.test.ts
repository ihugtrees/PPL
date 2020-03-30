import { expect } from "chai";
import { partition, mapMat, composeMany, maxSpeed, Pokemon, grassTypes, uniqueTypes } from "../src/part2/part2";

describe("Assignment 1 Part 2", () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const expMat = [[1, 4, 9], [16, 25, 36], [49, 64, 81]];
    const squareAndHalf = composeMany([(x: number) => x / 2, (x: number) => x * x]);
    const add3 = composeMany([(x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1]);


    it("test for partition function, divide even and odd", () => {
        expect(partition((x: number) => x % 2 === 0, numbers)).to.deep.equal([[2, 4, 6, 8], [1, 3, 5, 7, 9]]);
    });

    it("test for map function, power of 2 on matrix", () => {
        expect(mapMat((x: number) => x * x, mat)).to.deep.equal(expMat);
    });

    it("test for composeMany function, squareAndHalf", () => {
        expect(squareAndHalf(5)).to.equals(12.5);
    });

    it("test for composeMany function, add3", () => {
        expect(add3(5)).to.equals(8);
    });
});

describe("Assignment 1 Pokedex", () => {

    const pokedex: Pokemon[] = [
        {
            "id": 1,
            "name": {
                "english": "Bulbasaur",
                "japanese": "フシギダネ",
                "chinese": "妙蛙种子",
                "french": "Bulbizarre"
            },
            "type": [
                "Grass",
                "Poison"
            ],
            "base": {
                "HP": 45,
                "Attack": 49,
                "Defense": 49,
                "Sp. Attack": 65,
                "Sp. Defense": 65,
                "Speed": 45
            }
        },
        {
            "id": 2,
            "name": {
                "english": "Ivysaur",
                "japanese": "フシギソウ",
                "chinese": "妙蛙草",
                "french": "Herbizarre"
            },
            "type": [
                "Grass",
                "Poison"
            ],
            "base": {
                "HP": 60,
                "Attack": 62,
                "Defense": 63,
                "Sp. Attack": 80,
                "Sp. Defense": 80,
                "Speed": 60
            }
        },
        {
            "id": 3,
            "name": {
                "english": "Venusaur",
                "japanese": "フシギバナ",
                "chinese": "妙蛙花",
                "french": "Florizarre"
            },
            "type": [
                "Grass",
                "Poison"
            ],
            "base": {
                "HP": 80,
                "Attack": 82,
                "Defense": 83,
                "Sp. Attack": 100,
                "Sp. Defense": 100,
                "Speed": 80
            }
        },
        {
            "id": 4,
            "name": {
                "english": "Charmander",
                "japanese": "ヒトカゲ",
                "chinese": "小火龙",
                "french": "Salamèche"
            },
            "type": [
                "Fire"
            ],
            "base": {
                "HP": 39,
                "Attack": 52,
                "Defense": 43,
                "Sp. Attack": 60,
                "Sp. Defense": 50,
                "Speed": 65
            }
        },
        {
            "id": 5,
            "name": {
                "english": "Charmeleon",
                "japanese": "リザード",
                "chinese": "火恐龙",
                "french": "Reptincel"
            },
            "type": [
                "Fire"
            ],
            "base": {
                "HP": 58,
                "Attack": 64,
                "Defense": 58,
                "Sp. Attack": 80,
                "Sp. Defense": 65,
                "Speed": 80
            }
        }
    ]


    it("test for maxSpeed function", () => {
        expect(maxSpeed(pokedex)).to.deep.equal(
            [{
                "id": 3,
                "name": {
                    "english": "Venusaur",
                    "japanese": "フシギバナ",
                    "chinese": "妙蛙花",
                    "french": "Florizarre"
                },
                "type": [
                    "Grass",
                    "Poison"
                ],
                "base": {
                    "HP": 80,
                    "Attack": 82,
                    "Defense": 83,
                    "Sp. Attack": 100,
                    "Sp. Defense": 100,
                    "Speed": 80
                }
            }, {
                "id": 5,
                "name": {
                    "english": "Charmeleon",
                    "japanese": "リザード",
                    "chinese": "火恐龙",
                    "french": "Reptincel"
                },
                "type": [
                    "Fire"
                ],
                "base": {
                    "HP": 58,
                    "Attack": 64,
                    "Defense": 58,
                    "Sp. Attack": 80,
                    "Sp. Defense": 65,
                    "Speed": 80
                }
            }]);
    });

    it("test for grassTypes function", () => {
        expect(grassTypes(pokedex)).to.deep.equal(["Bulbasaur", "Ivysaur", "Venusaur"]);
    });

    it("test for uniqueTypes function", () => {
        expect(uniqueTypes(pokedex)).to.deep.equal(["Fire", "Grass", "Poison"]);
    });
});