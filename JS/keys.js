function swapHold(){
    if(!switched){
        if(SOUND_EFFECTS){AUDIO["hold"].cloneNode().play();}
        let tmp = held;
        held = NAMES.indexOf(player.name);
        
        if(!holding){
            player = new Player(randomGenerator.next());
        } else {
            player = new Player(tmp);
        }
        switched = true;
        holding = true;
    } else {if(SOUND_EFFECTS){AUDIO["holdfail"].cloneNode().play();}}
}
function clockTurnAndKick(){
    if(player.testKicksClockwise(sqr)){
        if(SOUND_EFFECTS){AUDIO["rotate"].cloneNode().play();}
        player.apply();
        player.lastAction = "rotate";
    } else {if(SOUND_EFFECTS){AUDIO["rotfail"].cloneNode().play();}}
}
function antiClockTurnAndKick(){
    if(player.testKicksAntiClockwise(sqr)){
        if(SOUND_EFFECTS){AUDIO["rotate"].cloneNode().play();}
        player.apply();
        player.lastAction = "rotate";
    } else {if(SOUND_EFFECTS){AUDIO["rotfail"].cloneNode().play();}}
}

var keyBindings = {
    "KeyC" : swapHold,
    "ShiftLeft" : swapHold,
    "ArrowDown" : function(){
        player.move(0, 1);
        if (player.testCollision(sqr) === true) {
            player.unapply();
        } else {
            if(SOUND_EFFECTS){AUDIO["softdrop"].cloneNode().play();}
            player.apply();
            score += SCORE_TABLE["softdrop"];
            player.lastAction = "softdrop";
            render_preview(previewCtx, PREVIEWS);

            // Check whether piece is on ground
            player.move(0, 1);
            if (!lockDelay && player.testCollision(sqr) === true) {
                lockBuffer = 0;
                lockDelay = true;
            }
        }
    },
    "ArrowLeft" : function(){
        player.move(-1, 0);
        if (player.testCollision(sqr) === true) {
            player.unapply();
        } else {
            if(SOUND_EFFECTS){AUDIO["move"].cloneNode().play();}
            player.apply();
            player.lastAction = "moveLeft";
        }
    },
    "ArrowRight" : function(){
        player.move(1, 0);
        if (player.testCollision(sqr) === true) {
            player.unapply();
        } else {
            if(SOUND_EFFECTS){AUDIO["move"].cloneNode().play();}
            player.apply();
            player.lastAction = "moveRight";
        }
    },
    "Space" : function(){
        if(SOUND_EFFECTS){AUDIO["harddrop"].cloneNode().play();}
        score += SCORE_TABLE["hardrop"] * player.drop(sqr);
        player.apply();

        const playerCopy = Object.assign({}, player);
        if(player.delete(sqr)){
            endGame();
        };
        player = new Player(randomGenerator.next());
        
        let t = sqr.fixFilledLines();
        if(GAMERULES["score"]) {score += determineScore(sqr, playerCopy, t)*currentLevel}
        
        if (t) {
            if(SOUND_EFFECTS){AUDIO["erase" + t].cloneNode().play();}    
            if(SCREEN_SHAKE) {startShake(t*0.5);}
            if(b2b_flag){AUDIO["b2b"].cloneNode().play();}
            b2b_flag = true;
        }
        else {b2b_flag = false;}
        if(GAMERULES["levels"] && sqr.linesCleared > currentLevel*LEVEL_LENGTH_LINES){
            if(SOUND_EFFECTS){AUDIO["levelup"].cloneNode().play();}
            currentLevel++;
            levelSpeed = LEVEL_SPEED_TABLE[Math.min(LEVEL_SPEED_TABLE.length - 1, currentLevel-1)];
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

keyNonRepeaters = ["Space", "KeyC", "ShiftLeft", "ArrowUp", "KeyX", "ControlLeft", "ControlRight","KeyZ"];
