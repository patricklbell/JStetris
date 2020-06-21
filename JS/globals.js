'use strict';

var tileSheet = document.getElementById('tilesheet');
var fontSheet = document.getElementById('fontsheet');
var canvas = document.getElementById('canvas');
var fieldbg = document.getElementById('fieldbg');
var canvasbg = document.getElementById('canvasbg');
var ctx = canvas.getContext('2d');

// Time
var lastUpdate = Date.now(), now = lastUpdate, dt = 0, id, size;

// Key
var lockBuffer = 0, lockDelay = false, lockResets = 0;
var fallDelayBuffer = 0, lastHandledKeyBuffer = 0, shiftDelayBuffer = 0;
var keyPressed = 0, keyBuffer = []; 

var paused = true, inGame = false;

// Rewind buffer
var gamestate_buffer = [];

var SCREEN_SHAKE = true, MUSIC = true, SOUND_EFFECTS = true, GHOST = true, unpausing = false;
var AUTO_REPEAT_RATE = 25, DELAY_AUTO_SHIFT = 125, LOCK_DELAY = 500, MAX_LOCK_RESETS = 15;
const HEIGHT = 20, WIDTH = 10, BUFFER_HEIGHT = 4, LEVEL_LENGTH_LINES = 10;
const PREVIEWS = 5, SECOND_PREVIEW_SCALE_DOWN = 0.5, HOLD_RENDER_SCALE = 0.75;
const COUNTDOWN_FONT_SIZE = 1/20, PREVIEW_FONT_SIZE = 1/40, PREVEIW_FONT_GAP = 2/100, PREVIEW_SECTION_GAP = 2/100;
const REWIND_LENGTH = 10, BUFFER_REWIND = false, PREVIEW_WIDTH = 4.7;
const MENU_FONT_SIZE = 1/40, MENU_FONT_STYLE = 0, PANEL_RADIUS = 1/40;
const BUTTON_RADIUS = 1/40, BUTTON_HEIGHT = 1/15, BUTTON_WIDTH = 5/9, BUTTON_GAP = 1/20, BUTTON_DECORATION_GAP = 1/40;
const MENU_WIDTH = 2/3, SETTINGS_WIDTH = 3/4, HEADING_HEIGHT = 1/9;
const CHECK_OPTIONS = ["OFF", "ON"];
const MENU_BUTTON_COLOUR = "#313131", BUTTON_COLOUR = "#525252", BUTTON_SELECT_COLOUR = "#DDDDDDD1", BUTTON_STROKE = "#FFFFFF", PANEL_COLOUR = "#414141", BUTTON_BACKGROUND = "#202020";

var LEVEL_SPEED_TABLE = [1000.00, 793, 617.80, 472.73, 355.20, 262.00, 189.68, 134.73, 93.88, 64.15, 42.98, 28.22, 18.15, 11.44, 7.06, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2];
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
const PREVIEW_ALPHA = 0.5;
var LINE_CLEAR_NAMES = ["", "single", "double", "triple", "tetris"];

var AUDIO = {
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
    "cursor" : new Audio('./assets/audio/cursor.mp3'),
    "theme" : new Audio('./assets/audio/theme.mp3'),
}
AUDIO["theme"].loop = true;

var DEFAULT_STYLE = "Default";
var STYLE = DEFAULT_STYLE;
const STYLES = {
    "Retro" : {
        "blockskin" : "b9.png",
        "theme" : "theme_classic.mp3",
        "fieldbg" : "fieldbg.png",
        "font" : "font_bw.png",
    },
    "Default" : {
        "blockskin" : "b1.png",
        "theme" : "theme.mp3",
        "fieldbg" : "fieldbg.png",
        "font" : "font.png",
    },
    "Classic" : {
        "blockskin" : "b28.png",
        "theme" : "theme_classic.mp3",
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
const STYLE_NAMES = ["Default", "Classic", "Retro", "Plain", "Cute", "Interesting", "Glazed"];
const STYLE_NAMES_SHORT = ["DEF", "COLOR", "RETRO", "PLAIN", "CUTE", "INT", "GLAZE"]

const GAME_MODES = {
    "marathon" : {
        "levels" : true,
        "showLevel" : true,
        "timer" : true,
        "countdown" : false,
        "countdownValue" : 60000,
        "showLines" : false,
        "lineLimit" : false,
        "lineLimitValue" : 40,
        "score" : true,
        "scoreShow" : true,
        "results" : true,
        "resultsLevel" : true,
        "resultsTimer" : true,
        "resultsLines" : true,
        "resultsScore" : true,
        "resultsTPM" : true,
        "resultsLPM" : true,
    },
    "sprint" : {
        "levels" : false,
        "showLevel" : false,
        "timer" : true,
        "countdown" : false,
        "countdownValue" : 60000,
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
        "resultsTPM" : true,
        "resultsLPM" : true,
    },
    "ultra" : {
        "levels" : false,
        "showLevel" : false,
        "timer" : false,
        "countdown" : true,
        "countdownValue" : 60000,
        "showLines" : true,
        "lineLimit" : false,
        "lineLimitValue" : 40,
        "score" : true,
        "scoreShow" : true,
        "results" : true,
        "resultsLevel" : false,
        "resultsTimer" : false,
        "resultsLines" : true,
        "resultsScore" : true,
        "resultsTPM" : true,
        "resultsLPM" : true,
    },
}
// Default value
var GAMERULES = {...GAME_MODES["marathon"]};
var GAMEMODE = "marathon"
var GAMEMODE_NAMES = ["marathon", "sprint", "ultra"];

const SCORE_TABLE = {
    "" : 0,
    "b2b" : 0,
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
    "tetrisb2b" : 1200,
    "tspinminitetris" : 800,
    "tspinminitetrisb2b" : 1200,
    "tspinsingle" : 800,
    "tspindouble" : 1200,
    "tspintriple" : 1600,
    "tspintetris" : 1600,
    "tspinsingleb2b" : 1200,
    "tspindoubleb2b" : 1800,
    "tspintripleb2b" : 2400,
    "tspintetrisb2b" : 2400,
};


var DEFAULT_GAMESTATE = {
    "nextShape" : 0,
    "holding" : false,
    "held" : false,
    "switched" : false,
    "b2b" : false,
    "startLevel" : 1,
    "currentLevel" : 1,
    "levelSpeed" : LEVEL_SPEED_TABLE[0], 
    "score" : 0,
    "player" : undefined,
    "board" : undefined,
    "pieceGenerator" : undefined,
    "playTimer" : undefined,
};
var gamestate = {...DEFAULT_GAMESTATE};

var MENUS = {
    "pause" : undefined,
    "main" : undefined,
    "settings" : undefined,
    "results" : undefined,
}
var currentMenu = "main";
var mouseX, mouseY, clicked;