'use strict';
function unpause(ctx){
    if(SOUND_EFFECTS){AUDIO["countdown"].cloneNode().play();}
    paused = false;
    
    unpausing = 0;
}

function pause(){
    if(SOUND_EFFECTS){AUDIO["pause"].cloneNode().play();}
    if(MUSIC){AUDIO["theme"].pause();}
    currentMenu = "pause";
    paused = true;
    unpausing = false;
    
    if(MUSIC){AUDIO.theme.pause();}
}

canvas.onmousemove = function(e){
    mouseX = e.pageX - this.offsetLeft;
    mouseY = e.pageY - this.offsetTop;
}

canvas.addEventListener('mousedown', () => {
  document.body.addEventListener('mouseup', () => clearTimeout(intervalLog));
  document.body.addEventListener('mouseover', (e) => {
    if (e.target !== canvas) clearTimeout(intervalLog);
  });
  clicked=true;
  const intervalLog = setInterval(() => {clicked=true;}, 250);
});

function keyDownHandler(event) {
if(event.code !== keyPressed){
    shiftDelayBuffer = 0;
    // lastHandledKeyBuffer = AUTO_REPEAT_RATE + 1;
    if (keyPressed === 0) {shiftDelayBuffer = 0;}
    else {
        if(keyBuffer.indexOf(keyPressed) === -1){
            keyBuffer.unshift(keyPressed);
        }
    }

    keyPressed = event.code;
}
}

