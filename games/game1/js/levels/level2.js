import { TILE_SIZE } from '../constants.js';
import { Goomba } from '../entities/Goomba.js';
import { Flagpole } from '../entities/Flagpole.js';

export function buildLevel2(levelRef) {
    const addBlock = (x, y, type) => levelRef.blocks.push({ x: x * TILE_SIZE, y: y * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE, type: type });

    // Génération Aléatoire
    let currentX = 0;
    const length = 200;

    for (let i = 0; i < length; i++) {
        // Toujours du sol au début et à la fin
        if (i < 10 || i > length - 10) {
            addBlock(i, 13, 'ground');
            addBlock(i, 14, 'ground');
            continue;
        }

        // Trous aléatoires (10% de chance)
        if (Math.random() < 0.1) {
            // Trou de 2 blocs
            i += 1; 
            continue;
        }

        addBlock(i, 13, 'ground');
        addBlock(i, 14, 'ground');

        // Plateformes aériennes (20% de chance)
        if (Math.random() < 0.2) {
            const height = 5 + Math.floor(Math.random() * 4); // Hauteur entre 5 et 8
            addBlock(i, height, 'brick');
            if (Math.random() < 0.5) addBlock(i+1, height, 'q_block');
            addBlock(i+2, height, 'brick');
        }

        // Tuyaux (5% de chance)
        if (Math.random() < 0.05) {
            const h = 1 + Math.floor(Math.random() * 3);
            for(let p=0; p<h; p++) addBlock(i, 12-p, 'pipe_body'); 
            addBlock(i, 12-h, 'pipe_top');
        }

        // Ennemis (10% de chance sur sol plat)
        if (Math.random() < 0.1) {
            levelRef.enemies.push(new Goomba(i * TILE_SIZE, 10 * TILE_SIZE, levelRef));
        }
    }
    
    // Drapeau de fin
    levelRef.flagpole = new Flagpole((length - 5) * TILE_SIZE, 3 * TILE_SIZE);
    levelRef.endX = length * TILE_SIZE;
}
