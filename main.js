window.addEventListener('load',function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const fullScreenButton = this.document.getElementById('fullScreenButton');
    canvas.width = 1500;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;


    class InputHandler {
        constructor(background) {
            this.keys = [];
            this.touchY = '';
            this.touchX = '';
            this.touchTreshold = 30;
            window.addEventListener('keydown', e => {
                if ((e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') 
                && this.keys.indexOf(e.key) === -1) {
                    if (e.key === 'd') {    
                        background.speed = 20;
                    }
                    if (e.key === 'a') {    
                        background.speed = 5;
                    }

                    this.keys.push(e.key);
            }else if (e.key == 'Enter' && gameOver) {
                    restartGame();
                }
            });

            window.addEventListener('keyup', e => {
                if ( e.key === 'w' 
                  || e.key === 'a'
                  || e.key === 's'
                  || e.key === 'd') {
                    if (e.key === 'd' || e.key === 'a') {    
                        background.speed = 7;
                    }
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });

            window.addEventListener('touchstart', e => {
                this.touchY = e.changedTouches[0].pageY;
                this.touchX = e.changedTouches[0].pageX;
            });

            window.addEventListener('touchmove', e => {
                const swipeDistanceY = e.changedTouches[0].pageY - this.touchY;
                const swipeDistanceX = e.changedTouches[0].pageX - this.touchX;
                if (swipeDistanceY < -this.touchTreshold && this.keys.indexOf('swipe up') === -1) {
                    this.keys.push('swipe up');
                } else if (swipeDistanceY > this.touchTreshold && this.keys.indexOf('swipe down') === -1) {
                    this.keys.push('swipe down');

                    if (gameOver) {
                        restartGame();
                    }
                } else if (swipeDistanceX < -this.touchTreshold && this.keys.indexOf('swipe left') === -1) {
                    background.speed = 5;
                    this.keys.push('swipe left');
                } else if (swipeDistanceX > this.touchTreshold && this.keys.indexOf('swipe right') === -1 ) {
                    background.speed = 20;
                    this.keys.push('swipe right');
                }
            });

            window.addEventListener('touchend', e => {
                if ((this.keys.indexOf('swipe left') > -1) || (this.keys.indexOf('swipe right') > -1)) {    
                    background.speed = 7;
                }
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1);
                this.keys.splice(this.keys.indexOf('swipe right'), 1);
                this.keys.splice(this.keys.indexOf('swipe left'), 1);
            });
        }
    }
    
    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameHeight = gameHeight;
            this.gameWidth = gameWidth;
            this.width = 200;
            this.height = 200;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.frameY = 0;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.maxFrame = 7;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 
                this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(input, deltaTime, enemies) {
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width/2 - 20)  - (this.x + this.width/2);
                const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2 + 20);
                const distance = Math.sqrt(dx**2 + dy**2);

                if (distance < enemy.width/3 + this.width/3) {
                    gameOver = true;
                }
            });

            if (this.frameTimer > this.frameInterval) {
                if (this.frameX > this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            if ((input.keys.indexOf('d') > -1) || (input.keys.indexOf('swipe right') > -1)) {
                this.speed = 5;
                background.speed = 20;
            } else if ((input.keys.indexOf('a') > -1) || (input.keys.indexOf('swipe left') > -1)) {
                this.speed = -5;
            } else if ((input.keys.indexOf('w') > -1 || input.keys.indexOf('swipe up') > -1) && this.onGround()) {
                this.vy -= 32;  
            } else if (((input.keys.indexOf('s') > -1 ) || (input.keys.indexOf('swipe down') > -1 )) && !this.onGround()) {
                this.vy += 4; 
            } else {
                this.speed = 0;
            }
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
            
            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.vy = 0;
                this.maxFrame = 7;
                this.frameY = 0;
            }

            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height
        }

        onGround() {
            return this.y >= this.gameHeight - this.height;
        }

        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 8;
            this.frameY = 0;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 7;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }

        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }

        restart() {
            this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('enemyImage');
            this.frameX = 0;
            this.speed = 8;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.markedForDeletion = false;
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, 
                this.width, this.height)
        }
        
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer+= deltaTime;
            }
            this.x-=this.speed;

            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
            enemies = enemies.filter(enemy => {
                return !enemy.markedForDeletion;
            });
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }

        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
    }

    function displayStatus(context) {
        textAlign = 'left';
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 100, 50);
        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 100, 52);

        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('Game over!', canvas.width/2, 200);
            context.fillStyle = 'white';
            context.fillText('Game over!', canvas.width/2 + 2, 200);

            context.fillStyle = 'green';
            context.fillText('Press enter or swipe down to restart!', canvas.width/2 + 45, 200 + 45);
            context.fillText('Press enter or swipe down to restart!', canvas.width/2 + 46, 200 + 46);
        }
    }

    function restartGame() {
        player.restart();
        background.restart();
        enemies = [];
        score = 0;
        gameOver = false;
        animate(0);
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(error => {
                alert(`Error, can't  enable full screen mode: ${error.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    fullScreenButton.addEventListener('click', toggleFullScreen);

    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    const input = new InputHandler(background);
    
    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 2000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    function animate(timeStamp) {
        const deltaTime = timeStamp  - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        background.draw(ctx);
        background.update();
        player.update(input, deltaTime, enemies);
        player.draw(ctx);
        handleEnemies(deltaTime);
        displayStatus(ctx);
        if (!gameOver) {
            requestAnimationFrame(animate);
        }
    }

    animate(0);
});