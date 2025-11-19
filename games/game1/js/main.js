import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from './constants.js';
import { SPRITES, PALETTES } from './sprites.js';
import { drawSprite } from './utils.js';
import { Player } from './entities/Player.js';
import { level, loadLevel } from './level.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// --- GAME LOOP ---
let mario = new Player(level);
let cameraX = 0;
const keys = { right: false, left: false, run: false };
let levelTransitionTimer = 0;

window.addEventListener('keydown', e => {
    if(e.code === 'ArrowRight') keys.right = true;
    if(e.code === 'ArrowLeft') keys.left = true;
    if(e.code === 'Space' || e.code === 'KeyZ') mario.jump();
    if(e.code === 'KeyX') keys.run = true;
});
window.addEventListener('keyup', e => {
    if(e.code === 'ArrowRight') keys.right = false;
    if(e.code === 'ArrowLeft') keys.left = false;
    if(e.code === 'KeyX') keys.run = false;
});

// Charger le niveau 1 au démarrage
loadLevel(1);

function resetGame(nextLevel = false) {
    if (nextLevel) {
        loadLevel(level.currentLevelIndex + 1);
    } else {
        loadLevel(level.currentLevelIndex);
    }
    
    // Reset Mario
    mario.pos = { x: 100, y: 100 };
    mario.vel = { x: 0, y: 0 };
    mario.dead = false;
    mario.level = level; // Update level ref
    cameraX = 0;
    levelTransitionTimer = 0;
}

function loop() {
    ctx.fillStyle = '#5c94fc'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mario.dead) {
        mario.pos.y += mario.vel.y;
        mario.vel.y += 0.5;
        if (mario.pos.y > GAME_HEIGHT + 100) {
             resetGame(false);
        }
    } else {
        // Si le niveau est fini (drapeau touché), on gèle les contrôles de Mario
        if (levelTransitionTimer > 0) {
            levelTransitionTimer--;
            // Mario glisse le long du mât ou marche vers le château (simplifié ici)
            // On attend juste que le timer finisse
            if (levelTransitionTimer === 0) {
                resetGame(true);
            }
        } else {
            mario.update(keys);
            
            // Vérification Drapeau
            if (level.flagpole && level.flagpole.update(mario)) {
                console.log("Niveau terminé !");
                levelTransitionTimer = 120; // 2 secondes d'attente
                // On pourrait ajouter une animation de glissade ici
            }
        }
    }

    level.enemies.forEach(e => { if(Math.abs(e.pos.x - mario.pos.x) < GAME_WIDTH) e.update(mario); });
    level.items.forEach(i => i.update(mario));

    // Remove dead blocks
    level.blocks = level.blocks.filter(b => b.type !== 'dead');

    if (mario.pos.x > cameraX + GAME_WIDTH * 0.4) cameraX = mario.pos.x - GAME_WIDTH * 0.4;
    if (mario.pos.x < cameraX) mario.pos.x = cameraX;

    // Draw Blocks
    level.blocks.forEach(b => {
        if(b.x - cameraX > -TILE_SIZE && b.x - cameraX < GAME_WIDTH) {
            if(b.type === 'ground') {
                ctx.fillStyle = '#c84c0c'; ctx.fillRect(b.x - cameraX, b.y, b.w, b.h);
                ctx.fillStyle = 'black'; ctx.fillRect(b.x - cameraX, b.y, b.w, 4);
            } else if (b.type.startsWith('pipe')) {
                ctx.fillStyle = '#00aa00'; ctx.fillRect(b.x - cameraX, b.y, b.w, b.h);
                ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(b.x - cameraX+10, b.y, b.w-20, b.h);
                if(b.type==='pipe_top') { ctx.fillStyle='#008800'; ctx.fillRect(b.x-cameraX-5, b.y, b.w+10, b.h); }
            } else if (b.type === 'empty') {
                drawSprite(ctx, SPRITES.q_block_empty, PALETTES.q_block, b.x - cameraX, b.y, b.w, b.h);
            } else {
                drawSprite(ctx, SPRITES[b.type], PALETTES[b.type], b.x - cameraX, b.y, b.w, b.h);
            }
        }
    });

    // Draw Flagpole
    if (level.flagpole) {
        level.flagpole.draw(ctx, cameraX);
    }

    level.items.forEach(i => i.draw(ctx, cameraX));
    level.enemies.forEach(e => e.draw(ctx, cameraX));
    mario.draw(ctx, cameraX);

    // UI Updates
    const scoreEl = document.getElementById('score');
    const coinsEl = document.getElementById('coins');
    const worldEl = document.querySelector('#ui-layer div:nth-child(3)');
    
    if(scoreEl) scoreEl.innerText = mario.score.toString().padStart(6, '0');
    if(coinsEl) coinsEl.innerText = 'x' + mario.coins.toString().padStart(2, '0');
    if(worldEl) worldEl.innerHTML = `WORLD<br>1-${level.currentLevelIndex}`;

    requestAnimationFrame(loop);
}

loop();
