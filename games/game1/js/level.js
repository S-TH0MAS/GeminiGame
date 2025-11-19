import { Item } from './entities/Item.js';
import { buildLevel1 } from './levels/level1.js';
import { buildLevel2 } from './levels/level2.js';

export const level = { 
    blocks: [], 
    enemies: [], 
    items: [],
    flagpole: null,
    currentLevelIndex: 1,
    endX: 0
};

export function spawnItem(levelRef, x, y, type) {
    levelRef.items.push(new Item(x, y, type, levelRef));
}

export function loadLevel(index) {
    // Reset du niveau
    level.blocks = [];
    level.enemies = [];
    level.items = [];
    level.flagpole = null;
    level.currentLevelIndex = index;

    if (index === 1) {
        buildLevel1(level);
    } else if (index === 2) {
        buildLevel2(level);
    } else {
        // Si on dépasse le niveau 2, on boucle ou on génère un nouveau niveau aléatoire
        buildLevel2(level); 
    }
}
