// Globals

// Time
var lastUpdate = Date.now(), now = lastUpdate, dt = 0, id, playTimer = now, countdownTimer = 0;

// Misc
var size, score = 0;

// Level
var levelSpeed = LEVEL_SPEED_TABLE[Math.min(LEVEL_SPEED_TABLE.length - 1, currentLevel-1)];
var startLevel = 1, currentLevel = 1

// Key
var lockBuffer = 0, lockDelay = false, lockResets = 0;
var fallDelayBuffer = 0, lastHandledKeyBuffer = 0, shiftDelayBuffer = 0;
var keyPressed = 0, keyBuffer = []; 

var paused = false, inGame = false, changingPause = false, b2b_flag = false;

// Holds
var nextShape, holding = false, held, switched = false;

// Objects
var player, sqr, randomGenerator = new randomBag(SHAPES.length);


function resize() {
  size = Math.floor((window.innerHeight * 0.9) / HEIGHT);
  canvas.style.height = size * HEIGHT + "px";
  canvas.style.width = size * WIDTH + "px";
  
  size *= window.devicePixelRatio;

  canvas.width = Math.floor(size * WIDTH);
  canvas.height = Math.floor(size * HEIGHT);
  fieldbg.width = Math.floor(size * WIDTH);
  fieldbg.height = Math.floor(size * HEIGHT);
  
  previewCanvas.style.marginLeft = window.innerWidth / 2 + canvas.width / 2 + 10 + "px";
  previewCanvas.style.height = size*HEIGHT + "px";
  previewCanvas.style.width = size*WIDTH + "px";
  previewCanvas.width = size*WIDTH;
  previewCanvas.height = size*HEIGHT;

  setting_icon.style.left = (window.innerWidth / 2) - (WIDTH*size / 2) - (window.innerHeight / 20) -10 + "px";
  setting_icon.style.marginTop = (window.innerHeight) / 20 + "px";
  restart_icon.style.left = (window.innerWidth / 2) - (WIDTH*size / 2) - (window.innerHeight / 20) -10 + "px";
  restart_icon.style.marginTop = (window.innerHeight) * 2 / 20 + 10 + "px";

  bufferImages(ctx, size);
  bufferImages(previewCtx, size);
}
window.addEventListener('resize', resize);
resize();

