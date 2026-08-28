# Fundamental Sequence Ordinal Encoding

*Construction of this project*

*Original idea by @solarzone, explained by @rngdelak*

---

## Overview

This document introduces a uniform method to encode ordinals using three core functions:

- **fs(α, n)** → Returns the n-th element of the fundamental sequence of ordinal α  
- **isSuccessor(α)** → True if α is a successor ordinal, False if limit ordinal  
- **cmp(α, β)** → Comparison function (-1 if α < β, 0 if equal, 1 if α > β)

**Prerequisite:** Familiarity with ordinal numbers up to Γ₀.

---

## I. Key Concepts

A **fundamental sequence** of a limit ordinal α is a sequence that approaches α from below.

**Notation:**
- fs(α): the fundamental sequence of α
- α[n]: the n-th element (0-indexed)

**Symbol used:**
- |A| : number of element in set A
- [α;β] : The set contain all ordinals x that α ≤ x ≤ β

### Examples

- fs(ε₀) = {1, ω, ω^ω, ω^(ω^ω), ...}  
  → ε₀[3] = ω^(ω^ω)

- fs(ω^ω) = {1, ω, ω², ω³, ...}  
  → ω^ω[3] = ω³

---

## II. Core Definitions

### 1. Function f(α, β)

```
f(α, β) = min { β[n] | β[n] > α }
the fundamental sequence must be
- increasing
- indexed by naturals
- cofinal below β
```

Returns the smallest element in β’s fundamental sequence which is greater than α.

---

### 2. Encoding Real Numbers into Binary Strings (h(x))

```
For 0 < x < 1: 
h(x) =
"0" + h(x/k)               if x < k
"" (empty string)          if x = k
"1" + h((x - k)/(1 - k))   if x > k
```
this works for all k that 0 < k < 1 but some x **never terminate**. Consider to add a "Maxlen" handler

**This should be defined as a iterative function, not recursive due to callstack limit**

These are **symbolic binary strings**, not standard binary expansions.

#### Examples (k = 1/2)

| x   | h(x) |
|-----|------|
| 1/8 | "00" |
| 1/4 | "0"  |
| 3/8 | "01" |
| 1/2 | ""   |
| 5/8 | "10" |
| 3/4 | "1"  |
| 7/8 | "11" |

---

### 3. Function g([α;β];s)

we can define g as folow

```
for |[α;β]| > 0:
g([α;β];s)=
g([α;f(α,β)];t)    if s[0]="0" 
g([f(α,β);β];t)    if s[0]="1"
f(α,β)             if β is a limit and s=""
α                  if β is a successor

as s = s[0] + t (t is string s without the first element)

given that α,β are ordinals, s is binary string
```

## III. Example Evaluation

**Binary string:** `111011001`  
**Ordinal bound:** ε₀

### Steps


Intialize : [0, ε₀]
| Step | Bit | Interval |
|------|-----|----------|
| 1 | 1 | [1, ε₀] |
| 2 | 1 | [ω, ε₀] |
| 3 | 1 | [ω^ω, ε₀] |
| 4 | 0 | [ω^ω, ω^(ω^ω)] |
| 5 | 1 | [ω^(ω²), ω^(ω^ω)] |
| 6 | 1 | [ω^(ω³), ω^(ω^ω)] |
| 7 | 0 | [ω^(ω³), ω^(ω⁴)] |
| 8 | 0 | [ω^(ω³), ω^(ω³·2)] |
| 9 | 1 | [ω^(ω³ + ω²), ω^(ω³·2)] |
| End | "" | Final Result : ω^(ω³ + ω²·2) |



*You may also analyse some yourself too!*
*If you can analyse these correct example correctly, you have understand it!*


