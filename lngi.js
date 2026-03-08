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