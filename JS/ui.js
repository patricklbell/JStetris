class Button {
    /**
     * Constructs a button object which is rendered with this.render()
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} [radius = 5] The corner radius; It can also be an object 
     *                 to specify different radii for corners
     * @param {Number} [radius.tl = 0] Top left
     * @param {Number} [radius.tr = 0] Top right
     * @param {Number} [radius.br = 0] Bottom right
     * @param {Number} [radius.bl = 0] Bottom left
     * @param {String} [fillColor = "#000000"] Color to fill the rectangle
     * @param {String} [strokeColor = "#000000"] Color to outline rectangle
     * @param {String} [selectColor = "#00FF00"] Color to fill when selected
     * @param {String} [text = ""] Text inside button
     * @param {Number} [fontSize = 10] Text font size
     * @param {Function} [function = {}] Function to called by this.onClick()
     * @param {Boolean} [borderGap = 0] Whether to draw gap decoration
     * @param {String} [behindColor = "#000000"] Color to fill behind border gap
     * @param {Number} [borderGap = 0] Color to fill behind border gap
     */
    constructor(x, y, width, height, radius = 5, fillColor = "#000000", strokeColor = "#000000", selectColor = "#00FF00", text = "", fontSize = 10, onclick = function () {}, gap = false, behindColor = "#000000", borderGap = 0) {
        this.hide = false;
        if (typeof radius === 'number') {
            this.r = {
                tl: radius,
                tr: radius,
                br: radius,
                bl: radius
            };
        } else {
            radius = {};
            let defaultRadius = {
                tl: 0,
                tr: 0,
                br: 0,
                bl: 0
            };
            for (var side in defaultRadius) {
                this.r[side] = radius[side] || defaultRadius[side];
            }
        }
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.selectColor = selectColor;
        this.behindColor = behindColor;
        this.text = text;
        this.onclick = onclick;
        this.fontSize = fontSize;
        this.gap = gap;
        this.borderGap = borderGap;
    }
    render(ctx, relX, relY, selected) {
        if (this.hide === false) {
            ctx.lineWidth = 0.5;
            if (this.gap) {
                let gapX = this.x + relX - this.borderGap / 2;
                let gapY = this.y + relY - this.borderGap / 2;
                ctx.beginPath();
                ctx.moveTo(gapX + (this.r.tl + this.borderGap / 2), gapY);
                ctx.lineTo(gapX + this.w + this.borderGap - (this.r.tr + this.borderGap / 2), gapY);
                ctx.quadraticCurveTo(gapX + this.w + this.borderGap, gapY, gapX + this.w + this.borderGap, gapY + (this.r.tr + this.borderGap / 2));
                ctx.lineTo(gapX + this.w + this.borderGap, gapY + this.h + this.borderGap - (this.r.br + this.borderGap / 2));
                ctx.quadraticCurveTo(gapX + this.w + this.borderGap, gapY + this.h + this.borderGap, gapX + this.w + this.borderGap - (this.r.br + this.borderGap / 2), gapY + this.h + this.borderGap);
                ctx.lineTo(gapX + (this.r.bl + this.borderGap / 2), gapY + this.h + this.borderGap);
                ctx.quadraticCurveTo(gapX, gapY + this.h + this.borderGap, gapX, gapY + this.h + this.borderGap - (this.r.bl + this.borderGap / 2));
                ctx.lineTo(gapX, gapY + (this.r.tl + this.borderGap / 2));
                ctx.quadraticCurveTo(gapX, gapY, gapX + (this.r.tl + this.borderGap / 2), gapY);
                ctx.closePath();
                ctx.fillStyle = this.behindColor;
                ctx.fill();
                ctx.strokeStyle = this.strokeColor;
                ctx.stroke();
            }

            let trueX = this.x + relX;
            let trueY = this.y + relY;
            ctx.beginPath();
            ctx.moveTo(trueX + this.r.tl, trueY);
            ctx.lineTo(trueX + this.w - this.r.tr, trueY);
            ctx.quadraticCurveTo(trueX + this.w, trueY, trueX + this.w, trueY + this.r.tr);
            ctx.lineTo(trueX + this.w, trueY + this.h - this.r.br);
            ctx.quadraticCurveTo(trueX + this.w, trueY + this.h, trueX + this.w - this.r.br, trueY + this.h);
            ctx.lineTo(trueX + this.r.bl, trueY + this.h);
            ctx.quadraticCurveTo(trueX, trueY + this.h, trueX, trueY + this.h - this.r.bl);
            ctx.lineTo(trueX, trueY + this.r.tl);
            ctx.quadraticCurveTo(trueX, trueY, trueX + this.r.tl, trueY);
            ctx.closePath();

            if (selected) {
                ctx.fillStyle = this.selectColor;
            } else {
                ctx.fillStyle = this.fillColor
            }
            ctx.fill();
            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();

            ctx.drawText(this.text, trueX + this.w / 2 - this.fontSize * this.text.length / 2, trueY + this.h / 2 - this.fontSize / 2, MENU_FONT_STYLE, this.fontSize);

            if (selected && clicked && this.onclick !== undefined) {
                this.onClick();
            }
        }
    }
    isInside(x, y, relX = 0, relY = 0) {
        return x > this.x + relX && x < this.x + relX + this.w && y < this.y + relY + this.h && y > this.y + relY;
    }
    onClick() {
        this.onclick(this);
    }
}

