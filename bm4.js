// Requires decimal.js
// const Decimal = require("decimal.js")

function D(x){
    return x instanceof Decimal ? x : new Decimal(x)
}

/* ---------------------------------------------------------
   Decimal-safe vector subtraction
--------------------------------------------------------- */

function sub(a,b){

    var r = new Array(a.length)

    for(var i=0;i<a.length;i++){
        r[i] = D(a[i]).minus(b[i])
    }

    return r
}

/* ---------------------------------------------------------
   Bashicu Matrix
--------------------------------------------------------- */

var Bms = function(_s,_b,_f){

    if(typeof _s === "string"){

        var b = Bms.parse(_s)

        this.s = b.s
        this.b = b.b
        this.f = b.f

    }else{

        /* normalize matrix to Decimal */

        this.s = _s.map(function(row){
            return row.map(function(v){
                return D(v)
            })
        })

        if(_b !== undefined) this.b = D(_b)

        this.f = _f
    }
}

/* --------------------------------------------------------- */

Bms.prototype.incBracket = function(){

    if(this.f !== undefined){
        return this.f(this.b)
    }

    return this.b
}

/* --------------------------------------------------------- */

Bms.prototype.expand = function(rst){

    var s = this.s
    var xs = this.xs()
    var ys = this.ys()

    var lim_cs = xs + rst

    var b1 = this.incBracket()

    var s1 = s.slice(0,xs-1)

    var r = this.getBadRoot()

    if(r === -1){
        return new Bms(s1,b1,this.f)
    }

    var delta = sub(s[xs-1],s[r])

    var lmnz = this.getLowermostNonzero(s[xs-1])

    for(var y=lmnz;y<ys;y++){
        delta[y] = new Decimal(0)
    }

    var A = this.getAscension()

    var bs = xs-r-1

    var bn = this.b ? this.b.toNumber() : 0

    if(!Number.isSafeInteger(bn)){
        throw "Bracket too large"
    }

    for(var i=0;i<bn;i++){

        var di = new Decimal(i).plus(1)

        for(var x=0;x<bs;x++){

            var da = new Array(ys)

            for(var y=0;y<ys;y++){

                var v1 = s[r+x][y]
                var v2 = delta[y]
                var v3 = A[x][y]

                da[y] = v1.plus(v2.times(v3).times(di))
            }

            s1.push(da)

            if(s1.length >= lim_cs) break
        }

        if(s1.length >= lim_cs) break
    }

    if(s1.length>1 && s1[1][s1[1].length-1].eq(0)){

        for(var i=0;i<Math.min(lim_cs,s1.length);i++){
            s1[i].pop()
        }
    }

    return new Bms(s1,b1,this.f)
}

/* --------------------------------------------------------- */

Bms.prototype.getParent = function(x,y){

    var p = x

    while(p>0){

        if(y!==0){
            p = this.getParent(p,y-1)
        }else{
            p = p-1
        }

        if(p===-1) return p

        if(this.s[p][y].lt(this.s[x][y])){
            return p
        }
    }

    return -1
}

/* --------------------------------------------------------- */

Bms.prototype.getBadRoot = function(){

    var x = this.xs()-1

    var y = this.getLowermostNonzero(this.s[x])

    if(y === -1) return -1

    return this.getParent(x,y)
}

/* --------------------------------------------------------- */

Bms.prototype.getAscension = function(){

    var xs = this.xs()
    var ys = this.ys()

    var r = this.getBadRoot()

    if(r === -1) return []

    var bs = xs-r-1

    var A = new Array(bs)

    for(var x=0;x<bs;x++){

        A[x] = new Array(ys)

        for(var y=0;y<ys;y++){
            A[x][y] = new Decimal(0)
        }
    }

    for(var y=0;y<ys;y++){

        A[0][y] = new Decimal(1)

        for(var x=1;x<bs;x++){

            var p = this.getParent(x+r,y)

            if(p-r>=0 && A[p-r][y].eq(1)){
                A[x][y] = new Decimal(1)
            }
        }
    }

    return A
}

/* --------------------------------------------------------- */

Bms.prototype.getLowermostNonzero = function(c){

    for(var y=c.length-1;y>=0;y--){
        if(D(c[y]).gt(0)) return y
    }

    return -1
}

/* --------------------------------------------------------- */

Bms.prototype.xs = function(){
    return this.s.length
}

Bms.prototype.ys = function(){

    if(this.s.length === 0) return 0

    return this.s[0].length
}

/* --------------------------------------------------------- */

Bms.prototype.toString = function(){

    var xs = this.xs()
    var ys = this.ys()

    var str = ""

    for(var c=0;c<xs;c++){

        str += "("

        for(var r=0;r<ys;r++){

            str += this.s[c][r].toString()

            if(r!==ys-1) str+=","
        }

        str+=")"
    }

    if(this.b!==undefined){
        str+="["+this.b.toString()+"]"
    }

    return str
}

/* --------------------------------------------------------- */

Bms.multiparse = function(str){

    var a = str.split("\n")

    var mm = new Array(a.length)

    for(var m=0;m<a.length;m++){
        mm[m] = Bms.parse(a[m])
    }

    return mm
}

/* --------------------------------------------------------- */

Bms.parse = function(str){

    var s=[[]]

    var r=/^\s*\(([^)]*)\)(.*)/

    var m=str.match(r)

    var ci=0

    while(m!=null){

        var c=m[1].split(",")

        for(var ri=0;ri<c.length;ri++){
            s[ci].push(D(c[ri]))
        }

        str=m[2]

        if(str==="") break

        m=str.match(r)

        if(m!=null){
            s.push([])
            ci++
        }
    }

    var b

    m=str.match(/\[([\s\d]+)\]/)

    if(m!=null){
        b = D(m[1])
    }

    return new Bms(s,b)
}

/* --------------------------------------------------------- */

Bms.prototype.Lng = function(){
    return this.xs()
}

Bms.Lng = function(M){
    return M.xs()
}

/* --------------------------------------------------------- */

Bms.str2expand = function(str,rst){

    var b = Bms.parse(str)

    return b.expand(rst).toString()
}