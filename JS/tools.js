'use strict';

var getWindowSize = (function() {
    var docEl = document.documentElement,
        IS_BODY_ACTING_ROOT = docEl && docEl.clientHeight === 0;
  
    // Used to feature test Opera returning wrong values 
    // for documentElement.clientHeight. 
    function isDocumentElementHeightOff () { 
        var d = document,
            div = d.createElement('div');
        div.style.height = "2500px";
        d.body.insertBefore(div, d.body.firstChild);
        var r = d.documentElement.clientHeight > 2400;
        d.body.removeChild(div);
        return r;
    }
  
    if (typeof document.clientWidth == "number") {
       return function () {
         return { width: document.clientWidth, height: document.clientHeight };
       };
    } else if (IS_BODY_ACTING_ROOT || isDocumentElementHeightOff()) {
        var b = document.body;
        return function () {
          return { width: b.clientWidth, height: b.clientHeight };
        };
    } else {
        return function () {
          return { width: docEl.clientWidth, height: docEl.clientHeight };
        };
    }
  })();

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
}

class randomBag{
    constructor(l){
        this.l = l;
        this.array = Array(l*2);
        for (let i = 0; i < l*2; i++) {
            this.array[i] = i % this.l;
        }
        shuffle(this.array);
    }
    next(){
        if(this.array.length <= this.l){
            let temp = Array(this.l);
            for (let i = 0; i < temp.length; i++) {
                temp[i] = i;
            }
            shuffle(temp);
            this.array = this.array.concat(temp);
        }
        return this.array.shift(0);
    }
    getList(){
        return this.array.slice();
    }
}

// add pixel aligned versions of strokeRect & fRect to this context instance
function sRect(x,y,w,h){
    x=parseInt(x)+0.50;
    y=parseInt(y)+0.50;
    this.strokeRect(x,y,w,h);
}
function fRect(x,y,w,h){
    x=parseInt(x);
    y=parseInt(y);
    this.fillRect(x,y,w,h);
}

function drawTile(x, y, n, s=size){
    this.drawImage(tileSheet, 32*(2+n), 0, 32, 32, x, y, s, s);
}

ctx.sRect = sRect;
ctx.fRect = fRect;
ctx.drawTile = drawTile;
ctx.drawText = drawText;
previewCtx.sRect = sRect;
previewCtx.fRect = fRect;
previewCtx.drawTile = drawTile;
previewCtx.drawText = drawText;


function drawText(text, x, y, style=0, s=size){
    let offsetX = 0; let offsetY = 3*16*style;
    for (let i = 0; i < text.length; i++) {
        let sx = ((text.charCodeAt(i) - 32) % 32) * 16 + offsetX;
        let sy = Math.floor((text.charCodeAt(i) - 32) / 32) * 16 + offsetY;
        this.drawImage(fontSheet, sx, sy, 15, 16, x+i*s, y, s, s);
    }
}

function unpause(ctx){
    paused = true;
    
    let font_size = Math.floor(ctx.canvas.height*COUNTDOWN_FONT_SIZE);

    resize();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    gamestate["board"].render(ctx);
    gamestate["player"].render(ctx, gamestate["board"]);
    render_preview(previewCtx, PREVIEWS);
    // var imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    var i = 4;
    if(SOUND_EFFECTS){AUDIO["countdown"].cloneNode().play();}

    ctx.drawText("3", ctx.canvas.width / 2 - font_size/2, ctx.canvas.height / 2 - font_size/2, 2, font_size); 
    unpause_interval = setInterval(function (){
        i--;
        resize();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        gamestate["board"].render(ctx);
        gamestate["player"].render(ctx, gamestate["board"]);
        render_preview(previewCtx, PREVIEWS);

        if (i === 3) {
            if(SOUND_EFFECTS){AUDIO["countdown"].cloneNode().play();}
            ctx.drawText("2", ctx.canvas.width / 2 - font_size/2, ctx.canvas.height / 2 - font_size/2, 5, font_size);
        }
        if(i === 2){
            if(SOUND_EFFECTS){AUDIO["countdown"].cloneNode().play();}
            ctx.drawText("1", ctx.canvas.width / 2 - font_size/2, ctx.canvas.height / 2 - font_size/2, 4, font_size);
        }
        else if(i === 1){ 
            if(MUSIC && inGame) {AUDIO["theme"].play()};
            paused = false;

            clearInterval(unpause_interval);
            unpause_interval = false;
        }
        
    }, 1000);
}

function pause(ctx){
    clearInterval(unpause_interval);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    gamestate["board"].render(ctx);
    gamestate["player"].render(ctx, gamestate["board"]);
    render_preview(previewCtx, PREVIEWS);
    unpause_interval = false;

    AUDIO["theme"].pause();
    if(SOUND_EFFECTS){AUDIO["pause"].cloneNode().play();}
    let height = Math.floor(ctx.canvas.height / 6);
    let width = Math.floor(ctx.canvas.height / 24);

    ctx.fillStyle = "#FFFFFF"
    ctx.fRect(ctx.canvas.width / 2 - 1.5*width, ctx.canvas.height / 2 - 0.5*height, width, height)
    ctx.fRect(ctx.canvas.width / 2 + 0.5*width, ctx.canvas.height / 2 - 0.5*height, width, height)
    paused = true;
}

