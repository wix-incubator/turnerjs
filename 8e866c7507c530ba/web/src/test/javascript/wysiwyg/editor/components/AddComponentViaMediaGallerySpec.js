describe("AddComponentViaMediaGallery", function() {
    var subject,
        executeCommand;

    testRequire().classes('wysiwyg.editor.components.AddComponentViaMediaGallery');

    beforeEach(function() {
        subject = new this.AddComponentViaMediaGallery();
        executeCommand = spyOn(W.Commands, 'executeCommand');
    });

    describe("openMediaGallery method", function () {
        function trycatch_openMediaGallery(options) {
            try {
                subject.openMediaGallery(options);
            } catch (e) {
            }
        }

        describe("for the TestComponent stub strategy", function () {
            var options, strategy;

            beforeEach(function () {
                strategy = jasmine.createSpyObj(
                    'TestStrategy', [
                        'getMediaGalleryCommandArgs',
                        'getDefaultPreset',
                        'extractMediaGalleryData',
                        'computeLayout',
                        'applyToPreset'
                    ]
                );

                subject._strategies = { TestComponent: strategy };

                options = {
                    compType: 'TestComponent' 
                };
            });

            it("should pick strategy according to the compType", function () {
                var picker = spyOn(subject, '_pickStrategyFor').andCallThrough();

                trycatch_openMediaGallery({ compType: 'TestComponent' });

                expect(picker).toHaveBeenCalledWith('TestComponent');
            });

            it("should pick strategy from its strategies hash", function () {
                trycatch_openMediaGallery({ compType: 'TestComponent' });

                expect(subject._strategy).toBe(subject._strategies.TestComponent);
            });

            it("should pass options to the used strategy", function () {
                trycatch_openMediaGallery(options);

                expect(subject._strategy.options).toBe(options);
            });

            it("should get command args from used strategy", function () {
                trycatch_openMediaGallery(options);

                expect(strategy.getMediaGalleryCommandArgs).toHaveBeenCalled();
            });

            it("should open media gallery frame using command args from strategy", function () {
                var commandArgs = {};

                strategy.getMediaGalleryCommandArgs.andReturn(commandArgs);

                subject.openMediaGallery(options);

                expect(executeCommand).toHaveBeenCalledWith(
                    'WEditorCommands.OpenMediaFrame', commandArgs
                );
            });

            it("should pass its _openMediaGalleryCallback as a callback to media gallery", function () {
                strategy.getMediaGalleryCommandArgs.andReturn({});

                subject.openMediaGallery(options);

                expect(executeCommand).toHaveBeenCalledWith(
                    'WEditorCommands.OpenMediaFrame', {
                        callback: subject._openMediaGalleryCallback
                    }
                );
            });

            it("should log event with options.compType", function () {
                spyOn(subject, '_reportAddButtonClick');
                strategy.getMediaGalleryCommandArgs.andReturn({});

                subject.openMediaGallery(options);

                expect(subject._reportAddButtonClick).toHaveBeenCalledWith(options.compType);
            });
        });

        it("throws error if no options passed", function () {
            expect(subject.openMediaGallery).toThrow("no options passed to openMediaGallery");
        });

        it("throws error if strategy is not found", function () {
            expect(function () {
                subject.openMediaGallery({ compType: 'TestComponent' });
            }).toThrow("no strategy found for TestComponent");
        });

        it("should open media gallery with provided strategy args", function() {
            var providedArgs = { test: 42 };

            spyOn(subject, '_pickStrategyFor').andCallFake(function () {
                subject._strategy = jasmine.createSpyObj('TestStrategy', ['getMediaGalleryCommandArgs']);
                subject._strategy.getMediaGalleryCommandArgs.andReturn(providedArgs);
            });

            subject.openMediaGallery({});

            expect(executeCommand).toHaveBeenCalledWith(
                'WEditorCommands.OpenMediaFrame', providedArgs);
        });
    });

    describe("_getCompType method", function () {
        var compType;

        it("should return UNKNOWN_COMPONENT if no strategy picked", function () {
            subject._strategy = null;
            compType = subject._getCompType();
            expect(compType).toBe(subject.UNKNOWN_COMPONENT);
        });

        it("should return UNKNOWN_COMPONENT if strategy has no options", function () {
            subject._strategy = {};
            compType = subject._getCompType();
            expect(compType).toBe(subject.UNKNOWN_COMPONENT);
        });

        it("should return UNKNOWN_COMPONENT if strategy has options with falsy compType", function () {
            subject._strategy = { options: { compType: '' } };
            compType = subject._getCompType();
            expect(compType).toBe(subject.UNKNOWN_COMPONENT);
        });

        it("should return compType from strategy.options", function () {
            subject._strategy = { options: { compType: "TestComponent" } };
            compType = subject._getCompType();
            expect(compType).toBe("TestComponent");
        });
    });

    describe("_openMediaGalleryCallback method", function () {
        var spyReportError,
            spyReportImagesAdded,
            spyGetCompType,
            spyAddComponentFromRawData;

        beforeEach(function () {
            spyReportError = spyOn(LOG, 'reportError');
            spyReportImagesAdded = spyOn(subject, '_reportImagesAdded');
            spyAddComponentFromRawData = spyOn(subject, '_addComponentFromRawData');
            spyGetCompType = spyOn(subject, '_getCompType');
        });

        it("should log error if no gallery data supplied", function () {
            subject._getCompType.andReturn('TestComponent');

            subject._openMediaGalleryCallback();

            expect(LOG.reportError).toHaveBeenCalledWith(subject.NO_DATA_ERROR + 'TestComponent', subject.$className, '_openMediaGalleryCallback');
        });

        it("should add multiple components if multiple gallery items were selected", function () {
            // NOTE: items are for test only, they have nothing common with real objects
            var galleryItems = [
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ];

            subject._openMediaGalleryCallback(galleryItems);

            expect(subject._addComponentFromRawData.callCount).toBe(galleryItems.length);
            galleryItems.forEach(function (item) {
                expect(subject._addComponentFromRawData).toHaveBeenCalledWith(item);
            });
        });

        it("should add single component if single gallery item was selected", function () {
            var galleryItem = { uri: 'test.png' };

            subject._getCompType.andReturn('TestComponent');
            subject._openMediaGalleryCallback(galleryItem);

            expect(subject._addComponentFromRawData.callCount).toBe(1);
            expect(subject._addComponentFromRawData).toHaveBeenCalledWith(galleryItem);
        });

        it("should log BI event for multiple items count and component type", function () {
            var galleryItems = [{}, {}];
            subject._getCompType.andReturn('TestComponent');

            subject._openMediaGalleryCallback(galleryItems);
            expect(spyReportImagesAdded).toHaveBeenCalledWith('TestComponent', galleryItems.length);
        });

        it("should log BI event for single item (count=1) and component type", function () {
            subject._getCompType.andReturn('TestComponent');

            subject._openMediaGalleryCallback({});
            expect(spyReportImagesAdded).toHaveBeenCalledWith('TestComponent', 1);
        });
    });

    describe("_addComponentFromRawData method", function () {
        var mockStrategy,
            rawGalleryData,
            defaultPresetData,
            extractedGalleryData,
            computedLayoutData,
            addComponentData,
            executeCommandNew;

        beforeEach(function () {
            mockStrategy = subject._strategy = jasmine.createSpyObj('TestStrategy', [
                'getMediaGalleryCommandArgs',
                'getDefaultPreset',
                'extractMediaGalleryData',
                'computeLayout',
                'applyToPreset'
            ]);

            rawGalleryData = {};
            extractedGalleryData = {};
            computedLayoutData = {};
            defaultPresetData = { compData: {} };

            mockStrategy.getDefaultPreset.andReturn(defaultPresetData);
            mockStrategy.extractMediaGalleryData.andReturn(extractedGalleryData);
            mockStrategy.computeLayout.andReturn(computedLayoutData);

            executeCommandNew = spyOn(subject.resources.W.CommandsNew, 'executeCommand').
                    andCallFake(function (commandName, commandArgs) {
                        expect(commandName).toBe("WEditorCommands.AddComponent");
                        addComponentData = commandArgs;
                    });
        });

        it("should get default preset from strategy", function () {
            subject._addComponentFromRawData(rawGalleryData);
            expect(mockStrategy.getDefaultPreset).toHaveBeenCalled();
        });

        it("should extract required media gallery data using strategy", function () {
            rawGalleryData.test = 42;
            subject._addComponentFromRawData(rawGalleryData);

            expect(mockStrategy.extractMediaGalleryData).toHaveBeenCalledWith(rawGalleryData);
        });

        it("should calculate layout using strategy and raw gallery data", function () {
            subject._addComponentFromRawData(rawGalleryData);

            expect(mockStrategy.computeLayout).toHaveBeenCalledWith(rawGalleryData);
        });

        it("should apply extra modifier to preset if it is defined", function () {
            subject._addComponentFromRawData(rawGalleryData);

            expect(mockStrategy.applyToPreset).toHaveBeenCalledWith(defaultPresetData);
        });

        it("should not throw if extra modifier not found in strategy", function () {
            delete mockStrategy.applyToPreset;

            expect(function () {
                subject._addComponentFromRawData(rawGalleryData);
            }).not.toThrow();
        });

        it("should add component using default preset", function () {
            subject._addComponentFromRawData(rawGalleryData);

            expect(addComponentData).toEqual(defaultPresetData);
        });

        it("should add component using data from gallery", function () {
            defaultPresetData.compData.data = { width: 42, height: 67 };
            extractedGalleryData.width = 100500;
            subject._addComponentFromRawData(rawGalleryData);

            expect(addComponentData.compData.data.width).toBe(100500);
            expect(addComponentData.compData.data.height).toBe(67);
        });

        it("should add component using computed layout", function () {
            defaultPresetData.compData.layout = { width: -1, height: -1 };
            computedLayoutData.width = 200;
            computedLayoutData.height = 90;

            subject._addComponentFromRawData(rawGalleryData);

            expect(addComponentData.compData.layout).toEqual({ width: 200, height: 90 });
        });

        it("should add component using extra modifier changes", function () {
            mockStrategy.applyToPreset.andCallFake(function (preset) {
                preset.test = 101;
            });

            subject._addComponentFromRawData(rawGalleryData);

            expect(addComponentData.test).toBe(101);
        });
    });
});

