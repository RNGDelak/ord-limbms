// Requires decimal.js
// const Decimal = require("decimal.js");



/* ---------------- Decimal helper ---------------- */

function D(x) {
    return x instanceof Decimal ? x : new Decimal(x);
}

/* ---------------- vector normalize input ---------------- */

function vec(v) {
    var r = new Array(v.length);

    for (var i = 0; i < v.length; i++) {
        r[i] = D(v[i]);
    }

    return r;
}

/* ---------------- matrix normalize input ---------------- */

function mat(m) {

    var r = new Array(m.length);

    for (var i = 0; i < m.length; i++) {

        r[i] = new Array(m[i].length);

        for (var j = 0; j < m[i].length; j++) {
            r[i][j] = D(m[i][j]);
        }
    }

    return r;
}

/* ---------------- transpose ---------------- */

function transpose(m) {

    m = mat(m);

    var r = new Array(m[0].length);

    for (var i = 0; i < m[0].length; i++) {

        r[i] = new Array(m.length);

        for (var j = 0; j < m.length; j++) {
            r[i][j] = m[j][i];
        }
    }

    return r;
}

/* ---------------- dot product ---------------- */

function dot(a, b) {

    a = vec(a);
    b = vec(b);

    var s = new Decimal(0);

    for (var i = 0; i < a.length; i++) {
        s = s.plus(a[i].times(b[i]));
    }

    return s;
}

/* ---------------- vector magnitude ---------------- */

function abs(v) {

    v = vec(v);

    var s = new Decimal(0);

    for (var i = 0; i < v.length; i++) {
        s = s.plus(v[i].times(v[i]));
    }

    return s.sqrt();
}

/* ---------------- normalize vector ---------------- */

function normalize(v) {

    v = vec(v);

    var inv = new Decimal(1).div(abs(v));

    var r = new Array(v.length);

    for (var i = 0; i < v.length; i++) {
        r[i] = v[i].times(inv);
    }

    return r;
}

/* ---------------- cross product ---------------- */

function cross(a, b) {

    a = vec(a);
    b = vec(b);

    return [
        a[1].times(b[2]).minus(a[2].times(b[1])),
        a[2].times(b[0]).minus(a[0].times(b[2])),
        a[0].times(b[1]).minus(a[1].times(b[0]))
    ];
}

/* ---------------- addition ---------------- */

function add(a, b) {

    if (Array.isArray(a[0])) {

        a = mat(a);
        b = mat(b);

        var r = new Array(a.length);

        for (var i = 0; i < a.length; i++) {

            r[i] = new Array(a[0].length);

            for (var j = 0; j < a[0].length; j++) {
                r[i][j] = a[i][j].plus(b[i][j]);
            }
        }

        return r;

    } else {

        a = vec(a);
        b = vec(b);

        var r = new Array(a.length);

        for (var i = 0; i < a.length; i++) {
            r[i] = a[i].plus(b[i]);
        }

        return r;
    }
}

/* ---------------- subtraction ---------------- */

function sub(a, b) {

    if (Array.isArray(a[0])) {

        a = mat(a);
        b = mat(b);

        var r = new Array(a.length);

        for (var i = 0; i < a.length; i++) {

            r[i] = new Array(a[0].length);

            for (var j = 0; j < a[0].length; j++) {
                r[i][j] = a[i][j].minus(b[i][j]);
            }
        }

        return r;

    } else {

        a = vec(a);
        b = vec(b);

        var r = new Array(a.length);

        for (var i = 0; i < a.length; i++) {
            r[i] = a[i].minus(b[i]);
        }

        return r;
    }
}

/* ---------------- scalar multiply vector ---------------- */

function mulkv(k, v) {

    k = D(k);
    v = vec(v);

    var r = new Array(v.length);

    for (var i = 0; i < v.length; i++) {
        r[i] = k.times(v[i]);
    }

    return r;
}

/* ---------------- scalar multiply matrix ---------------- */

function mulkm(k, m) {

    k = D(k);
    m = mat(m);

    var r = new Array(m.length);

    for (var i = 0; i < m.length; i++) {

        r[i] = new Array(m[0].length);

        for (var j = 0; j < m[0].length; j++) {
            r[i][j] = k.times(m[i][j]);
        }
    }

    return r;
}

/* ---------------- matrix vector multiply ---------------- */

function mulmv(m, v) {

    m = mat(m);
    v = vec(v);

    var r = new Array(m.length);

    for (var i = 0; i < m.length; i++) {

        var sum = new Decimal(0);

        for (var j = 0; j < v.length; j++) {
            sum = sum.plus(m[i][j].times(v[j]));
        }

        r[i] = sum;
    }

    return r;
}

/* ---------------- matrix multiply ---------------- */

function mulmm(a, b) {

    a = mat(a);
    b = mat(b);

    var r = new Array(a.length);

    for (var i = 0; i < a.length; i++) {

        r[i] = new Array(b[0].length);

        for (var k = 0; k < b[0].length; k++) {

            var sum = new Decimal(0);

            for (var j = 0; j < b.length; j++) {
                sum = sum.plus(a[i][j].times(b[j][k]));
            }

            r[i][k] = sum;
        }
    }

    return r;
}

/* ---------------- identity matrix ---------------- */

function identity(n) {

    var I = new Array(n);

    for (var i = 0; i < n; i++) {

        I[i] = new Array(n);

        for (var j = 0; j < n; j++) {
            I[i][j] = i === j ? new Decimal(1) : new Decimal(0);
        }
    }

    return I;
}

/* ---------------- matrix inverse (NxN) ---------------- */

function inv(m) {

    m = mat(m);

    var n = m.length;

    var A = m.map(row => row.slice());
    var I = identity(n);

    for (var i = 0; i < n; i++) {

        var pivot = A[i][i];

        if (pivot.eq(0)) {
            throw "Matrix not invertible";
        }

        var invPivot = new Decimal(1).div(pivot);

        for (var j = 0; j < n; j++) {
            A[i][j] = A[i][j].times(invPivot);
            I[i][j] = I[i][j].times(invPivot);
        }

        for (var k = 0; k < n; k++) {

            if (k === i) continue;

            var factor = A[k][i];

            for (var j = 0; j < n; j++) {

                A[k][j] = A[k][j].minus(factor.times(A[i][j]));
                I[k][j] = I[k][j].minus(factor.times(I[i][j]));
            }
        }
    }

    return I;
}

/* ---------------- Rodrigues rotation ---------------- */

function ang2rot(axis, cos, sin) {

    axis = normalize(axis);

    cos = D(cos);
    sin = D(sin);

    var one = new Decimal(1);
    var cos1 = one.minus(cos);

    var x = axis[0];
    var y = axis[1];
    var z = axis[2];

    return [

        [
            cos.plus(cos1.times(x).times(x)),
            cos1.times(x).times(y).minus(sin.times(z)),
            cos1.times(x).times(z).plus(sin.times(y))
        ],

        [
            cos1.times(y).times(x).plus(sin.times(z)),
            cos.plus(cos1.times(y).times(y)),
            cos1.times(y).times(z).minus(sin.times(x))
        ],

        [
            cos1.times(z).times(x).minus(sin.times(y)),
            cos1.times(z).times(y).plus(sin.times(x)),
            cos.plus(cos1.times(z).times(z))
        ]
    ];
}