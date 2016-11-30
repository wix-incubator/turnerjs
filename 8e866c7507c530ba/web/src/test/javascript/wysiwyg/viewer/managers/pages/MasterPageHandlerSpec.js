describe("MasterPageHandler", function(){
    testRequire().classes('wysiwyg.viewer.managers.pages.MasterPageHandler', 'wysiwyg.viewer.managers.pages.data.LocalDataResolver');

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
        node.trigger(Constants.ComponentEvents.READY, node.$logic);
    }

    beforeEach(function(){
        spyOn(Element.prototype, "wixify").andCallFake(fakeWixify);
        this._pagesContainer = new Element('div');

    });

    describe("_createPagesStubs", function(){
        beforeEach(function(){
            this._dataResolver = new this.LocalDataResolver(MasterPageHandlerDataMocks.LocalData);

            var self = this;
            this._nodes = {
                rootCompNode: {
                    querySelector: function(){
                        return self._pagesContainer;
                    }
                },
                compNodes: []
            };
        });

        it("should create page stub div with attributes", function(){
            var masterPageHandler = new this.MasterPageHandler(this._dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP);

            var nodes = masterPageHandler._createPagesStubs(this._nodes);
            var pageNode = nodes.pageNodes.cbxl;
            expect(pageNode.getAttribute('id')).toBe('cbxl');
            expect(pageNode.getAttribute('comp')).toBe('mobile.core.components.Page');
            expect(pageNode.getAttribute('skin')).toBe('mobile.core.skins.InlineSkin');
            expect(pageNode.getAttribute('dataQuery')).toBe('#cbxl');
        });

        it("should set comp type to app page", function(){
            var masterPageHandler = new this.MasterPageHandler(this._dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP);

            var nodes = masterPageHandler._createPagesStubs(this._nodes);
            var pageNode = nodes.pageNodes.cogy;
            expect(pageNode.getAttribute('comp')).toBe('wixapps.integration.components.AppPage');
        });

        it("should create and attach stub divs", function(){
            var masterPageHandler = new this.MasterPageHandler(this._dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP);

            var nodes = masterPageHandler._createPagesStubs(this._nodes);
            var pageNode = nodes.pageNodes;
            expect(pageNode.cbxl.getAttribute('id')).toBe('cbxl');
            expect(pageNode.cogy.getAttribute('id')).toBe('cogy');
            expect(pageNode.galleryPage.getAttribute('id')).toBe('galleryPage');

            expect(pageNode.cbxl.parentElement).toBe(this._pagesContainer);
            expect(pageNode.cogy.parentElement).toBe(this._pagesContainer);
            expect(pageNode.galleryPage.parentElement).toBe(this._pagesContainer);
        });
    });

    describe("loadPage", function(){
        asyncSpec.it("should wixify master page components and page stubs no wixify", function(done){
            //so that the bg node won't be added and hide the jasmin results
            spyOn(document.body, "insertBefore");
            var parent = document.createElement('div');
            var parentFirstChild = document.createElement('div') ;
            parent.appendChild(parentFirstChild) ;
            this._dataResolver = new this.LocalDataResolver(MasterPageHandlerDataMocks.LocalData);
            var masterPageHandler = new this.MasterPageHandler(this._dataResolver, Constants.ViewerTypesParams.TYPES.DESKTOP);
            spyOn(masterPageHandler, "_getSiteStructureReferenceNode").andReturn(parentFirstChild);

            masterPageHandler.loadMasterSignatureHtml()
                .then(masterPageHandler.wixifyMasterPage.bind(masterPageHandler))
                .then(function(){
                    var site = parent.childNodes[1];
                    expect(parent.childNodes.length).toBe(2);
                    expect(site.childNodes.length).toBe(3);
                    var pagesContainer = site.childNodes[2];
                    expect(pagesContainer.getAttribute('id')).toBe('PAGES_CONTAINER');

                    expect(pagesContainer.childNodes.length).toBe(1);
                    var sitePages = pagesContainer.childNodes[0];
                    expect(sitePages.getAttribute('id')).toBe('SITE_PAGES');
                    expect(sitePages.$logic).toBeDefined();
                    expect(sitePages.childNodes.length).toBe(3);
                    expect(sitePages.childNodes[0].$logic).not.toBeDefined();
                    done();
                }).done();
        });

    });


});