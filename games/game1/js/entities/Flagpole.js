import { SCALE, TILE_SIZE } from '../constants.js';
import { SPRITES, PALETTES } from '../sprites.js';
import { drawSprite, checkOverlap } from '../utils.js';

export class Flagpole {
    constructor(x, y) {
        this.pos = { x, y };
        this.width = 2 * TILE_SIZE; // Le drapeau dépasse un peu
        this.height = 9.5 * TILE_SIZE; // Hauteur du mât
        this.flagY = y + TILE_SIZE; // Position verticale du drapeau (commence en haut)
        this.triggered = false;
    }

    update(mario) {
        if (this.triggered) {
            // Animation : descendre le drapeau
            if (this.flagY < this.pos.y + 8 * TILE_SIZE) {
                this.flagY += 2 * SCALE;
            }
            return;
        }

        // Détection de collision avec le mât (zone fine au centre)
        const poleHitbox = {
            l: this.pos.x + 6 * SCALE,
            r: this.pos.x + 10 * SCALE,
            t: this.pos.y,
            b: this.pos.y + this.height
        };

        const marioHitbox = {
            l: mario.pos.x,
            r: mario.pos.x + mario.width,
            t: mario.pos.y,
            b: mario.pos.y + mario.height
        };

        if (checkOverlap(poleHitbox, marioHitbox)) {
            this.triggered = true;
            return true; // Indique que le niveau est fini
        }
        return false;
    }

    draw(ctx, cX) {
        // Dessiner le mât
        // Top
        drawSprite(ctx, SPRITES.flagpole_top, PALETTES.flagpole, this.pos.x - cX, this.pos.y, TILE_SIZE, TILE_SIZE);
        // Corps du mât (8 segments)
        for (let i = 1; i <= 8; i++) {
            drawSprite(ctx, SPRITES.flagpole_body, PALETTES.flagpole, this.pos.x - cX, this.pos.y + i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
        // Base (bloc solide)
        drawSprite(ctx, SPRITES.brick, PALETTES.brick, this.pos.x - cX, this.pos.y + 9 * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Dessiner le drapeau
        // Le drapeau est dessiné à gauche du mât
        drawSprite(ctx, SPRITES.flag, PALETTES.flag, this.pos.x - cX - 8 * SCALE, this.flagY, TILE_SIZE, TILE_SIZE);
    }
}

