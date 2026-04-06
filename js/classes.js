const gravity = 0.7;

class Fighter {
    constructor({ position, velocity, color = 0xff0000, offset, isPlayer2 = false }) {
        this.position = position; // {x, y}
        this.velocity = velocity;
        this.color = color;
        this.isPlayer2 = isPlayer2;
        this.offset = offset;
        
        this.width = 60;
        this.height = 120;
        this.depth = 40;
        
        this.health = 100;
        this.isAttacking = false;
        this.isBlocking = false;
        this.isHit = false;
        this.dead = false;
        
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            offset: offset,
            width: 80,
            height: 40,
            depth: 40
        };
        
        this.frames = 0;

        // Three.js Setup
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x + this.width/2, this.position.y + this.height/2, 0);

        // Materials
        this.bodyMaterial = new THREE.MeshLambertMaterial({ color: this.color });
        this.headMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        this.eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.limbMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        this.armMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
        this.shieldMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.5 
        });

        // Torso
        const torsoGeom = new THREE.BoxGeometry(this.width, 60, this.depth);
        this.torso = new THREE.Mesh(torsoGeom, this.bodyMaterial);
        this.torso.position.y = 10;
        this.torso.castShadow = true;
        this.mesh.add(this.torso);

        // Head
        const headGeom = new THREE.BoxGeometry(40, 20, this.depth);
        this.head = new THREE.Mesh(headGeom, this.headMaterial);
        this.head.position.y = 50;
        this.head.castShadow = true;
        this.mesh.add(this.head);

        // Eyes
        const eyeGeom = new THREE.BoxGeometry(10, 10, this.depth + 2);
        this.eye = new THREE.Mesh(eyeGeom, this.eyeMaterial);
        this.eye.position.set(this.isPlayer2 ? -10 : 10, 50, 0);
        this.mesh.add(this.eye);

        // Legs
        const legGeom = new THREE.BoxGeometry(20, 40, this.depth);
        this.legL = new THREE.Mesh(legGeom, this.limbMaterial);
        this.legL.position.set(-15, -40, 0);
        this.legL.castShadow = true;
        this.mesh.add(this.legL);
        
        this.legR = new THREE.Mesh(legGeom, this.limbMaterial);
        this.legR.position.set(15, -40, 0);
        this.legR.castShadow = true;
        this.mesh.add(this.legR);

        // Arm
        const armGeom = new THREE.BoxGeometry(20, 40, this.depth + 10);
        this.arm = new THREE.Mesh(armGeom, this.armMaterial);
        this.arm.position.set(this.isPlayer2 ? -35 : 35, 10, 0);
        this.arm.castShadow = true;
        this.mesh.add(this.arm);

        // Shield
        const shieldGeom = new THREE.BoxGeometry(10, this.height, this.depth + 20);
        this.shield = new THREE.Mesh(shieldGeom, this.shieldMaterial);
        this.shield.position.set(this.isPlayer2 ? -40 : 40, 0, 0);
        this.shield.visible = false;
        this.mesh.add(this.shield);

        // Attack Box Vis (Optional for debugging)
        const attackBoxGeom = new THREE.BoxGeometry(this.attackBox.width, this.attackBox.height, this.attackBox.depth);
        const attackBoxMat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true, transparent: true, opacity: 0.7 });
        this.attackBoxMesh = new THREE.Mesh(attackBoxGeom, attackBoxMat);
        this.attackBoxMesh.visible = false;
        this.mesh.add(this.attackBoxMesh);
    }

    updateMaterials() {
        if (this.isHit) {
            this.bodyMaterial.color.setHex(0xffffff);
        } else if (this.isBlocking) {
            this.bodyMaterial.color.setHex(0x888888);
        } else {
            this.bodyMaterial.color.setHex(this.color);
        }

        this.shield.visible = (this.isBlocking && !this.dead && !this.isHit);
        
        // Attack Box visibility
        if (this.isAttacking) {
            this.attackBoxMesh.visible = true;
            this.attackBoxMesh.position.set(
                this.attackBox.offset.x - (this.width/2) + this.attackBox.width/2,
                this.attackBox.offset.y - (this.height/2) + this.attackBox.height/2,
                0
            );
        } else {
            this.attackBoxMesh.visible = false;
        }
    }

    update(groundY) {
        if (this.dead) {
            // Death rotation
            const targetRotation = Math.PI / 2 * (this.isPlayer2 ? -1 : 1);
            this.mesh.rotation.z += (targetRotation - this.mesh.rotation.z) * 0.1;
            // Lower slightly when dead
            this.mesh.position.y += ((groundY + this.width/2) - this.mesh.position.y) * 0.1;
            return;
        }

        this.updateMaterials();

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y <= groundY) {
            this.velocity.y = 0;
            this.position.y = groundY;
        } else {
            this.velocity.y -= gravity;
        }
        
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > 1024) this.position.x = 1024 - this.width;

        // Update Three.js mesh position
        this.mesh.position.set(this.position.x + this.width/2, this.position.y + this.height/2, 0);
        
        if (this.isHit) {
            this.frames++;
            if (this.frames > 10) {
                this.isHit = false;
                this.frames = 0;
            }
        }
        
        if (this.isAttacking) {
            this.frames++;
            if (this.frames > 10) {
                this.isAttacking = false;
                this.frames = 0;
            }
        }
    }

    attack() {
        if (this.dead || this.isHit || this.isBlocking) return;
        this.isAttacking = true;
        this.frames = 0;
    }
    
    takeHit() {
        if (this.isBlocking) {
            this.health -= 5;
        } else {
            this.health -= 20;
            this.isHit = true;
            this.frames = 0;
        }

        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
        }
    }
}
