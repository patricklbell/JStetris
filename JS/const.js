var canvas = document.getElementById('canvas');
var fieldbg = document.getElementById('canvasbg');
var previewCanvas = document.getElementById('previewCanvas');
var unpause_interval;

var tileSheet = document.getElementById('tilesheet');
var fontSheet = document.getElementById('fontsheet');

var gameover = document.getElementById('gameover');
var message = document.getElementById('message');

var game_mode_select = document.getElementById('game-mode-select');
var game_mode_menus = document.getElementById('game-mode-menus')

var time_dom_ultra = document.getElementById('ultra-time');
var level_dom_marathon = document.getElementById('marathon-level');
var lines_dom_sprint = document.getElementById('sprint-lines');

var settings_submit = document.getElementById('settings-submit');
var setting_icon = document.getElementById('setting-icon');
var settings = document.getElementById('settings');
var results = document.getElementById('results');
var results_content = document.getElementById('results-content');

var lock_delay_input = document.getElementById('lock-delay');
var max_lock_resets_input = document.getElementById('max-lock-resets');
var auto_repeat_delay_input = document.getElementById('auto-repeat-delay');
var delay_auto_shift_input = document.getElementById('delay-auto-shift');
var music_input = document.getElementById('music');
var sound_effects_input = document.getElementById('sound-effects');
var screen_shake_input = document.getElementById('screen-shake');
var ghost_piece_input = document.getElementById('ghost-piece');

setting_icon.onclick = function (){
    settings.style.display = "block";
    changingPause = false;
    inGame = false;
    pause(ctx);
}
var restart_icon = document.getElementById('restart-icon');
restart_icon.onclick = function (){
    endGame();
}

var ctx = canvas.getContext('2d');
var previewCtx = previewCanvas.getContext('2d');
var HEIGHT = 20, WIDTH = 10, GHOST = true, LOCK_DELAY = 500, MAX_LOCK_RESETS = 15;
var PREVIEWS = 6, SECOND_PREVIEW_SCALE_DOWN = 0.5, HOLD_RENDER_SCALE = 0.75;
var AUTO_REPEAT_RATE = 25, DELAY_AUTO_SHIFT = 125, LEVEL_LENGTH_LINES = 10;
var COUNTDOWN_FONT_SIZE = 35, PREVIEW_FONT_SIZE = 1/40, PREVEIW_FONT_GAP = 2/100, PREVIEW_SECTION_GAP = 2/100;
var SCREEN_SHAKE = true, MUSIC = true, SOUND_EFFECTS = true;

var LEVEL_SPEED_TABLE = [1000.00, 793, 617.80, 472.73, 355.20, 262.00, 189.68, 134.73, 93.88, 64.15, 42.98, 28.22, 18.15, 11.44, 7.06, 
    5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2];