Bound ordinal : e0
| Binary      | Ordinal        |
|-------------|----------------|
| 0           | 0              |
| ""          | 1              |
| 10          | 2              |
| 101         | 3              |
| 1011        | 4              |
| 1           | ω              |
| 11000       | ω+1            |
| 110001      | ω+2            |
| 1100011     | ω+3            |
| 1100        | ω2             |
| 110010      | ω2+1           |
| 1100101     | ω2+2           |
| 11001011    | ω2+3           |
| 110010111   | ω2+4           |
| 11001       | ω3             |
| 110011      | ω4             |
| 1100111     | ω5             |
| 110         | ω^2            |
| 1101000     | ω^2 + 1        |
| 11010001    | ω^2 + 2        |
| 110100011   | ω^2 + 3        |
| 110100      | ω^2 + ω        |
| 11010010    | ω^2 + ω + 1    |
| 110100101   | ω^2 + ω + 2    |
| 1101001     | ω^2 + ω2       |

---

## IV. Reverse functions

## 1. Function g⁻¹([α;β];x)

We define the inverse of g as follows:

```
for |[α;β]| > 0 and α ≤ x < β
g⁻¹([α;β];x) =
"0" + g⁻¹([α;f(α,β)];t)      if x < f(α,β)
"1" + g⁻¹([f(α,β);β];t)      if x > f(α,β)
""                           if x = f(α,β)
""                           if β is a successor ordinal

as s = s[0] + t (t is string s without the first element)
```

## 2. Function h⁻¹(s)

We define h⁻¹ as follows, for fixed constant k ∈ (0,1)

```
for any binary string s and aspect ratio 0 < k < 1
h⁻¹(s) = 
k                   if s = ""
k*h⁻¹(t)            if s[0] = "0"
k+(1-k)*h⁻¹(t)      if s[0] = "1"

as s = s[0] + t (t is string s without first element)
```

## Extend this idea

### Conversion bettween 2 symetrical ordinal system

It able to convert any ordinal between 2 symetrical ordinal system

- Let two system A and B such that lim(A)<lim(B)

- Express lim(A) in B (call X)

- then for any a belong to A

**We have the conversion to B**

```
ConvA(a) = B.g(B.ZERO,LimAinB,A.g⁻¹(A.ZERO,A.Limit,ord))
for B.g,B.h are function implemented for system B, and A.g⁻¹ is implemented for system A
LimAinB is the expression of lim(A) in system B
```
***The inversion is also defined as***
```
ConvB(a) = A.g(A.ZERO,"Limit",B.g⁻¹(B.ZERO, LimAinB, ord));
```

**Requirement : symetric between 2 fs**

```
fsA(k)[n] = fsB(k)[n]
this mean fs of 2 equivalent ordinal is equivalent
```

Like fs of ω can be represented in many ways

- like Y(1,2) in ωY sequence which is equivalent to ω, has fs of Y(),Y(1),Y(1,1),Y(1,1,1),...

- or (0)(1) has fs of "",(0),(0)(0),(0)(0)(0),... in BMS

- Or psi0(psi0(0)) is 0,psi0(0),psi0(0)+psi0(0),psi0(0)+psi0(0)+psi0(0),... BOcf

**But they are fundamentally fs of ω which is 0,1,2,3,4,...**

---
### Fundamental sequence α[n] with rational n and reversal

```
α[n] = g([0;α];1-(1-k)^n)
```

for aspect ratio 0 < k < 1

**Explaination**

- 1-(1-k)^n maps n = 0,1,2,3,4,... into g⁻¹(α[0]), g⁻¹(α[1]), g⁻¹(α[2]), g⁻¹(α[3]),...

- g([0;α];1-(1-k)^n) maps n = 0,1,2,3,4,... into α[0], α[1], α[2], α[3],... which is exactly fs(α)

**We also define the reverse of this process**

```
α{β} = ln(1-h⁻¹(g⁻¹([0;α];β)))/ln(1-k)
```

**Explaination**

- h⁻¹(g⁻¹([0;α];β)) is the position of β inside hierachical space α

