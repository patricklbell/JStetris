'use strict';

// This function handles arrays and objects
function eachRecursive(obj, x, y, func){
    for (var k in obj){
        if (typeof obj[k] == "object" && obj[k] !== null){
            let offsetX = x;
            let offsetY = y;
            func(obj[k], x, y);
            if(typeof(obj[k].x) === "number") {offsetX += obj[k].x;}
            if(typeof(obj[k].y) === "number") {offsetY += obj[k].y;}
            eachRecursive(obj[k], offsetX, offsetY, func);
        }
    }
}

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

function drawTile(x, y, n, s=size){
    this.drawImage(tileSheet, 32*(2+n), 0, 32, 32, x, y, s, s);
}

function drawText(text, x, y, style=0, s=size){
    let offsetX = 0; let offsetY = 3*16*style;
    for (let i = 0; i < text.length; i++) {
        let sx = ((text.charCodeAt(i) - 32) % 32) * 16 + offsetX;
        let sy = Math.floor((text.charCodeAt(i) - 32) / 32) * 16 + offsetY;
        this.drawImage(fontSheet, sx, sy, 15, 15, x+i*s, y, s, s);
    }
}
ctx.drawTile = drawTile;
ctx.drawText = drawText;

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
    AUDIO["theme"].currentTime = 0;
    
    lockBuffer = 0, lockDelay = false, lockResets = 0;
    fallDelayBuffer = 0, lastHandledKeyBuffer = 0, shiftDelayBuffer = 0;
    keyPressed = 0, keyBuffer = [];

    paused = true;
    inGame = false;
    currentMenu = "main";
    AUDIO["theme"].pause();

    gamestate = {...DEFAULT_GAMESTATE};
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
  if (document.getCookie('startLevel') !== undefined) {gamestate.startLevel = parseInt(document.getCookie('startLevel')); gamestate.currentLevel = gamestate.startLevel; gamestate.levelSpeed = LEVEL_SPEED_TABLE[gamestate.currentLevel];};
  if (document.getCookie('countdownValue') !== undefined) {GAMERULES.countdownValue = parseInt(document.getCookie('countdownValue'));};
  if (document.getCookie('lineLimitValue') !== undefined) {GAMERULES.lineLimitValue = parseInt(document.getCookie('lineLimitValue'));};
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
  document.setCookie("startLevel", gamestate.startLevel);
  document.setCookie("lineLimitValue", GAMERULES.lineLimitValue);
  document.setCookie("countdownValue", GAMERULES.countdownValue);
  document.setCookie("autoRepeatDelay", AUTO_REPEAT_RATE);
  document.setCookie("delayAutoShift", DELAY_AUTO_SHIFT);
  document.setCookie("music", MUSIC);
  document.setCookie("soundEffect", SOUND_EFFECTS);
  document.setCookie("screenShake", SCREEN_SHAKE);
  document.setCookie("ghost", GHOST);
  document.setCookie("style", STYLE);
}

window.onbeforeunload = function(){pushCookies();}
window.addEventListener("beforeunload", function(e){pushCookies();}, false);