const SHAPES = [
  // size of bounding square, positions * num of blocks
  [3, [0, 1], [1, 1], [2, 1], [3, 1]],
  [2, [0, 0], [0, 1], [1, 1], [2, 1]],
  [2, [0, 1], [1, 1], [2, 1], [2, 0]],
  [1, [0, 0], [1, 0], [0, 1], [1, 1]],
  [2, [1, 0], [2, 0], [1, 1], [0, 1]],
  [2, [1, 0], [1, 1], [0, 1], [2, 1]],
  [2, [0, 0], [1, 0], [1, 1], [2, 1]],
];
const IWALLKICKS_R = [
  [[ 0, 0],     [-2, 0],    [1,  0],    [-2,-1],    [ 1, 2]],
  [[ 0, 0],     [-1, 0], 	[+2, 0], 	[-1,+2], 	[+2,-1]],
  [[ 0, 0],     [+2, 0], 	[-1, 0], 	[+2,+1], 	[-1,-2]],
  [[ 0, 0],     [+1, 0], 	[-2, 0], 	[+1,-2], 	[-2,+1]],
];
var WALLKICKS_R = [
  [[ 0, 0],    [-1, 0],     [-1, 1],    [ 0,-2],    [-1,-2]],
  [[ 0, 0],    [ 1, 0], 	[ 1,-1], 	[ 0, 2], 	[ 1, 2]],
  [[ 0, 0],    [+1, 0], 	[+1,+1], 	[ 0,-2], 	[+1,-2]],
  [[ 0, 0],    [-1, 0], 	[-1,-1], 	[ 0,+2], 	[-1,+2]],
];
const IWALLKICKS_L = [
    [[ 0, 0], 	[-1, 0], 	[+2, 0], 	[-1,+2], 	[+2,-1]],
    [[ 0, 0], 	[+2, 0], 	[-1, 0], 	[+2,+1], 	[-1,-2]],
    [[ 0, 0], 	[+1, 0], 	[-2, 0], 	[+1,-2], 	[-2,+1]],
    [[ 0, 0], 	[-2, 0], 	[+1, 0], 	[-2,-1], 	[+1,+2]],
];
const WALLKICKS_L = [
    [[ 0, 0], 	[+1, 0], 	[+1,+1], 	[ 0,-2], 	[+1,-2]],
    [[ 0, 0], 	[+1, 0], 	[+1,-1], 	[ 0,+2], 	[+1,+2]],
    [[ 0, 0], 	[-1, 0], 	[-1,+1], 	[ 0,-2], 	[-1,-2]],
    [[ 0, 0], 	[-1, 0], 	[-1,-1], 	[ 0,+2], 	[-1,+2]],
];
const SPAWN_TABLE = [
    [Math.floor(WIDTH / 2) - 2, -2],
    [Math.floor(WIDTH / 2) - 2, -2], 
    [Math.floor(WIDTH / 2) - 2, -2], 
    [Math.floor(WIDTH / 2) - 1, -2],
    [Math.floor(WIDTH / 2) - 2, -2],
    [Math.floor(WIDTH / 2) - 2, -2],
    [Math.floor(WIDTH / 2) - 2, -2],
];
const NAMES = ["I", "J", "L", "O", "S", "T", "Z"];
var COLORS = ["#FF0000FF", "#000000FF",  "#FF00FFFF", "#0000FFFF", "#00FF00FF", "#FFFF00FF", "#00FFFFFF"];
const PREVIEW_ALPHA = 0.7;
let LINE_CLEAR_NAMES = ["", "single", "double", "triple", "tetris"];

AUDIO = {
    "b2b" : new Audio('./assets/audio/b2b_continue.mp3'),
    "countdown" : new Audio('./assets/audio/countdown.mp3'),
    "died" : new Audio('./assets/audio/died.mp3'),
    "erase1" : new Audio('./assets/audio/erase1.mp3'),
    "erase2" : new Audio('./assets/audio/erase2.mp3'),
    "erase3" : new Audio('./assets/audio/erase3.mp3'),
    "erase4" : new Audio('./assets/audio/erase4.mp3'),
    "gameover" : new Audio('./assets/audio/gameover.mp3'),
    "gradeup" : new Audio('./assets/audio/gradeup.mp3'),
    "levelup" : new Audio('./assets/audio/levelup.mp3'),
    "harddrop" : new Audio('./assets/audio/harddrop.mp3'),
    "hold" : new Audio('./assets/audio/hold.mp3'),
    "holdfail" : new Audio('./assets/audio/holdfail.mp3'),
    "matchend" : new Audio('./assets/audio/matchend.mp3'),
    "move" : new Audio('./assets/audio/move.mp3'),
    "pause" : new Audio('./assets/audio/pause.mp3'),
    "rotate" : new Audio('./assets/audio/rotate.mp3'),
    "ready" : new Audio('./assets/audio/ready.mp3'),
    "rotfail" : new Audio('./assets/audio/rotfail.mp3'),
    "softdrop" : new Audio('./assets/audio/softdrop.mp3'),
    "theme" : new Audio('./assets/audio/theme.mp3'),
}
AUDIO["theme"].loop = true;

