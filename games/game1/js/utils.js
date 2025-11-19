export function drawSprite(ctx, spriteMap, palette, x, y, w, h, flip = false) {
    if(!spriteMap) return;
    const pixelW = w / spriteMap[0].length;
    const pixelH = h / spriteMap.length;

    for (let row = 0; row < spriteMap.length; row++) {
        for (let col = 0; col < spriteMap[row].length; col++) {
            const colorIndex = spriteMap[row][col];
            if (colorIndex !== 0 && palette[colorIndex] !== null) {
                ctx.fillStyle = palette[colorIndex];
                const drawX = flip ? x + w - (col * pixelW) - pixelW : x + col * pixelW;
                ctx.fillRect(drawX, y + row * pixelH, pixelW + 0.5, pixelH + 0.5);
            }
        }
    }
}

export function checkOverlap(r1, r2) {
    return (r1.l < r2.r && r1.r > r2.l && r1.t < r2.b && r1.b > r2.t);
}

