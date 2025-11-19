import { SCALE, GRAVITY, GAME_HEIGHT } from '../constants.js';
import { SPRITES, PALETTES } from '../sprites.js';
import { drawSprite, checkOverlap } from '../utils.js';

export class Item {
    constructor(x, y, type, level) {
        this.pos = { x, y };
        this.vel = { x: 2 * SCALE, y: -5 * SCALE }; // Sort en sautant
        this.type = type; // 'mushroom' or 'star'
        this.width = 16 * SCALE; this.height = 16 * SCALE;
        this.active = true;
        this.level = level;
    }
    update(mario) {
        if(!this.active) return;
        this.vel.y += GRAVITY;
        this.pos.y += this.vel.y;
        this.pos.x += this.vel.x;

        if(this.type === 'star' && this.pos.y + this.height > GAME_HEIGHT - 60) this.vel.y = -10 * SCALE; // Rebond étoile

        this.level.blocks.forEach(b => {
            if(checkOverlap({l:this.pos.x, r:this.pos.x+this.width, t:this.pos.y, b:this.pos.y+this.height},
                {l:b.x, r:b.x+b.w, t:b.y, b:b.y+b.h})) {
                if(this.vel.y > 0) { this.pos.y = b.y - this.height; this.vel.y = 0; } // Sol
                else { this.vel.x *= -1; } // Mur
            }
        });

        if(checkOverlap({l:mario.pos.x, r:mario.pos.x+mario.width, t:mario.pos.y, b:mario.pos.y+mario.height},
            {l:this.pos.x, r:this.pos.x+this.width, t:this.pos.y, b:this.pos.y+this.height})) {
            mario.powerUp(this.type);
            this.active = false;
        }
    }
    draw(ctx, cX) {
        if(!this.active) return;
        drawSprite(ctx, SPRITES[this.type], PALETTES[this.type], this.pos.x - cX, this.pos.y, 16*SCALE, 16*SCALE);
    }
}

