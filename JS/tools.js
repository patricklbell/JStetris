
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
    this.drawImage(this.offScreenCanvas, n*size, 0, size, size, x, y, s, s);
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
    let offsetX = 0; let offsetY = size + 3*size*style;
    for (let i = 0; i < text.length; i++) {
        let sx = ((text.charCodeAt(i) - 32) % 32) * size + offsetX;
        let sy = Math.floor((text.charCodeAt(i) - 32) / 32) * size + offsetY;
        this.drawImage(this.offScreenCanvas, sx, sy, size, size, x+i*s, y, s, s);
    }
}

function unpause(ctx, sqr){
    window.dispatchEvent(new Event('resize'));
    paused = true;
    changingPause = true;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    sqr.render(ctx);
    player.render(ctx, sqr);
    
    var i = 4;
    if(SOUND_EFFECTS){AUDIO["countdown"].cloneNode().play();}

    ctx.drawText("3", ctx.canvas.width / 2 - COUNTDOWN_FONT_SIZE/2, ctx.canvas.height / 2 - COUNTDOWN_FONT_SIZE/2, 2, COUNTDOWN_FONT_SIZE); 
    var timer = setInterval(function (){
        i--;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        sqr.render(ctx);
        player.render(ctx, sqr);

        if (i === 3) {
            if(SOUND_EFFECTS && i != 0){AUDIO["countdown"].cloneNode().play();}
            ctx.drawText("2", ctx.canvas.width / 2 - COUNTDOWN_FONT_SIZE/2, ctx.canvas.height / 2 - COUNTDOWN_FONT_SIZE/2, 5, COUNTDOWN_FONT_SIZE);
        }
        if(i === 2){
            if(SOUND_EFFECTS && i != 0){AUDIO["countdown"].cloneNode().play();}
            ctx.drawText("1", ctx.canvas.width / 2 - COUNTDOWN_FONT_SIZE/2, ctx.canvas.height / 2 - COUNTDOWN_FONT_SIZE/2, 4, COUNTDOWN_FONT_SIZE);
        }
        else if(i === 1){ 
            if(changingPause) {
                paused = false;
                changingPause = false;
            } else {
                pause(ctx);
            } 
            if(MUSIC && inGame) {AUDIO["theme"].play()};

            bufferImages(ctx, size);
            bufferImages(previewCtx, size);
            clearInterval(timer);
        }
        
    }, 1000);
}

function pause(ctx){
    AUDIO["theme"].pause();
    if(SOUND_EFFECTS){AUDIO["pause"].cloneNode().play();}
    height = Math.floor(ctx.canvas.height / 6);
    width = Math.floor(ctx.canvas.height / 24);

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

function bufferImages(canvas, size){
    canvas.offScreenCanvas = document.createElement('canvas');
    canvas.offScreenCanvas.width = size*32;
    canvas.offScreenCanvas.height = size + size*30;

    canvas.offScreenCanvas.getContext("2d").drawImage(tileSheet, 32*2, 0, 32*7, 32, 0, 0, size*7, size)
    canvas.offScreenCanvas.getContext("2d").drawImage(fontSheet, 0, 0, 16*32, 16*30, 0, size, size*32, size*30)
}


function endGame(){
    if(SOUND_EFFECTS){AUDIO["died"].cloneNode().play();}
    AUDIO["theme"].pause();
    AUDIO["theme"].currrenTime = 0;
    inGame = false, paused = true, nextShape, holding = false, held, switched = false;
    
    if(GAMERULES["results"]){
        results.style.display = "block";
        var results_queue = []
        if(GAMERULES["resultsLevel"]){results_queue.push(["Level: " + currentLevel]);}
        if(GAMERULES["resultsTimer"]){results_queue.push(["Time: " + (Math.max((now - playTimer) / 1000, 0)).toFixed(2)]);}
        if(GAMERULES["resultsLines"]){results_queue.push(["Lines: " + sqr.linesCleared]);}
        if(GAMERULES["resultsScore"]){results_queue.push(["Score: " + score]);}

        let html = "<h3>Game Over</h3>"
        for (let i = 0; i < results_queue.length; i++) {
            html += `<div class="result-item"><p>`+ results_queue[i] +"</p></div>";
        }
        html += `<button type="button" id="results-continue" class="button">Play Again</button>`
        results_content.innerHTML = html;
        document.getElementById('results-continue').addEventListener("click", function (e){
            if (e.x != 0 && e.y != 0){
              results.style.display = 'none';
              gameover.style.display = 'block';
            }
          });
    } else {
        gameover.style.display = 'block';
    }
}

function loadStyle(style){
    let style_obj = STYLES[style];
    tileSheet.src = "./assets/images/"+style_obj["blockskin"];
    fontSheet.src = "./assets/fonts/"+style_obj["font"];
    fieldbg.src = "./assets/images/"+style_obj["fieldbg"];
    AUDIO["theme"] = new Audio("./assets/audio/"+style_obj["theme"]);
    AUDIO["theme"].loop = true;
}

function determineScore(sqr, player, num_lines, b2b){
    var str_result = "";

    // Determine tspin and tspin mini
    if(player.name === "T" && player.lastAction === "rotate"){
        let centerX = player.piece[2][0] + player.pos[0]
        let centerY = player.piece[2][1] + player.pos[1]

        diagonalsFilled = 0;
        for (let i = -1; i < 2; i+=2) {
            for (let j = -1; j < 2; j+=2) {
                if(!(sqr.array[((centerY+i) * WIDTH) + centerX+j] === false) ||
                (sqr.array[((centerY+i) * WIDTH) + centerX+j] === undefined)){
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
                !(sqr.array[((centerY+tipY) * WIDTH) + centerX+tipX] === false ||
                sqr.array[((centerY+tipY) * WIDTH) + centerX+tipX] === undefined) ||
                // If the points beside tip are occupied
                (
                    !(sqr.array[((wing1Y+tipY) * WIDTH) + wing1X+tipX] === false ||
                    sqr.array[((wing1Y+tipY) * WIDTH) + wing1X+tipX] === undefined) + 
                    !(sqr.array[((wing2Y+tipY) * WIDTH) + wing2X+tipX] === false ||
                    sqr.array[((wing2Y+tipY) * WIDTH) + wing2X+tipX] === undefined) === 1
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
    return SCORE_TABLE[str_result];
}