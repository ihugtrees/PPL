import { map, filter, compose, indexOf } from 'ramda';

/* Question 1 */
export const partition = <T>(f: ((x: T) => boolean), array: T[]): T[][] => {
    let arr: T[][] = [array.filter(f), array.filter(((x: T): boolean => f(x) ? false : true))];
    return arr;
}

/* Question 2 */
export const mapMat = <T,U>(f: ((x: T) => U), mat: T[][]): U[][] => {
    let sol: U[][] = mat.map(map(f));
    return sol;
}

/* Question 3 */
export const composeMany = <T>(funcs: ((x: T) => T)[]): (x: T) => T => {
    let composed = funcs.reduce((composedF: ((x: T) => T), currF: ((x: T) => T)): (x: T) => T => { return composedF = compose(composedF, currF) });

    return composed;
    
}

/* Question 4 */
export interface Languages {
    english: string;
    japanese: string;
    chinese: string;
    french: string;
}

export interface Stats {
    HP: number;
    Attack: number;
    Defense: number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    Speed: number;
}

export interface Pokemon {
    id: number;
    name: Languages;
    type: string[];
    base: Stats;
}

export const maxSpeed = (pokedex: Pokemon[]): Pokemon[] => {
    let maxPokSpeed: number = pokedex.reduce((max: number, curr: Pokemon): number => {
        return max < curr.base.Speed ? curr.base.Speed : max;
    }, 0);

    return pokedex.filter((p: Pokemon): boolean => { return p.base.Speed === maxPokSpeed });
}

export const grassTypes = (pokedex: Pokemon[]): string[] => {
    let grassPokes: Pokemon[] = pokedex.filter((p: Pokemon): boolean => { return p.type.includes("Grass") })
    return grassPokes.map((x: Pokemon): string => { return x.name.english }).sort()
}

export const uniqueTypes = (pokedex: Pokemon[]): string[] => {
    let uniqueTypes: string[] = pokedex.reduce((types: string[], curr: Pokemon): string[] => {
        return types.concat(curr.type);
    }, []);

    return uniqueTypes.filter((x: string, index: number): boolean => { return uniqueTypes.indexOf(x) === index }).sort();
}
