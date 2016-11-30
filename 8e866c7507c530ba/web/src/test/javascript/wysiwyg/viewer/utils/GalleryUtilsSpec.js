describe('createActionQueue', function () {
    var actionsExecuted;
    var galleryUtils;

    var action = function (arg) {
        return function () {
            actionsExecuted.push(arg);
        }
    };

    beforeEach(function () {
        actionsExecuted = [];
        W.Classes.getClass("wysiwyg.viewer.utils.GalleryUtils",function(retClass){
            galleryUtils = retClass;
        });
        waitsFor(function () {
            return galleryUtils;
        }, 1000);
    });

    it('should simply execute the action', function () {
        var condition = true;
        var queue = new galleryUtils().createActionQueue(function () {
            return condition;
        }, 5);
        queue(action("a"));
        expect(actionsExecuted).toEqual(["a"]);
    });
    it('should simply block the action', function () {
        var condition = false;
        var queue = new galleryUtils().createActionQueue(function () {
            return condition;
        }, 5);
        queue(action("a"));
        expect(actionsExecuted).toEqual([]);
    });
    it('should first block, then execute the action', function () {
        var condition = false;
        var queue = new galleryUtils().createActionQueue(function () {
            return condition;
        }, 5);
        queue(action("a"));
        expect(actionsExecuted).toEqual([]);
        condition = true;
        queue();
        expect(actionsExecuted).toEqual(["a"]);
    });
    it('should block 3 actions, then execute them', function () {
        var condition = false;
        var queue = new galleryUtils().createActionQueue(function () {
            return condition;
        }, 5);
        queue(action("a"));
        queue(action("b"));
        queue(action("c"));
        expect(actionsExecuted).toEqual([]);
        condition = true;
        queue();
        expect(actionsExecuted).toEqual(["a", "b", "c"]);
    });

    it('should block 6 actions, then execute only last 2 ( = maxLenght) of them', function () {
        var condition = false;
        var queue = new galleryUtils().createActionQueue(function () {
            return condition;
        }, 2);
        queue(action("a"));
        queue(action("b"));
        queue(action("c"));
        queue(action("d"));
        queue(action("e"));
        queue(action("f"));
        expect(actionsExecuted).toEqual([]);
        condition = true;
        queue();
        expect(actionsExecuted).toEqual(["e", "f"]);
    });
});