describe('Animation Classes Structure Test', function() {

    var animationsMock = {
        tween: function() {
            return 'tween';
        },
        set: function() {
            return 'set';
        },
        applyTween: function() {
            return 'applyTween';
        },
        sequence: function() {
            return 'sequence';
        },
        clear: function() {
            return 'clear';
        },
        utils: {
            SplitHtmlText: function() {
                return{
                    letters: function() {
                    },
                    words: function() {
                    },
                    paragraphs: function() {
                    }
                };
            }
        },
        ClearTypes: {
            STYLE: 'resetStyle',
            SPLIT_TEXT: 'splitText'
        }
    };

    describe('Loop over all animations', function() {
        var definition;
        var animations = define.getDefinition('animation');
        for (var name in animations) {
            definition = animations[name]();
            definition.init(animationsMock);
            testSingleAnimation(name, definition);
            testSingleBaseAnimation(name, definition);
        }
    });

    function testSingleAnimation(name, definition) {
        describe(name, function() {
            it('should have an "init" function', function() {
                expect(definition.init).toBeOfType('function');
            });

            it('should have an "animate" function', function() {
                expect(definition.animate).toBeOfType('function');
            });

            it('should have a "group" array, and at least one group defined', function() {
                expect(definition.group).toBeOfType('array');
                expect(definition.group.length).toBeGreaterThan(0);
            });

            it('"init" should set the _animations var', function() {
                definition.init(animationsMock);

                expect(definition._animations).toBe(animationsMock);
            });

            it('"animate" should return a tween or a sequence', function() {
                // mock data
                var element = document.createElement('div'),
                    duration = 1.0,
                    delay = 0,
                    params = {};

                expect(definition.animate(element, duration, delay, params)).toMatch(/sequence|tween/);
            });
        });
    }

    function testSingleBaseAnimation(name, definition) {
        if (definition.group.indexOf('base') >= 0) {
            describe(name + ' is a base group', function() {
                it('should have a "_defaults" object', function() {
                    expect(definition._defaults).toBeOfType('object');
                });

                it('should have a "_allowedParams" array, and at least one param in it', function() {
                    expect(definition._allowedParams).toBeOfType('array');
                    expect(definition._allowedParams.length).toBeGreaterThan(0);
                });
            });
        }
    }

});