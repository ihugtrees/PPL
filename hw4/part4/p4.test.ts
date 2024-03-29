import { expect, assert } from 'chai';
import { f, g, h, slower } from './part4';


const getFastPromise = () => Promise.resolve("fast");

const slowPromiseValue = "slow";
const getSlowPromise = () => new Promise((resolve, reject) => {
    setTimeout(resolve, 100, slowPromiseValue);
});

const rejectValue = new Error("reject");
const getFastRejectingPromise = () => Promise.reject(rejectValue);
const getSlowRejectingPromise = () => new Promise((resolve, reject) => {
    setTimeout(reject, 100, rejectValue);
});


describe('slower tests', () => {
    it('assignment example', async () => {
        const promise1 = new Promise((resolve, reject) => {
            setTimeout(resolve, 500, 'one');
        });

        const promise2 = new Promise((resolve, reject) => {
            setTimeout(resolve, 100, 'two');
        });

        const value = await slower([promise1, promise2]);
        expect(value).to.deep.equal([0, 'one']);
    });

    it('2 promises fulfill - return value of slower', async () => {
        let value = await slower([getSlowPromise(), getFastPromise()]);
        expect(value).to.deep.equal([0, slowPromiseValue]);

        value = await slower([getFastPromise(), getSlowPromise()]);
        expect(value).to.deep.equal([1, slowPromiseValue]);
    });

    it('2 promises reject - reject', async () => {
        try {
            await slower([getFastRejectingPromise(), getSlowRejectingPromise()])
        }
        catch (e) {
            expect(e).to.deep.equal(rejectValue);
            return;
        }
        assert.fail("must throw");
    });

    it('2 promises reject - reject (call in reverse order)', async () => {
        try {
            await slower([getSlowRejectingPromise(), getFastRejectingPromise()])
        }
        catch (e) {
            expect(e).to.deep.equal(rejectValue);
            return;
        }
        assert.fail("must throw");
    });

    it('fast promise rejects - reject', async () => {
        try {
            await slower([getFastRejectingPromise(), getSlowPromise()]);
        }
        catch (e) {
            expect(e).to.deep.equal(rejectValue);
            return;
        }
        assert.fail("must throw");
    });

    it('fast promise rejects - reject (call in reverse order)', async () => {
        try {
            await slower([getSlowPromise(), getFastRejectingPromise()]);
        }
        catch (e) {
            expect(e).to.deep.equal(rejectValue);
            return;
        }
        assert.fail("must throw");
    });

    it('slow promise rejects - reject', async () => {
        try {
            await slower([getSlowRejectingPromise(), getFastPromise()]);
        }
        catch (e) {
            expect(e).to.deep.equal(rejectValue);
            return;
        }
        assert.fail("must throw");
    });

    it('slow promise rejects - reject (call in reverse order)', async () => {
        try {
            await slower([getFastPromise(), getSlowRejectingPromise()]);
        }
        catch (e) {
            expect(e).to.deep.equal(rejectValue);
            return;
        }
        assert.fail("must throw");
    });
});

describe('f g h tests', () => {
    it('h(5) = f(g(5)) = 1/(5*5) = 1/25', async () => {
        let res = await h(5);
        expect(res).to.deep.equal(1/(5*5));
    });

    it('h(0) = f(g(0)) = 1/(0*0) = error', async () => {
        try {
            await h(0);
        }
        catch (err) {
            expect(err).to.deep.equal('error');
            return;
        }
        assert.fail("Must handle error");
    });
});

describe('promises a', () => {
    it('test f - should return 1', async () => {
        expect(await f(1)).to.equal(1);
    });
    it('test f - 2 should return 0.5', async () => {
        expect(await f(2)).to.equal(0.5);
    });
    //todo: change acoording to answer 
    //https://www.cs.bgu.ac.il/~ppl202/Forum_Ex_4?action=show-thread&id=88454bac09c11b04031c40f7f9ea1bca
    it('test f - should fail', async () => {
        await f(0).catch(error => expect(error).to.deep.equal('error'));
    });
    it('test g - should return 1', async () => {
        expect(await g(1)).to.equal(1);
    });
    it('test g - 2 should return 4', async () => {
        expect(await g(2)).to.equal(4);
    });
    it('test g - should return 0', async () => {
        expect(await g(0)).to.equal(0);
    });
    it('test h - should return 1', async () => {
        expect(await h(1)).to.equal(1);
    });
    it('test h - 2 should return 0.25', async () => {
        expect(await h(2)).to.equal(0.25);
    });
    it('test h - should fail', async () => {
        await h(0).catch(error => expect(error).to.deep.equal('error'));
    });
});

describe('promises 2', () => {

    it('both fail', async () => {
        const first = Promise.reject(new Error("the end has come"));
        const second = Promise.reject(new Error("failing"));
        await slower([first, second]).catch(error => expect(error).to.be.an("error"));
    });

    it('the first', async () => {
        const lateFuncProm = new Promise((resolve) =>
            setTimeout(() => resolve('i\'m late'), 1));
        const alreadyFulfilledProm = Promise.resolve(666);
        expect(await slower([lateFuncProm, alreadyFulfilledProm]))
            .to.deep.equal([0, 'i\'m late']);
    });

    it('the second', async () => {
        const lateFuncProm = new Promise((resolve) =>
            setTimeout(() => resolve('i\'m late'), 1));
        const alreadyFulfilledProm = Promise.resolve(666);
        expect(await slower([alreadyFulfilledProm, lateFuncProm]))
            .to.deep.equal([1, 'i\'m late']);
    });
});