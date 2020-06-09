
class Player {
    constructor (choice) {
      this.type = choice;
      this.name = NAMES[choice];
      this.rot = 0;
      this.rot_chn = 0;
      this.piece = SHAPES[choice];
      this.piece_chn = this.piece.slice();
      this.pos = SPAWN_TABLE[choice];
      this.pos_chn = this.pos.slice();
      this.lastAction = "";
      switched = false;
    }
    render (ctx, sqr) {
      if(GHOST){
        this.drop(sqr);
        ctx.globalAlpha = PREVIEW_ALPHA;
        for (var i = 1; i < this.piece_chn.length; i++) {
          ctx.drawTile((this.piece_chn[i][0] + this.pos_chn[0]) * size, (this.piece_chn[i][1] + this.pos_chn[1]) * size, this.type);
        }
        ctx.globalAlpha = 1;

        this.unapply();
      }

      for (var i = 1; i < this.piece.length; i++) {
        ctx.drawTile((this.piece[i][0] + this.pos[0]) * size, (this.piece[i][1] + this.pos[1]) * size, this.type);      
      }
    }
    move (x, y) {
      this.pos_chn = [this.pos[0] + x, this.pos[1] + y];
    }
    testCollision (squares) {
      for (var i = 1; i < this.piece_chn.length; i++) {
        var x = this.piece_chn[i][0] + this.pos_chn[0];
        var y = this.piece_chn[i][1] + this.pos_chn[1];
        if (x >= WIDTH || x < 0) {
        // x boundary
          return true;
        } else if (y >= HEIGHT) {
        // y boundary, ignores top boundary
          return true;
        } else {
          // test collision with other objects
          for (var j = 0; j < sqr.array.length; j++) {
            if (!squares.array[j] === false) {
              if ((j % WIDTH === x) && (Math.floor(j / WIDTH) === y)) {
                return true;
              }
            }
          }
        }
      }
      return false;
    }
    delete (squares) {
      var flag = true;
      for (var i = 1; i < this.piece.length; i++) {
        if(this.piece[i][1] + this.pos[1] >= 0){
          flag = false;
        }
        squares.set(this.piece[i][0] + this.pos[0], this.piece[i][1] + this.pos[1], this.type);
      }
      // Tests whether any blocks were inside play, locked out
      return flag;
    }
    apply () {
      this.piece = this.piece_chn.slice();
      this.pos = this.pos_chn.slice();
      this.rot = this.rot_chn;
      
      if (lockDelay && lockResets <= MAX_LOCK_RESETS){
        lockBuffer = 0;
        lockResets++;
      }
    }
    unapply () {
      this.piece_chn = this.piece.slice();
      this.pos_chn = this.pos.slice();
      this.rot_chn = this.rot;
    }
    rotateClock () {
      // translate coordinates in relation to rotation point
      var pivot = this.piece[0] / 2;
  
      for (var i = 1; i < this.piece_chn.length; i++) {
        var xBrickCenter = this.piece[i][0] - pivot;
        var yBrickCenter = this.piece[i][1] - pivot;
        this.piece_chn[i] = [-yBrickCenter + pivot, xBrickCenter + pivot];
      }
      this.rot_chn = (this.rot + 1) % 4
    }
    rotateAntiClock () {
      // translate coordinates in relation to rotation point
      var pivot = this.piece[0] / 2;
  
      for (var i = 1; i < this.piece_chn.length; i++) {
        var xBrickCenter = this.piece[i][0] - pivot;
        var yBrickCenter = this.piece[i][1] - pivot;
        this.piece_chn[i] = [yBrickCenter + pivot, -xBrickCenter + pivot];
      }
      this.rot_chn = (this.rot + 3) % 4
    }
    drop (sqr){
      for (let i = 0; i < (HEIGHT - player.pos[1]); i++) {
        this.move(0, i);
        if (this.testCollision(sqr) === true) {
          this.move(0, i-1);
          return i-1;
        }
      }
      return 0;
    }
    testKicksClockwise (sqr){
      var kicks;
      if(this.name == "I"){
        kicks = IWALLKICKS_R[this.rot]
      } else if (this.name != "O") {
        kicks = WALLKICKS_R[this.rot]
      } else {
        return false;
      }

      for (let i = 0; i < kicks.length; i++) {
        this.rotateClock();
        this.move(kicks[i][0], kicks[i][1]);
        if (this.testCollision(sqr) === false) {
          return true;
        }
      }
      this.unapply();
      return false;
    }
    testKicksAntiClockwise (sqr){
      var kicks;
      if(this.name == "I"){
        kicks = IWALLKICKS_L[this.rot]
      } else if (this.name != "O") {
        kicks = WALLKICKS_L[this.rot]
      } else {
        return false;
      }

      for (let i = 0; i < kicks.length; i++) {
        this.rotateAntiClock();
        this.move(kicks[i][0], kicks[i][1]);
        if (this.testCollision(sqr) === false) {
          return true;
        }
      }
      this.unapply();
      return false;
    }
  }
  