- ln(1-h⁻¹(g⁻¹([0;α];β)))/ln(1-k) maps them back into 0,1,2,3,4,...


## Global javascript implementation

```js
/********************************************************
 * REQUIRED GLOBAL FUNCTIONS
 ********************************************************/
//for this time, i preseve the recursive definition for functions except h
//This function are ordinal sysrem dependences
//System for the example : LPrSS

function cmp(a, b) {
    if (a == "Limit" && b == "Limit") return 0;
    if (a == "Limit" && b != "Limit") return 1;
    if (a != "Limit" && b == "Limit") return -1;


    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
}

function fs(a, n) {
    if (a == "Limit") return [0,n+1]
	let out = [...a];
	let cutNode = out.pop();
	let root = out.length - 1;
	while (out[root] >= cutNode && root > 0) root--;
	let increment = cutNode - out[root] - 1;
	let badPart = out.slice(root);
	for (let i = 1; i < n; i++) {
		out = out.concat(badPart.map(v => v + increment * i));
	}
	return out;
}

function isSuccessor(a) {
	return a !== "Limit" && (a.length === 0 || a.at(-1) === 0);
}

let ZERO = [] // 0 = [] in LPrSS

/********************************************************
 * f(alpha,beta)
 ********************************************************/

function f(alpha, beta) {

    let n = 0;

    while (true) {

        const x = fs(beta, n);

        if (cmp(x, alpha) > 0) {
            return x;
        }

        n++;
    }
}

/********************************************************
 * g([α,β], s)
 ********************************************************/

function g(alpha, beta, s) {

    // terminal
    if (isSuccessor(beta)) {
        return alpha;
    }

    const split = f(alpha, beta);

    // empty string
    if (s === "") {
        return split;
    }

    const bit = s[0];
    const rest = s.slice(1);

    if (bit === "0") {
        return g(alpha, split, rest);
    }

    return g(split, beta, rest);
}

/********************************************************
 * g⁻¹
 ********************************************************/

function gInv(alpha, beta, target) {

    if (isSuccessor(beta)) {
        return "";
    }

    const split = f(alpha, beta);

    const c = cmp(target, split);

    if (c === 0) {
        return "";
    }

    if (c < 0) {
        return "0" +
            gInv(alpha, split, target);
    }

    return "1" +
        gInv(split, beta, target);
}

/********************************************************
 * h(x) -- defined as iterative function, but can be defined as a recursive form but dangerous to use because of floating point error
 ********************************************************/
function h(x, k = 0.5, Maxlen = 100 , eps = 1e-10) {
    let result = "";

    while (result.length < Maxlen && Math.abs(x - k) > eps) {
        if (x < k) {
            result += "0";
            x = x / k;
        } else {
            result += "1";
            x = (x - k) / (1 - k);
        }
    }

    return result;
}

/********************************************************
 * h⁻¹
 ********************************************************/

function hInv(s, k = 0.5) {

    if (s === "") {
        return k;
    }

    const bit = s[0];
    const rest = s.slice(1);

    if (bit === "0") {
        return k * hInv(rest, k);
    }

    return k +
        (1 - k) * hInv(rest, k);
}

/********************************************************
 * Extension of Fundamental sequence to rational
 ********************************************************/

function fsR(alpha, n, k = 0.5) {

    const x = 1 - Math.pow(1 - k, n);

    return g(ZERO, alpha, h(x, k));
}

/********************************************************
 * fsR⁻¹
 ********************************************************/

function fsRInv(alpha, beta, k = 0.5) {

    const s = gInv(ZERO, alpha, beta);

    const x = hInv(s, k);

    return Math.log(1 - x) /
           Math.log(1 - k);
}

```

## Global Ordinal Conversion Implemetation

