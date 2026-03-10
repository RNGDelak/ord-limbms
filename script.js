
function sliceSequence(xInput) {
    const x = new Decimal(xInput);
    const EPS = new Decimal("1e-12");

    let a = new Decimal(0);
    let b = new Decimal(1);

    for (let depth = 1; depth < Decimal.precision + 3; depth++) {
        let len = b.minus(a);
        let left = a;
        let size = len.div(3);
        let right = left.plus(size);

        while (true) {
            if (x.minus(right).abs().lt(EPS)) {
                return depth;
            }

            if (x.lt(right)) {
                a = left;
                b = right;
                break;
            }

            left = right;
            size = size.mul(2).div(3);
            right = left.plus(size);
        }
    }
}

function trimTrailingZeros(str) {
    let first = true;

    return str.replace(/\(([^)]+)\)/g, (_, content) => {
        if (first) {
            first = false;
            return `(${content})`;
        }

        return `(${content.replace(/(,0)+$/, "")})`;
    });
}

function numberToColor(num) {

    num = new Decimal(num);

    const hue = num
        .times(137.508)
        .mod(360)
        .toNumber();

    const light = new Decimal(55)
        .plus(num.mod(15))
        .toNumber();

    return `hsl(${hue}, 70%, ${light}%)`;
}

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


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// =====================
// STATE
// =====================

let zoom = new Decimal(500);
let offsetX = new Decimal(-1.5);

let isInteracting = false;
let renderVersion = 0;
let idleTimeout = null;


// =====================
// COORDINATES
// =====================

function worldToScreen(x) {
    return x
        .plus(offsetX)
        .times(zoom)
        .plus(canvas.width / 2)
        .toNumber();
}

function screenToWorld(x) {
    return new Decimal(x)
        .minus(canvas.width / 2)
        .div(zoom)
        .minus(offsetX);
}

// =====================
// INTERACTION CONTROL
// =====================
function startInteraction() {
    isInteracting = true;
    renderVersion++;
    if (idleTimeout) clearTimeout(idleTimeout);
}

function endInteraction() {
    isInteracting = false;

    idleTimeout = setTimeout(() => {
        startRender();
    }, 120);
}

// =====================
// MOUSE
// =====================
let mouseDown = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", e => {
    mouseDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
    startInteraction();
});

window.addEventListener("mouseup", () => {
    if (mouseDown) {
        mouseDown = false;
        endInteraction();
    }
});

window.addEventListener("mousemove", e => {
    if (!mouseDown) return;

    const dx = new Decimal(e.clientX - lastX);
    const dy = new Decimal(e.clientY - lastY);

    lastX = e.clientX;
    lastY = e.clientY;

    offsetX = offsetX.plus(dx.div(zoom));

    const zoomFactor = new Decimal(1).plus(dy.neg().times(0.005));
    const centerScreen = new Decimal(canvas.width / 2);
    const centerWorld = screenToWorld(centerScreen);

    zoom = zoom.times(zoomFactor);
    if (zoom.lte(0)) zoom = new Decimal(1);

    offsetX = offsetX.plus(centerWorld.minus(screenToWorld(centerScreen)));
});

// =====================
// TOUCH SUPPORT
// =====================

let touchActive = false;

canvas.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) return;

    e.preventDefault();

    const touch = e.touches[0];

    touchActive = true;
    lastX = touch.clientX;
    lastY = touch.clientY;

    startInteraction();
}, {passive: false});

canvas.addEventListener("touchmove", e => {
    if (!touchActive || e.touches.length !== 1) return;

    e.preventDefault();

    const touch = e.touches[0];

    const dx = new Decimal(touch.clientX - lastX);
    const dy = new Decimal(touch.clientY - lastY);

    lastX = touch.clientX;
    lastY = touch.clientY;

    // Horizontal pan (same as mouse)
    offsetX = offsetX.plus(dx.div(zoom));

    // Vertical drag = zoom
    const zoomFactor = new Decimal(1).plus(dy.neg().times(0.005));

    const centerScreen = new Decimal(canvas.width / 2);
    const centerWorld = screenToWorld(centerScreen);

    zoom = zoom.times(zoomFactor);
    if (zoom.lte(0)) zoom = new Decimal(1);

    offsetX = offsetX.plus(
        centerWorld.minus(screenToWorld(centerScreen))
    );

}, {passive: false});

