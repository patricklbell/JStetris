'use strict';
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
var style_select = document.getElementById("style-select")