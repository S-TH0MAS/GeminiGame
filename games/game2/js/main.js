import * as THREE from 'three';
import { Centipede } from './Centipede.js';
import { Food } from './Food.js';
import { Bonus } from './Bonus.js';

// Configuration
const BOARD_SIZE = 20; // Taille de la grille (20x20)
const CELL_SIZE = 1;   // Taille visuelle d'une case

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Ciel bleu clair

// Brouillard pour l'ambiance (Foret claire)
scene.fog = new THREE.Fog(0x87CEEB, 15, 45);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 18, 12); // Vue un peu plus haute
camera.lookAt(0, 0, 2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Lumière plus forte et blanche
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); // Soleil
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

// --- ENVIRONNEMENT ---

// Sol (Herbe)
const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x76c755, roughness: 1 }); // Vert clair
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
plane.position.y = -0.05;
scene.add(plane);

// Délimitations (Buissons naturels)
const bushGroup = new THREE.Group();
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
const halfSize = (BOARD_SIZE * CELL_SIZE) / 2;

function createBush(x, z) {
    // Un buisson = Dodecahedron pour une forme un peu low poly / irrégulière
    const geo = new THREE.DodecahedronGeometry(0.6, 0);
    const mesh = new THREE.Mesh(geo, bushMaterial);
    mesh.position.set(x, 0.4, z);
    // Randomisation
    const s = 0.8 + Math.random() * 0.4;
    mesh.scale.set(s, s, s);
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bushGroup.add(mesh);
}

// Placer des buissons le long du périmètre
for(let i = -halfSize - 0.5; i <= halfSize + 0.5; i += 1.0) {
   createBush(i, -halfSize - 0.8); // Haut
   createBush(i, halfSize + 0.8);  // Bas
   createBush(-halfSize - 0.8, i); // Gauche
   createBush(halfSize + 0.8, i);  // Droite
}
scene.add(bushGroup);

// GRILLE SUPPRIMÉE VISUELLEMENT
// const gridHelper = ...

// Arbres décoratifs
function createTree(x, z) {
    const group = new THREE.Group();
    
    // Tronc
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 2, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1;
    trunk.castShadow = true;
    group.add(trunk);
    
    // Feuillage
    const leavesGeo = new THREE.ConeGeometry(2, 4, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 3;
    leaves.castShadow = true;
    group.add(leaves);
    
    group.position.set(x, 0, z);
    // Random scale/rotation
    const s = 0.8 + Math.random() * 0.5;
    group.scale.set(s, s, s);
    group.rotation.y = Math.random() * Math.PI;
    
    scene.add(group);
}

// Générer des arbres autour
for (let i = 0; i < 40; i++) {
    let tx, tz;
    // En dehors de la zone de jeu (-11 à 11)
    // On veut entre -25 et 25
    do {
        tx = (Math.random() - 0.5) * 50;
        tz = (Math.random() - 0.5) * 50;
    } while (tx > -12 && tx < 12 && tz > -12 && tz < 12);
    
    createTree(tx, tz);
}


// Jeu
let lastTime = 0;
let tickAccumulator = 0;
const BASE_TICK_RATE = 0.15; // Vitesse de base
let currentTickRate = BASE_TICK_RATE;
let speedBonusTimer = 0;

const centipede = new Centipede(scene, BOARD_SIZE);
const food = new Food(scene, BOARD_SIZE);
const bonus = new Bonus(scene, BOARD_SIZE); // Instantiation du bonus

let score = 0;
let isGameOver = false;

// Contrôles
window.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    switch(e.key) {
        case 'ArrowUp': centipede.setDirection(0, -1); break;
        case 'ArrowDown': centipede.setDirection(0, 1); break;
        case 'ArrowLeft': centipede.setDirection(-1, 0); break;
        case 'ArrowRight': centipede.setDirection(1, 0); break;
    }
});

function gameOver() {
    isGameOver = true;
    const gameOverEl = document.getElementById('game-over');
    if(gameOverEl) {
        gameOverEl.style.display = 'block';
        const finalScoreEl = document.getElementById('final-score');
        if(finalScoreEl) finalScoreEl.innerText = score;
    }
}

function update(dt) {
    if (isGameOver) return;

    // Gestion Bonus Vitesse (Timer)
    if (speedBonusTimer > 0) {
        speedBonusTimer -= dt;
        if (speedBonusTimer <= 0) {
            currentTickRate = BASE_TICK_RATE; // Retour vitesse normale
        }
    }

    // Apparition Bonus Aléatoire
    if (!bonus.active && Math.random() < 0.002) { // Petite chance à chaque frame
        // On ne spawn pas sur le serpent ou la nourriture
        const forbidden = [...centipede.body, food.pos];
        bonus.spawn(forbidden);
    }
    bonus.update(dt);

    tickAccumulator += dt;
    if (tickAccumulator >= currentTickRate) {
        tickAccumulator = 0;
        
        // Logique du Tick
        centipede.move();

        // Collisions Mur
        const head = centipede.getHeadPos();
        const limit = BOARD_SIZE / 2;
        if (head.x < -limit || head.x >= limit || head.z < -limit || head.z >= limit) {
            gameOver();
            return;
        }

        // Collision Soi-même
        if (centipede.checkSelfCollision()) {
            gameOver();
            return;
        }

        // Collision Nourriture
        if (Math.round(head.x) === food.pos.x && Math.round(head.z) === food.pos.z) {
            centipede.grow();
            food.respawn(centipede.body); // centipede.body est le path
            score += 10;
            updateScore();
        }

        // Collision Bonus
        if (bonus.active && Math.round(head.x) === bonus.pos.x && Math.round(head.z) === bonus.pos.z) {
            if (bonus.type === 'points') {
                score += 50; // Gros bonus de points
                showFloatingText("+50", bonus.pos);
            } else if (bonus.type === 'speed') {
                currentTickRate = 0.08; // Très rapide !
                speedBonusTimer = 5.0; // Pendant 5 secondes
                score += 20;
                showFloatingText("SPEED!", bonus.pos);
            }
            bonus.hide();
            updateScore();
        }
    }
    
    // Interpolation visuelle pour fluidité
    // Note: Si speed bonus actif, l'interpolation doit suivre le nouveau rate
    centipede.updateVisuals(tickAccumulator / currentTickRate);
    food.update();
}

function updateScore() {
    const scoreEl = document.getElementById('score');
    if(scoreEl) scoreEl.innerText = score;
}

// Petit helper pour texte flottant (Optionnel mais sympa)
function showFloatingText(text, pos) {
    // Pour simplifier sans CSS complexe, on log juste pour l'instant ou on pourrait créer un élément DOM
    console.log("Bonus:", text);
}

function animate(time) {
    requestAnimationFrame(animate);
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    update(dt);
    renderer.render(scene, camera);
}

animate(0);

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