function render_preview(ctx, numPreviews){
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let font_size = Math.floor(ctx.canvas.height*PREVIEW_FONT_SIZE);
  let font_gap = Math.floor(ctx.canvas.height*PREVEIW_FONT_GAP);
  let section_gap = Math.floor(ctx.canvas.height*PREVIEW_SECTION_GAP);
  
  ctx.drawText("NEXT", 0, 0, 0, font_size);
  previews = randomGenerator.getList();
  gap = font_size+font_gap;
  let s = 1;
  for (let preview = 0; preview < numPreviews; preview++) {
    renderingShape = SHAPES[previews[preview]];
    for (let i = 1; i < renderingShape.length; i++) {
      ctx.drawTile(renderingShape[i][0] * size*s, renderingShape[i][1] * size*s + gap, previews[preview], size*s);
    }
    gap += 3*s*size;
    s = Math.floor(size*SECOND_PREVIEW_SCALE_DOWN) / size;
  }
  
  style = 0
  if(GAMERULES["levels"]){
    style = currentLevel % 7;
  }
  
  let space = font_size*2 + 2*font_gap + section_gap;
  let stats_queue = [];

  if(sqr !== undefined && GAMERULES["showLines"]) {
    if(GAMERULES["lineLimit"] && sqr.linesCleared > GAMERULES["lineLimitValue"] * (9/10)){style = 2;}
    stats_queue.push(["LINES", sqr.linesCleared.toString()])
  }

  if(GAMERULES["timer"]){
    let time = (Math.max((now - playTimer) / 1000, 0));
    stats_queue.push(["TIME", time.toFixed(1)]);
  }
  
  if (GAMERULES["countdown"]){
    let timeLeft = Math.max((GAMERULES["countdownValue"] - (now - playTimer)) / 1000, 0)
    if (timeLeft < GAMERULES["countdownValue"] / 10) {style = 2;}
    stats_queue.push(["TIME LEFT", timeLeft.toFixed(1)]);
  }
  if(GAMERULES["showLevel"]){stats_queue.push(["LEVEL", currentLevel.toString()])}
  if(GAMERULES["scoreShow"]){stats_queue.push(["SCORE", score.toString()])}

  for (let i = 0; i < stats_queue.length; i++) {
    ctx.drawText(stats_queue[i][0], 0, gap+space*i, style, font_size);
    ctx.drawText(stats_queue[i][1], 0, gap+space*i+font_size+font_gap, style, font_size);
  }

  if(holding){
    let s = Math.floor(size*HOLD_RENDER_SCALE) / size;
    ctx.drawText("HOLD", 0, ctx.canvas.height - (2*size*s+font_size+font_gap), 0, font_size);
    renderingShape = SHAPES[held];
    gap = ctx.canvas.height - 2*size*s;
    for (let i = 1; i < renderingShape.length; i++) {
      ctx.drawTile(renderingShape[i][0] * size*s, renderingShape[i][1] * size*s + gap, held, size*s);
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
  score = 0
  
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  sqr = new Squares();
  player = new Player(randomGenerator.next());
  resize();
  unpause(ctx, sqr);
  
  gameloop();
}

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );


// game code

function gameloop () {
  stats.begin();
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
    sqr.render(ctx);
    player.render(ctx, sqr);
    render_preview(previewCtx, PREVIEWS);
    postShake();
    
    fallDelayBuffer += dt;
    
    if (lockDelay) {
      // Check whether we are still locked
      player.move(0, 1);
      if (player.testCollision(sqr) !== true) {
        lockDelay = false;
      }
      
      if(lockBuffer >= LOCK_DELAY && lockDelay){
        lockResets = 0;
        lockBuffer = 0;
        
        const playerCopy = Object.assign({}, player);
        if(player.delete(sqr)){
          endGame();
        }
        player = new Player(randomGenerator.next());
        
        let t = sqr.fixFilledLines();
        if(GAMERULES["score"]) {score += determineScore(sqr, playerCopy, t, b2b_flag)*currentLevel}
        if (t) {
          if(SOUND_EFFECTS){AUDIO["erase" + t].cloneNode().play();}    
          if(SCREEN_SHAKE) {startShake(t*0.5);}
          if(b2b_flag){AUDIO["b2b"].cloneNode().play();}
          b2b_flag = true;
        }

        if(GAMERULES["levels"] && sqr.linesCleared + (startLevel-1)*LEVEL_LENGTH_LINES >=  currentLevel*LEVEL_LENGTH_LINES){
          if(SOUND_EFFECTS){AUDIO["levelup"].cloneNode().play();}
          currentLevel++;
          levelSpeed = LEVEL_SPEED_TABLE[Math.min(LEVEL_SPEED_TABLE.length - 1, currentLevel-1)];
        }
        
        lockResets = 0;
        lockBuffer = 0;
        render_preview(previewCtx, PREVIEWS);
      }
      
      fallDelayBuffer = 0;
      lockBuffer += dt;
    } 
    if (!lockDelay) {
      player.move(0, 1);
      
      if (player.testCollision(sqr) === true) {
        lockDelay = true;
        player.unapply();
      } else if (fallDelayBuffer > levelSpeed){
        player.apply();
        player.lastAction = "drop";
        fallDelayBuffer = 0;
      }
    }
    
    if((GAMERULES["lineLimit"] && sqr.linesCleared >= GAMERULES["lineLimitValue"]) || 
       (GAMERULES["countdown"] && GAMERULES["countdownValue"] - (now - playTimer) <= 0)){
      if(player.delete(sqr)){
        endGame();
      }
    }
  } else {
    playTimer += dt;
    render_preview(previewCtx, PREVIEWS);
  }

  if(keyPressed === "Escape" && shiftDelayBuffer === 0 && !changingPause && inGame){
    if(paused) {unpause(ctx, sqr);}
    else       {pause(ctx);}
    keyPressed = 0;
  }

  stats.end();
}

function keyDownHandler(event) {
  if(event.code !== keyPressed) {
    shiftDelayBuffer = 0;
    lastHandledKeyBuffer = AUTO_REPEAT_RATE + 1;
    keyBuffer.push(event.code);
  }
  keyPressed = event.code;
}
function keyUpHandler(event) {
  if(event.code === keyPressed) {
      if(keyBuffer.length == 0 || keyBuffer[0] == event.code){
        keyPressed = 0;
      } else {
        keyPressed = keyBuffer[0];
      }
  }

  let index = keyBuffer.indexOf(event.code)
  if(index !== -1){
    keyBuffer.splice(index, 1);
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


  unpause(ctx, sqr);
  settings.style.display = "none";
}
settings_submit.addEventListener("click", submitSettings);
loadStyle(DEFAULT_STYLE);

// Restart code
document.getElementById('button').addEventListener("click", function (e) {
  if (e.x != 0 && e.y != 0){
    gameover.style.display = 'none';
    
    GAMERULES["countdownValue"] = Math.min(time_dom_ultra.value,5)*60*1000
    
    if (GAMERULES["levels"]){
      startLevel = Math.floor(Math.max(level_dom_marathon.value, 1));
      currentLevel = startLevel;
      levelSpeed = LEVEL_SPEED_TABLE[Math.min(LEVEL_SPEED_TABLE.length - 1, currentLevel-1)];
    } else {
      startLevel = 1;
      currentLevel = 1;
      levelSpeed = LEVEL_SPEED_TABLE[1];
    }
    GAMERULES["lineLimitValue"] = Math.max(Math.floor(lines_dom_sprint.value), 1);
    
    inGame = true;
    init();

    playTimer = Date.now();
    gameloop();
  }
});