function scaleMenus(){
    let cw = canvas.width, ch = canvas.height;
  let font_size = Math.floor(canvas.height*MENU_FONT_SIZE);
  let button_height = Math.floor(canvas.height*BUTTON_HEIGHT);
  let button_width = Math.floor(canvas.width*BUTTON_WIDTH);
  let menu_width = Math.floor(canvas.width*MENU_WIDTH);
  let settings_width = Math.floor(canvas.width*SETTINGS_WIDTH);
  let button_gap = Math.floor(canvas.width*BUTTON_GAP);
  let heading_height = Math.floor(canvas.height*HEADING_HEIGHT);
  let button_radius = Math.floor(canvas.height*BUTTON_RADIUS);
  let panel_radius = Math.floor(canvas.height*PANEL_RADIUS);
  let border_gap = Math.floor(canvas.height*BUTTON_DECORATION_GAP)
  MENUS.pause = new Div((cw - menu_width)/2, ch/2-(5*button_gap+4*button_height)/2, [
    new Panel(0, 0, menu_width, 5*button_gap+4*button_height, panel_radius, PANEL_COLOUR, BUTTON_STROKE),
    new VBox(button_gap, button_gap, button_gap, [
      new Button(0, 0, button_width, button_height, button_radius, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "RESUME", font_size, function (obj) {
        unpause(ctx);
      }, true, BUTTON_BACKGROUND, border_gap),
      new Button(0, 0, button_width, button_height, button_radius, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "OPTIONS", font_size, function (obj) {
        currentMenu = "settings";
      }, true, BUTTON_BACKGROUND, border_gap),
      new Button(0, 0, button_width, button_height, button_radius, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "RESTART", font_size, function(obj) {
        gamestate = {...DEFAULT_GAMESTATE};
        init();
      }, true, BUTTON_BACKGROUND, border_gap),
      new Button(0, 0, button_width, button_height, button_radius, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "QUIT", font_size, function(){
        endGame();
      }, true, BUTTON_BACKGROUND, border_gap),
    ])
  ]);
  MENUS.settings = new Div((cw - settings_width)/2, ch/2-(6*button_gap+6.5*button_height)/2, 
  [
    new Panel(0, 0, settings_width, 6*button_gap+6.5*button_height, panel_radius, "#3F3F3F", "#FFFFFF"),
    
    new VBox(button_gap/2, button_gap, button_gap, [
      new CenteredText(-button_gap/2, 0, settings_width, button_height/2, "SETTINGS", font_size),

      new HBox(0, 0, button_width/5.5, [
        new Text(0, 0, button_width / 2, button_height/2, "STYLE:", font_size*(3/4)),
        new HBox(0, 0, -button_width/6, [
          new Button(-button_width/12, 0, button_width/6, button_height/2, button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(STYLE_NAMES.indexOf(STYLE)==0)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(STYLE_NAMES.indexOf(STYLE)==0)?0:1], "<", font_size*(3/4), function () {
            let loc = MENUS[currentMenu].contents[1].contents[1].contents[1].contents;
            STYLE = STYLE_NAMES[Math.max(STYLE_NAMES.indexOf(STYLE)-1, 0)];
            loadStyle(STYLE);
            if(STYLE_NAMES.indexOf(STYLE) == 0){loc[0].fillColor = BUTTON_BACKGROUND; loc[0].selectColor = BUTTON_BACKGROUND}
            else{loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR; loc[2].fillColor = MENU_BUTTON_COLOUR; loc[2].selectColor = BUTTON_SELECT_COLOUR;}
            loc[1].text = STYLE_NAMES_SHORT[STYLE_NAMES.indexOf(STYLE)];
          }, false),
          new CenteredText(0, 0, button_width/2, button_height/2, STYLE_NAMES_SHORT[STYLE_NAMES.indexOf(STYLE)], font_size*(3/4)),
          new Button(button_width/12, 0, button_width/6, button_height/2, button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(STYLE_NAMES.indexOf(STYLE)>=STYLE_NAMES.length-1)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(STYLE_NAMES.indexOf(STYLE)>=STYLE_NAMES.length-1)?0:1], ">", font_size*(3/4), function () {
            let loc = MENUS[currentMenu].contents[1].contents[1].contents[1].contents;
            STYLE = STYLE_NAMES[Math.min(STYLE_NAMES.indexOf(STYLE)+1, STYLE_NAMES.length-1)];
            loadStyle(STYLE);
            if(STYLE_NAMES.indexOf(STYLE) >= STYLE_NAMES.length-1){loc[2].fillColor = BUTTON_BACKGROUND; loc[2].selectColor = BUTTON_BACKGROUND}
            else{loc[2].fillColor = MENU_BUTTON_COLOUR; loc[2].selectColor = BUTTON_SELECT_COLOUR; loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR;}
            loc[1].text = STYLE_NAMES_SHORT[STYLE_NAMES.indexOf(STYLE)];
          }, false),
        ])
      ]),

      new HBox(0, 0, button_width/5.5, [
        new Text(0, 0, button_width / 2, button_height/2, "GHOST:", font_size*(3/4)),
        new Button(0, 0, button_width / 2, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, CHECK_OPTIONS[GHOST?1:0], font_size*(3/4), function (obj) {
          GHOST = !GHOST;
          obj.text = CHECK_OPTIONS[GHOST?1:0];
        }, false),
      ]),
      new HBox(0, 0, button_width/5.5, [
        new Text(0, 0, button_width / 2, button_height/2, "MUSIC:", font_size*(3/4)),
        new Button(0, 0, button_width / 2, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, CHECK_OPTIONS[MUSIC?1:0], font_size*(3/4), function (obj) {
          MUSIC = !MUSIC;
          obj.text = CHECK_OPTIONS[MUSIC?1:0];
        }, false),
      ]),
      new HBox(0, 0, button_width/5.5, [
        new Text(0, 0, button_width / 2, button_height/2, "SFX:", font_size*(3/4)),
        new Button(0, 0, button_width / 2, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, CHECK_OPTIONS[SOUND_EFFECTS?1:0], font_size*(3/4), function (obj) {
          SOUND_EFFECTS = !SOUND_EFFECTS;
          obj.text = CHECK_OPTIONS[SOUND_EFFECTS?1:0];
        }, false),
      ]),
      new HBox(0, 0, button_width/5.5, [
        new Text(0, 0, button_width / 2, button_height/2, "SCREEN SHAKE:", font_size*(3/4)),
        new Button(0, 0, button_width / 2, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, CHECK_OPTIONS[SCREEN_SHAKE?1:0], font_size*(3/4), function (obj) {
          SCREEN_SHAKE = !SCREEN_SHAKE;
          obj.text = CHECK_OPTIONS[SCREEN_SHAKE?1:0];
        }, false),
      ]),

      new HBox(0, 0, button_width/5.5, [
        new Text(0, 0, button_width / 2, button_height/2, "REPEAT RATE:", font_size*(3/4)),
        new HBox(0, 0, -button_width/6, [
          new Button(-button_width/12, 0, button_width/6, button_height/2, button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(AUTO_REPEAT_RATE<=1)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(AUTO_REPEAT_RATE<=1)?0:1], "-", font_size*(3/4), function () {
            let incr = 10, loc = MENUS[currentMenu].contents[1].contents[6].contents[1].contents;
            if(AUTO_REPEAT_RATE < 20){incr = 1}
            AUTO_REPEAT_RATE = Math.max(AUTO_REPEAT_RATE-incr, 1);
            if(AUTO_REPEAT_RATE <= 1){loc[0].fillColor = BUTTON_BACKGROUND; loc[0].selectColor = BUTTON_BACKGROUND}
            else{loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR}
            loc[1].text = AUTO_REPEAT_RATE.toString() + " MS";
          }, false),
          new CenteredText(0, 0, button_width/2, button_height/2, AUTO_REPEAT_RATE.toString()+" MS", font_size*(3/4)),
          new Button(button_width/12, 0, button_width/6, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "+", font_size*(3/4), function () {
            let incr = 10, loc = MENUS[currentMenu].contents[1].contents[6].contents[1].contents;
            if(AUTO_REPEAT_RATE < 20){incr = 1}
            AUTO_REPEAT_RATE += incr;
            loc[1].text = AUTO_REPEAT_RATE.toString() + " MS";
            if(AUTO_REPEAT_RATE <= 1){loc[0].fillColor = BUTTON_BACKGROUND; loc[0].selectColor = BUTTON_BACKGROUND}
            else{loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR}
          }, false),
        ])
      ]),

      new HBox(0, 0, button_width/5.5, [
        new Text(0, 0, button_width / 2, button_height/2, "DELAY TIME:", font_size*(3/4)),
        new HBox(0, 0, -button_width/6, [
          new Button(-button_width/12, 0, button_width/6, button_height/2, button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(DELAY_AUTO_SHIFT<=1)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(DELAY_AUTO_SHIFT<=1)?0:1], "-", font_size*(3/4), function () {
            let incr = 10, loc = MENUS[currentMenu].contents[1].contents[7].contents[1].contents;
            if(DELAY_AUTO_SHIFT < 20){incr = 1}
            DELAY_AUTO_SHIFT = Math.max(DELAY_AUTO_SHIFT-incr, 1);
            loc[1].text = DELAY_AUTO_SHIFT.toString() + " MS";
            if(DELAY_AUTO_SHIFT <= 1){loc[0].fillColor = BUTTON_BACKGROUND; loc[0].selectColor = BUTTON_BACKGROUND}
            else{loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR}
          }, false),
          new CenteredText(0, 0, button_width/2, button_height/2, DELAY_AUTO_SHIFT.toString() + " MS", font_size*(3/4)),
          new Button(button_width/12, 0, button_width/6, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "+", font_size*(3/4), function () {
            let incr = 10, loc = MENUS[currentMenu].contents[1].contents[7].contents[1].contents;
            if(DELAY_AUTO_SHIFT < 20){incr = 1}
            DELAY_AUTO_SHIFT += incr;
            loc[1].text = DELAY_AUTO_SHIFT.toString() + " MS";
            if(DELAY_AUTO_SHIFT <= 1){loc[0].fillColor = BUTTON_BACKGROUND; loc[0].selectColor = BUTTON_BACKGROUND}
            else{loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR}
          }, false),
        ])
      ]),
      
      new HBox(button_gap/2, 0, button_width/5.5, [
        new Button(0, 0, button_width/2, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "BACK", font_size*(3/4), function (obj) {
          currentMenu = "pause";
        }, true, BUTTON_BACKGROUND, border_gap),
        new Button(0, 0, button_width/2, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "RESET", font_size*(3/4), function (obj) {
          SCREEN_SHAKE = true, MUSIC = true, SOUND_EFFECTS = true, GHOST = true, AUTO_REPEAT_RATE = 25, DELAY_AUTO_SHIFT = 125;
          STYLE = DEFAULT_STYLE; loadStyle(STYLE);
          scaleMenus();
        }, true, BUTTON_BACKGROUND, border_gap),
      ]),
  
    ]),
  ]);

  MENUS.main = new Div((cw - settings_width)/2, ch/2-(5*button_gap+5*button_height)/2, [
    new Panel(0, 0, settings_width, 5*button_gap+5*button_height, panel_radius, "#3F3F3F", "#FFFFFF"),
    
    new VBox(button_gap/2, button_gap, button_gap, [
      new CenteredText(0, 0, settings_width, button_height/2, "GAME MODE", font_size),

      new HBox(0, 0, button_gap/2, [
        new Button(0, 0, button_width/3, button_height*(2/3), button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(GAMEMODE_NAMES.indexOf(GAMEMODE)==0)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(GAMEMODE_NAMES.indexOf(GAMEMODE)==0)?0:1], "<", font_size*(3/4), function () {
            GAMEMODE = GAMEMODE_NAMES[Math.max(GAMEMODE_NAMES.indexOf(GAMEMODE)-1, 0)];
            GAMERULES = {...GAME_MODES[GAMEMODE]};
            loadCookies();
            scaleMenus();
        }, false),
        new CenteredText(0, 0, button_width/2, button_height*(2/3), GAMEMODE.toUpperCase(), font_size*(3/4)),
        new Button(0, 0, button_width/3, button_height*(2/3), button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(GAMEMODE_NAMES.indexOf(GAMEMODE)>=GAMEMODE_NAMES.length-1)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(GAMEMODE_NAMES.indexOf(GAMEMODE)>=GAMEMODE_NAMES.length-1)?0:1], ">", font_size*(3/4), function () {
            GAMEMODE = GAMEMODE_NAMES[Math.min(GAMEMODE_NAMES.indexOf(GAMEMODE)+1, GAMEMODE_NAMES.length-1)];
            GAMERULES = {...GAME_MODES[GAMEMODE]};
            loadCookies();
            scaleMenus();
        }, false),
      ]),

      new Div(0,0,[]),
      new Div(0,0,[]),
      new Button((settings_width-button_width-button_gap)/2, button_gap, button_width, button_height, button_radius, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, "PLAY", font_size, function(obj) {
        inGame = true;
        init();
      }, true, BUTTON_BACKGROUND, border_gap),
    ]),
  ]);