describe("AddComponentViaMediaGallery: inner strategies", function () {
    var subject,
        executeCommand;

    testRequire().classes(
        'wysiwyg.editor.components.AddComponentViaMediaGallery',
        'wysiwyg.editor.components.addviamediagallery.BaseStrategy'
    );

    beforeEach(function() {
        subject = new this.AddComponentViaMediaGallery();
        executeCommand = spyOn(W.Commands, 'executeCommand');
    });

    suite_for_inner_strategy("WPhoto", {
        inherits: 'BasePhotoStrategy',
        extraSuite: function () {
            suite_for_image_like_components();

            describe(".applyToPreset()", function () {
                var presetData;

                beforeEach(function () {
                    presetData = {
                        compData: {
                            data: {
                                uri: 'sample_image'
                            }
                        }
                    };
                });

                for_image_file_extension('.png',
                    always_wp2_should_be_applied
                );

                for_image_file_extension('.gif',
                    always_wp2_should_be_applied
                );

                for_image_file_extension('.jpg',
                    the_style_should_not_be_changed
                );

                for_image_file_extension('',
                    the_style_should_not_be_changed
                );

                function always_wp2_should_be_applied() {
                    if_image_had_style('wp1', function () {
                        it_should_apply_style('wp2');
                    });

                    if_image_had_style('wp2', function () {
                        it_should_apply_style('wp2');
                    });
                }

                function the_style_should_not_be_changed() {
                    if_image_had_style('wp1', function () {
                        it_should_apply_style('wp1');
                    });

                    if_image_had_style('wp2', function () {
                        it_should_apply_style('wp2');
                    });
                }

                function for_image_file_extension(extension, innerDescribe) {
                    describe("for *" + extension + " images", function () {
                        beforeEach(function () {
                            presetData.compData.data.uri += extension;
                        });

                        innerDescribe();
                    });
                }

                function if_image_had_style(styleId, innerDescribe) {
                    describe("if image had style: " + styleId, function () {
                        beforeEach(function () {
                            subject.options.styleId = styleId;
                        });

                        innerDescribe();
                    });
                }

                function it_should_apply_style(styleId) {
                    it("should apply style " + styleId, function () {
                        subject.applyToPreset(presetData);

                        expect(presetData.styleId).toBe(styleId);
                    });
                }
            });
        }
    });

    suite_for_inner_strategy("ClipArt", {
        inherits: 'BasePhotoStrategy',
        extraSuite: suite_for_image_like_components
    });

    suite_for_inner_strategy("DocumentMedia", { });
    suite_for_inner_strategy("Shape", {
        noData: true,
        noSkin: true,
        noMediaType: true,
        noGalleryConfigID: true
    });

    suite_for_inner_strategy("AudioPlayer", {
        noPublicMediaFile: true
    });

    suite_for_inner_strategy("SingleAudioPlayer", {
        noPublicMediaFile: true
    });

    describe("base strategy", function () {
        beforeEach(function () {
            subject = new this.BaseStrategy();
        });

        describe(".computeLayout() behavior", function () {
            var layout;

            beforeEach(function () {
                spyOn(subject, 'getDefaultPreset').andReturn({
                    compType: 'TestComponent',
                    compData: {
                        layout: {
                            width: 888,
                            height: undefined
                        }
                    }
                });
            });

            it("uses media gallery data width", function () {
                layout = subject.computeLayout({ width: 432 });
                
                expect(layout.width).toBe(432);
            });

            it("uses media gallery data height", function () {
                layout = subject.computeLayout({ height: 234 });
                
                expect(layout.height).toBe(234);
            });

            describe("default value = preset.layout.dimension || 200", function () {

                function it_should_be_applied_for(propertyName, value, expectedValue) {
                    it("should be applied for " + propertyName + ", if it is = " + value, function () {
                        var rawData = {};
                        rawData[propertyName] = value;

                        layout = subject.computeLayout(rawData);

                        expect(layout[propertyName]).toBe(expectedValue);
                    });
                }

                function it_should_not_be_applied_for(propertyName, value) {
                    it("should not (!) be applied for " + propertyName + ", if it is = " + value, function () {
                        var rawData = {};
                        rawData[propertyName] = value;

                        layout = subject.computeLayout(rawData);

                        expect(layout[propertyName]).toBe(value);
                    });
                }

                it_should_be_applied_for('width', undefined, 888);
                it_should_be_applied_for('height', undefined, 200);
                it_should_be_applied_for('width', null, 888);
                it_should_be_applied_for('height', null, 200);
                it_should_be_applied_for('width', '', 888);
                it_should_be_applied_for('height', '', 200);
                it_should_be_applied_for('width', 0, 888);
                it_should_be_applied_for('height', 0, 200);
                it_should_be_applied_for('width', -1, 888);
                it_should_be_applied_for('height', -1, 200);

                it_should_not_be_applied_for('width', 1);
                it_should_not_be_applied_for('width', 99.9);
                it_should_not_be_applied_for('width', 100);
                it_should_not_be_applied_for('width', 101.1);
            });
        });
    });

    function suite_for_inner_strategy(strategyName, options) {
        describe(strategyName + " strategy", function () {
            beforeEach(function () {
                subject._initializeStrategies();
                subject = subject._strategies[strategyName];
            });

            options.inherits = options.inherits || "BaseStrategy";

            it("should inherit from " + options.inherits, function () {
                var signature = new RegExp(options.inherits + "$");
                expect(subject.$parentPrototype.$className).toMatch(signature);
            });

            it_should_have("function", "getMediaGalleryCommandArgs");
            it_should_have("function", "getDefaultPreset");
            it_should_have("function", "extractMediaGalleryData");
            it_should_have("function", "computeLayout");
            it_should_have("function", "applyToPreset");

            describe("media gallery command args", function () {
                beforeEach(function () {
                    subject = subject.getMediaGalleryCommandArgs();
                });

                if (!options.noGalleryConfigID) {
                    it_should_have('string', 'galleryConfigID');
                }

                if (!options.noMediaType) {
                    it_should_have('string', 'mediaType');
                }

                if (!options.noPublicMediaFile) {
                    it_should_have('string', 'publicMediaFile');
                }
                it_should_have('string', 'selectionType');
                it_should_have('string', 'i18nPrefix');
            });

            describe("default preset", function () { beforeEach(function () {
                    subject = subject.getDefaultPreset();
                });

                it_should_have('string', 'compType');
                it_should_have('object', 'compData');

                describe(".compData", function () {
                    beforeEach(function () {
                        subject = subject.compData;
                    });

                    it_should_have('string', 'comp');
                    it_should_have('object', 'layout');

                    if (!options.noSkin) {
                        it_should_have('string', 'skin');
                    }

                    if (!options.noData) {
                        it_should_have('object', 'data');

                        describe(".data", function () {
                            beforeEach(function () {
                                subject = subject.data;
                            });

                            it_should_have('string', 'type');
                        });
                    }
                });
            });

            if (typeof options.extraSuite === "function") {
                options.extraSuite();
            }

            function it_should_have(propertyType, propertyName) {
                it("should have: " + propertyType + " " + propertyName, function () {
                    expect(typeof subject[propertyName]).toBe(propertyType);
                });
            }
        });
    }

    // for Image and ClipArt
    function suite_for_image_like_components() {
        describe(".computeLayout()", function () {

            it("should have MAX_IMG_WIDTH = 600", function () {
                expect(subject.MAX_IMG_WIDTH).toBe(600);
            });

            describe("when width <= MAX_IMG_WIDTH", function () {
                it("should round width", function () {
                    var layout = subject.computeLayout({ width: 30.99 });
                    expect(layout.width).toBe(31);
                });

                it("should round height", function () {
                    var layout = subject.computeLayout({ height: 99.11 });
                    expect(layout.height).toBe(99);
                });
            });

            describe("when width > MAX_IMG_WIDTH", function () {
                it("should crop width to MAX_IMG_WIDTH", function () {
                    layout = subject.computeLayout({ width: 10000, height: 5000 });

                    expect(layout.width).toBe(subject.MAX_IMG_WIDTH);
                });

                it("should crop height proportionally", function () {
                    layout = subject.computeLayout({ width: 10000, height: 5000 });

                    expect(layout.height).toBe(subject.MAX_IMG_WIDTH * 0.5);
                });
            });
        });

        describe(".extractMediaGalleryData()", function () {
            var extractedData, mediaGalleryData;

            beforeEach(function () {
                mediaGalleryData = {
                    description: "description",
                    height: 100,
                    width: 200,
                    fileName: "filename",
                    title: "title",
                    alt: "alt"
                };

                extractedData = subject.extractMediaGalleryData(_.clone(mediaGalleryData));
            });

            it("should rename fileName to uri", function () {
                expect(extractedData.uri).toBe(mediaGalleryData.fileName);
            });

            it("should clean data.title", function () {
                expect(extractedData.title).toBe("");
            });

            it("should clean data.alt", function () {
                expect(extractedData.alt).toBe("");
            });

            it_should_leave_as_is('description');
            it_should_leave_as_is('height');
            it_should_leave_as_is('width');

            function it_should_leave_as_is(propertyName) {
                it("should leave as is data." + propertyName, function () {
                    var expected = mediaGalleryData[propertyName];
                    var actual = extractedData[propertyName];

                    expect(actual).toBe(expected);
                });
            }
        });
    }
});