DEFAULT_STYLE = "Default";
const STYLES = {
    "Retro" : {
        "blockskin" : "b9.png",
        "theme" : "theme_classic.mp3",
        "fieldbg" : "fieldbg.png",
        "font" : "font.png",
    },
    "Default" : {
        "blockskin" : "b1.png",
        "theme" : "theme.mp3",
        "fieldbg" : "fieldbg.png",
        "font" : "font.png",
    },
    "Classic" : {
        "blockskin" : "b28.png",
        "theme" : "theme.mp3",
        "fieldbg" : "fieldbg.png",
        "font" : "font.png",
    },
    "Plain" : {
        "blockskin" : "b14.png",
        "theme" : "theme.mp3",
        "fieldbg" : "fieldbg.png",
        "font" : "font.png",
    },
    "Cute" : {
        "blockskin" : "b8.png",
        "theme" : "theme_classic.mp3",
        "fieldbg" : "fieldbg2.png",
        "font" : "font.png",
    },
    "Interesting" : {
        "blockskin" : "b25.png",
        "theme" : "theme.mp3",
        "fieldbg" : "fieldbg.png",
        "font" : "font.png",
    },
    "Glazed" : {
        "blockskin" : "b22.png",
        "theme" : "theme_classic.mp3",
        "fieldbg" : "fieldbg2.png",
        "font" : "font.png",
    },
};

var style_select = document.getElementById("style-select")
setupStyle = function() {
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

const GAME_MODES = {
    "marathon" : {
        "levels" : true,
        "showLevel" : true,
        "timer" : true,
        "countdown" : false,
        "countdownValue" : 0,
        "showLines" : false,
        "lineLimit" : false,
        "lineLimitValue" : 0,
        "score" : true,
        "scoreShow" : true,
        "results" : true,
        "resultsLevel" : true,
        "resultsTimer" : true,
        "resultsLines" : true,
        "resultsScore" : true,
    },
    "sprint" : {
        "levels" : false,
        "showLevel" : false,
        "timer" : true,
        "countdown" : false,
        "countdownValue" : 0,
        "showLines" : true,
        "lineLimit" : true,
        "lineLimitValue" : 40,
        "score" : false,
        "scoreShow" : false,
        "results" : true,
        "resultsLevel" : false,
        "resultsTimer" : true,
        "resultsLines" : false,
        "resultsScore" : true,
    },
    "ultra" : {
        "levels" : false,
        "showLevel" : false,
        "timer" : false,
        "countdown" : true,
        "countdownValue" : 1000,
        "showLines" : true,
        "lineLimit" : false,
        "lineLimitValue" : 0,
        "score" : true,
        "scoreShow" : true,
        "results" : true,
        "resultsLevel" : false,
        "resultsTimer" : false,
        "resultsLines" : true,
        "resultsScore" : true,
    },
}
// Default value
var GAMERULES = {...GAME_MODES["marathon"]};

const SCORE_TABLE = {
    "" : 0,
    "hardrop" : 2,
    "softdrop" : 1,
    "single" : 100,
    "singleb2b" : 100,
    "tspinmini" : 100,
    "tspinminisingle" : 200,
    "tspinminisingleb2b" : 200,
    "double" : 300,
    "doubleb2b" : 300,
    "tspinminidouble" : 300,
    "tspinminidoubleb2b" : 300,
    "tspin" : 400,
    "triple" : 500,
    "tripleb2b" : 500,
    "tspinminitriple" : 500,
    "tspinminitripleb2b" : 500,
    "tetris" : 800,
    "tspinminitetris" : 800,
    "tspinsingle" : 800,
    "tspinsingleb2b" : 1200,
    "tetrisb2b" : 1200,
    "tspinminitetrisb2b" : 1200,
    "tspindouble" : 1200,
    "tspintriple" : 1600,
    "tspindoubleb2b" : 1800,
    "tspintripleb2b" : 2400
};