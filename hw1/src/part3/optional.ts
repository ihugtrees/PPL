/* Question 1 */

import { values } from "ramda";

export type Optional<T> = Some<T> | None;
type Some<T> = ({ tag: "Some", value: T });
type None = ({ tag: "None" });

export const makeSome = <T>(content: T): Some<T> => {
    return ({ tag: "Some", value: content });//normaly content is called value
}

export const makeNone = (): None => {
    return ({ tag: "None" });
}

export const isSome = <T>(bob: Optional<T>): bob is Some<T> => {
    return bob.tag === "Some";
}

export const isNone = <T>(bob: Optional<T>): bob is None => {
    return bob.tag === "None";
}

/* Question 2 */
export const bind = <T, U>(opInput: Optional<T>, function1: (x: T) => Optional<U>): Optional<U> => {
    return isNone(opInput) ? makeNone() : function1(opInput.value);

    // if (isNone(opInput)) {
    //     return makeNone();
    // }
    // let result: Optional<U> = function1(opInput.value);

    // if (isNone(result)) {
    //     return makeNone();
    // }
    // return result;
}
