/* Question 3 */

import { makeSome } from "./optional";

export type Result<T> = Ok<T> | Failure;

const makeOk = <T>(value1: T): Ok<T> => ({ tag: "Ok", value: value1 });
const makeFailure = <T>(message1: string): Failure => ({ tag: "Failure", message: message1 });

export const isOk = <T>(bob: Result<T>): bob is Ok<T> => bob.tag === "Ok";


export const isFailure = <T>(bob: Result<T>): bob is Failure => bob.tag === "Failure";


interface Ok<T> {
    tag: "Ok";
    value: T;
}

interface Failure {
    tag: "Failure";
    message: string;
}

/* Question 4 */
export const bind = <T, U>(res: Result<T>, f: (x: T) => Result<U>): Result<U> => {
    return isOk(res) ? f(res.value) : makeFailure(res.message);
}


/* Question 5 */
interface User {
    name: string;
    email: string;
    handle: string;
}

const validateName = (user: User): Result<User> =>
    user.name.length === 0 ? makeFailure("Name cannot be empty") :
        user.name === "Bananas" ? makeFailure("Bananas is not a name") :
            makeOk(user);

const validateEmail = (user: User): Result<User> =>
    user.email.length === 0 ? makeFailure("Email cannot be empty") :
        user.email.endsWith("bananas.com") ? makeFailure("Domain bananas.com is not allowed") :
            makeOk(user);

const validateHandle = (user: User): Result<User> =>
    user.handle.length === 0 ? makeFailure("Handle cannot be empty") :
        user.handle.startsWith("@") ? makeFailure("This isn't Twitter") :
            makeOk(user);

            
export const naiveValidateUser = (user: User): Result<User> => {
    let name = validateName(user);
    if (isFailure(name)) {
        return name;
    }
    else {
        let email = validateEmail(user);
        if (isFailure(email))
            return email;
        else
            return validateHandle(user)
    }
}

export const monadicValidateUser = (user: User): Result<User> => {
    return bind(bind(validateName(user), validateEmail), validateHandle);
}
