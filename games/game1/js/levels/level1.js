import { TILE_SIZE } from '../constants.js';
import { Goomba } from '../entities/Goomba.js';
import { Flagpole } from '../entities/Flagpole.js';

export function buildLevel1(levelRef) {
    const addBlock = (x, y, type) => levelRef.blocks.push({ x: x * TILE_SIZE, y: y * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE, type: type });

    // Sol
    for(let i=0; i<200; i++) {
        if(i !== 69 && i !== 70 && i !== 86) {
            addBlock(i, 13, 'ground'); addBlock(i, 14, 'ground');
        }
    }
    
    // Structure 1-1
    addBlock(16, 9, 'q_block');
    addBlock(20, 9, 'brick'); addBlock(21, 9, 'q_block'); addBlock(22, 9, 'brick'); addBlock(23, 9, 'q_block'); addBlock(24, 9, 'brick');
    addBlock(22, 5, 'q_block');

    // Pipes
    const addPipe = (x, h) => { for(let i=0; i<h; i++) addBlock(x, 12-i, 'pipe_body'); addBlock(x, 12-h, 'pipe_top'); };
    addPipe(28, 1); addPipe(38, 2); addPipe(46, 3); addPipe(57, 3);

    // Enemies
    levelRef.enemies.push(new Goomba(22 * TILE_SIZE, 10 * TILE_SIZE, levelRef));
    levelRef.enemies.push(new Goomba(40 * TILE_SIZE, 10 * TILE_SIZE, levelRef));
    levelRef.enemies.push(new Goomba(50 * TILE_SIZE, 10 * TILE_SIZE, levelRef));
    
    // Drapeau de fin
    // On le place à la fin du niveau (x=190)
    // Le mât fait 9.5 blocs de haut, donc on le place pour que la base soit au sol (y=13)
    // Base à y=12 (car le sol est à 13), donc top à 12 - 9 = 3
    levelRef.flagpole = new Flagpole(190 * TILE_SIZE, 3 * TILE_SIZE);
    levelRef.endX = 200 * TILE_SIZE; // Limite absolue
}
