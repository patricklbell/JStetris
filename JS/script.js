'use strict';
// Time
var lastUpdate = Date.now(), now = lastUpdate, dt = 0, id, size;

// Key
var lockBuffer = 0, lockDelay = false, lockResets = 0;
var fallDelayBuffer = 0, lastHandledKeyBuffer = 0, shiftDelayBuffer = 0;
var keyPressed = 0, keyBuffer = []; 

var paused = false, inGame = false;

// Rewind buffer
var gamestate_buffer = [];

function resize() {
  let wsize = getWindowSize();
  size = Math.floor(wsize.height / HEIGHT);
  if (Math.floor(wsize.width / WIDTH) < size){
    size = Math.floor(wsize.width / WIDTH);
  }
  
  canvas.style.width = size * WIDTH + "px";
  canvas.style.height = size * HEIGHT + "px";

  var modals = document.getElementsByClassName('modal-content');
  for(let i = 0; i < modals.length; i++) {
    modals[i].style.width = size * (WIDTH + 1) + "px";
  }

  canvas.width = Math.floor(size * WIDTH);
  canvas.height = Math.floor(size * HEIGHT);
  previewCanvas.style.height = size*HEIGHT + "px";
  previewCanvas.style.width = size*4+ "px";
  previewCanvas.width = size*4;
  previewCanvas.height = size*HEIGHT;
  fieldbg.width = Math.floor(size * WIDTH);
  fieldbg.height = Math.floor(size * HEIGHT);
  
  canvas.style.marginLeft = (wsize.width - canvas.width - previewCanvas.width) / 2 + "px";
  fieldbg.style.marginLeft = (wsize.width - canvas.width - previewCanvas.width) / 2 + "px";
  setting_icon.style.left = (wsize.width - canvas.width - previewCanvas.width) / 2 -50 + "px";
  restart_icon.style.left = (wsize.width - canvas.width - previewCanvas.width) / 2 -50 + "px";
  previewCanvas.style.marginLeft = (wsize.width - canvas.width - previewCanvas.width) / 2 + canvas.width + "px";
  
  setting_icon.style.marginTop = (wsize.height) / 20 + "px";
  restart_icon.style.marginTop = (wsize.height) * 2 / 20 + 10 + "px";

  try{
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    gamestate["board"].render(ctx);
    gamestate["player"].render(ctx, gamestate["board"]);
    render_preview(previewCtx, PREVIEWS);
    if(paused && unpause_interval === false){
      let height = Math.floor(ctx.canvas.height / 6);
      let width = Math.floor(ctx.canvas.height / 24);
  
      ctx.fillStyle = "#FFFFFF";
      ctx.fRect(ctx.canvas.width / 2 - 1.5*width, ctx.canvas.height / 2 - 0.5*height, width, height);
      ctx.fRect(ctx.canvas.width / 2 + 0.5*width, ctx.canvas.height / 2 - 0.5*height, width, height);
    }
  } catch {}
}
window.addEventListener('resize', resize);
resize();

