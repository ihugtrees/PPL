import { expect } from "chai";
import { Optional, makeNone, makeSome } from "../src/part3/optional";
import { Result, naiveValidateUser, monadicValidateUser, isFailure, isOk } from "../src/part3/result";

describe("Assignment 1 Part 3", () => {

    it("test for optional functions, check is number is modolu 5", () => {
        const module5 = (x: number): Optional<boolean> => x % 5 === 0 ? makeSome(true) : makeNone();
        expect(module5(10)).to.eql({ tag: 'Some', value: true })
        expect(module5(13)).to.eql({ tag: 'None' })
    });

    interface User {
        name: string;
        email: string;
        handle: string;
    }

    let user1: User = { name: "Tempo", email: "TempoTheDog@post.bgu.ac.il", handle: "Woof" }
    let user2: User = { name: "Bananas", email: "ban@walla.co.il", handle: "name Banana" }
    let user3: User = { name: "badEmail", email: "bene@bananas.com", handle: "email" }
    let user4: User = { name: "badHandle", email: "abc@gmail.com", handle: "@handle" }

    it("test for result functions, checks user 1", () => {

        expect(isOk(naiveValidateUser(user1))).to.equal(true)

        expect(isOk(monadicValidateUser(user1))).to.equal(true)

    }); 

    it("test for result functions, checks user bad name", () => {

        expect(isOk(naiveValidateUser(user2))).to.equal(false)

        expect(isFailure(monadicValidateUser(user2))).to.equal(true)

    }); 

    it("test for result functions, checks user bad email", () => {

        expect(isOk(naiveValidateUser(user3))).to.equal(false)

        expect(isOk(monadicValidateUser(user3))).to.equal(false)

    });

    it("test for result functions, checks user bad handle", () => {

        expect(isOk(naiveValidateUser(user4))).to.equal(false)

        expect(isOk(monadicValidateUser(user4))).to.equal(false)

    });
});