canvas.addEventListener("touchend", e => {
    if (!touchActive) return;

    touchActive = false;
    endInteraction();
});

canvas.addEventListener("touchcancel", () => {
    touchActive = false;
    endInteraction();
});

// =====================
// KEYBOARD SUPPORT
// =====================

let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

let keyboardAnimating = false;

function startKeyboardLoop() {
    if (keyboardAnimating) return;
    keyboardAnimating = true;
    startInteraction();
    requestAnimationFrame(keyboardStep);
}

function stopKeyboardLoop() {
    keyboardAnimating = false;
    endInteraction();
}

function keyboardStep() {
    if (!keyboardAnimating) return;

    const panSpeed = new Decimal(35).div(zoom); // pan speed scales with zoom
    const zoomSpeed = new Decimal(0.07);        // smooth zoom rate

    // PAN
    if (keys.ArrowLeft) {
        offsetX = offsetX.plus(panSpeed);
    }
    if (keys.ArrowRight) {
        offsetX = offsetX.minus(panSpeed);
    }

    // ZOOM
    if (keys.ArrowUp || keys.ArrowDown) {

        const direction = keys.ArrowUp ? 1 : -1;
        const zoomFactor = new Decimal(1).plus(zoomSpeed.times(direction));

        const centerScreen = new Decimal(canvas.width / 2);
        const centerWorld = screenToWorld(centerScreen);

        zoom = zoom.times(zoomFactor);
        if (zoom.lte(0)) zoom = new Decimal(1);

        offsetX = offsetX.plus(
            centerWorld.minus(screenToWorld(centerScreen))
        );
    }

    requestAnimationFrame(keyboardStep);
}

window.addEventListener("keydown", e => {
    if (keys.hasOwnProperty(e.key)) {
        if (!keys[e.key]) {
            keys[e.key] = true;
            startKeyboardLoop();
        }
        e.preventDefault();
    }
});

window.addEventListener("keyup", e => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;

        // stop only if all released
        if (!keys.ArrowUp && !keys.ArrowDown &&
            !keys.ArrowLeft && !keys.ArrowRight) {
            stopKeyboardLoop();
        }

        e.preventDefault();
    }
});


// =====================
// PRECISION CONTROL
// =====================

function autoPrecision() {

    if (!zoom || zoom.lte(0)) return;

    const zoomMag = zoom.log(2);

    const centerWorld = screenToWorld(canvas.width / 2);
    if (!centerWorld || centerWorld.isZero()) return;

    const worldMag = centerWorld.abs().log(10);

    const newPrecision = zoomMag
        .plus(worldMag)
        .add(7)
        .floor()
        .toNumber();

    const clamped = Math.max(7, Math.min(newPrecision, 1e6));

    Decimal.set({ precision: clamped });
}

// =====================
// DRAW
// =====================

function drawOrdinalTick(ord, sx, zoom) {

    let color = "white";

    const midY = (canvas.height / canvas.width) * sx;

    ctx.font = "20px serif";

    const input = ord[0];
    const output = trimTrailingZeros(input);


    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(sx, midY - 15);
    ctx.lineTo(sx, midY + 15);
    ctx.stroke();

    ctx.fillText(output, sx, midY - 23);
}

function marker() {

    // Set stroke color (green)
    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

// =====================
// PREVIEW RENDER
// =====================

function renderPreview() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const worldLeft = screenToWorld(0);
    const worldRight = screenToWorld(canvas.width);

    const start = Decimal.max(new Decimal(1), worldLeft);
    const end = worldRight;

    if (end.lte(start)) return;

    const steps = 50;
    let lastOrdinal = null;

    for (let step = 0; step <= steps; step++) {

        const ratio = new Decimal(step).div(steps);

        const x = start.plus(
            end.minus(start).mul(ratio)
        );

        const ordinal = lngi(x);

        if (!(JSON.stringify(ordinal) === JSON.stringify(lastOrdinal))) {

            const sx = worldToScreen(x);

            if (sx > -50 && sx < canvas.width + 50) {
                drawOrdinalTick(ordinal, sx, zoom);
            }

            lastOrdinal = ordinal;
        }
    }
}


