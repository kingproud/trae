const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;
ctx.imageSmoothingEnabled = false;

const game = {
    isOver: false
};

const background = new Sprite({
    position: { x: 0, y: 0 },
    width: canvas.width,
    height: canvas.height,
    color: '#222'
});

const player1 = new Fighter({
    position: { x: 100, y: 0 },
    velocity: { x: 0, y: 0 },
    color: '#3b82f6',
    offset: { x: 60, y: 30 },
    isPlayer2: false
});

const player2 = new Fighter({
    position: { x: 800, y: 0 },
    velocity: { x: 0, y: 0 },
    color: '#ef4444',
    offset: { x: -80, y: 30 },
    isPlayer2: true
});

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowUp: { pressed: false }
};

decreaseTimer();

function animate() {
    window.requestAnimationFrame(animate);
    
    // Sky
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#4a4e69';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    player1.update(ctx, canvas.height);
    player2.update(ctx, canvas.height);
    
    if (game.isOver) return;

    player1.velocity.x = 0;
    if (!player1.dead && !player1.isHit && !player1.isBlocking) {
        if (keys.a.pressed && player1.position.x > 0) {
            player1.velocity.x = -5;
        } else if (keys.d.pressed && player1.position.x < canvas.width - player1.width) {
            player1.velocity.x = 5;
        }
    }

    player2.velocity.x = 0;
    if (!player2.dead && !player2.isHit && !player2.isBlocking) {
        if (keys.ArrowLeft.pressed && player2.position.x > 0) {
            player2.velocity.x = -5;
        } else if (keys.ArrowRight.pressed && player2.position.x < canvas.width - player2.width) {
            player2.velocity.x = 5;
        }
    }

    // Collision Detection & Attack
    if (
        player1.isAttacking && 
        player1.frames === 2 &&
        rectangularCollision({ rectangle1: player1, rectangle2: player2 })
    ) {
        player2.takeHit();
        document.querySelector('#player2-health').style.width = player2.health + '%';
    }

    if (
        player2.isAttacking && 
        player2.frames === 2 &&
        rectangularCollision({ rectangle1: player2, rectangle2: player1 })
    ) {
        player1.takeHit();
        document.querySelector('#player1-health').style.width = player1.health + '%';
    }

    // End game based on health
    if (player1.health <= 0 || player2.health <= 0) {
        determineWinner({ player1, player2, timerId });
    }
}

animate();

window.addEventListener('keydown', (event) => {
    if (game.isOver) return;

    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            break;
        case 'a':
            keys.a.pressed = true;
            break;
        case 'w':
            if (player1.velocity.y === 0 && !player1.dead) player1.velocity.y = -15;
            break;
        case ' ':
            player1.attack();
            break;
            
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowUp':
            if (player2.velocity.y === 0 && !player2.dead) player2.velocity.y = -15;
            break;
        case 'Enter':
            player2.attack();
            break;
    }
    
    if (event.code === 'ShiftLeft') {
        player1.isBlocking = true;
    }
    if (event.code === 'ShiftRight') {
        player2.isBlocking = true;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
    
    if (event.code === 'ShiftLeft') {
        player1.isBlocking = false;
    }
    if (event.code === 'ShiftRight') {
        player2.isBlocking = false;
    }
});

document.querySelector('#restart-btn').addEventListener('click', () => {
    resetGame();
});