```js
/*
Conversion Between Ordinal System A and B
Defintion : https://github.com/RNGDelak/ord-limbms/blob/main/README.md (in the extends this idea section)
Assuming that Lim(A) < Lim(B)
*/

class CNF {
    static asp(str) {
        if (!str) return ["", ""];
        let depth = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === "(") depth++;
            if (str[i] === ")") depth--;
            if (!depth) return [str.slice(0, i + 1), str.slice(i + 1)];
        }
        return [str, ""];
    }

    static vsp(str) {
        return [str.slice(1, -1)];
    }

    static to_str(n) {
        return "()".repeat(n);
    }

    static single(str) {
        return !this.asp(str)[1];
    }

    static lt(a, b) {
        if (!b) return false;
        if (a === "Limit") return false;
        if (b === "Limit") return true;
        if (!a) return true;

        if (!this.single(a) && !this.single(b)) {
            const a1 = this.asp(a);
            const b1 = this.asp(b);
            return (
                this.lt(a1[0], b1[0]) ||
                (!this.lt(b1[0], a1[0]) && this.lt(a1[1], b1[1]))
            );
        }

        if (!this.single(a) && this.single(b))
            return this.lt(this.asp(a)[0], b);

        if (this.single(a) && !this.single(b))
            return !this.lt(this.asp(b)[0], a);

        return this.lt(this.vsp(a)[0], this.vsp(b)[0]);
    }

    static cmp(a, b) {
        if (a === b) return 0;
        return this.lt(a, b) ? -1 : 1;
    }

    static isSuccessor(a) {
        return a !== "Limit" && (typeof a === "string" && a.endsWith("()"));
    }

    static cof(x) {
        if (!x) return "";
        if (x === "Limit") return "(())";
        if (x.slice(-2) === "()") return "()";
        return "(())";
    }

    static fs(a, n = "") {
        if (typeof n === "number") n = this.to_str(n + 1);

        if (!a) return "";

        if (a === "Limit")
            return n ? `(${this.fs(a, this.fs(n))})` : "";

        if (!this.single(a)) {
            const a1 = this.asp(a);
            return a1[0] + this.fs(a1[1], n);
        }

        const inside = this.vsp(a)[0];

        if (!inside) return "";

        if (this.cof(inside) === "()") {
            return n
                ? `${this.fs(a, this.fs(n))}(${this.fs(inside)})`
                : "";
        }

        return `(${this.fs(inside, n)})`;
    }

    static pretty(a) {
        if (!a) return "0";

        if (!this.single(a)) {
            const [x, y] = this.asp(a);
            return `${this.pretty(x)}+${this.pretty(y)}`;
        }

        const e = this.vsp(a)[0];

        if (!e) return "1";

        const pe = this.pretty(e);

        return pe === "1"
            ? "ω"
            : `ω^(${pe})`;
    }

    static ZERO = "";

    static f(alpha, beta) {
        let n = 0;

        while (true) {
            const x = this.fs(beta, n);

            if (this.cmp(x, alpha) > 0) {
                return x;
            }

            n++;
        }
    }

    static g(alpha, beta, s) {
        while (true) {
            if (this.isSuccessor(beta)) return alpha;

            const split = this.f(alpha, beta);

            if (s === "") return split;

            const bit = s[0];
            s = s.slice(1);

            if (bit === "0") {
                beta = split;
            } else {
                alpha = split;
            }
        }
    }

    static gInv(alpha, beta, target) {
        let result = "";

        while (!this.isSuccessor(beta)) {
            const split = this.f(alpha, beta);
            const c = this.cmp(target, split);

            if (c === 0) break;

            if (c < 0) {
                result += "0";
                beta = split;
            } else {
                result += "1";
                alpha = split;
            }
        }

        return result;
    }

    static h(x, k = 0.5 , maxlen = 100, eps = 1e-10) {
        let result = "";

        while (Math.abs(x - k) > eps && result.length < maxlen) {
            if (x < k) {
                result += "0";
                x = x / k;
            } else {
                result += "1";
                x = (x - k) / (1 - k);
            }
        }

        return result;
    }

    static hInv(s, k = 0.5) {
        let x = k;

        for (let i = s.length - 1; i >= 0; i--) {
            if (s[i] === "0") {
                x = k * x;
            } else {
                x = k + (1 - k) * x;
            }
        }

        return x;
    }
}

class LPrSS {

    static cmp(a, b) {
        if (a == "Limit" && b == "Limit") return 0;
        if (a == "Limit" && b != "Limit") return 1;
        if (a != "Limit" && b == "Limit") return -1;


        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] < b[i]) return -1;
            if (a[i] > b[i]) return 1;
        }

        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;
        return 0;
    }

    static fs(a, n) {
        if (a == "Limit") return [0, n + 1]
        let out = [...a];
        let cutNode = out.pop();
        let root = out.length - 1;
        while (out[root] >= cutNode && root > 0) root--;
        let increment = cutNode - out[root] - 1;
        let badPart = out.slice(root);
        for (let i = 1; i < n; i++) {
            out = out.concat(badPart.map(v => v + increment * i));
        }
        return out;
    }

    static isSuccessor(a) {
        return a !== "Limit" && (a.length === 0 || a.at(-1) === 0);
    }

    static ZERO = [];

    static f(alpha, beta) {

        let n = 0;

        while (true) {

            const x = this.fs(beta, n);

            if (this.cmp(x, alpha) > 0) {
                return x;
            }

            n++;
        }
    }


    static g(alpha, beta, s) {
        while (true) {
            if (this.isSuccessor(beta)) return alpha;

            const split = this.f(alpha, beta);

            if (s === "") return split;

            const bit = s[0];
            s = s.slice(1);

            if (bit === "0") {
                beta = split;
            } else {
                alpha = split;
            }
        }
    }

    static gInv(alpha, beta, target) {
        let result = "";

        while (!this.isSuccessor(beta)) {
            const split = this.f(alpha, beta);
            const c = this.cmp(target, split);

            if (c === 0) break;

            if (c < 0) {
                result += "0";
                beta = split;
            } else {
                result += "1";
                alpha = split;
            }
        }

        return result;
    }

    static h(x, k = 0.5, maxlen = 100, eps = 1e-10) {
        let result = "";

        while (Math.abs(x - k) > eps && result.length < maxlen) {
            if (x < k) {
                result += "0";
                x = x / k;
            } else {
                result += "1";
                x = (x - k) / (1 - k);
            }
        }

        return result;
    }

    static hInv(s, k = 0.5) {
        let x = k;

        for (let i = s.length - 1; i >= 0; i--) {
            if (s[i] === "0") {
                x = k * x;
            } else {
                x = k + (1 - k) * x;
            }
        }

        return x;
    }
}

let Lim_CNF_in_LPrSS = [0, 2] // Lim(CNF) is 0,2 in LPrSS

function Conv_CNF(ord) {
    return LPrSS.g(LPrSS.ZERO, Lim_CNF_in_LPrSS, CNF.gInv(CNF.ZERO, "Limit", ord))
}

function Conv_LPrSS(ord) {
    return CNF.g(CNF.ZERO, "Limit", LPrSS.gInv(LPrSS.ZERO, Lim_CNF_in_LPrSS, ord));
}

```


## Summary

- Real numbers in (0,1) are encoded into binary strings via **h(x)**  
- Binary strings define a path through ordinal intervals via **g(X, α)**  
- Fundamental sequences guide interval refinement  
- The process yields a unique ordinal below α

## Implement
- Check ordinal.js for the Implementation of this construction with bound ordinal **Lim(BMS)**
- Check [https://github.com/RNGDelak/ord-transposition](https://github.com/RNGDelak/ord-transposition) for more notations
- - Check [https://github.com/RNGDelak/ord-generalized](https://github.com/RNGDelak/ord-generalized) for a visualizer tool
