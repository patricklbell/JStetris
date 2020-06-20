'use strict';
function resize() {
  let wsize = getWindowSize();
  size = Math.floor(wsize.height / HEIGHT);
  if (Math.floor(wsize.width / (WIDTH+PREVIEW_WIDTH)) < size){
    size = Math.floor(wsize.width / (WIDTH+PREVIEW_WIDTH));
  }
  
  canvas.style.width = size * (WIDTH+PREVIEW_WIDTH) + "px";
  canvas.style.height = size * HEIGHT + "px";

  var modals = document.getElementsByClassName('modal-content');
  for(let i = 0; i < modals.length; i++) {
    modals[i].style.width = size * (WIDTH + 1) + "px";
  }

  canvas.width = Math.floor(size * (WIDTH + PREVIEW_WIDTH));
  canvas.height = Math.floor(size * HEIGHT);

  fieldbg.width = Math.floor(size * WIDTH);
  fieldbg.height = Math.floor(size * HEIGHT);

  canvasbg.style.width = canvas.width + "px";
  canvasbg.style.height = canvas.height + "px";
  
  canvas.style.marginLeft = (wsize.width - canvas.width) / 2 + "px";
  fieldbg.style.marginLeft = (wsize.width - canvas.width) / 2 + "px";
  canvasbg.style.marginLeft = (wsize.width - canvas.width) / 2 + "px";

  scaleMenus();
}
window.addEventListener('resize', resize);
resize();

function updatePreview(numPreviews){
  ctx.fillStyle = "#000000";
  if(gamestate["pieceGenerator"] !== undefined){
    let font_size = Math.floor(ctx.canvas.height*PREVIEW_FONT_SIZE);
    let font_gap = Math.floor(ctx.canvas.height*PREVEIW_FONT_GAP);
    let section_gap = Math.floor(ctx.canvas.height*PREVIEW_SECTION_GAP);
    let xOffset = section_gap + WIDTH*size;
    let style = 0
    
    
    ctx.drawText("NEXT", xOffset, font_gap, 0, font_size);
    let previews = gamestate["pieceGenerator"].getList();
    let gap = font_size+font_gap;
    let s = 1;
    for (let preview = 0; preview < PREVIEWS; preview++) {
      let renderingShape = SHAPES[previews[preview]];
      for (let i = 1; i < renderingShape.length; i++) {
        ctx.drawTile(renderingShape[i][0] * size*s + xOffset, renderingShape[i][1] * size*s + gap+font_gap, previews[preview], size*s);
      }
      gap += 3*s*size;
      s = Math.floor(size*SECOND_PREVIEW_SCALE_DOWN) / size;
    }
    
    let space = font_size*2 + 2*font_gap + section_gap;
    let stats_queue = [];
  
    if(GAMERULES["levels"]){
      style = gamestate["currentLevel"] % 7;
    }
  
    if(gamestate["board"] !== undefined && GAMERULES["showLines"]) {
      if(GAMERULES["lineLimit"] && gamestate["board"].linesCleared > GAMERULES["lineLimitValue"] * (9/10)){style = 2;}
      stats_queue.push(["LINES", gamestate["board"].linesCleared.toString()])
    }
  
    if(GAMERULES["timer"]){
      let time = (Math.max((now - gamestate["playTimer"]) / 1000, 0));
      stats_queue.push(["TIME", time.toFixed(1)]);
    }
    
    if (GAMERULES["countdown"]){
      let timeLeft = Math.max((GAMERULES["countdownValue"] - (now - gamestate["playTimer"])) / 1000, 0)
      if (timeLeft < GAMERULES["countdownValue"] / 10) {style = 2;}
      stats_queue.push(["TIME", timeLeft.toFixed(1)]);
    }
    if(GAMERULES["showLevel"]){stats_queue.push(["LEVEL", gamestate["currentLevel"].toString()])}
    if(GAMERULES["scoreShow"]){stats_queue.push(["SCORE", gamestate["score"].toString()])}
  
    for (let i = 0; i < stats_queue.length; i++) {
      ctx.drawText(stats_queue[i][0], xOffset, gap+space*i+font_gap, style, font_size);
      ctx.drawText(stats_queue[i][1], xOffset, gap+space*i+font_size+2*font_gap, style, font_size);
    }
  
    ctx.drawText("HOLD", xOffset, ctx.canvas.height - (2*size*s+font_gap*5), 0, font_size);
    if(gamestate["held"]){
      let s = Math.floor(size*HOLD_RENDER_SCALE) / size;
      let renderingShape = SHAPES[gamestate["holding"]];
      gap = ctx.canvas.height - 2*size*s - font_gap;
      for (let i = 1; i < renderingShape.length; i++) {
        ctx.drawTile(renderingShape[i][0] * size*s + xOffset, renderingShape[i][1] * size*s + gap, gamestate["holding"], size*s);
      }
    }
  }
}

