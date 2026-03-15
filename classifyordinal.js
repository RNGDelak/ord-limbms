/* =========================================================
   Ordinal classifier for Bashicu matrices
   Requires: bm4.js
========================================================= */

/* ---------- utilities ---------- */

function ordclass_rowIsZero(r){
    for(let v of r){
        if(!v.eq(0)) return false
    }
    return true
}

function ordclass_rowGE(a,b){

    if(a.length < b.length) return false

    for(let i=0;i<b.length;i++){

        if(a[i].lt(b[i])) return false

        if(a[i].gt(b[i])) return true
    }

    return true
}

/* matrix ≥ sequence of rows */

function ordclass_matrixGE(M,seq){

  if(M.length < seq.length) return false

  for(let i=0;i<seq.length;i++){
    if(!ordclass_rowGE(M[i],seq[i])) return false
  }

  return true
}

/* ---------- children ---------- */

function ordclass_C(M,i){

  let r=[]
  let s=M.s

  for(let j=i+1;j<s.length;j++){
    if(M.getParent(j,0)===i) r.push(j)
  }

  return r
}

/* ---------- A(M,i) ---------- */

function ordclass_A(M,i){

  let res=[]
  let children=ordclass_C(M,i)

  for(let j of children){

    let block=[ M.s[j], ...ordclass_A(M,j) ]

    res=res.concat(block)
  }

  return res
}

/* ---------- P(M,i) ---------- */

function ordclass_P(M,i){

  let c=ordclass_C(M,i)

  if(c.length===0) return []

  let j=c[c.length-1]

  return [M.s[j], ...ordclass_A(M,j)]
}

/* ---------- helpers ---------- */

function ordclass_zeroIndices(M){

    let r=[]

    for(let i=0;i<M.s.length;i++){
        if(ordclass_rowIsZero(M.s[i])) r.push(i)
    }

    return r
}

function ordclass_lastZeroIndex(M){

    let z = ordclass_zeroIndices(M)

    if(z.length===0) return -1

    return z[z.length-1]
}

/* =========================================================
   ordinal classes
========================================================= */

function ordclass_isPowerOfOmega(M){

    return ordclass_zeroIndices(M).length === 1
}

function ordclass_isTowerOfOmega(M){

    let s = M.s

    if(s.length<=2) return false

    let last = s[s.length-1]

    return last[last.length-1].eq(s.length-1)
}

/* ---------- epsilon ---------- */

function ordclass_isEpsilonOrdinal(M){

  if(!ordclass_isPowerOfOmega(M)) return false

  let p=ordclass_P(M,0)

  return ordclass_matrixGE(p,[
    [D(1),D(1)]
  ])
}

/* ---------- Veblen ---------- */

function ordclass_isVeblenOrdinal(M){

    if(!ordclass_isPowerOfOmega(M)) return false

    let p = ordclass_P(M,0)

    return ordclass_matrixGE(p,[
        [D(1),D(1)],
        [D(2),D(1)]
    ])
}

/* ---------- impredicative ---------- */

function ordclass_isImpredicative(M){

    if(!ordclass_isPowerOfOmega(M)) return false

    let p = ordclass_P(M,0)

    return ordclass_matrixGE(p,[
        [D(1),D(1)],
        [D(2),D(1)],
        [D(3),D(1)]
    ])
}

/* ---------- BHO ---------- */

function ordclass_isBHO(M){

    if(!ordclass_isPowerOfOmega(M)) return false

    let p = ordclass_P(M,0)

    return ordclass_matrixGE(p,[
        [D(1),D(1)],
        [D(2),D(2)]
    ])
}

/* ---------- Buchholz ---------- */

function ordclass_isBuchholz(M){

    if(!ordclass_isPowerOfOmega(M)) return false

    let p = ordclass_P(M,0)

    return ordclass_matrixGE(p,[
        [D(1),D(1)],
        [D(2),D(2)],
        [D(2),D(1)]
    ])
}

/* ---------- limit / successor ---------- */

function ordclass_isLimitOrdinal(M){

    let x = ordclass_lastZeroIndex(M)

    if(x===-1) return false

    let p = ordclass_P(M,x)

    return p.length>0
}

function ordclass_isSuccessorOrdinal(M){

    return !ordclass_isLimitOrdinal(M)
}

/* =========================================================
   main classifier
========================================================= */

function ordclass_classifyOrdinal(M){

    return {

        powerOfOmega : ordclass_isPowerOfOmega(M),

        towerOfOmega : ordclass_isTowerOfOmega(M),

        epsilon : ordclass_isEpsilonOrdinal(M),

        veblen : ordclass_isVeblenOrdinal(M),

        impredicative : ordclass_isImpredicative(M),

        BHO : ordclass_isBHO(M),

        buchholz : ordclass_isBuchholz(M),

        limit : ordclass_isLimitOrdinal(M),

        successor : ordclass_isSuccessorOrdinal(M)

    }
}

/* =========================================================
   master classifier (highest rank only)
========================================================= */

function ordclass_masterClassify(M){

    if(ordclass_isBuchholz(M)) return "Buchholz"

    if(ordclass_isBHO(M)) return "BHO"

    if(ordclass_isImpredicative(M)) return "Impredicative"

    if(ordclass_isVeblen(M)) return "Veblen"

    if(ordclass_isEpsilonOrdinal(M)) return "Epsilon"

    if(ordclass_isTowerOfOmega(M)) return "TowerOfOmega"

    if(ordclass_isPowerOfOmega(M)) return "PowerOfOmega"

    if(ordclass_isLimitOrdinal(M)) return "Limit"

    if(ordclass_isSuccessorOrdinal(M)) return "Successor"

    return "Unknown"
}

function getColor(input , arr) {
  if (input === "Lim(BMS)") {return "lightblue";}
  if (input === "0") {
    return "lightblue";
  }


  const cls = ordclass_masterClassify(new Bms(input))

  const colors = {
    "Successor": "red",
    "Limit": "orange",
    "PowerOfOmega": "yellow",
    "TowerOfOmega": "white",
    "Epsilon": "#00FF00",
    "Veblen": "cyan",
    "Impredicative": "#ff73f6",
    "BHO": "blue",
    "Buchholz": "gray"
  }

  return colors[cls] ?? "white"
}
