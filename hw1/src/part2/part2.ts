import { map, filter, compose } from 'ramda';

/* Question 1 */
export const partition = <T>(f: ((x: T) => boolean), array: T[]): T[][] => {
    let arr: T[][] = [array.filter(f), array.filter(((x: T): boolean => f(x) ? false : true))];
    return arr;
}

/* Question 2 */
export const mapMat = <T>(f: ((x: T) => T), mat: T[][]): T[][] => {
    let sol: T[][] = mat.map(map(f));
    return sol;
}

/* Question 3 */
export const composeMany = <T>(funcs: ((x: T) => T)[]): (x: T) => T => {
    let composed = funcs.reduce((composedF: ((x: T) => T), currF: ((x: T) => T)): (x: T) => T => 
    { return composedF = compose(composedF, currF) });

    return composed;
}

/* Question 4 */
interface Languages {
    english: string;
    japanese: string;
    chinese: string;
    french: string;
}

interface Stats {
    HP: number;
    Attack: number;
    Defense: number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    Speed: number;
}

interface Pokemon {
    id: number;
    name: Languages;
    type: string[];
    base: Stats;
}

export const maxSpeed = undefined;

export const grassTypes = undefined;

export const uniqueTypes = undefined;
