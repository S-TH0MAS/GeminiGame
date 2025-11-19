import { SCALE, GRAVITY, JUMP_FORCE } from '../constants.js';
import { SPRITES, PALETTES } from '../sprites.js';
import { drawSprite, checkOverlap } from '../utils.js';

export class Goomba {
    constructor(x, y, level) {
        this.pos = { x, y };
        this.vel = { x: -1 * SCALE, y: 0 };
        this.width = 16 * SCALE; this.height = 16 * SCALE;
        this.dead = false;
        this.tick = 0;
        this.frame = 0;
        this.level = level;
    }
    update(mario) {
        if(this.dead) return;
        this.pos.x += this.vel.x;
        this.vel.y += GRAVITY;
        this.pos.y += this.vel.y;

        // Animation
        this.tick++;
        if(this.tick > 10) { this.tick = 0; this.frame = !this.frame; }

        // Collision Sol
        this.level.blocks.forEach(b => {
            if(checkOverlap({l:this.pos.x, r:this.pos.x+this.width, t:this.pos.y, b:this.pos.y+this.height},
                {l:b.x, r:b.x+b.w, t:b.y, b:b.y+b.h})) {
                if(this.vel.y >= 0) { this.pos.y = b.y - this.height; this.vel.y = 0; }
                else { this.vel.x *= -1; } // Mur
            }
        });

        // Collision Mario
        if(checkOverlap(
            {l:mario.pos.x, r:mario.pos.x+mario.width, t:mario.pos.y, b:mario.pos.y+mario.height},
            {l:this.pos.x, r:this.pos.x+this.width, t:this.pos.y, b:this.pos.y+this.height}
        )) {
            if(mario.invincible) {
                this.dead = true; mario.score+=100;
            } else if(mario.vel.y > 0 && mario.pos.y + mario.height < this.pos.y + (this.height/2) + 10) {
                this.dead = true;
                mario.vel.y = -JUMP_FORCE / 2;
                mario.score += 100;
            } else {
                if(mario.state === 'big') { mario.state = 'small'; mario.invincible = true; mario.invincibleTimer = 120; }
                else mario.die();
            }
        }
    }
    draw(ctx, cX) {
        if(this.dead) return;
        let s = this.frame ? SPRITES.goomba_1 : SPRITES.goomba_2;
        drawSprite(ctx, s, PALETTES.goomba, this.pos.x - cX, this.pos.y, 16*SCALE, 16*SCALE);
    }
}

