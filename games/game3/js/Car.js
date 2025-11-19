import * as THREE from 'three';

export class Car {
    constructor(scene) {
        this.scene = scene;
        
        // Physique
        this.pos = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.angle = 0;
        this.speed = 0;
        
        // Paramètres de conduite
        this.maxSpeed = 0.8;
        this.accelRate = 0.005; // Encore plus lent
        this.brakeRate = 0.01;  // Encore plus lent
        this.friction = 0.97;   // Friction réduite pour garder l'élan (lourdeur)
        this.turnSpeed = 0.05;  // Direction un peu plus lourde
        this.driftFactor = 0.95; // Un peu moins de drift "savonnette" pour compenser la lenteur
        
        // Construction du Mesh (Drift Car Style)
        this.mesh = new THREE.Group();
        
        // Matériaux
        const carColor = 0xff0055;
        const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.2, metalness: 0.5 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.0, metalness: 0.9 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });

        // 1. Châssis Principal
        const chassisGeo = new THREE.BoxGeometry(1.3, 0.4, 2.4);
        const chassis = new THREE.Mesh(chassisGeo, bodyMat);
        chassis.position.y = 0.4;
        chassis.castShadow = true;
        this.mesh.add(chassis);

        // 2. Cabine (Cockpit)
        const cabinGeo = new THREE.BoxGeometry(1.1, 0.35, 1.2);
        const cabin = new THREE.Mesh(cabinGeo, glassMat);
        cabin.position.set(0, 0.75, -0.1);
        cabin.castShadow = true;
        this.mesh.add(cabin);
        
        // 3. Toit (Un peu plus petit que la cabine)
        const roofGeo = new THREE.BoxGeometry(1.0, 0.05, 1.0);
        const roof = new THREE.Mesh(roofGeo, bodyMat);
        roof.position.set(0, 0.93, -0.1);
        this.mesh.add(roof);

        // 4. Passages de roues (Fenders) - Élargissement visuel
        const fenderGeo = new THREE.BoxGeometry(0.15, 0.3, 0.6);
        const fl = new THREE.Mesh(fenderGeo, bodyMat); fl.position.set(0.7, 0.4, 0.7);
        const fr = new THREE.Mesh(fenderGeo, bodyMat); fr.position.set(-0.7, 0.4, 0.7);
        const rl = new THREE.Mesh(fenderGeo, bodyMat); rl.position.set(0.7, 0.4, -0.7);
        const rr = new THREE.Mesh(fenderGeo, bodyMat); rr.position.set(-0.7, 0.4, -0.7);
        this.mesh.add(fl); this.mesh.add(fr); this.mesh.add(rl); this.mesh.add(rr);

        // 5. Aileron (Spoiler)
        const spoilerPostsGeo = new THREE.BoxGeometry(0.05, 0.3, 0.1);
        const sp1 = new THREE.Mesh(spoilerPostsGeo, blackMat); sp1.position.set(0.4, 0.7, -1.1);
        const sp2 = new THREE.Mesh(spoilerPostsGeo, blackMat); sp2.position.set(-0.4, 0.7, -1.1);
        this.mesh.add(sp1); this.mesh.add(sp2);
        
        const spoilerWingGeo = new THREE.BoxGeometry(1.4, 0.05, 0.3);
        const spoiler = new THREE.Mesh(spoilerWingGeo, blackMat);
        spoiler.position.set(0, 0.85, -1.15);
        this.mesh.add(spoiler);

        // Roues
        const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.35, 24);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.8 });
        
        const createWheel = (x, z) => {
            const group = new THREE.Group();
            const tire = new THREE.Mesh(wheelGeo, wheelMat);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            group.add(tire);
            
            // Jante
            const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.36, 12);
            const rim = new THREE.Mesh(rimGeo, rimMat);
            rim.rotation.z = Math.PI / 2;
            group.add(rim);

            group.position.set(x, 0.32, z);
            this.mesh.add(group);
            return group;
        };
        
        this.wheels = [
            createWheel(0.75, 0.75),  // AV D
            createWheel(-0.75, 0.75), // AV G
            createWheel(0.75, -0.75), // AR D
            createWheel(-0.75, -0.75) // AR G
        ];
        
        // Phares AV
        const lightGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        const l1 = new THREE.Mesh(lightGeo, lightMat); l1.position.set(0.45, 0.5, 1.2);
        const l2 = new THREE.Mesh(lightGeo, lightMat); l2.position.set(-0.45, 0.5, 1.2);
        this.mesh.add(l1); this.mesh.add(l2);

        // Feux AR
        const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const t1 = new THREE.Mesh(lightGeo, tailLightMat); t1.position.set(0.45, 0.5, -1.2);
        const t2 = new THREE.Mesh(lightGeo, tailLightMat); t2.position.set(-0.45, 0.5, -1.2);
        this.mesh.add(t1); this.mesh.add(t2);

        scene.add(this.mesh);
        
        // Système de particules (Fumée)
        this.smokeParticles = [];
        const smokeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const smokeMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.6 });
        this.smokeGeometry = smokeGeo;
        this.smokeMaterial = smokeMat;
    }

    update(input, dt) {
        // 1. Accélération (Plus réaliste)
        // Moins d'accélération quand on approche la vitesse max
        const powerFactor = Math.max(0, 1 - (Math.abs(this.speed) / this.maxSpeed));
        
        if (input.up) {
            this.speed += this.accelRate * (0.4 + powerFactor * 0.6);
        } else if (input.down) {
            this.speed -= this.brakeRate;
        }
        
        // Friction naturelle
        this.speed *= this.friction;
        
        // Capuchonner la vitesse
        if (Math.abs(this.speed) < 0.001) this.speed = 0;
        
        // Gestion Drift Manuel (Frein à main)
        let currentDriftFactor = this.driftFactor;
        let turnMultiplier = 1;

        if (input.space) {
            // Le frein à main fait décrocher l'arrière -> Glisse ++
            currentDriftFactor = 0.90; 
            this.speed *= 0.97; // Freinage
            turnMultiplier = 1.5; // On tourne plus vite en dérapage contrôlé
        }
        
        // 2. Direction (Rotation)
        // On ne peut tourner que si on bouge (réaliste)
        if (Math.abs(this.speed) > 0.01) {
            const reverseFactor = this.speed < 0 ? -1 : 1; 
            if (input.left) this.angle += this.turnSpeed * reverseFactor * turnMultiplier;
            if (input.right) this.angle -= this.turnSpeed * reverseFactor * turnMultiplier;
        }
        
        // Mise à jour visuelle de la rotation de la voiture
        this.mesh.rotation.y = this.angle;
        
        // 3. Physique de Drift
        const forwardVector = new THREE.Vector3(Math.sin(this.angle), 0, Math.cos(this.angle));
        
        if (Math.abs(this.speed) > 0) {
            const engineForce = forwardVector.clone().multiplyScalar(this.speed);
            this.velocity.add(engineForce);
        }
        
        // Application du facteur de drift (variable si espace appuyé)
        this.velocity.multiplyScalar(currentDriftFactor);
        
        // Mise à jour position
        this.pos.add(this.velocity);
        this.mesh.position.copy(this.pos);
        
        // Roues qui tournent visuellement
        const wheelAngle = (input.left ? 0.5 : 0) + (input.right ? -0.5 : 0);
        this.wheels[0].rotation.y = wheelAngle;
        this.wheels[1].rotation.y = wheelAngle;
        
        // 4. Fumée (Si on dérape)
        const movementDir = this.velocity.clone().normalize();
        const dot = movementDir.dot(forwardVector); 
        
        // On fume si on dérape (dot < 0.9) OU si on burn (input up + space)
        const isDrifting = this.velocity.length() > 0.1 && Math.abs(dot) < 0.95;
        const isBurnout = input.up && input.space && Math.abs(this.speed) < 0.1;
        
        if (isDrifting || isBurnout) {
            this.spawnSmoke();
        }
        
        this.updateSmoke();
    }
    
    spawnSmoke() {
        // Créer deux particules aux roues arrières
        const offset = new THREE.Vector3(0.6, 0, -0.6).applyAxisAngle(new THREE.Vector3(0,1,0), this.angle);
        const p1 = this.pos.clone().add(offset);
        const p2 = this.pos.clone().sub(offset); // Erreur math ici pour la gauche, simplifions
        
        // Roue AR Gauche (-0.7, -0.7)
        const w1 = new THREE.Vector3(-0.75, 0.1, -0.75).applyAxisAngle(new THREE.Vector3(0,1,0), this.angle).add(this.pos);
        const w2 = new THREE.Vector3(0.75, 0.1, -0.75).applyAxisAngle(new THREE.Vector3(0,1,0), this.angle).add(this.pos);
        
        [w1, w2].forEach(p => {
            const mesh = new THREE.Mesh(this.smokeGeometry, this.smokeMaterial);
            mesh.position.copy(p);
            mesh.rotation.z = Math.random() * Math.PI;
            this.scene.add(mesh);
            this.smokeParticles.push({ mesh, life: 1.0 });
        });
    }
    
    updateSmoke() {
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.life -= 0.05;
            p.mesh.position.y += 0.05;
            p.mesh.scale.addScalar(0.1);
            p.mesh.material.opacity = p.life * 0.6;
            
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.smokeParticles.splice(i, 1);
            }
        }
    }
}
