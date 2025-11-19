import * as THREE from 'three';
import { Car } from './Car.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccff);
scene.fog = new THREE.Fog(0x88ccff, 20, 150); // Brouillard un peu plus loin

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 300;
dirLight.shadow.camera.left = -150;
dirLight.shadow.camera.right = 150;
dirLight.shadow.camera.top = 150;
dirLight.shadow.camera.bottom = -150;
scene.add(dirLight);

// --- MAP GENERATION ---

// Sol Herbe
const groundGeo = new THREE.PlaneGeometry(1000, 1000);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

// Circuit
const points = [
    new THREE.Vector3(0, 0, 10),
    new THREE.Vector3(0, 0, -50),
    new THREE.Vector3(40, 0, -90),
    new THREE.Vector3(100, 0, -50),
    new THREE.Vector3(80, 0, 20),
    new THREE.Vector3(20, 0, 60),
    new THREE.Vector3(-40, 0, 40),
    new THREE.Vector3(-80, 0, 0),
    new THREE.Vector3(-80, 0, -40),
    new THREE.Vector3(-40, 0, -60),
];

const curve = new THREE.CatmullRomCurve3(points);
curve.closed = true;

const trackWidth = 16;
const trackShape = new THREE.Shape();
trackShape.moveTo(-trackWidth/2, 0);
trackShape.lineTo(trackWidth/2, 0);
trackShape.lineTo(trackWidth/2, 0.1);
trackShape.lineTo(-trackWidth/2, 0.1);

const extrudeSettings = {
    steps: 400,
    curveSegments: 24,
    extrudePath: curve,
    depth: 0,
    bevelEnabled: false
};

// Pas de mesh de piste visible, on roule sur l'herbe !
// const trackGeo = new THREE.ExtrudeGeometry(trackShape, extrudeSettings);
// const trackMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });
// const track = new THREE.Mesh(trackGeo, trackMat);
// track.position.y = 0.05;
// track.receiveShadow = true;
// scene.add(track);

// Arbres & Forêt
const treeGroup = new THREE.Group();
const treeColliders = []; // Pour les collisions

const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 2, 8);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
const leafGeo = new THREE.ConeGeometry(3, 6, 8);
const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });

function createTree(x, z, scale) {
    const tree = new THREE.Group();
    
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1 * scale;
    trunk.scale.set(scale, scale, scale);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);
    
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.y = 4 * scale;
    leaf.scale.set(scale, scale, scale);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    tree.add(leaf);
    
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI;
    
    treeGroup.add(tree);
    treeColliders.push({ x, z, radius: 0.8 * scale });
}

// Génération Forêt Dense (800 arbres)
for(let i=0; i<800; i++) {
    const x = (Math.random() - 0.5) * 600;
    const z = (Math.random() - 0.5) * 600;
    
    // Vérification distance piste (approximative)
    let tooClose = false;
    // On check chaque point de contrôle de la courbe
    for(const p of points) {
        const dx = x - p.x;
        const dz = z - p.z;
        // Si on est proche d'un point du circuit, on ne plante pas
        if (dx*dx + dz*dz < 25*25) { 
            tooClose = true;
            break;
        }
    }
    
    // On vérifie aussi quelques points intermédiaires pour les longues lignes droites
    if(!tooClose) {
        const midPoints = curve.getSpacedPoints(20);
        for(const p of midPoints) {
            const dx = x - p.x;
            const dz = z - p.z;
            if (dx*dx + dz*dz < 12*12) { // Marge de sécurité largeur piste
                tooClose = true;
                break;
            }
        }
    }
    
    if (!tooClose) {
        const s = 0.8 + Math.random() * 1.5; // Taille aléatoire
        createTree(x, z, s);
    }
}
scene.add(treeGroup);


// Voiture
const car = new Car(scene);

// Input
const keys = { up: false, down: false, left: false, right: false, space: false };

window.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowUp': keys.up = true; break;
        case 'ArrowDown': keys.down = true; break;
        case 'ArrowLeft': keys.left = true; break;
        case 'ArrowRight': keys.right = true; break;
        case 'Space': keys.space = true; break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowUp': keys.up = false; break;
        case 'ArrowDown': keys.down = false; break;
        case 'ArrowLeft': keys.left = false; break;
        case 'ArrowRight': keys.right = false; break;
        case 'Space': keys.space = false; break;
    }
});

// Game Loop
function animate() {
    requestAnimationFrame(animate);

    car.update(keys, 0.016); // dt fixe approx

    // Collisions Arbres
    for (const tree of treeColliders) {
        const dx = car.pos.x - tree.x;
        const dz = car.pos.z - tree.z;
        const distSq = dx*dx + dz*dz;
        const minDist = 1.5 + tree.radius; // Rayon voiture (~1.5) + rayon arbre
        
        if (distSq < minDist * minDist) {
            // Collision détectée
            
            // 1. Arrêt/Rebond
            car.speed *= -0.5; // Rebond vers l'arrière à mi-vitesse
            car.velocity.multiplyScalar(-0.5);
            
            // 2. Repousser la voiture (Anti-penetration)
            const angle = Math.atan2(dz, dx); // Angle voiture -> arbre
            // On veut pousser la voiture dans la direction opposée (arbre -> voiture)
            // Non, dx/dz est Arbre -> Voiture si dx = car - tree. C'est bon.
            
            car.pos.x = tree.x + Math.cos(angle) * (minDist + 0.1);
            car.pos.z = tree.z + Math.sin(angle) * (minDist + 0.1);
            
            // Reset mesh position
            car.mesh.position.copy(car.pos);
        }
    }

    // Caméra Chase (Derrière la voiture)
    const dist = 12;
    const height = 6;
    
    const cx = car.pos.x - Math.sin(car.angle) * dist;
    const cz = car.pos.z - Math.cos(car.angle) * dist;
    
    const targetPos = new THREE.Vector3(cx, car.pos.y + height, cz);
    
    camera.position.lerp(targetPos, 0.1);
    camera.lookAt(car.pos.clone().add(new THREE.Vector3(0, 2, 0))); // Regarde un peu au dessus du sol

    renderer.render(scene, camera);
    updateUI();
}

function updateUI() {
    const needle = document.getElementById('needle');
    const speedValue = document.getElementById('speed-value');
    
    if (needle) {
        // Vitesse max 0.8
        const ratio = Math.abs(car.speed) / 0.8;
        // -135 à +135 degrés
        const angle = -135 + (ratio * 270);
        needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        
        if(speedValue) {
            // 0.8 unit = 200 km/h
            const kmh = Math.floor(Math.abs(car.speed) * 250);
            speedValue.innerText = kmh;
        }
    }
}

animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
