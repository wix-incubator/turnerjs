var Game = (function () {

    var board;
    var snake;
    var currLevel;
    var ctx;
    var currentDirectionKeyCode;
    var moveKeyQ;
    var lastFrameTimestamp, lastMessageTimestamp;
    var messageNode;

    function initImages() {
        IMAGE_URLS.forEach(function (item) {
            var img = new Image;
            img.src = 'https://avatars.githubusercontent.com/u/' + item.id + '?v=3&s=80';
            img.setAttribute('data-name', item.name);
            IMAGE_NODES.push(img);
        })
    }

    function resetGame() {
        snake.reset();
        snake.setRandomFood();
        currentDirectionKeyCode = null;
        moveKeyQ = [];
    }

    function tickFrame(frameTimestamp) {
        lastFrameTimestamp = lastFrameTimestamp || frameTimestamp;
        if (frameTimestamp - lastFrameTimestamp > FRAME_INTERVAL[currLevel]) {
            lastFrameTimestamp = 0;
            snake.moveForward(getNextMoveKey());
            board.drawSnake(snake);
        }

        lastMessageTimestamp = lastMessageTimestamp || frameTimestamp;
        if (frameTimestamp - lastMessageTimestamp > 1000) {
            lastMessageTimestamp = 0;
            setMessage('', '');
        }
        requestAnimationFrame(tickFrame);
    }

    function getNextMoveKey() {
        currentDirectionKeyCode = moveKeyQ.shift() || currentDirectionKeyCode;
        return currentDirectionKeyCode;
    }

    function getLatestMoveKey() {
        return moveKeyQ.length ? _.last(moveKeyQ) : currentDirectionKeyCode;
    }

    function handleKeyEvent(event) {
        var nextKey = event.keyCode;
        var latestKey = getLatestMoveKey();

        if (latestKey === DIRECTIONS.LEFT && nextKey === DIRECTIONS.RIGHT) {
            return;
        }
        if (latestKey === DIRECTIONS.UP && nextKey === DIRECTIONS.DOWN) {
            return;
        }
        if (latestKey === DIRECTIONS.RIGHT && nextKey === DIRECTIONS.LEFT) {
            return;
        }
        if (latestKey === DIRECTIONS.DOWN && nextKey === DIRECTIONS.UP) {
            return;
        }
        moveKeyQ.push(nextKey);
    }

    function setMessage(name, className) {
        lastMessageTimestamp = 0;
        messageNode.innerText = name;
        messageNode.className = className;
    }

    return {
        init: function () {
            initImages();
            document.onkeydown = handleKeyEvent;
            var canvas = document.getElementById('canvas');
            messageNode = document.getElementById('message');
            ctx = canvas.getContext('2d');
            board = new Board(ctx);
            snake = new Snake(resetGame, setMessage);
            currLevel = LEVELS.MEDIUM;
            this.resetGame();
            requestAnimationFrame(tickFrame);
        },
        resetGame: function () {
            snake.reset();
            snake.setRandomFood();
            currentDirectionKeyCode = null;
            moveKeyQ = [];
        }
    };
})();