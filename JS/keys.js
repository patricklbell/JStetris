'use strict';
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

var keyBindings = {
    "KeyC" : swapHold,
    "ShiftLeft" : swapHold,
    "ArrowDown" : function(){
        gamestate["player"].move(0, 1);
        if (gamestate["player"].testCollision(gamestate["board"]) === true) {
            gamestate["player"].unapply();
        } else {
            if(SOUND_EFFECTS){AUDIO["softdrop"].cloneNode().play();}
            gamestate["player"].apply();
            gamestate["score"] += SCORE_TABLE["softdrop"];
            gamestate["player"].lastAction = "softdrop";
            render_preview(previewCtx, PREVIEWS);

            // Check whether piece is on ground
            gamestate["player"].move(0, 1);
            if (!lockDelay && gamestate["player"].testCollision(gamestate["board"]) === true) {
                lockBuffer = 0;
                lockDelay = true;
            }
        }
    },
    "ArrowLeft" : function(){
        gamestate["player"].move(-1, 0);
        if (gamestate["player"].testCollision(gamestate["board"]) === true) {
            gamestate["player"].unapply();
        } else {
            if(SOUND_EFFECTS){AUDIO["move"].cloneNode().play();}
            gamestate["player"].apply();
            gamestate["player"].lastAction = "moveLeft";
        }
    },
    "ArrowRight" : function(){
        gamestate["player"].move(1, 0);
        if (gamestate["player"].testCollision(gamestate["board"]) === true) {
            gamestate["player"].unapply();
        } else {
            if(SOUND_EFFECTS){AUDIO["move"].cloneNode().play();}
            gamestate["player"].apply();
            gamestate["player"].lastAction = "moveRight";
        }
    },
    "Space" : function(){
        if(SOUND_EFFECTS){AUDIO["harddrop"].cloneNode().play();}
        gamestate["score"] += SCORE_TABLE["hardrop"] * gamestate["player"].drop(gamestate["board"]);
        gamestate["player"].apply();

        lockResets = 0;
        lockBuffer = 0;
        
        const playerCopy = Object.assign({}, gamestate["player"]);
        if(gamestate["player"].delete(gamestate["board"])){
          endGame();
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
        render_preview(previewCtx, PREVIEWS);
    },
    "ArrowUp" : clockTurnAndKick,
    "KeyX" : clockTurnAndKick,
    "ControlLeft" : antiClockTurnAndKick,
    "ControlRight" : antiClockTurnAndKick,
    "KeyZ" : antiClockTurnAndKick
};

var keyNonRepeaters = ["Space", "KeyC", "ShiftLeft", "ArrowUp", "KeyX", "ControlLeft", "ControlRight","KeyZ"];
