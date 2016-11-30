describe( 'Animations', function () {

    testRequire()
        .classes('wysiwyg.common.behaviors.Animations', 'wysiwyg.common.behaviors.TweenEngine');

    var tweenEngineMock = {
        tween: function(){return 'tween'},
        applyTween: function(){return 'applyTween'},
        sequence: function(){return 'sequence'},
        clear: function(){return 'clear'}
    };
    beforeEach(function () {
        this.animations = new this.Animations(tweenEngineMock);
    });

    describe('Animations test suite', function(){

        it('Should pass the right params to the tweenEngine tween function', function() {
            var element = document.createElement('span'),
                params = {},
                allowedParams = [];

            spyOn(this.animations._tweenEngine, 'tween');

            this.animations.tween(element, params, allowedParams);

            expect(this.animations._tweenEngine.tween).toHaveBeenCalledWith(element, params, allowedParams);
        });

        it('Should pass the right params to the tweenEngine sequence function', function() {
            var tweenList = [{},{}],
                params = {};

            spyOn(this.animations._tweenEngine, 'sequence');

            this.animations.sequence(tweenList, params);

            expect(this.animations._tweenEngine.sequence).toHaveBeenCalledWith(tweenList, params);
        });

        it('Should pass the right params to the tweenEngine clear function', function() {
            var src = {};

            spyOn(this.animations._tweenEngine, 'clear');

            this.animations.clear(src);

            expect(this.animations._tweenEngine.clear).toHaveBeenCalledWith(src);
        });

        it('Should return all the animation definitions', function() {

            expect(_.keys(this.animations.getAllAnimationDefinitions())).toEqual(_.keys(define.getDefinition('animation')));
        });

        it('Should return null when a non existing animation is passed', function() {

            expect(this.animations.getAnimationDefinition('nonExistingAnimationClass')).toEqual(null);
        });

        it('Should get an animation and call it\'s animate() function', function() {
            var name = _.keys(define.getDefinition('animation'))[0],
                element = document.createElement('span'),
                duration = 5,
                delay = 0,
                params = {};

            this.animateMock = function(){};
            spyOn(this, 'animateMock');

            spyOn(this.animations, 'getAnimationDefinition').andReturn({animate:  this.animateMock});

            this.animations.applyTween(name, element, duration, delay, params);

            expect(this.animations.getAnimationDefinition).toHaveBeenCalledWith(name);
            expect(this.animateMock).toHaveBeenCalledWith(element, duration, delay, params);
        });

        it('Should return null when passed with a non existing animation', function() {
            var name = 'nonExistingAnimation',
                element = document.createElement('span'),
                duration = 5,
                delay = 0,
                params = {};

            expect(this.animations.applyTween(name, element, duration, delay, params)).toEqual(null);
        });

    });


});