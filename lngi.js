function map(x) {

    x = new Decimal(x);

    return new Decimal(1).minus(
        new Decimal(2).div(3).pow(x)
    );
}

// log_{2/3}(1 - x)
function unmap(x) {

    x = new Decimal(x);

    return new Decimal(1).minus(x)
        .ln()
        .div(
            new Decimal(2).div(3).ln()
        );
}
function gen_init_bms(x) {
    x = new Decimal(x)

    let s = ""
    let e = ""
    let i = new Decimal(0)

    while (i.lt(x)) {
        s = s + "0,"
        e = e + "1,"
        i = i.plus(1)
    }

    return "(" + s + "0)(" + e + "1)[60]"
}


function lngi(x) {

    x = new Decimal(x)

    // boundary conditions
    if (x.gt(1)) return ["Lim(BMS)",new Decimal(0)]
    if (x.lt(0)) return ["0",new Decimal(0)]

    x = unmap(x)

    // special case: 0 <= x < 1
    if (x.gte(0) && x.lt(1)) {
        let k = Decimal.floor(
            Decimal.log(Decimal.sub(1, x), Decimal.div(2, 3))
        ).toNumber()

        return (k === 0) ? ["0",1] : ["(0)".repeat(k),new Decimal(k)]
    }

    let s = gen_init_bms(x.floor())

    let j = x.mod(1)

    let k = [new Decimal(1)]

    let l = new Decimal(0)
    let m = new Decimal(0)

    while (l.lt(Decimal.precision)) {

        if (j.lt(0.5)) {

            j = j.times(2)
            k.push(new Decimal(0))
            m = m.plus(1)

        } else {

            j = j.minus(0.5).times(2)
            k[k.length - 1] = k[k.length - 1].plus(1)

            if (j.eq(0)) {
                l = new Decimal(30)
            }
        }

        l = l.plus(1)
    }

    let p = new Decimal(0)
    let i = new Decimal(0)

    while (i.lte(m)) {

        let t = new Decimal(Bms.parse(s).s.length)

        s = Bms.str2expand(s, k[i].toNumber())

        let u = new Decimal(Bms.parse(s).s.length)

        if (t.minus(1).gte(u)) {
            break
        }

        p = p.plus(k[i]).plus(1)
        i = i.plus(1)
    }

    return [s.slice(0, -4), Decimal.min(p, new Decimal(Decimal.precision)).toNumber()]
}
