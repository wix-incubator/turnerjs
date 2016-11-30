describe("PageHandler", function(){
    testRequire().classes('wysiwyg.viewer.managers.pages.PageHandler',
        'wysiwyg.viewer.managers.pages.data.LocalDataResolver'
    ).components('core.components.base.BaseComp');

    var asyncSpec =  new AsyncSpec(this);

    function fakeWixify(logic){
        var node = this;
        node.$logic = logic && logic.$view ? logic :  {
            '$view': node,
            getComponentId: function(){
                return node.get('id');
            },
            getInlineContentContainer: function(){
                return node;
            }
        };
        node.trigger(Constants.ComponentEvents.WIXIFIED, node.$logic);
    }

    beforeEach(function(){

        this._dataResolver = new this.LocalDataResolver(PageHandlerDataMocks.LocalData);

        var parentNode = new Element('div');
        this._pageNode = new Element('div');
        parentNode.adopt(this._pageNode);

        W.ComponentLifecycle.pause();

        this._wixifySpy = spyOn(Element.prototype, "wixify").andCallFake(fakeWixify);
        window.__specLog = null;
    });

    afterEach(function(){
        W.ComponentLifecycle.run();
        if(window.__specLog){
            window.__specLog['url'] = window.location.href;
            throw JSON.stringify(window.__specLog);
        }
    });


    describe("_addComponentStuffToManagers", function(){
        beforeEach(function(){
            this._savedAnchors = {};
            var self = this;
            spyOn(W.Layout, 'appendSavedAnchor').andCallFake(function(anchors){
                if (self._savedAnchors) {
                    Object.append(self._savedAnchors, anchors);
                } else {
                    self._savedAnchors = anchors;
                }
            });
        });
        asyncSpec.it("should add page comps anchors to saved anchors", function(done){
            var expectedAnchors = {
                'cbxl': [],
                "Cntnr3-qry": [
                    {
                        "distance":160,
                        "topToTop":90,
                        "originalValue":500,
                        "type":"BOTTOM_PARENT",
                        "locked":false,
                        "targetComponent":"cbxl"
                    }
                ],
                'WPht5-rwb':[
                    {
                        "distance":60,
                        "topToTop":40,
                        "originalValue":250,
                        "type":"BOTTOM_PARENT",
                        "locked":true,
                        "targetComponent":"Cntnr3-qry"
                    }
                ],
                'Cntnr4-k7d':[
                    {
                        "distance":150,
                        "topToTop":100,
                        "originalValue":500,
                        "type":"BOTTOM_PARENT",
                        "locked":false,
                        "targetComponent":"cbxl"
                    }
                ]
            };

            var self = this;

            this._dataResolver.getPageData('cbxl').then(function(pageData){
                var clonedPageData = _.cloneDeep(pageData);
                var _pageHandler = new self.PageHandler('cbxl', self._pageNode, self._dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP);

                var newPageData = _pageHandler._addComponentStuffToManagers(pageData);

                expect(self._savedAnchors, "saved anchors are different " + JSON.stringify(self._savedAnchors)).toBeEquivalentTo(expectedAnchors);
                expect(newPageData, "page data was changed during execution " + JSON.stringify(newPageData)).toBeEquivalentTo(clonedPageData);
                done();
            }).done();

        });

//        asyncSpec.it("Q test spec", function(done){
//            window.__specLog ={};
//            window.__specLog['started it'] = 1;
//            var tempP = Q();
//            window.__specLog['got promise'] = tempP ? 1 : 2;
//            tempP.then(function(){
//                window.__specLog['q works'] = 1;
//                done();
//            }).done();
//        });

        asyncSpec.it("should add page comps anchors to saved anchors taking mobile child component and add prefix", function(done){
            var expectedAnchors = {
                'mobile_cbxl': [],
                'mobile_Cntnr4-k7d': [
                    {
                        "distance":10,
                        "topToTop":260,
                        "originalValue":270,
                        "type":"BOTTOM_TOP",
                        "locked":true,
                        "targetComponent":"mobile_Cntnr3-qry"
                    }
                ],
                'mobile_Cntnr3-qry': [
                    {
                        "distance":10,
                        "topToTop":270,
                        "originalValue":450,
                        "type":"BOTTOM_PARENT",
                        "locked":true,
                        "targetComponent":"mobile_cbxl"
                    }
                ],
                'mobile_WPht5-rwb': [
                    {
                        "distance":10,
                        "topToTop":10,
                        "originalValue":170,
                        "type":"BOTTOM_PARENT",
                        "locked":true,
                        "targetComponent":"mobile_Cntnr3-qry"
                    }
                ]
            };

            var self = this;

            this._dataResolver.getPageData('cbxl').then(function(pageData){
                var clonedPageData = _.cloneDeep(pageData);
                var _pageHandler = new self.PageHandler('cbxl', self._pageNode, self._dataResolver, Constants.ViewerTypesParams.TYPES.MOBILE);

                var newPageData = _pageHandler._addComponentStuffToManagers(pageData);

                expect(self._savedAnchors, "saved anchors are different " + JSON.stringify(self._savedAnchors)).toBeEquivalentTo(expectedAnchors);
                expect(newPageData, "page data was changed during execution " + JSON.stringify(newPageData)).toBeEquivalentTo(clonedPageData);
                done();
            }).done();
        });


    });

    describe("create dom and wixify page", function(){
        beforeEach(function(){
            spyOn(W.Preview, 'getPreviewManagers').andReturn(W);
            spyOn(W.Layout, 'appendSavedAnchor');
            this.handler = new this.PageHandler('cbxl', this._pageNode, this._dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP);
        });

        asyncSpec.it("should wixify components", function(done){
            var pageHandler = this.handler;
            this.handler.loadPage()
                .then(function(nodes){
                    _.forEach(nodes.compNodes, function(node){
                        expect(node.$logic).toBeDefined();
                    });
                    expect(_.values(pageHandler._failed).length).toBe(0);
                    done();
                }).done();
        });

        function makeWixifyAsyncOneTime(counterForAsync, wixifySpy){
            var counter = 0;

            wixifySpy.andCallFake(function(){
                if(counter === counterForAsync){
                    var node = this;
                    setTimeout(function(){
                        fakeWixify.apply(node, arguments);
                    }, 0);
                } else{
                    fakeWixify.apply(this, arguments);
                }
                counter++;
            });
        }

        asyncSpec.it("should wixify components with 1st wixify is async", function(done){
            var pageHandler = this.handler;
            makeWixifyAsyncOneTime(0, this._wixifySpy);

            this.handler.loadPage()
                .then(function(nodes){
                    _.forEach(nodes.compNodes, function(node){
                        expect(node.$logic).toBeDefined();
                    });
                    expect(_.values(pageHandler._failed).length).toBe(0);
                    done();
                }).done();
        });

        asyncSpec.it("should wixify components with 2nd wixify is async", function(done){
            var pageHandler = this.handler;
            makeWixifyAsyncOneTime(1, this._wixifySpy);

            this.handler.loadPage()
                .then(function(nodes){
                    _.forEach(nodes.compNodes, function(node){
                        expect(node.$logic).toBeDefined();
                    });
                    expect(_.values(pageHandler._failed).length).toBe(0);
                    done();
                }).done();
        });

    });

    describe("create dom and wixify page with failed comps", function(){
        beforeEach(function(){
            spyOn(W.Preview, 'getPreviewManagers').andReturn(W);
            this.handler = new this.PageHandler('cbxl', this._pageNode, this._dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP);
        });

        function validateFailedArray(pageHandler){
            var failed = _.values(pageHandler._failed);
            expect(failed.length).toBe(1);
            return failed[0];
        }

        asyncSpec.it("should wixify page with a failed component and save the component info", function(done){
            this._wixifySpy.andCallFake(function(){
                if(this.get('id') === "WPht5-rwb"){
                    throw new Error("test error");
                } else{
                    fakeWixify.apply(this, arguments);
                }

            });
            var pageHandler = this.handler;
            this._dataResolver.getPageData('cbxl').then(pageHandler._createPageStructure)
                .then(pageHandler._wixifyPage)
                .then(function(){
                    var compInfo = validateFailedArray(pageHandler);
                    expect(compInfo.message).toBe("test error");
                    expect(compInfo.pageId).toBe("cbxl");
                    expect(compInfo.stack).toBeDefined();
                    done();
                }).done();
        });

        asyncSpec.it("should wixify page with a comp that requested to die and save comp info", function(done){
            var self = this;
            this._wixifySpy.andCallFake(function(){
                if(this.get('id') === "WPht5-rwb"){
                    var logic = new self.BaseComp("WPht5-rwb", this);
                    fakeWixify(logic);
                    logic.requestToDie("dead", {});
                } else{
                    fakeWixify.apply(this, arguments);
                }

            });

            var pageHandler = this.handler;
            this._dataResolver.getPageData('cbxl').then(pageHandler._createPageStructure)
                .then(pageHandler._wixifyPage)
                .then(function(){
                    var compInfo = validateFailedArray(pageHandler);
                    expect(compInfo.message).toBe("dead");
                    expect(compInfo.pageId).toBe("cbxl");
                    expect(compInfo.stack).toBeDefined();
                    done();
                }).done();
        });

        asyncSpec.it("should fail wixify on a page error", function(done){
            this._wixifySpy.andCallFake(function(){
                if(this.get('id') === "cbxl"){
                    throw new Error("test error");
                } else{
                    fakeWixify.apply(this, arguments);
                }

            });
            var pageHandler = this.handler;
            this._dataResolver.getPageData('cbxl').then(pageHandler._createPageStructure)
                .then(pageHandler._wixifyPage)
                .fail(function(){
                    expect(_.values(pageHandler._failed).length).toBe(0);
//                    expect(pageHandler._timedOut.length).toBe(0);
                    done();
                }).done();
        });

        function getNodeWixInfo(nodes, nodeId){
            var node =_.find(nodes.compNodes, function(n){
                return n.get('id') === nodeId;
            });
            return node.wixificationState;
        }

        xit("should wixify page with a timeouted due to missing skin component and save the component info", function(done){
            var pageHandler = this.handler;
            this._dataResolver.getPageData('cbxl').then(
                function(data){
                    var clonedData = _.cloneDeep(data);
                    clonedData.structure.components[0].components[0].skin = "wysiwyg.viewer.skins.area.asdfasdfasdfasdf";
                    clonedData.structure.components[0].components[0].styleId = "asf";
                    return pageHandler._createPageStructure(clonedData)
                })
                .then(pageHandler._wixifyPage)
                .then(function(nodes){
                    var compInfo = validateFailedArrays(pageHandler,true);
                    expect(compInfo.pageId).toBe("cbxl");

                    var nodeWixifyInfo = getNodeWixInfo(nodes, compInfo.domCompId);
                    expect(nodeWixifyInfo.startedLookingForResources).toBeTruthy();
                    expect(nodeWixifyInfo.startedWixify).toBeFalsy();
                    expect(nodeWixifyInfo.wixifyObj.getMissingData()[0]).toBe('skinClass');
                    expect(nodeWixifyInfo.wixifyObj.getMissingData()[1]).toBe('style');
                    done();
                }).done();
        });


    });

    //we don't really wixify any more..
    testDom = function(pageParent){
        expect(pageParent.childNodes.length).toBe(1);
        var pageNode = pageParent.childNodes[0];
        var childComps = pageNode.childNodes;
        expect(childComps.length).toBe(2);
        expect(childComps[0].$logic.getComponentId()).toBe('Cntnr3-qry');
        expect(childComps[1].$logic.getComponentId()).toBe('Cntnr4-k7d');

        var childComps1 = childComps[0].childNodes;
        expect(childComps1.length).toBe(1);
        expect(childComps1[0].$logic.getComponentId()).toBe('WPht5-rwb');

        var childComps2 = childComps[1].childNodes;
        expect(childComps2.length).toBe(0);
    };

    describe("loadPage", function(){
        asyncSpec.it("should build and wixify page", function(done){
            var someParent = new Element('div');
            someParent.adopt(this._pageNode);
            var pageHandler = new this.PageHandler('cbxl', this._pageNode, this._dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP, 500);

            pageHandler.loadPage()
                .then(function(pageId){
                    testDom(someParent);
                    done();
                }).done();
        });
    });

});
