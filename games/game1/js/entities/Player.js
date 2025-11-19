import { SCALE, GRAVITY, FRICTION, ACCELERATION, JUMP_FORCE, TILE_SIZE, GAME_HEIGHT } from '../constants.js';
import { SPRITES, PALETTES } from '../sprites.js';
import { drawSprite, checkOverlap } from '../utils.js';
import { spawnItem } from '../level.js';

export class Player {
    constructor(level) {
        this.level = level;
        this.pos = { x: 100, y: 100 };
        this.vel = { x: 0, y: 0 };
        this.width = 12 * SCALE;
        this.height = 16 * SCALE;
        this.grounded = false;
        this.facingRight = true;
        this.dead = false;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.state = 'small'; // 'small', 'big', 'fire'
        this.invincible = false;
        this.invincibleTimer = 0;
        this.score = 0;
        this.coins = 0;
    }

    update(keys) {
        if (this.dead) {
            this.pos.y += this.vel.y;
            this.vel.y += GRAVITY * 0.5;
            return;
        }

        // Input Physics
        if (keys.left) {
            this.vel.x -= ACCELERATION;
            this.facingRight = false;
        }
        if (keys.right) {
            this.vel.x += ACCELERATION;
            this.facingRight = true;
        }

        this.vel.x *= FRICTION;
        const maxSpeed = (keys.run ? 6 : 3.5) * SCALE;
        if (this.vel.x > maxSpeed) this.vel.x = maxSpeed;
        if (this.vel.x < -maxSpeed) this.vel.x = -maxSpeed;

        this.vel.y += GRAVITY;

        // Collisions
        this.pos.x += this.vel.x;
        this.checkCollisionsX();
        this.pos.y += this.vel.y;
        this.grounded = false;
        this.checkCollisionsY();

        if (this.pos.y > GAME_HEIGHT) this.die();

        // Animation Ticks
        if(Math.abs(this.vel.x) > 0.5) {
            this.tickCount++;
            if(this.tickCount > (keys.run ? 5 : 10)) {
                this.tickCount = 0;
                this.frameIndex = this.frameIndex === 0 ? 1 : 0;
            }
        } else {
            this.frameIndex = 0;
        }

        // Invincibilité
        if(this.invincible) {
            this.invincibleTimer--;
            if(this.invincibleTimer <= 0) {
                this.invincible = false;
                document.body.classList.remove('invincible-flash');
            }
        }
    }

    checkCollisionsX() {
        let r = { l: this.pos.x, r: this.pos.x + this.width, t: this.pos.y, b: this.pos.y + this.height };
        this.level.blocks.forEach(b => {
            let br = { l: b.x, r: b.x + b.w, t: b.y, b: b.y + b.h };
            if (checkOverlap(r, br)) {
                if (this.vel.x > 0) { this.pos.x = br.l - this.width; this.vel.x = 0; }
                else if (this.vel.x < 0) { this.pos.x = br.r; this.vel.x = 0; }
            }
        });
    }

    checkCollisionsY() {
        let r = { l: this.pos.x, r: this.pos.x + this.width, t: this.pos.y, b: this.pos.y + this.height };
        this.level.blocks.forEach(b => {
            let br = { l: b.x, r: b.x + b.w, t: b.y, b: b.y + b.h };
            if (checkOverlap(r, br)) {
                if (this.vel.y > 0) {
                    this.pos.y = br.t - this.height;
                    this.vel.y = 0;
                    this.grounded = true;
                } else if (this.vel.y < 0) {
                    this.pos.y = br.b;
                    this.vel.y = 0;
                    if(b.type === 'q_block') {
                        b.type = 'empty';
                        this.score += 100;
                        this.coins++;
                        spawnItem(this.level, b.x, b.y - TILE_SIZE, Math.random() > 0.8 ? 'star' : 'mushroom');
                    } else if (b.type === 'brick' && this.state !== 'small') {
                        b.type = 'dead'; // Break brick
                        this.score += 50;
                    }
                }
            }
        });
    }

    jump() { if (this.grounded) { this.vel.y = -JUMP_FORCE; this.grounded = false; } }

    die() {
        if(!this.dead) {
            this.dead = true;
            this.vel.y = -JUMP_FORCE;
            // La gestion du reload est maintenant faite dans main.js
        }
    }

    powerUp(type) {
        this.score += 1000;
        if(type === 'mushroom') {
            if (this.state === 'small') {
                this.state = 'big';
                this.width = 16 * SCALE;
                this.height = 32 * SCALE;
                this.pos.y -= 16 * SCALE;
            }
        } else if (type === 'star') {
            this.invincible = true;
            this.invincibleTimer = 600; // 10 sec
            document.body.classList.add('invincible-flash');
        }
    }

    takeDamage() {
        if (this.invincible) return;

        if (this.state === 'big') {
            this.state = 'small';
            this.width = 12 * SCALE;
            this.height = 16 * SCALE;
            this.invincible = true;
            this.invincibleTimer = 120;
            this.pos.y += 16 * SCALE;
        } else {
            this.die();
        }
    }

    draw(ctx, cX) {
        let sprite = SPRITES.mario_stand;
        if(!this.grounded) sprite = SPRITES.mario_jump;
        else if(Math.abs(this.vel.x) > 0.5) sprite = (this.frameIndex === 0) ? SPRITES.mario_run1 : SPRITES.mario_run2;

        drawSprite(ctx, sprite, PALETTES.mario, this.pos.x - cX, this.pos.y, this.width, this.height, !this.facingRight);
    }
}

