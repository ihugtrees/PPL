import fs from "fs";
import { expect } from "chai";
import { partition, mapMat, composeMany, maxSpeed, grassTypes, uniqueTypes } from "../src/part2/part2";

describe("Assignment 1 Part 2", () => {
    describe("Question 1", () => {
        it("partitions a list of numbers given a predicate", () => {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            expect(partition((x: number) => x % 2 === 0, numbers)).to.deep.equal([[2, 4, 6, 8], [1, 3, 5, 7, 9]]);
        });
        
        it("partitions a list of strings given a predicate", () => {
            const strings = ["Ben", "Michael", "Dor", "Meni"];
            expect(partition((s: string) => s.length <= 3, strings)).to.deep.equal([["Ben", "Dor"], ["Michael", "Meni"]]);
        });
    });

    describe("Question 2", () => {
        it("applies a function on a matrix of numbers", () => {
            const mat1 = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ];
            expect(mapMat(x => x * x, mat1)).to.deep.equal([[1, 4, 9], [16, 25, 36], [49, 64, 81]]);
        });

        it("applies a function to matrix of strings", () => {
            const mat2 = [
                ["chat", "chien", "chouette"],
                ["cat", "dog", "owl"],
                ["hatul", "kelev", "yanshuf"]
            ];
            expect(mapMat(s => s.length, mat2)).to.deep.equal([[4, 5, 8], [3, 3, 3], [5, 5, 7]]);
        });
    });

    describe("Question 3", () => {
        it("composes zero functions", () => {
            const f0 = composeMany([]);
            expect(f0(3)).to.equal(3);
        });

        it("composes one function", () => {
            const f1 = composeMany([(x: number) => x * x]);
            expect(f1(5)).to.equal(25);
        });

        it("composes two functions", () => {
            const f2 = composeMany([(x: number) => x + 1, (x: number) => x * x]);
            expect(f2(5)).to.equal(26);

            const f2_2 = composeMany([(x: number[]) => x.concat([42]),
                                      (x: number[]) => x.concat([1337])]);
            expect(f2_2([1, 2, 3])).to.deep.equal([1, 2, 3, 1337, 42]);
        });

        it("composes three functions", () => {
            const f3 = composeMany([(x: number) => x / 2,
                                    (x: number) => x * x,
                                    (x: number) => x * 3 + 1]);
            expect(f3(5)).to.equal(128);
        });
    });

    describe("Question 4", () => {
        const pokedex = JSON.parse(fs.readFileSync("pokedex.json", { encoding: "utf-8" }));

        describe("maxSpeed", () => {
            it("returns an array with the Pokemon with highest speed", () => {
                const expected = [{
                    id: 291,
                    name: {
                        english: 'Ninjask',
                        japanese: 'テッカニン',
                        chinese: '铁面忍者',
                        french: 'Ninjask'
                    },
                    type: [ 'Bug', 'Flying' ],
                    base: {
                        HP: 61,
                        Attack: 90,
                        Defense: 45,
                        'Sp. Attack': 50,
                        'Sp. Defense': 50,
                        Speed: 160
                    }
                }];
                
                expect(new Set(maxSpeed(pokedex))).to.deep.equal(new Set(expected));
                expect(new Set(maxSpeed(pokedex.slice(0, 5)))).to.deep.equal(new Set([pokedex[2], pokedex[4]]));
            });
        });

        describe("grassTypes", () => {
            it("returns an array of the English names of all Grass-type Pokemon", () => {
                const expected = [
                    'Abomasnow',  'Amoonguss',  'Bayleef',    'Bellossom', 'Bellsprout',
                    'Bounsweet',  'Breloom',    'Budew',      'Bulbasaur', 'Cacnea',
                    'Cacturne',   'Carnivine',  'Celebi',     'Cherrim',   'Cherubi',
                    'Chesnaught', 'Chespin',    'Chikorita',  'Cottonee',  'Cradily',
                    'Dartrix',    'Decidueye',  'Deerling',   'Dhelmise',  'Exeggcute',
                    'Exeggutor',  'Ferroseed',  'Ferrothorn', 'Fomantis',  'Foongus',
                    'Gloom',      'Gogoat',     'Gourgeist',  'Grotle',    'Grovyle',
                    'Hoppip',     'Ivysaur',    'Jumpluff',   'Kartana',   'Leafeon',
                    'Leavanny',   'Lileep',     'Lilligant',  'Lombre',    'Lotad',
                    'Ludicolo',   'Lurantis',   'Maractus',   'Meganium',  'Morelull',
                    'Nuzleaf',    'Oddish',     'Pansage',    'Paras',     'Parasect',
                    'Petilil',    'Phantump',   'Pumpkaboo',  'Quilladin', 'Roselia',
                    'Roserade',   'Rowlet',     'Sawsbuck',   'Sceptile',  'Seedot',
                    'Serperior',  'Servine',    'Sewaddle',   'Shaymin',   'Shiftry',
                    'Shiinotic',  'Shroomish',  'Simisage',   'Skiddo',    'Skiploom',
                    'Snivy',      'Snover',     'Steenee',    'Sunflora',  'Sunkern',
                    'Swadloon',   'Tangela',    'Tangrowth',  'Tapu Bulu', 'Torterra',
                    'Treecko',    'Trevenant',  'Tropius',    'Tsareena',  'Turtwig',
                    'Venusaur',   'Victreebel', 'Vileplume',  'Virizion',  'Weepinbell',
                    'Whimsicott', 'Wormadam'
                ];

                expect(grassTypes(pokedex)).to.deep.equal(expected);
                expect(grassTypes(pokedex.slice(0, 6))).to.deep.equal(["Bulbasaur", "Ivysaur", "Venusaur"]);
            });
        });

        describe("uniqueTypes", () => {
            it("returns an array of all unique Pokemon types", () => {
                const expected = [
                    'Bug',     'Dark',
                    'Dragon',  'Electric',
                    'Fairy',   'Fighting',
                    'Fire',    'Flying',
                    'Ghost',   'Grass',
                    'Ground',  'Ice',
                    'Normal',  'Poison',
                    'Psychic', 'Rock',
                    'Steel',   'Water'
                ];
                
                expect(uniqueTypes(pokedex)).to.deep.equal(expected);
                expect(uniqueTypes(pokedex.slice(0, 6))).to.deep.equal(["Fire", "Flying", "Grass", "Poison"]);
            });
        });
    });
});