// browser gameloop code
var vendors = ['webkit', 'moz'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
  window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
  window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

function init () {
  lockBuffer = 0, lockDelay = false, lockResets = 0;
  fallDelayBuffer = 0, lastHandledKeyBuffer = 0, shiftDelayBuffer = 0;
  keyPressed = 0, keyBuffer = [];

  gamestate["pieceGenerator"] = new randomBag(SHAPES.length);
  gamestate["board"] = new Board();
  gamestate["player"] = new Player(gamestate["pieceGenerator"].next());
  gamestate["playTimer"] = now;
  unpause(ctx);
}

function gameloop (time) {
  id = window.requestAnimationFrame(gameloop);
  
  now = time;
  dt = (now - lastUpdate);
  lastUpdate = now;
  
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  updatePreview();
  if(gamestate.board !== undefined) {gamestate.board.render(ctx)};
  if(inGame){
    preShake();
    gamestate.player.render(ctx, gamestate["board"]);
    postShake();
  }
  if(paused && MENUS[currentMenu].render !== undefined) {MENUS[currentMenu].render(ctx, 0, 0);}
  
  if(!paused && inGame && unpausing === false){
    if(keyBindings[keyPressed] !== undefined){
      if(shiftDelayBuffer <= DELAY_AUTO_SHIFT || keyNonRepeaters.indexOf(keyBindings[keyPressed]) !== -1){
        if(shiftDelayBuffer === 0){
          keyBindings[keyPressed]();
        }
        shiftDelayBuffer += dt;
      } else {
        // start repeating
        if(AUTO_REPEAT_RATE === 0){
          for (let i = 0; i < 10; i++) {
            keyBindings[keyPressed]()
          }
        } else {
          if(lastHandledKeyBuffer >= AUTO_REPEAT_RATE){
            keyBindings[keyPressed]();
            lastHandledKeyBuffer = 0;
          }
          lastHandledKeyBuffer += dt;
        }
      }
    }
    
    fallDelayBuffer += dt;
    
    if (lockDelay) {
      // Check whether we are still locked
      gamestate["player"].move(0, 1);
      if (gamestate["player"].testCollision(gamestate["board"]) !== true) {
        lockDelay = false;
      }
      
      if(lockBuffer >= LOCK_DELAY && lockDelay){
        harddrop();
      }
      
      fallDelayBuffer = 0;
      lockBuffer += dt;
    } 
    if (!lockDelay) {
      gamestate["player"].move(0, 1);
      
      if (gamestate["player"].testCollision(gamestate["board"]) === true) {
        lockDelay = true;
        gamestate["player"].unapply();
      } else if ((GAMERULES["levels"] && (fallDelayBuffer > gamestate["levelSpeed"])) ||
       (!GAMERULES["levels"] && (fallDelayBuffer > DEFAULT_GAMESTATE["levelSpeed"]))){
        gamestate["player"].apply();
        gamestate["player"].lastAction = "drop";
        fallDelayBuffer = 0;
      }
    }
    
    if((GAMERULES["lineLimit"] && gamestate["board"].linesCleared >= GAMERULES["lineLimitValue"]) || 
      (GAMERULES["countdown"] && GAMERULES["countdownValue"] - (now - gamestate["playTimer"]) <= 0)){
      if(gamestate["player"].delete(gamestate["board"])){
        endGame();
      }
    }
  }
  
  if(unpausing !== false){
    if(Math.floor(unpausing / 1000) < Math.floor((unpausing+dt)/1000)){
      if(SOUND_EFFECTS){AUDIO["countdown"].cloneNode().play();}
    }

    unpausing += dt;
    if(unpausing <= 3000){
      ctx.drawText(Math.floor(4 - unpausing/1000).toString(), WIDTH*size / 2 - (COUNTDOWN_FONT_SIZE*ctx.canvas.height)/2, HEIGHT*size / 2 - (COUNTDOWN_FONT_SIZE*ctx.canvas.height)/2, 5, (COUNTDOWN_FONT_SIZE*ctx.canvas.height));
    } else {
      if(MUSIC){AUDIO["theme"].play();}
      unpausing = false;
    }
  }
  if((paused || unpausing !== false) && inGame){gamestate["playTimer"] += dt}


  if(keyPressed === "Escape" && shiftDelayBuffer === 0 && inGame){
    if(paused && inGame){
      unpause(ctx);
    } else {
      pause();
    }
    keyPressed = 0;
  }

  clicked = false;
}
window.onload = function() {
  var context = new AudioContext();
  requestAnimationFrame(gameloop);
}