// =====================
// FULL RENDER
// =====================

function startRender() {

    renderVersion++;
    const currentVersion = renderVersion;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const worldLeft = screenToWorld(0);
    const worldRight = screenToWorld(canvas.width);

    const start = Decimal.max(new Decimal(1), worldLeft);
    const end = worldRight;

    if (end.lte(start)) return;

    const totalSteps = Math.floor(canvas.width * 2);//more compact

    let step = 0;
    let lastOrdinal = null;

    function processChunk() {

        if (currentVersion !== renderVersion) return;
        if (isInteracting) return;

        const chunkSize = Math.floor(totalSteps / 25);

        for (let i = 0; i < chunkSize && step <= totalSteps; i++, step++) {

            const ratio = new Decimal(step).div(totalSteps);

            const x = start.plus(
                end.minus(start).mul(ratio)
            );

            const ordinal = lngi(x);

            if (!(JSON.stringify(ordinal) === JSON.stringify(lastOrdinal))) {

                const sx = worldToScreen(x);

                if (sx > -50 && sx < canvas.width + 50) {
                    drawOrdinalTick(ordinal, sx, zoom);
                }

                lastOrdinal = ordinal;
            }
        }

        if (step <= totalSteps) {
            requestAnimationFrame(processChunk);
        }
    }

    processChunk();
}






function parseBMS(s){
  return [...s.matchAll(/\(([^)]+)\)/g)].map(m=>{
    let row = m[1].split(',').map(Number);
    while(row.length < 3) row.push(0); // ensure minimum length
    return row;
  });
}


const cOCF_LIMIT = Bms.parse("(0,0,0)(1,1,1)(2,2,1)(3,2)");
function compareBms(a,b){

    const A = a.s
    const B = b.s

    const len = Math.min(A.length,B.length)

    for(let i=0;i<len;i++){

        const rowA = A[i]
        const rowB = B[i]

        const rlen = Math.min(rowA.length,rowB.length)

        for(let j=0;j<rlen;j++){

            if(rowA[j].lt(rowB[j])) return -1
            if(rowA[j].gt(rowB[j])) return 1
        }

        if(rowA.length < rowB.length) return -1
        if(rowA.length > rowB.length) return 1
    }

    if(A.length < B.length) return -1
    if(A.length > B.length) return 1

    return 0
}

function largerThanLimit(bms){

    return compareBms(bms, cOCF_LIMIT) === 1
}

function computePsi(input){
if (largerThanLimit(Bms.parse((input)))) return ">Lim(COCF)";
    
  try{  
    let result = display(_o(parseBMS(input)));
    if(!result) throw "bad result";
    return result;
  }catch(e){
    return ">Lim(COCF)";
  }
}
// =====================
// MAIN LOOP
// =====================
let fps = 0, lastTime = performance.now(), frames = 0;

function loop() {

    autoPrecision();
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        fps = frames;
        frames = 0;
        lastTime = now;
    }

    document.getElementById("zoomDisplay").textContent = zoom.toPrecision(6);
    document.getElementById("fpsDisplay").textContent = fps;

    let centerWorld = screenToWorld(canvas.width / 2);
    document.getElementById("worldDisplay").textContent =
        centerWorld.toPrecision(3)
    const safeCenter = Decimal.max(new Decimal(1), centerWorld);

    const input = lngi(safeCenter)[0];

    const output = trimTrailingZeros(input)

    document.getElementById("ord").innerHTML = output

    document.getElementById("psi").innerHTML = computePsi(input);

    if (isInteracting){
        renderPreview();marker()}

    requestAnimationFrame(loop);
}

loop();
startRender();
