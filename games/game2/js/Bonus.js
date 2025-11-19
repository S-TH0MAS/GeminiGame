import * as THREE from 'three';

export class Bonus {
    constructor(scene, boardSize) {
        this.scene = scene;
        this.boardSize = boardSize;
        this.active = false;
        this.pos = { x: 0, z: 0 };
        this.type = 'points'; // 'points' ou 'speed'
        this.lifeTime = 0;

        // Groupe principal
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.group.visible = false;

        // Mesh pour les Points (Or)
        const pointsGeo = new THREE.OctahedronGeometry(0.4, 0);
        const pointsMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700, 
            emissive: 0xaa8800,
            roughness: 0.1,
            metalness: 0.8
        });
        this.pointsMesh = new THREE.Mesh(pointsGeo, pointsMat);
        this.group.add(this.pointsMesh);

        // Mesh pour la Vitesse (Bleu Électrique)
        const speedGeo = new THREE.IcosahedronGeometry(0.4, 0);
        const speedMat = new THREE.MeshStandardMaterial({ 
            color: 0x00FFFF, 
            emissive: 0x0088aa,
            roughness: 0.1
        });
        this.speedMesh = new THREE.Mesh(speedGeo, speedMat);
        this.group.add(this.speedMesh);
        
        // Particules ou aura (Torus simple)
        const ringGeo = new THREE.TorusGeometry(0.6, 0.05, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        this.ring = new THREE.Mesh(ringGeo, ringMat);
        this.ring.rotation.x = Math.PI / 2;
        this.group.add(this.ring);
    }

    spawn(forbiddenPositions) {
        if (this.active) return;

        // Choisir le type
        this.type = Math.random() > 0.5 ? 'points' : 'speed';
        
        // Afficher le bon mesh
        this.pointsMesh.visible = (this.type === 'points');
        this.speedMesh.visible = (this.type === 'speed');
        
        // Couleur de l'anneau
        this.ring.material.color.setHex(this.type === 'points' ? 0xFFD700 : 0x00FFFF);

        // Position aléatoire
        let valid = false;
        while (!valid) {
            const half = Math.floor(this.boardSize / 2);
            this.pos.x = Math.floor(Math.random() * this.boardSize) - half;
            this.pos.z = Math.floor(Math.random() * this.boardSize) - half;
            
            // Vérifier collision avec serpent ou nourriture
            valid = !forbiddenPositions.some(p => p.x === this.pos.x && p.z === this.pos.z);
        }

        this.group.position.set(this.pos.x, 0.5, this.pos.z);
        this.active = true;
        this.group.visible = true;
        this.lifeTime = 10; // Disparait après 10 secondes
        this.group.scale.set(0,0,0); // Pour anim d'apparition
    }

    hide() {
        this.active = false;
        this.group.visible = false;
    }

    update(dt) {
        if (!this.active) return;

        this.lifeTime -= dt;
        if (this.lifeTime <= 0) {
            this.hide();
            return;
        }

        // Animation
        this.group.rotation.y += dt * 2;
        this.pointsMesh.rotation.z += dt;
        this.speedMesh.rotation.x += dt;
        
        // Pulsation de l'anneau
        const s = 1 + Math.sin(Date.now() * 0.005) * 0.2;
        this.ring.scale.set(s, s, s);

        // Scale in
        if (this.group.scale.x < 1) {
            this.group.scale.addScalar(dt * 2);
        }
        
        // Clignotement fin de vie
        if (this.lifeTime < 3) {
            this.group.visible = Math.floor(Date.now() / 200) % 2 === 0;
        } else {
            this.group.visible = true;
        }
    }
}