function keyUpHandler(event) {
if(event.code === keyPressed) {
    if(keyBuffer.length == 0 || keyBuffer[0] === event.code){
    keyPressed = 0;    
    } else {
    keyPressed = keyBuffer[0];
    }
}

let index = keyBuffer.indexOf(event.code)
while(index !== -1){
    keyBuffer.splice(index, 1);
    index = keyBuffer.indexOf(event.code)
}
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
// Handle losing focus
document.addEventListener("blur", function(event) {
    keyBuffer = [];
    keyPressed = 0;
    if(inGame){pause();}
});

function swapHold(){
    if(!gamestate["switched"]){
        if(SOUND_EFFECTS){AUDIO["hold"].cloneNode().play();}
        let tmp = gamestate["holding"];
        gamestate["holding"] = gamestate["player"].type;
        
        if(!gamestate["held"]){
            gamestate["player"] = new Player(gamestate["pieceGenerator"].next());
        } else {
            gamestate["player"] = new Player(tmp);
        }
        lockResets = 0;
        lockBuffer = 0;
        
        gamestate["switched"] = true;
        gamestate["held"] = true;
    } else {if(SOUND_EFFECTS){AUDIO["holdfail"].cloneNode().play();}}
}
function clockTurnAndKick(){
    if(gamestate["player"].testKicksClockwise(gamestate["board"])){
        if(SOUND_EFFECTS){AUDIO["rotate"].cloneNode().play();}
        gamestate["player"].apply();
        gamestate["player"].lastAction = "rotate";
    } else {if(SOUND_EFFECTS){AUDIO["rotfail"].cloneNode().play();}}
}
function antiClockTurnAndKick(){
    if(gamestate["player"].testKicksAntiClockwise(gamestate["board"])){
        if(SOUND_EFFECTS){AUDIO["rotate"].cloneNode().play();}
        gamestate["player"].apply();
        gamestate["player"].lastAction = "rotate";
    } else {if(SOUND_EFFECTS){AUDIO["rotfail"].cloneNode().play();}}
}

function softdrop(){
    gamestate["player"].move(0, 1);
    if (gamestate["player"].testCollision(gamestate["board"]) === true) {
        gamestate["player"].unapply();
    } else {
        if(SOUND_EFFECTS){AUDIO["softdrop"].cloneNode().play();}
        gamestate["player"].apply();
        gamestate["score"] += SCORE_TABLE["softdrop"];
        gamestate["player"].lastAction = "softdrop";

        // Check whether piece is on ground
        gamestate["player"].move(0, 1);
        if (!lockDelay && gamestate["player"].testCollision(gamestate["board"]) === true) {
            lockBuffer = 0;
            lockDelay = true;
        }
    }
}

function moveLeft(){
    gamestate["player"].move(-1, 0);
    if (gamestate["player"].testCollision(gamestate["board"]) === true) {
        gamestate["player"].unapply();
    } else {
        if(SOUND_EFFECTS){AUDIO["move"].cloneNode().play();}
        gamestate["player"].apply();
        gamestate["player"].lastAction = "moveLeft";
    }
}

function moveRight(){
    gamestate["player"].move(1, 0);
    if (gamestate["player"].testCollision(gamestate["board"]) === true) {
        gamestate["player"].unapply();
    } else {
        if(SOUND_EFFECTS){AUDIO["move"].cloneNode().play();}
        gamestate["player"].apply();
        gamestate["player"].lastAction = "moveRight";
    }
}

function harddrop(){
    gamestate["score"] += SCORE_TABLE["hardrop"] * gamestate["player"].drop(gamestate["board"]);
    gamestate["player"].apply();
    
    const playerCopy = Object.assign({}, gamestate["player"]);
    if(gamestate["player"].delete(gamestate["board"])){
        endGame();
    } else {
        if(SOUND_EFFECTS){AUDIO["harddrop"].cloneNode().play();}
    }
    
    let t = gamestate["board"].fixFilledLines();
    if(GAMERULES["score"]) {
        gamestate["score"] += determineScore(gamestate["board"], playerCopy, t, gamestate["b2b"])*gamestate["currentLevel"];
    }
    if (t) {
        if(SOUND_EFFECTS){AUDIO["erase" + t].cloneNode().play();}    
        if(SCREEN_SHAKE) {startShake(t*0.5);}
        if(gamestate["b2b"] && SOUND_EFFECTS){AUDIO["b2b"].cloneNode().play();}
        gamestate["b2b"] = true;
    } else {
        gamestate["b2b"] = false;
    }

    if(GAMERULES["levels"] && gamestate["board"].linesCleared + (gamestate["startLevel"]-1)*LEVEL_LENGTH_LINES >=  gamestate["currentLevel"]*LEVEL_LENGTH_LINES){
        if(SOUND_EFFECTS){AUDIO["levelup"].cloneNode().play();}
        gamestate["currentLevel"] += 1;
        gamestate["levelSpeed"] = LEVEL_SPEED_TABLE[Math.min(LEVEL_SPEED_TABLE.length - 1, gamestate["currentLevel"]-1)];
    }
    
    gamestate["player"] = new Player(gamestate["pieceGenerator"].next());
    gamestate["board"].tetriminoes += 1;

    if(BUFFER_REWIND){
        if(gamestate_buffer.length >= REWIND_LENGTH){
            gamestate_buffer.shift();
        }
        gamestate_buffer.push(Object.assign({}, gamestate));
        gamestate_buffer[gamestate_buffer.length-1]["pieceGenerator"] = Object.assign({}, gamestate["pieceGenerator"]);
        gamestate_buffer[gamestate_buffer.length-1]["board"] = Object.assign({}, gamestate["board"]);
        gamestate_buffer[gamestate_buffer.length-1]["player"] = Object.assign({}, gamestate["player"]);
    }

    lockResets = 0;
    lockBuffer = 0;
}

var keyBindings = {
    "KeyC" : swapHold,
    "ShiftLeft" : swapHold,
    "ShiftRight" : swapHold,
    "ArrowDown" : softdrop,
    "keyS" : softdrop,
    "ArrowLeft" : moveLeft,
    "keyA" : moveLeft,
    "ArrowRight" : moveRight,
    "keyD" : moveRight,
    "Space" : harddrop,
    "ArrowUp" : clockTurnAndKick,
    "keyW" : clockTurnAndKick,
    "KeyX" : clockTurnAndKick,
    "ControlLeft" : antiClockTurnAndKick,
    "ControlRight" : antiClockTurnAndKick,
    "KeyZ" : antiClockTurnAndKick,
};

var keyNonRepeaters = ["Space", "KeyC", "ShiftLeft", "ArrowUp", "KeyX", "ControlLeft", "ControlRight","KeyZ"];
