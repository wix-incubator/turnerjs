function Snake(resetHandler, messageHandler) {
    this.reset();
    this.resetHandler = resetHandler;
    this.messageHandler = messageHandler;
}

(function () {

    function getNextSnakePart(coord, direction) {
        var nextCoord = {};
        nextCoord[coord] = this.snakeParts[0][coord] + (direction ? 1 : -1);
        return _.assign(_.clone(this.snakeParts[0]), nextCoord, {img: null});
    }

    function isColliding(coordinates, ignoreFirst) {
        return !_.every(this.snakeParts, function (snakePart, i) {
            return (ignoreFirst && i === 0) || coordinates.r !== snakePart.r || coordinates.c !== snakePart.c;
        });
    }

    function isEating(snakePart) {
        return food.r === snakePart.r && food.c === snakePart.c;
    }

    function setRandomFood() {
        food = {
            r: _.random(1, CANVAS_INFO.rows),
            c: _.random(1, CANVAS_INFO.cols),
            img: IMAGE_NODES[_.random(0, IMAGE_NODES.length - 1)]
        };

        if (isColliding.call(this, food)) {
            setRandomFood.call(this);
        }
    }

    function isMoveAllowed(nextSnakePart) {
        if (nextSnakePart.r < 1 || nextSnakePart.r > CANVAS_INFO.rows) {
            return false;
        }

        if (nextSnakePart.c < 1 || nextSnakePart.c > CANVAS_INFO.cols) {
            return false
        }

        return !isColliding.call(this, nextSnakePart, true);
    }

    function moveSnake(coord, direction) {
        var nextSnakePart = getNextSnakePart.call(this, coord, direction);
        var isEatingResult = isEating.call(this, nextSnakePart);

        if (!isMoveAllowed.call(this, nextSnakePart)) {
            this.resetHandler();
            this.messageHandler('Oh snap :(', 'show');
            return;
        }

        if (isEatingResult) {
            this.snakeParts.push(_.last(this.snakeParts));
            this.images.push(food.img);
            this.messageHandler(food.img.getAttribute('data-name'), 'show');
        }

        this.snakeParts = [nextSnakePart].concat(this.snakeParts.slice(0, this.snakeParts.length - 1));

        if (isEatingResult) {
            setRandomFood.call(this);
        }
    }

    Snake.prototype = {
        reset: function () {
            this.snakeParts = [
                {r: 5, c: 3},
                {r: 5, c: 4},
                {r: 5, c: 5},
            ];
            this.images = [
                IMAGE_NODES[_.random(0, IMAGE_NODES.length - 1)],
                IMAGE_NODES[_.random(0, IMAGE_NODES.length - 1)],
                IMAGE_NODES[_.random(0, IMAGE_NODES.length - 1)]
            ];
        },
        moveForward: function (nextMoveKey) {
            switch (nextMoveKey) {
                case DIRECTIONS.LEFT:
                    moveSnake.call(this, 'r', false);
                    break;
                case DIRECTIONS.UP:
                    moveSnake.call(this, 'c', false);
                    break;
                case DIRECTIONS.RIGHT:
                    moveSnake.call(this, 'r', true);
                    break;
                case DIRECTIONS.DOWN:
                    moveSnake.call(this, 'c', true);
                    break;
            }
        },
        getSnakeParts: function () {
            return _.map(this.snakeParts, function(snakePart, i){
                return {
                    r: snakePart.r,
                    c: snakePart.c,
                    img: this.images[i]
                }
            }, this);
        },
        setRandomFood: setRandomFood

    };
})();

var food;