//   Change menu options to reflect current gamemode
    if(GAMEMODE === "marathon"){
        MENUS.main.contents[1].contents[2] = new CenteredText(0, 0, settings_width, button_height/2, "STANDARD LEVELED GAME MODE.", font_size/2);
        MENUS.main.contents[1].contents[3] = new HBox(0, 0, button_width/5.5, [
            new Text(0, 0, button_width / 2, button_height/2, "LEVEL:", font_size*(3/4)),
            new HBox(0, 0, -button_width/6, [
                new Button(-button_width/12, 0, button_width/6, button_height/2, button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(gamestate.startLevel<=1)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(gamestate.startLevel<=1)?0:1], "<", font_size*(3/4), function () {
                    let loc = MENUS.main.contents[1].contents[3].contents[1].contents;
                    gamestate.startLevel = Math.max(gamestate.startLevel-1, 1);
                    gamestate.currentLevel = gamestate.startLevel;
                    gamestate.levelSpeed = LEVEL_SPEED_TABLE[gamestate.currentLevel];
                    loc[1].text = gamestate.startLevel.toString();
                    if(gamestate.startLevel <= 1){loc[0].fillColor = BUTTON_BACKGROUND; loc[0].selectColor = BUTTON_BACKGROUND;}
                }, false),
                new CenteredText(0, 0, button_width/2, button_height/2, gamestate.startLevel.toString(), font_size*(3/4)),
                new Button(button_width/12, 0, button_width/6, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, ">", font_size*(3/4), function () {
                    let loc = MENUS.main.contents[1].contents[3].contents[1].contents;
                    gamestate.startLevel += 1;
                    gamestate.currentLevel = gamestate.startLevel;
                    loc[1].text = gamestate.startLevel.toString();
                    loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR;
                }, false),
            ]),
        ]);
    }
    else if(GAMEMODE === "sprint"){
        MENUS.main.contents[1].contents[2] = new VBox(0, 0, font_size/6, [
            new CenteredText(0, 0, settings_width, button_height/2, "ENDS WHEN YOU CLEAR A", font_size/2),
            new CenteredText(0, 0, settings_width, button_height/2, "CERTAIN NUMBER OF LINES.", font_size/2),
        ]);
        MENUS.main.contents[1].contents[3] = new HBox(0, 0, button_width/5.5, [
            new Text(0, 0, button_width / 2, button_height/2, "LINES:", font_size*(3/4)),
            new HBox(0, 0, -button_width/6, [
              new Button(-button_width/12, 0, button_width/6, button_height/2, button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(GAMERULES.lineLimitValue<=1)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(GAMERULES.lineLimitValue<=1)?0:1], "<", font_size*(3/4), function () {
                let loc = MENUS.main.contents[1].contents[3].contents[1].contents;
                let incr = 10
                if(GAMERULES.lineLimitValue < 20) {incr = 1}
                GAMERULES.lineLimitValue = Math.max(GAMERULES.lineLimitValue-incr, 1);
                loc[1].text = GAMERULES.lineLimitValue.toString();
                if(GAMERULES.lineLimitValue <= 1){loc[0].fillColor = BUTTON_BACKGROUND; loc[0].selectColor = BUTTON_BACKGROUND;}
              }, false),
              new CenteredText(0, 0, button_width/2, button_height/2, GAMERULES.lineLimitValue.toString(), font_size*(3/4)),
              new Button(button_width/12, 0, button_width/6, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, ">", font_size*(3/4), function () {
                let loc = MENUS.main.contents[1].contents[3].contents[1].contents;
                let incr = 10
                if(GAMERULES.lineLimitValue < 10) {incr = 1}
                GAMERULES.lineLimitValue += incr;
                loc[1].text = GAMERULES.lineLimitValue.toString();
                loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR;
              }, false),
            ]),
        ]);
    }
    else if(GAMEMODE === "ultra"){
        MENUS.main.contents[1].contents[2] = new CenteredText(0, 0, settings_width, button_height/2, "PLAY UNDER A TIME LIMIT.", font_size/2);
        MENUS.main.contents[1].contents[3] = new HBox(0, 0, button_width/5.5, [
            new Text(0, 0, button_width / 2, button_height/2, "TIME:", font_size*(3/4)),
            new HBox(0, 0, -button_width/6, [
                new Button(-button_width/12, 0, button_width/6, button_height/2, button_radius/2, [BUTTON_BACKGROUND, MENU_BUTTON_COLOUR][(GAMERULES.countdownValue<=60000)?0:1], BUTTON_STROKE, [BUTTON_BACKGROUND, BUTTON_SELECT_COLOUR][(GAMERULES.countdownValue<=60000)?0:1], "<", font_size*(3/4), function () {
                  let loc = MENUS.main.contents[1].contents[3].contents[1].contents;
                  GAMERULES.countdownValue = Math.max(GAMERULES.countdownValue-60000, 60000);
                  loc[1].text = (GAMERULES.countdownValue/60000).toFixed() + " MIN";
                  if((GAMERULES.countdownValue/60000) <= 1){loc[0].fillColor = BUTTON_BACKGROUND; loc[0].selectColor = BUTTON_BACKGROUND;}
                }, false),
                new CenteredText(0, 0, button_width/2, button_height/2, (GAMERULES.countdownValue/60000).toFixed() + " MIN", font_size*(3/4)),
                new Button(button_width/12, 0, button_width/6, button_height/2, button_radius/2, MENU_BUTTON_COLOUR, BUTTON_STROKE, BUTTON_SELECT_COLOUR, ">", font_size*(3/4), function () {
                  let loc = MENUS.main.contents[1].contents[3].contents[1].contents;
                  GAMERULES.countdownValue += 60000;
                  loc[1].text = (GAMERULES.countdownValue/60000).toFixed() + " MIN";
                  loc[0].fillColor = MENU_BUTTON_COLOUR; loc[0].selectColor = BUTTON_SELECT_COLOUR;
                }, false),
            ]),
        ]);
    }
}