var shakeDuration = 200;
var shakeStartTime = -1;
var shakeCoefficient = -1;

function preShake() {
  if (shakeStartTime ==-1) return;
  var dt = Date.now()-shakeStartTime;
  if (dt>shakeDuration) {
      shakeStartTime = -1; 
      return;
  }
  var easingCoef = dt / shakeDuration;
  var easing = Math.pow(easingCoef-1,3) +1;
  ctx.save();  
  var dx = easing*(Math.cos(dt*0.1 ) + Math.cos( dt *0.3115))*1.5;
  var dy = easing*(Math.sin(dt*0.05) + Math.sin(dt*0.057113))*1.5;
  ctx.translate(dx, dy);  
}

function postShake() {
  if (shakeStartTime ==-1) return;
  ctx.restore();
}

function startShake(coefficient) {
   shakeStartTime=Date.now();
   shakeCoefficient=coefficient;
   shakeDuration=coefficient*100;
}

function msToTime(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours != "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}

function endGame(){
    if(SOUND_EFFECTS){AUDIO["died"].cloneNode().play();}
    AUDIO["theme"].pause();
    AUDIO["theme"].currrenTime = 0;
    inGame = false, paused = true;
    
    if(GAMERULES["results"]){
        results.style.display = "block";
        var results_queue = [];
        let time = Math.max(now - gamestate["playTimer"], 0.00000001);
        if(GAMERULES["resultsLevel"]){results_queue.push(["Level: " + gamestate["currentLevel"]]);}
        if(GAMERULES["resultsTimer"]){results_queue.push(["Time: " + msToTime(time)]);}
        if(GAMERULES["resultsLines"]){results_queue.push(["Lines: " + gamestate["board"].linesCleared]);}
        if(GAMERULES["resultsScore"]){results_queue.push(["Score: " + gamestate["score"]]);}
        if(GAMERULES["resultsTPM"]){results_queue.push(["Tetriminoes per minute: " + (gamestate["board"].tetriminoes / (time / 60000)).toFixed(1)]);}
        if(GAMERULES["resultsLPM"]){results_queue.push(["Lines per minute: " + (gamestate["board"].linesCleared / (time / 60000)).toFixed(1)]);}
        
        let html = "<h3>Game Over</h3>"
        for (let i = 0; i < results_queue.length; i++) {
            html += `<div class="result-item"><p>`+ results_queue[i] +"</p></div>";
        }
        if(BUFFER_REWIND){
            html += `<button type="button" id="results-rewind" class="button">Rewind `+REWIND_LENGTH+` moves</button>`
            document.getElementById('results-rewind').addEventListener("click", function(e){
                if (e.x != 0 && e.y != 0){
                    resize();
                    unpause(ctx);
                    inGame = true;
                    gamestate = gamestate_buffer[0];
                    gameloop();
                    results.style.display = 'none';
                }
            });
        }
        html += `<button type="button" id="results-continue" class="button">Play Again</button>`
        results_content.innerHTML = html;
        document.getElementById('results-continue').addEventListener("click", function (e){
            if (e.x != 0 && e.y != 0){
                gamestate_buffer = [];
                results.style.display = 'none';
                gameover.style.display = 'block';
            }
        });
    } else {
        gameover.style.display = 'block';
    }
    clearInterval(unpause_interval);
    unpause_interval = false;
}

function loadStyle(style){
    let style_obj = STYLES[style];
    tileSheet.src = "./assets/images/"+style_obj["blockskin"];
    fontSheet.src = "./assets/fonts/"+style_obj["font"];
    fieldbg.src = "./assets/images/"+style_obj["fieldbg"];
    AUDIO["theme"] = new Audio("./assets/audio/"+style_obj["theme"]);
    AUDIO["theme"].loop = true;
}

function determineScore(board, player, num_lines, b2b){
    var str_result = "";

    // Determine tspin and tspin mini
    if(player.name === "T" && player.lastAction === "rotate"){
        let centerX = player.piece[2][0] + player.pos[0]
        let centerY = player.piece[2][1] + player.pos[1]

        let diagonalsFilled = 0;
        for (let i = -1; i < 2; i+=2) {
            for (let j = -1; j < 2; j+=2) {
                if(!(board.array[((centerY+i) * WIDTH) + centerX+j] === false) ||
                (board.array[((centerY+i) * WIDTH) + centerX+j] === undefined)){
                    diagonalsFilled += 1;
                }
            }
        }
        if(diagonalsFilled >= 3){str_result = "tspin"}
        else{
            let tipX = player.piece[2][0] - player.piece[1][0]
            let tipY = player.piece[2][1] - player.piece[1][1]
            let wing1X = player.piece[3][0] + player.pos[0]
            let wing1Y = player.piece[3][1] + player.pos[1]
            let wing2X = player.piece[4][0] + player.pos[0]
            let wing2Y = player.piece[4][1] + player.pos[1]
            if( // If their is a hole behind
                !(board.array[((centerY+tipY) * WIDTH) + centerX+tipX] === false ||
                board.array[((centerY+tipY) * WIDTH) + centerX+tipX] === undefined) ||
                // If the points beside tip are occupied
                (
                    !(board.array[((wing1Y+tipY) * WIDTH) + wing1X+tipX] === false ||
                    board.array[((wing1Y+tipY) * WIDTH) + wing1X+tipX] === undefined) + 
                    !(board.array[((wing2Y+tipY) * WIDTH) + wing2X+tipX] === false ||
                    board.array[((wing2Y+tipY) * WIDTH) + wing2X+tipX] === undefined) === 1
                )
            ){
                str_result = "tspinmini";
            }
        }   
    }
    str_result += LINE_CLEAR_NAMES[num_lines]
    if (b2b) {
        str_result += "b2b";
    }
    if(SCORE_TABLE[str_result] !== undefined){
        return SCORE_TABLE[str_result];
    }
    return 0;
}

setting_icon.onclick = function (){
    settings.style.display = "block";
    inGame = false;
    pause(ctx);
}
var restart_icon = document.getElementById('restart-icon');
restart_icon.onclick = function (){
    endGame();
}


function setupStyle() {
    let i = 0;
    for (var key in STYLES) {
        let opt = document.createElement('option');

        // create text node to add to option element (opt)
        opt.appendChild( document.createTextNode(key) );

        // set properties of opt
        opt.value = i; 
        if(key === DEFAULT_STYLE){
            opt.selected = "selected";
        }

        // add opt to end of select box (sel)
        style_select.appendChild(opt); 
        i++;
    }
}
setupStyle();

// https://stackoverflow.com/questions/19189785/is-there-a-good-cookie-library-for-javascript/19189846
/*********************************************************
gets the value of a cookie
**********************************************************/
document.getCookie = function(sName)
{
    sName = sName.toLowerCase();
    var oCrumbles = document.cookie.split(';');
    for(var i=0; i<oCrumbles.length;i++)
    {
        var oPair= oCrumbles[i].split('=');
        var sKey = decodeURIComponent(oPair[0].trim().toLowerCase());
        var sValue = oPair.length>1?oPair[1]:'';
        if(sKey == sName)
            return decodeURIComponent(sValue);
    }
    return undefined;
}
/*********************************************************
sets the value of a cookie
**********************************************************/
document.setCookie = function(sName,sValue)
{
    var oDate = new Date();
    oDate.setYear(oDate.getFullYear()+1);
    var sCookie = encodeURIComponent(sName) + '=' + encodeURIComponent(sValue);
    //  + ';expires=' + oDate.toGMTString() + ';path=/';
    document.cookie= sCookie;
}
/*********************************************************
removes the value of a cookie
**********************************************************/
document.clearCookie = function(sName)
{
    setCookie(sName,'');
}

function parseBool(str){
    return str === "true";
}

function loadCookies(){
  if (document.getCookie('lockDelay') !== undefined) {LOCK_DELAY = parseInt(document.getCookie('lockDelay'));};
  if (document.getCookie('maxLockResets') !== undefined) {MAX_LOCK_RESETS = parseInt(document.getCookie('maxLockResets'));};
  if (document.getCookie('autoRepeatDelay') !== undefined) {AUTO_REPEAT_RATE = parseInt(document.getCookie('autoRepeatDelay'));};
  if (document.getCookie('delayAutoShift') !== undefined) {DELAY_AUTO_SHIFT = parseInt(document.getCookie('delayAutoShift'));};
  if (document.getCookie('music') !== undefined) {MUSIC = parseBool(document.getCookie('music'));};
  if (document.getCookie('soundEffect') !== undefined) {SOUND_EFFECTS = parseBool(document.getCookie('soundEffect'));};
  if (document.getCookie('screenShake') !== undefined) {SCREEN_SHAKE = parseBool(document.getCookie('screenShake'));};
  if (document.getCookie('ghost') !== undefined) {GHOST = parseBool(document.getCookie('ghost'));};
  if (document.getCookie('style') !== undefined) {loadStyle(document.getCookie('style')); STYLE = document.getCookie('style');};
}
loadCookies();

function pushCookies(){
  document.setCookie("lockDelay", LOCK_DELAY);
  document.setCookie("maxLockResets", MAX_LOCK_RESETS);
  document.setCookie("autoRepeatDelay", AUTO_REPEAT_RATE);
  document.setCookie("delayAutoShift", DELAY_AUTO_SHIFT);
  document.setCookie("music", MUSIC);
  document.setCookie("soundEffect", SOUND_EFFECTS);
  document.setCookie("screenShake", SCREEN_SHAKE);
  document.setCookie("ghost", GHOST);
  document.setCookie("style", STYLE);
}