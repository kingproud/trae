const container = document.getElementById('game-container');
const width = 1024;
const height = 576;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1e1e24');

// Camera
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
// Y is up, X is right, Z is towards the screen
camera.position.set(512, 288, 800); 
camera.lookAt(512, 288, 0);

// Renderer
let renderer;
try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
} catch (e) {
    console.error("WebGL Error:", e);
    container.innerHTML = `<div style="color:white; text-align:center; margin-top:200px;">WebGL is not supported in this environment.<br>${e.message}</div>`;
}

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(512, 1000, 500);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -600;
dirLight.shadow.camera.right = 600;
dirLight.shadow.camera.top = 600;
dirLight.shadow.camera.bottom = -600;
scene.add(dirLight);

// Ground
const groundGeometry = new THREE.BoxGeometry(1024, 50, 200);
const groundMaterial = new THREE.MeshLambertMaterial({ color: '#4a4e69' });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.set(512, 25, 0); // Ground top is at Y=50
ground.receiveShadow = true;
scene.add(ground);

const game = {
    isOver: false
};

const player1 = new Fighter({
    position: { x: 100, y: 50 },
    velocity: { x: 0, y: 0 },
    color: 0x3b82f6,
    offset: { x: 60, y: 30 },
    isPlayer2: false
});
scene.add(player1.mesh);

const player2 = new Fighter({
    position: { x: 800, y: 50 },
    velocity: { x: 0, y: 0 },
    color: 0xef4444,
    offset: { x: -80, y: 30 },
    isPlayer2: true
});
scene.add(player2.mesh);

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
    if (!renderer) return;
    
    player1.update(50);
    player2.update(50);
    
    if (game.isOver) {
        renderer.render(scene, camera);
        return;
    }

    player1.velocity.x = 0;
    if (!player1.dead && !player1.isHit && !player1.isBlocking) {
        if (keys.a.pressed && player1.position.x > 0) {
            player1.velocity.x = -5;
        } else if (keys.d.pressed && player1.position.x < width - player1.width) {
            player1.velocity.x = 5;
        }
    }

    player2.velocity.x = 0;
    if (!player2.dead && !player2.isHit && !player2.isBlocking) {
        if (keys.ArrowLeft.pressed && player2.position.x > 0) {
            player2.velocity.x = -5;
        } else if (keys.ArrowRight.pressed && player2.position.x < width - player2.width) {
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

    renderer.render(scene, camera);
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
            if (player1.position.y <= 50 && !player1.dead) player1.velocity.y = 15;
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
            if (player2.position.y <= 50 && !player2.dead) player2.velocity.y = 15;
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
