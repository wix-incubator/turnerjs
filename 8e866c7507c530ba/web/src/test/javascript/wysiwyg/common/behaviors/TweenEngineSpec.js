describe('TweenEngine', function () {

    testRequire()
        .classes('wysiwyg.common.behaviors.TweenEngine');

    var tweenResourceMock = {
        tween: function(){return 'tween';},
        timeline: function(){ return 'timeline' ;},
        from: function(){return 'from';},
        to: function(){return 'to';},
        fromTo: function(){return 'fromTo';},
        set: function(){return 'set';}
    };

    beforeEach(function () {
        this.tweenEngine = new this.TweenEngine(tweenResourceMock);
    });

    describe('TweenEngine test suite', function(){

        xit('Tween should pass the right arguments to the "_from" function when given "from" params', function() {
            var element = [document.createElement('span')],
                params = {
                    duration: 1.2,
                    from: {
                        opacity: 0
                    },
                    data: {},
                    onComplete: this.tweenEngine._onCompleteEvent,
                    onCompleteParams: ['{self}'],
                    onStart: this.tweenEngine._onStartEvent,
                    onStartParams: ['{self}']
                };

            spyOn(this.tweenEngine, '_from');
            spyOn(this.tweenEngine, '_saveCssText');

            this.tweenEngine.tween(element, params, ['opacity']);

            expect(this.tweenEngine._from).toHaveBeenCalledWith(element, params);
        });

        xit('Tween should pass the right arguments to the "_to" function when given "to" params', function() {
            var element = [document.createElement('span')],
                params = {
                    duration: 1.2,
                    to: {
                        opacity: 1
                    },
                    data: {},
                    onComplete: this.tweenEngine._onCompleteEvent,
                    onCompleteParams: ['{self}'],
                    onStart: this.tweenEngine._onStartEvent,
                    onStartParams: ['{self}']
                };

            spyOn(this.tweenEngine, '_saveCssText');
            spyOn(this.tweenEngine, '_to');

            this.tweenEngine.tween(element, params, ['opacity']);

            expect(this.tweenEngine._to).toHaveBeenCalledWith(element, params);

        });

        xit('Tween should pass the right arguments to the "_fromTo" function when given "from" params and "to" params', function() {
            var element = [document.createElement('span')],
                params = {
                    duration: 1.2,
                    from: {
                        opacity: 0
                    },
                    to: {
                        opacity: 1
                    },
                    data: {},
                    onComplete: this.tweenEngine._onCompleteEvent,
                    onCompleteParams: ['{self}'],
                    onStart: this.tweenEngine._onStartEvent,
                    onStartParams: ['{self}']
                };

            spyOn(this.tweenEngine, '_fromTo');
            spyOn(this.tweenEngine, '_saveCssText');

            this.tweenEngine.tween(element, params, ['opacity']);

            expect(this.tweenEngine._fromTo).toHaveBeenCalledWith(element, params);
        });

        xit('Sequence should pass the right arguments to the tweenResource timeline function and return the tweenList', function() {
            var element = document.createElement('span'),
                params = {
                    duration: 1.2,
                    data: {},
                    onComplete: this.tweenEngine._onCompleteEvent,
                    onCompleteParams: ['{self}'],
                    onStart: this.tweenEngine._onStartEvent,
                    onStartParams: ['{self}']
                },
                expectedParams = {},
                tweenList = [{tween1: ''},{tween2: ''}],
                result = null;


            expectedParams = {
                data : {}
            };

            this.addMock = function(){};
            spyOn(this, 'addMock');

            spyOn(this.tweenEngine._tweenResource, 'timeline').andReturn({add:  this.addMock});

            this.tweenEngine.sequence(tweenList, params, []);

            expect(this.tweenEngine._tweenResource.timeline).toHaveBeenCalledWith(expectedParams);
            expect(this.addMock).toHaveBeenCalledWith(tweenList);
        });

        

        it('Should save element.style.cssText to a property on the element\'s object', function() {
            var element = document.createElement('span');

            element.style.color = '#ffffff';
            this.tweenEngine._saveCssText(element);
            expect(element._gsCssText).toEqual(element.style.cssText);
        });

        it('Should clear all tween information for the passed element and resets it\'s style to previously saved style', function() {
            var element = document.createElement('span'),
                cssText = 'color: rgb(255, 255, 255);';

            // Assume the following css text applied to _gsCssText
            element._gsCssText = cssText;

            spyOn(this.tweenEngine._tweenResource, 'set');

            this.tweenEngine._resetElementStyles(element);
            expect(element.style.cssText).toEqual(cssText);
            expect(this.tweenEngine._tweenResource.set).toHaveBeenCalledWith(element, {clearProps:'all'});
        });

        it('Removes from the passed params object values that are not present in the union of allowedAnimationParamsList and _allowedTweenMaxParamsList', function() {
            var invalidParam = 'notAllowed',

                tweenMaxParams = {},
                validTweenMaxParam = this.tweenEngine._allowedTweenMaxParamsList[0],
                allowedAnimationParamsList = ['allowedParam'],

                resultParams = null;

            tweenMaxParams[invalidParam] = 'should be filtered';
            tweenMaxParams[validTweenMaxParam] = 'this is a valid param...';
            tweenMaxParams[allowedAnimationParamsList[0]] = 'this is a valid param...';

            resultParams = this.tweenEngine._validateAnimationParams(_.cloneDeep(tweenMaxParams), [allowedAnimationParamsList, this.tweenEngine._allowedTweenMaxParamsList]);

            expect(resultParams[invalidParam]).toBeUndefined();
            expect(resultParams[validTweenMaxParam]).toBeDefined();
            expect(resultParams[allowedAnimationParamsList[0]]).toBeDefined();

        });

        it('Removes from the passed params object values that are not present in the union of allowedAnimationParamsList and _allowedTimelineMaxParamsList', function() {
            var invalidParam = 'notAllowed',

                timelineParams = {},
                validTimelineParam = this.tweenEngine._allowedTimelineMaxParamsList[0],
                allowedAnimationParamsList = ['allowedParam'],

                resultParams = null;

            timelineParams[invalidParam] = 'should be filtered';
            timelineParams[validTimelineParam] = 'this is a valid param...';
            timelineParams[allowedAnimationParamsList[0]] = 'this is a valid param...';

            resultParams = this.tweenEngine._validateAnimationParams(_.cloneDeep(timelineParams), [allowedAnimationParamsList, this.tweenEngine._allowedTimelineMaxParamsList]);

            expect(resultParams[invalidParam]).toBeUndefined();
            expect(resultParams[validTimelineParam]).toBeDefined();
            expect(resultParams[allowedAnimationParamsList[0]]).toBeDefined();

        });

    });


});