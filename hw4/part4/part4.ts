
export const f = (x: number): Promise<number> =>
    new Promise<number>((resolve, reject) =>
        x === 0 ? reject("error") : resolve(1 / x)
    )


export const g = (x: number): Promise<number> =>
    new Promise<number>((resolve, reject) =>
        typeof (x * x) === "number" ? resolve(x * x) : reject("must be number")
    )


export const h = (x: number): Promise<number> =>
    new Promise<number>((resolve, reject) =>
        g(x)
            .then((x) => f(x))
            .then((x) => resolve(x))
            .catch((err) => reject(err))
    )

export const slower = (promises: Promise<any>[]): Promise<any[]> =>
    new Promise<any[]>((resolve, reject) =>
        Promise.race(promises)
            .then((fasterValue) => {
                Promise.all(promises)
                    .then((values) => resolve(fasterValue === values[0] ? [1, values[1]] : [0, values[0]]))
                    .catch((e) => reject(e))
            })
            .catch((e) => reject(e))
    )
