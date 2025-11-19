import * as THREE from 'three';

export class Food {
    constructor(scene, boardSize) {
        this.scene = scene;
        this.boardSize = boardSize;
        this.pos = { x: 0, z: 0 };
        
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xff5722, emissive: 0x550000, roughness: 0.2 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 0.5;
        this.mesh.castShadow = true;
        
        // Tige (Feuille)
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.4;
        this.mesh.add(stem);

        scene.add(this.mesh);
        this.respawn([]);
    }

    respawn(snakePath) {
        let valid = false;
        while (!valid) {
            const half = Math.floor(this.boardSize / 2);
            this.pos.x = Math.floor(Math.random() * this.boardSize) - half;
            this.pos.z = Math.floor(Math.random() * this.boardSize) - half;
            
            // Vérifier collision avec le serpent
            valid = !snakePath.some(segment => segment.x === this.pos.x && segment.z === this.pos.z);
        }
        
        this.mesh.position.x = this.pos.x;
        this.mesh.position.z = this.pos.z;
        
        // Petite animation de pop
        this.mesh.scale.set(0.1, 0.1, 0.1);
        this.targetScale = 1;
    }
    
    update() {
        this.mesh.rotation.y += 0.02;
        if (this.mesh.scale.x < 1) {
            this.mesh.scale.addScalar(0.1);
        }
    }
}

