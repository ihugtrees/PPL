/* Question 1 */

import { values } from "ramda";

export type Optional<T> = Some<T> | None;
export type Some<T> = ({tag : "Some" , value : T});
export type None = ({tag : "None"});

export const makeSome = <T>( content : T  ) : Some<T> => {
    return ({tag:"Some" , value : content});//normaly content is called value
}

export const makeNone = () : None => {
    return ({tag : "None"});
}



export const isSome = <T>( bob : Optional<T> ) : bob is Some<T> => {
    return bob.tag==="Some";
}

export const isNone = <T>( bob : Optional<T> ) : bob is None => {
    return bob.tag==="None";
}

/* Question 2 */
export const bind =  <T, U>(opInput: Optional<T>, f: (x: T) => Optional<U>): Optional<U> => { 
    return isNone(opInput) ? makeNone() : f(opInput.value); 
    // same as :
    // if (isNone(opInput)){
    //     return makeNone();
    // }
    // else{
    //     return f(opInput.value);
    // }

}

