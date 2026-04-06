function rectangularCollision({ rectangle1, rectangle2 }) {
    // 3D AABB Collision Detection (Z is ignored as characters share Z=0 plane)
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
}

let timer = 60;
let timerId;

function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        document.querySelector('#timer').innerHTML = timer;
    }

    if (timer === 0) {
        determineWinner({ player1, player2, timerId });
    }
}

function determineWinner({ player1, player2, timerId }) {
    clearTimeout(timerId);
    document.querySelector('#end-message').style.display = 'block';
    document.querySelector('#restart-btn').style.display = 'block';
    
    if (player1.health === player2.health) {
        document.querySelector('#end-message').innerHTML = 'Tie';
    } else if (player1.health > player2.health) {
        document.querySelector('#end-message').innerHTML = 'Player 1 Wins';
    } else if (player1.health < player2.health) {
        document.querySelector('#end-message').innerHTML = 'Player 2 Wins';
    }
    
    game.isOver = true;
}

function resetGame() {
    player1.health = 100;
    player2.health = 100;
    player1.position = { x: 100, y: 50 };
    player2.position = { x: 800, y: 50 };
    player1.dead = false;
    player2.dead = false;
    player1.isHit = false;
    player2.isHit = false;
    player1.isAttacking = false;
    player2.isAttacking = false;
    player1.isBlocking = false;
    player2.isBlocking = false;
    player1.velocity = { x: 0, y: 0 };
    player2.velocity = { x: 0, y: 0 };

    player1.mesh.rotation.z = 0;
    player2.mesh.rotation.z = 0;
    
    document.querySelector('#player1-health').style.width = '100%';
    document.querySelector('#player2-health').style.width = '100%';
    document.querySelector('#end-message').innerHTML = '';
    document.querySelector('#end-message').style.display = 'none';
    document.querySelector('#restart-btn').style.display = 'none';
    
    timer = 60;
    document.querySelector('#timer').innerHTML = timer;
    clearTimeout(timerId);
    decreaseTimer();
    
    game.isOver = false;
}