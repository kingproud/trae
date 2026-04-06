const gravity = 0.7;

class Sprite {
    constructor({ position, width = 50, height = 150, color = 'red' }) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(ctx) {
        this.draw(ctx);
    }
}

class Fighter extends Sprite {
    constructor({ position, velocity, color = 'red', offset, isPlayer2 = false }) {
        super({ position, width: 60, height: 120, color });
        this.velocity = velocity;
        this.isPlayer2 = isPlayer2;
        
        this.health = 100;
        this.isAttacking = false;
        this.isBlocking = false;
        this.isHit = false;
        this.dead = false;
        
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            offset: offset,
            width: 80,
            height: 40
        };
        
        this.frames = 0;
    }

    draw(ctx) {
        ctx.save();
        
        if (this.dead) {
            ctx.translate(this.position.x + this.width / 2, this.position.y + this.height);
            ctx.rotate(Math.PI / 2 * (this.isPlayer2 ? -1 : 1));
            ctx.translate(-(this.position.x + this.width / 2), -(this.position.y + this.height));
        }
        
        let bodyColor = this.color;
        if (this.isHit) {
            bodyColor = 'white';
        } else if (this.isBlocking) {
            bodyColor = '#888';
        }
        
        // Torso
        ctx.fillStyle = bodyColor;
        ctx.fillRect(this.position.x, this.position.y + 20, this.width, 60);
        
        // Head
        ctx.fillStyle = '#444';
        ctx.fillRect(this.position.x + 10, this.position.y, 40, 20);
        
        // Eye
        ctx.fillStyle = 'yellow';
        const eyeX = this.isPlayer2 ? this.position.x + 15 : this.position.x + 35;
        ctx.fillRect(eyeX, this.position.y + 5, 10, 10);
        
        // Legs
        ctx.fillStyle = '#666';
        ctx.fillRect(this.position.x + 5, this.position.y + 80, 20, 40);
        ctx.fillRect(this.position.x + 35, this.position.y + 80, 20, 40);
        
        // Arm
        ctx.fillStyle = '#aaa';
        const armX = this.isPlayer2 ? this.position.x - 10 : this.position.x + 50;
        ctx.fillRect(armX, this.position.y + 30, 20, 40);
        
        // Block Shield
        if (this.isBlocking && !this.dead && !this.isHit) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            const shieldX = this.isPlayer2 ? this.position.x - 20 : this.position.x + this.width;
            ctx.fillRect(shieldX, this.position.y, 20, this.height);
        }

        // Attack Box Effect
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
            ctx.fillRect(
                this.attackBox.position.x,
                this.attackBox.position.y,
                this.attackBox.width,
                this.attackBox.height
            );
        }
        
        ctx.restore();
    }

    update(ctx, canvasHeight) {
        this.draw(ctx);
        if (this.dead) return;

        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= canvasHeight - 50) {
            this.velocity.y = 0;
            this.position.y = canvasHeight - 50 - this.height;
        } else {
            this.velocity.y += gravity;
        }
        
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > 1024) this.position.x = 1024 - this.width;
        
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