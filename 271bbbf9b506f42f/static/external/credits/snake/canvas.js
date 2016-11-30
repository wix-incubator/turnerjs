function Board(context) {
    this.ctx = context;
}

(function () {

    function drawImage(img, row, col, highlight) {
        var cellSize = CANVAS_INFO.cellSize;
        this.ctx.drawImage(img, row * cellSize - cellSize + 1, col * cellSize - cellSize + 1, cellSize - 2, cellSize - 2);

        this.ctx.beginPath();
        this.ctx.rect(row * cellSize - cellSize + 1, col * cellSize - cellSize + 1, cellSize - 2, cellSize - 2);
        this.ctx.arc(row * cellSize - cellSize * 0.5, col * cellSize - cellSize * 0.5, cellSize / 2 - 1, 0, 2 * Math.PI, true);
        this.ctx.fillStyle = "white";
        this.ctx.fill();

        if (highlight) {
            this.ctx.beginPath();
            this.ctx.arc(row * cellSize - cellSize * 0.5, col * cellSize - cellSize * 0.5, cellSize / 2 - 1, 0, 2 * Math.PI);
            this.ctx.strokeStyle = "red";
            this.ctx.lineWidth = 5;
            this.ctx.stroke();
        }
    }

    function drawSnakePart(snakePart, index) {
        drawImage.call(this, snakePart.img, snakePart.r, snakePart.c);
    }

    function drawFood() {
        drawImage.call(this, food.img, food.r, food.c, true);
    }

    function drawGrid() {
        var i;
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'grey';
        this.ctx.lineWidth = 1;
        for (i = 1; i < CANVAS_INFO.cols; i++) {
            this.ctx.moveTo(0, i * CANVAS_INFO.cellSize);
            this.ctx.lineTo(CANVAS_INFO.w, i * CANVAS_INFO.cellSize);
        }
        for (i = 1; i < CANVAS_INFO.rows; i++) {
            this.ctx.moveTo(i * CANVAS_INFO.cellSize, 0);
            this.ctx.lineTo(i * CANVAS_INFO.cellSize, CANVAS_INFO.h);
        }
        this.ctx.stroke();
    }

    function clear () {
        this.ctx.clearRect(0, 0, CANVAS_INFO.w, CANVAS_INFO.h);
        drawGrid.call(this);
        drawFood.call(this);
    }

    Board.prototype = {
        drawSnake: function (snake) {
            clear.call(this);
            snake.getSnakeParts().forEach(drawSnakePart.bind(this));
        }
    };

})();