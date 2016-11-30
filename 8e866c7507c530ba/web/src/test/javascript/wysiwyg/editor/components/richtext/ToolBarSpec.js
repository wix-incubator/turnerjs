describe('ToolBar', function(){
    testRequire().
        components('wysiwyg.editor.components.richtext.ToolBar');

    it("should not have describes with no tests!", function(){ expect('test').not.toBe('empty'); });

    xdescribe('ToolBar', function(){
        beforeEach(function(){
               var toolBarParentElement = new Element("toolBarParent_node");
               var toolBarElement = new Element("toolBar_node");
               toolBarElement.insertInto(toolBarParentElement);
               this.toolBar = new this.ToolBar('toolBarId', toolBarElement);

               var ckEditorMock =
               {execCommand: function(){},
                   getCommand: function(){}};
               this.toolBar._skinParts =
               {a: {addEvent: function(){},
                       startListeningToButtonParts: function(){}
                   }/*,
               wixLink: {addEvent: function(){}},
               wixUnlink: {addEvent: function(){}}*/
               };
               this.toolBar._editorInstance =  ckEditorMock;
               this.toolBar._commandList = ['a', 'b', 'c'];
               this.toolBar.controllersDataInfo =  {a: {toolTipId: 'id1'}};
           });

           it("Should start listening to ck commands state change event on startEditing, and set default values", function() {
               var cmd = {on: function(){}};
               spyOn(this.toolBar, '_setStylesDropDownData');
               spyOn(this.toolBar, '_setFontsDropDownData');
               spyOn(this.toolBar._editorInstance, 'getCommand').andReturn(cmd);
               spyOn(this.toolBar, '_isDualStateCommand').andReturn(false);
               spyOn(this.toolBar, '_setDefaultValueIfExist');
               spyOn(cmd, 'on');
               var handleStateChangeSpy = spyOn(this.toolBar, '_handleStateChange');
               var styleMapId = {};

               this.toolBar.startEditing(styleMapId);

               expect(this.toolBar._setStylesDropDownData).toHaveBeenCalledWith(styleMapId);
               expect(this.toolBar._setFontsDropDownData).toHaveBeenCalled();
               //mock for ck and implement on...  and then check on was called on different commands
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledXTimes(3);
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledWith('a');
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledWith('b');
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledWith('c');
               expect(this.toolBar._isDualStateCommand).toHaveBeenCalledXTimes(3);
               expect(this.toolBar._isDualStateCommand).toHaveBeenCalledWith('a');
               expect(this.toolBar._isDualStateCommand).toHaveBeenCalledWith('b');
               expect(this.toolBar._isDualStateCommand).toHaveBeenCalledWith('c');
               expect(this.toolBar._setDefaultValueIfExist).toHaveBeenCalledXTimes(3);
               expect(this.toolBar._setDefaultValueIfExist).toHaveBeenCalledWith('a');
               expect(this.toolBar._setDefaultValueIfExist).toHaveBeenCalledWith('b');
               expect(this.toolBar._setDefaultValueIfExist).toHaveBeenCalledWith('c');
               expect(cmd.on).toHaveBeenCalledXTimes(3);
               expect(cmd.on).toHaveBeenCalledWith('state', handleStateChangeSpy, this.toolBar, {commandName: 'a'});
               expect(cmd.on).toHaveBeenCalledWith('state', handleStateChangeSpy, this.toolBar, {commandName: 'b'});
               expect(cmd.on).toHaveBeenCalledWith('state', handleStateChangeSpy, this.toolBar, {commandName: 'c'});
           });

           it("Should start listening to ck commands state change event on startEditing, without setting default values", function() {
               var cmd = {on: function(){}};
               spyOn(this.toolBar, '_setStylesDropDownData');
               spyOn(this.toolBar, '_setFontsDropDownData');
               spyOn(this.toolBar._editorInstance, 'getCommand').andReturn(cmd);
               spyOn(this.toolBar, '_isDualStateCommand').andReturn(true);
               spyOn(this.toolBar, '_setDefaultValueIfExist');
               spyOn(cmd, 'on');
               var handleStateChangeSpy = spyOn(this.toolBar, '_handleStateChange');
               var styleMapId = {};

               this.toolBar.startEditing(styleMapId);

               expect(this.toolBar._setStylesDropDownData).toHaveBeenCalledWith(styleMapId);
               expect(this.toolBar._setFontsDropDownData).toHaveBeenCalled();
               //mock for ck and implement on...  and then check on was called on different commands
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledXTimes(3);
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledWith('a');
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledWith('b');
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledWith('c');
               expect(this.toolBar._isDualStateCommand).toHaveBeenCalledXTimes(3);
               expect(this.toolBar._isDualStateCommand).toHaveBeenCalledWith('a');
               expect(this.toolBar._isDualStateCommand).toHaveBeenCalledWith('b');
               expect(this.toolBar._isDualStateCommand).toHaveBeenCalledWith('c');
               expect(this.toolBar._setDefaultValueIfExist).not.toHaveBeenCalled();
               expect(cmd.on).toHaveBeenCalledXTimes(3);
               expect(cmd.on).toHaveBeenCalledWith('state', handleStateChangeSpy, this.toolBar, {commandName: 'a'});
               expect(cmd.on).toHaveBeenCalledWith('state', handleStateChangeSpy, this.toolBar, {commandName: 'b'});
               expect(cmd.on).toHaveBeenCalledWith('state', handleStateChangeSpy, this.toolBar, {commandName: 'c'});
           });

           it("Should stop listening to ck commands state change event on stopEditing", function() {
               this.toolBar._commandList = ['a', 'b'];
               var cmd = {removeListener: function(){}};
               spyOn(this.toolBar._editorInstance, 'getCommand').andReturn(cmd);
               spyOn(cmd, 'removeListener');
               var handleStateChangeSpy = spyOn(this.toolBar, '_handleStateChange');

               this.toolBar.stopEditing();

               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledXTimes(2);
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledWith('a');
               expect(this.toolBar._editorInstance.getCommand).toHaveBeenCalledWith('b');
               expect(cmd.removeListener).toHaveBeenCalledXTimes(2);
               expect(cmd.removeListener).toHaveBeenCalledWith('state', handleStateChangeSpy);
           });


           it("should start listening to the toolbar dual state controller events", function() {
               var controller = this.toolBar._skinParts.a;
               var toolTipId = this.toolBar.controllersDataInfo['a'].toolTipId;
               spyOn(this.toolBar, '_isDualStateCommand').andReturn(true);
               var executeDualStateCommand = spyOn(this.toolBar, 'executeDualStateCommand');
               spyOn(controller, 'addEvent');
               spyOn(this.toolBar, '_addToolTipToSkinPart');

               this.toolBar._setControllers();

               expect(controller.addEvent).toHaveBeenCalledWith('click', executeDualStateCommand );
               expect(this.toolBar._addToolTipToSkinPart).toHaveBeenCalledWith(controller, toolTipId);
           });

           it("should start listening to the toolbar multi state controller events", function() {
               var controller = this.toolBar._skinParts.a;
               var toolTipId = this.toolBar.controllersDataInfo['a'].toolTipId;
               spyOn(this.toolBar, '_isDualStateCommand').andReturn(false);
               spyOn(this.toolBar, '_isMultiStateCommand').andReturn(true);
               var executeMultiStateCommand = spyOn(this.toolBar, 'executeMultiStateCommand');
               spyOn(controller, 'addEvent');
               spyOn(this.toolBar, '_addToolTipToSkinPart');

               this.toolBar._setControllers();

               expect(controller.addEvent).toHaveBeenCalledWith('change', executeMultiStateCommand );
               expect(this.toolBar._addToolTipToSkinPart).toHaveBeenCalledWith(controller, toolTipId);
           });

           it("should start listening to the toolbar color controller events", function() {
               var controller = this.toolBar._skinParts.a;
               var toolTipId = this.toolBar.controllersDataInfo['a'].toolTipId;
               spyOn(this.toolBar, '_isDualStateCommand').andReturn(false);
               spyOn(this.toolBar, '_isMultiStateCommand').andReturn(false);
               spyOn(this.toolBar, '_isColorCommand').andReturn(true);
               spyOn(controller, 'startListeningToButtonParts');
               var executeColorCommand = spyOn(this.toolBar, 'executeColorCommand');
               spyOn(controller, 'addEvent');
               spyOn(this.toolBar, '_addToolTipToSkinPart');

               this.toolBar._setControllers();

               expect(controller.startListeningToButtonParts).toHaveBeenCalled();
               expect(controller.addEvent).toHaveBeenCalledWith('change', executeColorCommand );
               expect(this.toolBar._addToolTipToSkinPart).toHaveBeenCalledWith(controller, toolTipId);
           });

           it("should start listening to the toolbar link controller events", function() {
               var controller = this.toolBar._skinParts.a;
               var toolTipId = this.toolBar.controllersDataInfo['a'].toolTipId;
               spyOn(this.toolBar, '_isDualStateCommand').andReturn(false);
               spyOn(this.toolBar, '_isMultiStateCommand').andReturn(false);
               spyOn(this.toolBar, '_isColorCommand').andReturn(false);
               spyOn(this.toolBar, '_isLinkCommand').andReturn(true);
               var executeLinkCommand = function(){};
               spyOn(this.toolBar, '_getLinkCommandListener').andReturn(executeLinkCommand);
               spyOn(controller, 'addEvent');
               spyOn(this.toolBar, '_addToolTipToSkinPart');

               this.toolBar._setControllers();

               expect(controller.addEvent).toHaveBeenCalledWith('click', executeLinkCommand);
               expect(this.toolBar._addToolTipToSkinPart).toHaveBeenCalledWith(controller, toolTipId);
           });

           it("should start listening to the toolbar unlink controller events", function() {
               var controller = this.toolBar._skinParts.a;
               var toolTipId = this.toolBar.controllersDataInfo['a'].toolTipId;
               spyOn(this.toolBar, '_isDualStateCommand').andReturn(false);
               spyOn(this.toolBar, '_isMultiStateCommand').andReturn(false);
               spyOn(this.toolBar, '_isColorCommand').andReturn(false);
               spyOn(this.toolBar, '_isLinkCommand').andReturn(true);
               var executeUnlinkCommand = function(){};
               spyOn(this.toolBar, '_getLinkCommandListener').andReturn(executeUnlinkCommand);
               spyOn(controller, 'addEvent');
               spyOn(this.toolBar, '_addToolTipToSkinPart');

               this.toolBar._setControllers();

               expect(controller.addEvent).toHaveBeenCalledWith('click', executeUnlinkCommand );
               expect(this.toolBar._addToolTipToSkinPart).toHaveBeenCalledWith(controller, toolTipId);
           });
    });

    describe('Fonts & Character Sets', function() {

        testRequire().
            components('wysiwyg.editor.components.richtext.ToolBar')
            .resources("W.Preview");

        beforeEach(function(){
            var toolBarParentElement = new Element("toolBarParent_node");
            var toolBarElement = new Element("toolBar_node");
            toolBarElement.insertInto(toolBarParentElement);
            this.toolBar = new this.ToolBar('toolBarId', toolBarElement);

            var ckEditorMock = {
                execCommand: function(){},
                getCommand: function(){}
            };
            this.toolBar._skinParts = {
                'a': { 'addEvent': function(){},
                  'startListeningToButtonParts': function(){}
                }
            };
            this.toolBar._editorInstance =  ckEditorMock;
            this.toolBar._commandList = ['a', 'b', 'c'];
            this.toolBar.controllersDataInfo =  {a: {toolTipId: 'id1'}};
        });

        it('should on it initialization, register a command named \'W.CssCommands.CharacterSetChange\' on the preview Commands manager. With _setFontsDropDownData as the handler', function(){
            var managersMock = {
                'Commands': {
                    'registerCommandAndListener': jasmine.createSpy('Commands.registerCommandAndListener')
                }
            };

            spyOn(this.W.Preview, 'getPreviewManagersAsync').andCallFake(function(callback, scope){
                callback.call(scope, managersMock);
            });

            this.toolBar.initialize('toolBarId', this.toolBar._view);

            expect(managersMock.Commands.registerCommandAndListener).toHaveBeenCalledWith('W.CssCommands.CharacterSetChange', this.toolBar, this.toolBar._setFontsDropDownData);
        });

        describe('_setFontsDropDownData', function() {

            var possibleCharacterSets =  ['latin-ext','cyrillic','japanese','korean','arabic','hebrew','latin'];

            beforeEach(function(){
                this.mockFontsList = {
                    'latin-ext': [
                        {
                            "displayName": "Anton",
                            "fontFamily": "anton",
                            "cssFontFamily": "anton",
                            "cdnName": "Anton",
                            "genericFamily": "sans-serif",
                            "provider": "google",
                            "characterSets": [
                                "latin",
                                "latin-ext"
                            ],
                            "permissions": "all",
                            "fallbacks": "",
                            "spriteIndex": 0
                        },
                        {
                            "displayName": "Arial",
                            "fontFamily": "arial",
                            "cssFontFamily": "arial",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "latin-ext",
                                "cyrillic",
                                "hebrew",
                                "arabic",
                                "japanese",
                                "korean"
                            ],
                            "permissions": "all",
                            "fallbacks": "helvetica",
                            "spriteIndex": 2
                        },
                        {
                            "displayName": "Caudex",
                            "fontFamily": "caudex",
                            "cssFontFamily": "caudex",
                            "cdnName": "Caudex",
                            "genericFamily": "serif",
                            "provider": "google",
                            "characterSets": [
                                "latin",
                                "latin-ext"
                            ],
                            "permissions": "all",
                            "fallbacks": "",
                            "spriteIndex": 18
                        }
                    ],
                    'cyrillic': [
                        {
                            "displayName": "Arial",
                            "fontFamily": "arial",
                            "cssFontFamily": "arial",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "latin-ext",
                                "cyrillic",
                                "hebrew",
                                "arabic",
                                "japanese",
                                "korean"
                            ],
                            "permissions": "all",
                            "fallbacks": "helvetica",
                            "spriteIndex": 2
                        },
                        {
                            "displayName": "Arial Black",
                            "fontFamily": "arial black",
                            "cssFontFamily": "arial black",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "cyrillic"
                            ],
                            "permissions": "all",
                            "fallbacks": "gadget",
                            "spriteIndex": 14
                        }
                    ],
                    'japanese': [
                        {
                            "displayName": "Arial",
                            "fontFamily": "arial",
                            "cssFontFamily": "arial",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "latin-ext",
                                "cyrillic",
                                "hebrew",
                                "arabic",
                                "japanese",
                                "korean"
                            ],
                            "permissions": "all",
                            "fallbacks": "helvetica",
                            "spriteIndex": 2
                        }
                    ],
                    'korean': [
                        {
                            "displayName": "Arial",
                            "fontFamily": "arial",
                            "cssFontFamily": "arial",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "latin-ext",
                                "cyrillic",
                                "hebrew",
                                "arabic",
                                "japanese",
                                "korean"
                            ],
                            "permissions": "all",
                            "fallbacks": "helvetica",
                            "spriteIndex": 2
                        }
                    ],
                    'arabic': [
                        {
                            "displayName": "Arial",
                            "fontFamily": "arial",
                            "cssFontFamily": "arial",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "latin-ext",
                                "cyrillic",
                                "hebrew",
                                "arabic",
                                "japanese",
                                "korean"
                            ],
                            "permissions": "all",
                            "fallbacks": "helvetica",
                            "spriteIndex": 2
                        },
                        {
                            "displayName": "Arabic Typesetting Regular",
                            "fontFamily": "arabictypesettingw23-re",
                            "cssFontFamily": "arabictypesettingw23-re",
                            "cdnName": "",
                            "genericFamily": "serif",
                            "provider": "monotype",
                            "characterSets": [
                                "arabic"
                            ],
                            "permissions": "all",
                            "fallbacks": "",
                            "spriteIndex": 176
                        }
                    ],
                    'hebrew': [
                        {
                            "displayName": "Arial",
                            "fontFamily": "arial",
                            "cssFontFamily": "arial",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "latin-ext",
                                "cyrillic",
                                "hebrew",
                                "arabic",
                                "japanese",
                                "korean"
                            ],
                            "permissions": "all",
                            "fallbacks": "helvetica",
                            "spriteIndex": 2
                        },
                        {
                            "displayName": "Frank Ruhl",
                            "fontFamily": "frank-ruhl-w26-regular",
                            "cssFontFamily": "frank-ruhl-w26-regular",
                            "cdnName": "",
                            "genericFamily": "serif",
                            "provider": "monotype",
                            "characterSets": [
                                "hebrew"
                            ],
                            "permissions": "all",
                            "fallbacks": "",
                            "spriteIndex": 159
                        }
                    ],
                    'latin': [
                        {
                            "displayName": "Anton",
                            "fontFamily": "anton",
                            "cssFontFamily": "anton",
                            "cdnName": "Anton",
                            "genericFamily": "sans-serif",
                            "provider": "google",
                            "characterSets": [
                                "latin",
                                "latin-ext"
                            ],
                            "permissions": "all",
                            "fallbacks": "",
                            "spriteIndex": 0
                        },
                        {
                            "displayName": "Arial",
                            "fontFamily": "arial",
                            "cssFontFamily": "arial",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "latin-ext",
                                "cyrillic",
                                "hebrew",
                                "arabic",
                                "japanese",
                                "korean"
                            ],
                            "permissions": "all",
                            "fallbacks": "helvetica",
                            "spriteIndex": 2
                        },
                        {
                            "displayName": "Arial Black",
                            "fontFamily": "arial black",
                            "cssFontFamily": "arial black",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "system",
                            "characterSets": [
                                "latin",
                                "cyrillic"
                            ],
                            "permissions": "all",
                            "fallbacks": "gadget",
                            "spriteIndex": 14
                        },
                        {
                            "displayName": "Caudex",
                            "fontFamily": "caudex",
                            "cssFontFamily": "caudex",
                            "cdnName": "Caudex",
                            "genericFamily": "serif",
                            "provider": "google",
                            "characterSets": [
                                "latin",
                                "latin-ext"
                            ],
                            "permissions": "all",
                            "fallbacks": "",
                            "spriteIndex": 18
                        },
                        {
                            "displayName": "Helvetica Neue",
                            "fontFamily": "helvetica neue",
                            "cdnName": "",
                            "genericFamily": "sans-serif",
                            "provider": "monotype",
                            "characterSets": [
                                "latin"
                            ],
                            "permissions": "legacy",
                            "fallbacks": ""
                        }
                    ]
                };

                var managersMock = this.managersMock = {
                    'Css': {
                        'getLanguagesFontsLists': jasmine.createSpy('Css.getLanguagesFontsLists').andReturn(this.mockFontsList),
                        'getFontsListSpriteUrl': jasmine.createSpy('Css.getFontsListSpriteUrl').andReturn('test://fonts-list-sprite.url'),
                        'getCharacterSets': jasmine.createSpy('Css.getCharacterSets').andReturn(['latin','cyrillic']),
                        possibleCharacterSets: possibleCharacterSets
                    }
                };

                spyOn(this.W.Preview, 'getPreviewManagersAsync').andCallFake(function(callback, scope){
                    callback.call(scope, managersMock);
                });

                this.toolBar._controllerInstances = {
                    'fontFamily': {
                        'setComponentData': function(){}
                    }
                };
            });

            describe('should use the fonts list provided by CssManager.getLanguagesFontsLists()',function(){
                beforeEach(function() {
                    this.generatedFontItems = {};

                    spyOn(this.toolBar, '_createAndSetDataItem').andCallFake(function(name,key,items){
                        this.generatedFontItems = items;
                    }.bind(this));
                });

                it('should add each font once for each used character set it supports', function(){
                    var siteCharacterSets = this.managersMock.Css.getCharacterSets(),
                        usedCharSetsCounter,i;

                    this.toolBar._setFontsDropDownData();

                    var generatedFontsCountersObj =_.countBy(this.generatedFontItems, function(generatedFont){
                        return generatedFont.value;
                    });

                    for (i = 0; i < siteCharacterSets.length; i++){
                        var currentCharSet = siteCharacterSets[i],
                            currentCharSetFontsListNoLegacy = _.filter(this.mockFontsList[currentCharSet], isFontWithLegacyPermissions);

                        _.forEach(currentCharSetFontsListNoLegacy,function(fontObject){
                            usedCharSetsCounter = 0;
                            if (fontObject.characterSets.indexOf('latin') !== -1){
                                usedCharSetsCounter++;
                            }
                            if (fontObject.characterSets.indexOf('cyrillic') !== -1){
                                usedCharSetsCounter++;
                            }
                            expect(generatedFontsCountersObj[fontObject.cssFontFamily]).toBe(usedCharSetsCounter);
                        },this);

                    }
                });

                it('should not use legacy fonts', function(){
                    var siteCharacterSets = this.managersMock.Css.getCharacterSets(),
                        usedCharSetsCounter,i;

                    this.toolBar._setFontsDropDownData();

                    var generatedFontsCountersObj =_.countBy(this.generatedFontItems, function(generatedFont){
                        return generatedFont.value;
                    });

                    for (i = 0; i < siteCharacterSets.length; i++){
                        var currentCharSet = siteCharacterSets[i],
                            currentCharSetFontsListLegacyOnly = _.filter(this.mockFontsList[currentCharSet], {'permissions':'legacy'});

                        _.forEach(currentCharSetFontsListLegacyOnly,function(fontObject){
                            expect(generatedFontsCountersObj[fontObject.cssFontFamily]).toBe(undefined);
                        },this);
                    }
                });
            });


            it('Should create a default font option with value of 2', function(){
                this.generatedFontItems = {};

                spyOn(this.toolBar, '_createAndSetDataItem').andCallFake(function(name,key,items){
                    this.generatedFontItems = items;
                }.bind(this));

                this.toolBar._setFontsDropDownData();

                expect(this.generatedFontItems['default'].value).toBe(2);
            });

            it('should use the sprite index provided by CssManager.getFontsData() * -24 on Latin fonts', function(){
                this.generatedFontItems = {};

                spyOn(this.toolBar, '_createAndSetDataItem').andCallFake(function(name,key,items){
                    this.generatedFontItems = items;
                }.bind(this));

                this.toolBar._setFontsDropDownData();

                var latinFontsListNoLegacy = _.filter(this.mockFontsList['latin'],function(fontObject){
                    return fontObject.permissions !== 'legacy';
                });

                for(var i = 0; i < latinFontsListNoLegacy.length; i++){
                    var fontObj = latinFontsListNoLegacy[i];
                    var expectedOffset = fontObj.spriteIndex * -24;
                    expect(this.generatedFontItems['language_6_fontFamily_' + i].spriteOffset.y).toBe(expectedOffset);
                }
            });

            it('should, if the site supports Cyrillic characters, for each font use correct calculated sprite index', function(){

                this.generatedFontItems = {};
                this.managersMock.Css.getCharacterSets = jasmine.createSpy('Css.getCharacterSets').andReturn(['latin', 'cyrillic'])

                spyOn(this.toolBar, '_createAndSetDataItem').andCallFake(function(name,key,items){
                    this.generatedFontItems = items;
                }.bind(this));

                this.toolBar._setFontsDropDownData();



                for(var i = 0; i < this.mockFontsList['cyrillic'].length; i++){
                    var fontObj = this.mockFontsList['cyrillic'][i];
                    var expectedOffset = (fontObj.spriteIndex + fontObj.characterSets.indexOf('cyrillic')) * -24;

                    expect(this.generatedFontItems['language_1_fontFamily_' + i].spriteOffset.y).toBe(expectedOffset);
                }

            });

        });
    });
});


function isFontWithLegacyPermissions(fontObject){
    return (fontObject.legacy === 'legacy');
}