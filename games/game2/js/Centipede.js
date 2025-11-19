import * as THREE from 'three';

export class Centipede {
    constructor(scene, boardSize) {
        this.scene = scene;
        this.boardSize = boardSize;
        // Positions logiques (Grille)
        this.path = [
            { x: 0, z: 0 },
            { x: -1, z: 0 },
            { x: -2, z: 0 }
        ];
        
        this.meshes = []; // Objets 3D
        this.direction = { x: 1, z: 0 };
        this.nextDirection = { x: 1, z: 0 };
        this.growPending = 0;

        // Matériaux
        this.headMaterial = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.3 });
        this.bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8bc34a, roughness: 0.3 });
        this.legMaterial = new THREE.MeshStandardMaterial({ color: 0xff9800 });

        // Initialisation des meshes
        this.createHead();
        this.createBodySegment(-1, 0);
        this.createBodySegment(-2, 0);
    }

    createHead() {
        const group = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.45, 16, 16);
        const mesh = new THREE.Mesh(geometry, this.headMaterial);
        mesh.castShadow = true;
        group.add(mesh);

        // Yeux
        const eyeGeo = new THREE.SphereGeometry(0.12);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(0.25, 0.1, 0.3);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(-0.25, 0.1, 0.3);
        group.add(eyeL);
        group.add(eyeR);
        
        // Antennes
        const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6);
        const antMat = new THREE.MeshStandardMaterial({ color: 0xff9800 });
        const antL = new THREE.Mesh(antGeo, antMat);
        antL.position.set(0.2, 0.5, 0.2);
        antL.rotation.x = -0.5;
        antL.rotation.z = -0.5;
        const antR = new THREE.Mesh(antGeo, antMat);
        antR.position.set(-0.2, 0.5, 0.2);
        antR.rotation.x = -0.5;
        antR.rotation.z = 0.5;
        group.add(antL);
        group.add(antR);

        group.position.set(0, 0.5, 0);
        this.scene.add(group);
        this.meshes.push(group);
    }

    createBodySegment(x, z) {
        const group = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.35, 16, 16);
        const mesh = new THREE.Mesh(geometry, this.bodyMaterial);
        mesh.castShadow = true;
        group.add(mesh);

        // Pattes
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
        const legMesh = new THREE.Mesh(legGeo, this.legMaterial);
        legMesh.rotation.x = Math.PI / 2; // Horizontal
        legMesh.position.y = -0.1;
        legMesh.castShadow = true;
        group.add(legMesh);

        group.position.set(x, 0.5, z);
        this.scene.add(group);
        this.meshes.push(group);
    }

    setDirection(x, z) {
        // Interdit de reculer
        const head = this.path[0];
        const neck = this.path[1];
        
        // Si la prochaine case est la même que le cou, c'est un demi-tour
        if (head.x + x === neck.x && head.z + z === neck.z) return;
        
        this.nextDirection = { x, z };
    }
    
    getHeadPos() {
        return this.path[0];
    }
    
    get body() { // Pour la compatibilité avec la collision food
        return this.path;
    }

    move() {
        this.direction = this.nextDirection;
        
        // Calcul nouvelle tête
        const head = this.path[0];
        const newHead = {
            x: head.x + this.direction.x,
            z: head.z + this.direction.z
        };
        
        // Mise à jour logique
        this.path.unshift(newHead);
        
        if (this.growPending > 0) {
            this.growPending--;
            // Ajouter un mesh visuel
            // On le crée à la position de la QUEUE actuelle (pour qu'il "sorte" de la queue)
            const tail = this.path[this.path.length - 1];
            this.createBodySegment(tail.x, tail.z);
        } else {
            this.path.pop();
        }
        
        // Orientation de la tête visuelle
        const headMesh = this.meshes[0];
        // On oriente la tête vers la direction
        const angle = Math.atan2(this.direction.x, this.direction.z);
        headMesh.rotation.y = angle;
    }

    grow() {
        this.growPending++;
    }

    checkSelfCollision() {
        const head = this.path[0];
        // On commence à 1 car 0 est la tête
        for (let i = 1; i < this.path.length; i++) {
            if (this.path[i].x === head.x && this.path[i].z === head.z) {
                return true;
            }
        }
        return false;
    }

    updateVisuals(progress) {
        // progress est entre 0 et 1 (temps écoulé depuis le dernier tick / durée du tick)
        // Mais pour un snake style grille, l'interpolation peut être bizarre si on change de direction brusquement.
        // Pour un look "Snake 3D", une interpolation linéaire simple est bien.
        
        // On limite progress à 1
        if(progress > 1) progress = 1;

        for (let i = 0; i < this.meshes.length; i++) {
            // Le mesh i correspond au segment path[i]
            // MAIS, lors du mouvement, path a déjà changé.
            // path[i] est la CIBLE.
            // L'ancienne position (avant le tick) était... complexe à déduire sans stocker "oldPath".
            
            // Simplification : On anime vers la cible avec une fluidité
            // Lerp simple
            const mesh = this.meshes[i];
            const target = this.path[i];
            
            // Smooth follow
            mesh.position.x += (target.x - mesh.position.x) * 0.3;
            mesh.position.z += (target.z - mesh.position.z) * 0.3;
            
            // Animation des pattes (oscillation)
            if (i > 0) { // Pas la tête
                const legs = mesh.children[1];
                legs.rotation.z = Math.sin(Date.now() * 0.01 + i) * 0.3;
                legs.position.y = -0.1 + Math.abs(Math.sin(Date.now() * 0.02 + i)) * 0.05; // Marche
            }
        }
    }
}
