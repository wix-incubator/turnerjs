describe("PageDeadCompsHandler", function(){

    testRequire().classes('wysiwyg.viewer.managers.pages.PageDeadCompsHandler',
        'wysiwyg.viewer.managers.pages.PageHandler',
        'wysiwyg.viewer.managers.pages.data.LocalDataResolver',
        'wysiwyg.editor.managers.WComponentSerializer')
        .resources('W.Data', 'W.Preview', 'W.ComponentData', 'W.ComponentLifecycle');
    var compId = "mockComp";
    var compType = "mockType";

    function clearData(map){
        var keys = _.keys(map);
        _.forEach(keys, function(key){
            delete map[key];
        });
    }

    beforeEach(function(){
        clearData(W.Theme._styleCache);
        clearData(W.Theme.dataMap);
        delete define._definitions.dataThemeItem.hl2;
        delete define._definitions.dataThemeItem.p2;
        delete define._definitions.dataThemeItem.c1;
        delete define._definitions.dataThemeItem.b1;

        this.handler = new this.PageDeadCompsHandler();
        spyOn(this.handler, '_getDeadCompSkinName').andReturn('mock.viewer.skins.PageDeadCompsHandlerCompSkin');
        this.node = new Element('div', {'id': compId, 'comp': compType});
        this.node.wixificationState = {
            'startedLookingForResources': true,
            'startedWixify': true,
            'wixifyDone': true
        };
        this._getCompByIdSpy = spyOn(this.handler, '_getCompById').andReturn(this.node);
    });

    describe("_getBIJson", function(){
        it("should add comp type", function(){
            var json = this.handler._getBIJson({
                'pageId': 'mockPage',
                'domCompId': compId,
                'message': 'test msg',
                'stack': 'stack'
            });
            expect(json.compType).toBe(compType);
        });

        it("set page id", function(){
            var json = this.handler._getBIJson({
                'pageId': 'mockPage',
                'domCompId': compId,
                'message': 'test msg',
                'stack': 'stack'
            });
            expect(json.pageId).toBe('mockPage');
        });
        it("should set compid to desc", function(){
            var json = this.handler._getBIJson({
                'pageId': 'mockPage',
                'domCompId': compId,
                'message': 'test msg',
                'stack': 'stack'
            });
            expect(json.desc.compId).toBe(compId);
        });

        it("should set error message to desc message", function(){
            var json = this.handler._getBIJson({
                'pageId': 'mockPage',
                'domCompId': compId,
                'message': 'test msg',
                'stack': 'stack'
            });
            expect(json.desc.message).toBe("test msg");
        });

        xit("should shorten stack string", function(){
            var json = this.handler._getBIJson({
                'pageId': 'mockPage',
                'domCompId': compId,
                'message': 'test msg',
                'stack': 'very long stack very long stack very long stack very long stack very long stack very long stack very long stack very long stack very long stack very long stack very long stack '
            });
            json.stack+=json.stack+json.stack+json.stack;
            expect(json.desc.stack.length).toBe(300);
        });

    });

    describe( "_replaceFailedComp", function(){
        beforeEach(function(){
            spyOn(W.Preview, 'getPreviewManagers').andReturn(W);
            spyOn(W.Layout, 'appendSavedAnchor');

            var parentNode = new Element('div');
            this._pageNode = new Element('div');
            parentNode.adopt(this._pageNode);
            var dataResolver= new this.LocalDataResolver(PageDeadCompsMock.pageContainerNBC);

            this._wixifiedNodes = null;
            var self = this;
            var pageHandler = new this.PageHandler('cbxl', this._pageNode, dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP);

            pageHandler.loadPage()
                .then(function(nodes){
                    self._wixifiedNodes = nodes.nodes.compNodes;
                }).done();
            waitsFor(function(){
                return self._wixifiedNodes;
            }, "waiting for nodes to wixify", 5000);
        });

        function getWixifiedNode(compId, nodes){
            return _.find(nodes, function(n){
                return n.get('id') === compId;
            });
        }

        it("_createSignatureNode - should copy only the root node", function(){
            var node = getWixifiedNode('WPht5-rwb', this._wixifiedNodes);
            var newNode = this.handler._createSignatureNode(node);
            expect(newNode.childNodes.length).toBe(0);
            expect(newNode.get('id')).toBeEquivalentTo(node.get('id'));
            expect(newNode.get('comp')).toBeEquivalentTo(node.get('comp'));
            expect(newNode.$logic).toBeUndefined();
        });

        it("should replace the dead comp with an empty comp", function(){
            var node = getWixifiedNode('WPht5-rwb', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);

            var newNode = this.handler._replaceFailedComp({});

            expect(newNode.get('id')).toBeEquivalentTo(node.get('id'));
            expect(newNode.get('comp')).toBeEquivalentTo(node.get('comp'));
            waitsFor(function(){
                return newNode.$logic;
            }, 2000, "waiting for wixify");
            runs(function(){
                expect(newNode.$logic.$className).toBe('wysiwyg.common.components.DeadComponent');
            });
        });

        it("should replace the dead comp with an empty comp NBC", function(){
            var node = getWixifiedNode('FvGrdLn2', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);

            var newNode = this.handler._replaceFailedComp({});

            expect(newNode.get('id')).toBeEquivalentTo(node.get('id'));
            expect(newNode.get('comp')).toBeEquivalentTo(node.get('comp'));
            waitsFor(function(){
                return newNode.$logic;
            }, 2000, "waiting for wixify");
            runs(function(){
                expect(newNode.$logic.$className).toBe('wysiwyg.common.components.DeadComponent');
            });
        });

        it("should render the dead comp OBC", function(){
            var node = getWixifiedNode('WPht5-rwb', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);

            var newNode = this.handler._replaceFailedComp({});

            expect(newNode.get('comp')).toBeEquivalentTo(node.get('comp'));
            expect(newNode.get('skin')).toBeEquivalentTo(node.get('skin'));
            expect(newNode.get('styleid')).toBeEquivalentTo(node.get('styleid'));
            expect(newNode.$logic.$className).toBe('wysiwyg.common.components.DeadComponent');
        });

        it("should leave the attributes as after render", function(){
            var node = getWixifiedNode('WPht5-rwb', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);

            var newNode = this.handler._replaceFailedComp({});

            this.ComponentLifecycle["@testRenderNow"](newNode.$logic);
            waitsFor(function(){
                return newNode.$logic.isReady();
            }, 2000, "waiting for render");
            runs(function() {

                expect(newNode.get('comp')).toBeEquivalentTo(node.get('comp'));
                expect(newNode.get('skin')).toBeEquivalentTo(node.get('skin'));
                expect(newNode.get('styleid')).toBeEquivalentTo(node.get('styleid'));
                expect(newNode.$logic.$className).toBe('wysiwyg.common.components.DeadComponent');
            });
        });

        it("should render the dead comp NBC", function(){
            var node = getWixifiedNode('FvGrdLn2', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);

            var newNode = this.handler._replaceFailedComp({});


            expect(newNode.get('comp')).toBeEquivalentTo(node.get('comp'));
            expect(newNode.get('skin')).toBeEquivalentTo(node.get('skin'));
            expect(newNode.$logic.$className).toBe('wysiwyg.common.components.DeadComponent');
        });

        it("should render the dead comp with received message if there is one", function(){
            var node = getWixifiedNode('FvGrdLn2', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);

            var newNode = this.handler._replaceFailedComp({'messageToUser':{
                'title':'mockTitle',
                'desc1':'mockDesc1',
                'desc2':'mockDesc2'
            }});
            this.ComponentLifecycle["@testRenderNow"](newNode.$logic);
            waitsFor(function(){
                return newNode.$logic.isReady();
            }, 2000, "waiting for render");
            runs(function(){
                var compSkinParts = newNode.$logic._skinParts;
                expect(compSkinParts.title.get('html')).toBe('mockTitle');
                expect(compSkinParts.desc.get('html')).toBe('mockDesc1');
                expect(compSkinParts.desc2.get('html')).toBe('mockDesc2');
            });
        });

        it("should set data and propertied to new comp (for gc)", function(){
            this.W.ComponentData.addDataItem('mainPage_SiteButton_0', {"type":"ButtonProperties",
                "metaData":{
                    "schemaVersion":"1.0"
                },
                "align":"center",
                "margin":0});
            this.W.Data.addDataItem('component_92817', { "type":"SiteButton",
                "id":"component_92817",
                "metaData":{
                    "isPreset":true,
                    "schemaVersion":"1.0",
                    "isHidden":false
                },
                "target":"_self",
                "linkType":"PAGE",
                "href":"#!PRACTICE AREAS|c1iwz",
                "label":"MORE"});

            var node = getWixifiedNode('WPht5-rwb', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);

            var newNode = this.handler._replaceFailedComp({});


            expect(newNode.$logic.getDataItem().get('id')).toBe('component_92817');
            expect(newNode.$logic.getComponentProperties().get('align')).toBe('center');
        });

        it("should be serialized the same as the old one for OBC", function(){
            var node = getWixifiedNode('WPht5-rwb', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);
            var compSerializer = new this.WComponentSerializer();
            spyOn(compSerializer, '_isPageNode').andReturn(false);

            var newNode = this.handler._replaceFailedComp({});

            var serialized = compSerializer.serializeComponent(newNode);
            var dataFromServer = {
                "type":"Component",
                "layout":{
                    "width":80,
                    "height":32,
                    "x":349,
                    "y":643,
                    "scale":1.0,
                    "rotationInDegrees":0.0,
                    "fixedPosition" : false,
                    "anchors":[

                    ]
                },
                "styleId":"b1",
                "id":"WPht5-rwb",
                "dataQuery":"#component_92817",
                "skin":"mock.viewer.skins.PageDeadCompsHandlerSiteButtonSkin",
                "propertyQuery":"mainPage_SiteButton_0",
                "componentType":"wysiwyg.viewer.components.SiteButton"
            };
            expect(_.isEqual(serialized, dataFromServer)).toBeTruthy();
        });

        xit("should be serialized the same as the old one for NBC", function(){
            var node = getWixifiedNode('FvGrdLn2', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);
            var compSerializer = new this.WComponentSerializer();
            spyOn(compSerializer, '_isPageNode').andReturn(false);

            var newNode = this.handler._replaceFailedComp({});

            waitsFor(function(){
                return newNode.$logic && newNode.$logic.isReady();
            }, 2000, "waiting for wixify");
            runs(function(){
                var serialized = compSerializer.serializeComponent(newNode);
                var dataFromServer = {
                    "componentType":"wysiwyg.viewer.components.FiveGridLine",
                    "type":"Component",
                    "id":"FvGrdLn2",
                    "styleId":"hl2",
                    "skin":"mock.viewer.skins.line.PageDeadCompsHandlerHorizontalSolidLine",
                    "layout":{
                        "x":2,
                        "y":51,
                        "width":311,
                        "height":30,
                        "scale":1,
                        "rotationInDegrees":0,
                        "anchors":[

                        ]
                    }
                };
                expect(_.isEqual(serialized, dataFromServer)).toBeTruthy();
            });
        });

        it("should set the class to be the dead comp skin NBC", function(){
            var node = getWixifiedNode('FvGrdLn2', this._wixifiedNodes);
            this._getCompByIdSpy.andReturn(node);
            var compSerializer = new this.WComponentSerializer();
            spyOn(compSerializer, '_isPageNode').andReturn(false);

            var newNode = this.handler._replaceFailedComp({});

            expect(newNode.get('skin')).toBe('mock.viewer.skins.line.PageDeadCompsHandlerHorizontalSolidLine');
            expect(newNode.get('class')).toBe('mock_viewer_skins_PageDeadCompsHandlerCompSkin');
        });

        it("should leave the skin as is even if style is defined", function(){
            W.Theme.addDataItem('hl2', {"type":"TopLevelStyle","id":"hl2","metaData":{"isPreset":false,"schemaVersion":"1.0","isHidden":false},"style":{"propertiesSource":{"brd":"theme","lnw":"value"},"properties":{"alpha-brd":"1","brd":"color_14","lnw":"3px"},"groups":{}},"componentClassName":"","pageId":"","compId":"","styleType":"system","skin":"mock.viewer.skins.line.PageDeadCompsHandlerWORKINGHorizontalSolidLine"});
            var hasStyle = false;
            W.Theme.getStyle('hl2', function(){
                hasStyle = true;
            });

            waitsFor(function(){
                return hasStyle;
            }, 100, "waiting for style");

            var newNode;
            runs(function(){
                var node = getWixifiedNode('FvGrdLn2', this._wixifiedNodes);
                this._getCompByIdSpy.andReturn(node);
                newNode = this.handler._replaceFailedComp({});
                this.ComponentLifecycle["@testRenderNow"](newNode.$logic);
            });


            waitsFor(function(){
                return newNode.$logic.isReady();
            }, 2000, "waiting for render");

            runs(function(){
                var compSerializer = new this.WComponentSerializer();
                spyOn(compSerializer, '_isPageNode').andReturn(false);
                var serialized = compSerializer.serializeComponent(newNode);
                expect(serialized.skin).toBe('mock.viewer.skins.line.PageDeadCompsHandlerHorizontalSolidLine');
            });
        });

    });

});



