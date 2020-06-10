
export function* braid(generator1: Generator, generator2: Generator): Generator {

    let val1 = generator1.next();
    let val2 = generator2.next();

    while (!val1.done || !val2.done) {
        if (!val1.done) {
            yield val1.value;
            val1 = generator1.next();
        }
        if (!val2.done) {
            yield val2.value;
            val2 = generator2.next();
        }
    }
}

export function* biased(generator1: Generator, generator2: Generator): Generator {

    let val1 = generator1.next();
    let val2 = generator2.next();

    while(!val1.done || !val2.done){
        if(!val1.done){
            yield val1.value;
            val1 = generator1.next();
            if(!val1.done){
                yield val1.value;
                val1 = generator1.next();
            }
        }
        if(!val2.done){
            yield val2.value;
            val2 = generator2.next();
        }
    }
}