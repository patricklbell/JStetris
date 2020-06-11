
  'use strict';
  class Board {
    constructor () {
      this.array = Array(HEIGHT * WIDTH);
      this.array.fill(false)
      this.linesCleared = 0;
      this.tetriminoes = 0;
    }
    render (ctx) {
      for (var i = 0; i < this.array.length; i++) {
        if (!(this.array[i] === false)) {
          ctx.drawTile(i % WIDTH * size, Math.floor(i / WIDTH) * size, this.array[i] - 1);
        } 
      }
    }
    set (x, y, type) {
      this.array[(y * WIDTH) + x] = type + 1;
    }
    delete (x, y) {
      this.array[(y * WIDTH) + x] = false;
    }
    testLine(y){
      for (var i = WIDTH*(HEIGHT - y); i > (HEIGHT - (y + 1))*WIDTH; i--){
        if(this.array[i-1] === false){
          return 0;
        }
      }
      return 1;
    }
    removeLine(y){
      var temp = Array(WIDTH)
      temp.fill(false)
      this.array = temp.concat( this.array.slice( 0, (HEIGHT - (y+1))*WIDTH)).concat(this.array.slice((HEIGHT - y)*WIDTH, WIDTH*HEIGHT) );
      this.linesCleared++;
    }
    fixFilledLines(){
      let flag = 0;
        for (let i = 0; i < HEIGHT; i++) {
            if (this.testLine(i)){
                this.removeLine(i);
                flag++;
                i--;
            }
        }
      return flag;
    }
  }
  