class Panel {
    /**
     * Constructs a panel object which is rendered with this.render()
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} [radius = 5] The corner radius; It can also be an object 
     *                 to specify different radii for corners
     * @param {Number} [radius.tl = 0] Top left
     * @param {Number} [radius.tr = 0] Top right
     * @param {Number} [radius.br = 0] Bottom right
     * @param {Number} [radius.bl = 0] Bottom left
     * @param {String} [fillColor = "#000000"] Color to fill the rectangle
     * @param {String} [strokeColor = "#000000"] Color to outline rectangle
     */
    constructor(x, y, width, height, radius = 5, fillColor = "#000000", strokeColor = "#000000") {
        this.hide = false;
        if (typeof radius === 'number') {
            this.r = {
                tl: radius,
                tr: radius,
                br: radius,
                bl: radius
            };
        } else {
            radius = {};
            let defaultRadius = {
                tl: 0,
                tr: 0,
                br: 0,
                bl: 0
            };
            for (var side in defaultRadius) {
                this.r[side] = radius[side] || defaultRadius[side];
            }
        }
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
    }
    render(ctx, relX, relY, selected) {
        if (this.hide === false) {
            let trueX = this.x + relX;
            let trueY = this.y + relY;
            ctx.beginPath();
            ctx.moveTo(trueX + this.r.tl, trueY);
            ctx.lineTo(trueX + this.w - this.r.tr, trueY);
            ctx.quadraticCurveTo(trueX + this.w, trueY, trueX + this.w, trueY + this.r.tr);
            ctx.lineTo(trueX + this.w, trueY + this.h - this.r.br);
            ctx.quadraticCurveTo(trueX + this.w, trueY + this.h, trueX + this.w - this.r.br, trueY + this.h);
            ctx.lineTo(trueX + this.r.bl, trueY + this.h);
            ctx.quadraticCurveTo(trueX, trueY + this.h, trueX, trueY + this.h - this.r.bl);
            ctx.lineTo(trueX, trueY + this.r.tl);
            ctx.quadraticCurveTo(trueX, trueY, trueX + this.r.tl, trueY);
            ctx.closePath();

            ctx.fillStyle = this.fillColor
            ctx.fill();
            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
        }
    }
}

class CenteredText {
    /**
     * Constructs a panel object which is rendered with this.render()
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {String} text The text to display
     */
    constructor(x, y, width, height, text = "", fontSize = 10) {
        this.hide = false;
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.text = text;
        this.fontSize = fontSize;
    }
    render(ctx, relX, relY, selected) {
        if (this.hide === false) {
            ctx.drawText(this.text, relX + this.x + this.w / 2 - this.fontSize * this.text.length / 2, relY + this.y + this.h / 2 - this.fontSize / 2, MENU_FONT_STYLE, this.fontSize);
        }
    }
}