function render_preview(ctx, numPreviews){
  let xOffset = 10;
  let style = 0
  
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let font_size = Math.floor(ctx.canvas.height*PREVIEW_FONT_SIZE);
  let font_gap = Math.floor(ctx.canvas.height*PREVEIW_FONT_GAP);
  let section_gap = Math.floor(ctx.canvas.height*PREVIEW_SECTION_GAP);
  
  ctx.drawText("NEXT", xOffset, font_gap, 0, font_size);
  let previews = gamestate["pieceGenerator"].getList();
  let gap = font_size+font_gap;
  let s = 1;
  for (let preview = 0; preview < numPreviews; preview++) {
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
    stats_queue.push(["TIME LEFT", timeLeft.toFixed(1)]);
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
window.addEventListener('resize', function() {render_preview(previewCtx, PREVIEWS);} );

// browser gameloop code
var vendors = ['webkit', 'moz'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
  window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
  window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

function init () {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  gamestate["pieceGenerator"] = new randomBag(SHAPES.length);
  gamestate["board"] = new Board();
  gamestate["player"] = new Player(gamestate["pieceGenerator"].next());
  gamestate["playTimer"] = now;
  resize();
  unpause(ctx);
  
  gameloop();
}

function gameloop () {
  id = window.requestAnimationFrame(gameloop);
  
  now = Date.now();
  dt = (now - lastUpdate);
  lastUpdate = now;
  
  if(!paused && inGame){
    if(keyBindings[keyPressed] !== undefined){
      if(shiftDelayBuffer <= DELAY_AUTO_SHIFT || keyNonRepeaters.indexOf(keyPressed) !== -1){
        if(shiftDelayBuffer === 0){
          keyBindings[keyPressed]();
        }
        shiftDelayBuffer += dt;
      } else {
        // start repeating
        if(lastHandledKeyBuffer >= AUTO_REPEAT_RATE){
          keyBindings[keyPressed]();
          lastHandledKeyBuffer = 0;
        }
        lastHandledKeyBuffer += dt;
      }
    }
    
    preShake();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    gamestate["board"].render(ctx);
    gamestate["player"].render(ctx, gamestate["board"]);
    render_preview(previewCtx, PREVIEWS);
    postShake();
    
    fallDelayBuffer += dt;
    
    if (lockDelay) {
      // Check whether we are still locked
      gamestate["player"].move(0, 1);
      if (gamestate["player"].testCollision(gamestate["board"]) !== true) {
        lockDelay = false;
      }
      
      if(lockBuffer >= LOCK_DELAY && lockDelay){
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
      }
      
      fallDelayBuffer = 0;
      lockBuffer += dt;
    } 
    if (!lockDelay) {
      gamestate["player"].move(0, 1);
      
      if (gamestate["player"].testCollision(gamestate["board"]) === true) {
        lockDelay = true;
        gamestate["player"].unapply();
      } else if (fallDelayBuffer > gamestate["levelSpeed"]){
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
  } else {
    gamestate["playTimer"] += dt;
    render_preview(previewCtx, PREVIEWS);
  }

  if(keyPressed === "Escape" && shiftDelayBuffer === 0 && inGame && unpause_interval === false){
    if(paused) {unpause(ctx);}
    else       {pause(ctx);}
    keyPressed = 0;
  }
  else if(keyPressed === "Escape" && shiftDelayBuffer === 0 && paused){
    clearInterval(unpause_interval);
    pause(ctx);
    keyPressed = 0;
  }
}

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
});

function updateMenu(){
  let menus = game_mode_menus.children;
  for (let i = 0; i < menus.length; i++) {menus[i].style.display = "none";}
  
  document.getElementById(game_mode_select.value + "-options").style.display = "block";
  GAMERULES = {...GAME_MODES[game_mode_select.value]}
}
updateMenu();
game_mode_select.addEventListener("change", updateMenu);

function submitSettings(){
  loadStyle(style_select.options[style_select.selectedIndex].text);
  inGame = true;
  
  LOCK_DELAY = Math.max(parseInt(lock_delay_input.value), 0);
  MAX_LOCK_RESETS = Math.max(parseInt(max_lock_resets_input.value), 0);
  AUTO_REPEAT_RATE = Math.max(parseInt(auto_repeat_delay_input.value), 0);
  DELAY_AUTO_SHIFT = Math.max(parseInt(delay_auto_shift_input.value), 0);
  MUSIC = music_input.checked;
  SOUND_EFFECTS = sound_effects_input.checked;
  SCREEN_SHAKE = screen_shake_input.checked;
  GHOST = ghost_piece_input.checked;
  STYLE = style_select.options[style_select.selectedIndex].text
  
  pushCookies();
  resize();
  unpause(ctx);
  settings.style.display = "none";
}
settings_submit.addEventListener("click", submitSettings);

// Restart code
document.getElementById('button').addEventListener("click", function (e) {
  if (e.x != 0 && e.y != 0){
    gameover.style.display = 'none';
    
    GAMERULES["countdownValue"] = Math.max(time_dom_ultra.value,0)*60*1000
    GAMERULES["lineLimitValue"] = Math.max(Math.floor(lines_dom_sprint.value), 1);
      
    gamestate = Object.assign({}, DEFAULT_GAMESTATE);
    gamestate["startLevel"] = Math.floor(Math.max(level_dom_marathon.value, 1));
    gamestate["currentLevel"] = Math.floor(Math.max(level_dom_marathon.value, 1));
    gamestate["levelSpeed"] = LEVEL_SPEED_TABLE[Math.min(LEVEL_SPEED_TABLE.length - 1, Math.floor(Math.max(level_dom_marathon.value, 1))-1)];

    inGame = true;
    init();

    gamestate["playTimer"] = Date.now();
    gameloop();
  }
});
