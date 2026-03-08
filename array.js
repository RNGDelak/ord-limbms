// Requires decimal.js
// const Decimal = require('decimal.js')




const D0 = new Decimal(0)
const D1 = new Decimal(1)

function D(x){
    return x instanceof Decimal ? x : new Decimal(x)
}

/* ---------------- dimensions ---------------- */

Array.prototype.dims = function () {

    if (this.length === 0) return 1

    if (Array.isArray(this[0])) {
        return this[0].dims() + 1
    }

    return 1
}

/* ---------------- min ---------------- */

Array.prototype.min = function () {

    if (this.length === 0) return undefined

    var ret = D(this[0])

    for (var i = 1; i < this.length; i++) {

        var v = D(this[i])

        if (v.lt(ret)) ret = v
    }

    return ret
}

/* ---------------- max ---------------- */

Array.prototype.max = function () {

    if (this.length === 0) return undefined

    var ret = D(this[0])

    for (var i = 1; i < this.length; i++) {

        var v = D(this[i])

        if (v.gt(ret)) ret = v
    }

    return ret
}

/* ---------------- argmax ---------------- */

Array.prototype.argmax = function () {

    if (this.length === 0) return -1

    var best = D(this[0])
    var idx = 0

    for (var i = 1; i < this.length; i++) {

        var v = D(this[i])

        if (v.gt(best)) {
            best = v
            idx = i
        }
    }

    return idx
}

/* ---------------- argmin ---------------- */

Array.prototype.argmin = function () {

    if (this.length === 0) return -1

    var best = D(this[0])
    var idx = 0

    for (var i = 1; i < this.length; i++) {

        var v = D(this[i])

        if (v.lt(best)) {
            best = v
            idx = i
        }
    }

    return idx
}

/* ---------------- sort indices ---------------- */

Array.prototype.sorti = function () {

    var a = this.map((v,i)=>({
        v: D(v),
        i: i
    }))

    a.sort(function(x,y){

        if (x.v.gt(y.v)) return -1
        if (x.v.lt(y.v)) return 1
        return 0

    })

    return a.map(e=>e.i)
}

/* ---------------- sum ---------------- */

Array.prototype.sum = function () {

    var ret = D0

    for (var i = 0; i < this.length; i++) {
        ret = ret.plus(D(this[i]))
    }

    return ret
}

/* ---------------- product ---------------- */

Array.prototype.prod = function () {

    var ret = D1

    for (var i = 0; i < this.length; i++) {
        ret = ret.times(D(this[i]))
    }

    return ret
}

/* ---------------- mean ---------------- */

Array.prototype.mean = function () {

    if (this.length === 0) return undefined

    return this.sum().div(this.length)
}

/* ---------------- deep clone ---------------- */

Array.prototype.clone = function () {

    if (this.length === 0) return []

    if (Array.isArray(this[0])) {

        var r = new Array(this.length)

        for (var i = 0; i < this.length; i++) {
            r[i] = this[i].clone()
        }

        return r
    }

    return this.map(v => v instanceof Decimal ? new Decimal(v) : v)
}

/* ---------------- multidimensional indexing ---------------- */

Array.prototype.at = function (idx) {

    var r = this

    for (var i = 0; i < idx.length; i++) {
        r = r[idx[i]]
    }

    return r
}

/* ---------------- zeros ---------------- */

Array.zeros = function (shape) {

    function build(s,d){

        var a = new Array(s[d])

        if (d === s.length - 1){

            for (var i=0;i<s[d];i++){
                a[i] = D0
            }

        } else {

            for (var i=0;i<s[d];i++){
                a[i] = build(s,d+1)
            }

        }

        return a
    }

    return build(shape,0)
}

/* ---------------- toString ---------------- */

Array.prototype.toString = function () {

    return "[" + this.map(v=>v.toString()).join(", ") + "]"
}

/* ---------------- deep equality ---------------- */

Array.prototype.isEqual = function (a) {

    if (!Array.isArray(a)) return false

    if (this.length !== a.length) return false

    for (var i = 0; i < this.length; i++) {

        var v0 = this[i]
        var v1 = a[i]

        if (Array.isArray(v0)) {

            if (!Array.isArray(v1)) return false

            if (!v0.isEqual(v1)) return false

        } else {

            if (!D(v0).eq(D(v1))) return false
        }
    }

    return true
}

/* ---------------- push uniquely ---------------- */

Array.prototype.pushUniquely = function (e) {

    for (var i = 0; i < this.length; i++) {

        var v = this[i]

        if (Array.isArray(v) && Array.isArray(e)) {

            if (v.isEqual(e)) return i

        } else {

            if (D(v).eq(D(e))) return i
        }
    }

    this.push(e)

    return this.length - 1
}

/* ---------------- random pop ---------------- */

Array.prototype.randomPop = function () {

    if (this.length === 0) return undefined

    var i = Math.floor(Math.random()*this.length)

    return this.splice(i,1)[0]
}