class Text {
    /**
     * Constructs a panel object which is rendered with this.render()
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {String} text The text to display
     */
    constructor(x, y, width, height, text = "", fontSize = 10) {
        this.hide = false;
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
        this.text = text;
        this.fontSize = fontSize;
    }
    render(ctx, relX, relY, selected) {
        if (this.hide === false) {
            ctx.drawText(this.text, relX + this.x, relY + this.y, MENU_FONT_STYLE, this.fontSize);
        }
    }
}

class Div {
    /**
     * Constructs a panel object which is rendered with this.render()
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Array} contents List of elements within div
     */
    constructor(x, y, contents) {
        this.hide = false;
        this.x = x;
        this.y = y;
        this.contents = contents;

        this.w = 0;
        this.h = 0;
        for (var key of Object.keys(this.contents)) {
            let e = this.contents[key];
            if(e.hide === false){
                this.w += e.w;
                this.h += e.h;
            }
        }
    }
    render(ctx, relX, relY) {
        if (this.hide === false) {
            let trueX = relX + this.x;
            let trueY = relY + this.y;
            for (var key of Object.keys(this.contents)) {
                let e = this.contents[key];
                if(e.hide === false){
                    if (e.constructor.name === "Button") {
                        this.hide = false;
                        e.render(ctx, trueX, trueY, e.isInside(mouseX, mouseY, trueX, trueY));
                    } else {
                        e.render(ctx, trueX, trueY);
                    }
                }
            }
        }
    }
}

class VBox {
    /**
     * Constructs equally vertically spaced list from contents, render with this.render()
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} seperator Vertical space between elements
     * @param {Array} contents List of elements within div
     */
    constructor(x, y, sep = 0, contents) {
        this.hide = false;
        this.x = x;
        this.y = y;
        this.sep = sep;
        this.contents = contents;

        this.w = 0;
        this.h = 0;
        for (var key of Object.keys(this.contents)) {
            let e = this.contents[key];
            if(e.hide === false){
                if (this.w < e.w) {
                    this.w = e.w
                };
                this.h += e.h;
            }
        }
    }
    render(ctx, relX, relY, selected) {
        if (this.hide === false) {
            let yOffset = 0;
            let trueX = relX + this.x;
            let trueY = relY + this.y;
            for (var key of Object.keys(this.contents)) {
                let e = this.contents[key];
                if(e.hide === false){
                    if (e.constructor.name === "Button") {
                        this.hide = false;
                        e.render(ctx, trueX, trueY + yOffset, e.isInside(mouseX, mouseY, trueX, trueY + yOffset));
                    } else {
                        e.render(ctx, trueX, trueY + yOffset);
                    }
                    yOffset += e.h + this.sep;
                }
            }
        }
    }
}

class HBox {
    /**
     * Constructs equally horizontally spaced list from contents, render with this.render()
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} seperator Horizontal space between elements
     * @param {Array} contents List of elements within div
     */
    constructor(x, y, sep = 0, contents) {
        this.hide = false;
        this.x = x;
        this.y = y;
        this.sep = sep
        this.contents = contents;

        this.w = 0;
        this.h = 0;
        for (var key of Object.keys(this.contents)) {
            let e = this.contents[key];
            if(e.hide === false){
                if (this.h < e.h) {
                    this.h = e.h
                };
                this.w += e.w;
            }
        }
    }
    render(ctx, relX, relY, selected) {
        if (this.hide === false) {
            let trueX = relX + this.x;
            let trueY = relY + this.y;
            let xOffset = 0;
            for (var key of Object.keys(this.contents)) {
                let e = this.contents[key];
                if(e.hide === false){
                    if (e.constructor.name === "Button") {
                        this.hide = false;
                        e.render(ctx, trueX + xOffset, trueY, e.isInside(mouseX, mouseY, trueX + xOffset, trueY));
                    } else {
                        e.render(ctx, trueX + xOffset, trueY);
                    }
                    xOffset += e.w + this.sep;
                }
            }
        }
    }
}