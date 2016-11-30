describe('LinkRenderer test suite', function() {

    testRequire().
        classes('wysiwyg.common.utils.LinkRenderer').
        resources('W.Data', 'W.Config', 'W.Viewer');

    function getCleanAchorTag() {
        var link = document.createElement("a");
        link.removeEvents(Constants.CoreEvents.CLICK);
        return link;
    }

    beforeEach(function () {
        this.mockComponent = {
            hasState: function(stateName, stateGroup){},
            removeState: function(stateName, stateGroup){},
            setState: function(stateName, stateGroup){},
            getSkin:  function(){ return {}; },
        };
        this.linkRenderer = new this.LinkRenderer();
        spyOn(this.linkRenderer, '_getViewerManager').andReturn(W.Viewer);
    });


    it("should have a LinkRenderer instance prepared", function () {
        expect(this.linkRenderer).toBeTruthy();
        expect(this.linkRenderer.renderLink).toBeTruthy();
    });


    it("should not perform any changes on a node when given a null/undefined Link DataItem", function () {
        var node1 = document.createElement("a");
        var node2 = document.createElement("a");
        var nullLinkDataItem = null;
        var undefinedLinkDataItem = undefined;

        expect(function () { this.linkRenderer.renderLink(node1, nullLinkDataItem) }).toThrow();
        expect(function () { this.linkRenderer.renderLink(node2, undefinedLinkDataItem) }).toThrow();

        expect(node1.outerHTML).toBe(document.createElement("a").outerHTML);
        expect(node2.outerHTML).toBe(document.createElement("a").outerHTML);
    });


    it("should be able to remove a rendered link from a given node", function () {
        var linkNode = document.createElement("a");
        var linkType = "DocumentLink";
        var data = {
            'id': +new Date(),
            'type': linkType,
            'docId': Number(+new Date()).toString(32),
            'name': "My-Awesome-Document.pdf"
        };
        var linkDataItem = this.W.Data.createDataItem(data, linkType);

        this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);
        this.linkRenderer.removeRenderedLinkFrom(linkNode, this.mockComponent);

        expect(linkNode.getAttribute("href")).toBeFalsy();
        expect(linkNode.getAttribute("target")).toBeFalsy();
    });


    describe('External Links Tests', function (){
        it("should render external link on a node with target = _blank", function () {
            var linkType = "ExternalLink";
            var target = '_blank';
            var linkNode = document.createElement("a");
            var data = {
                'id': +new Date(),
                'type': linkType,
                'url': 'http://www.wix.com',
                'target': target
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.outerHTML).not.toBe(document.createElement("a").outerHTML);
            expect(linkNode.getAttribute("href")).toBe("http://www.wix.com");
            expect(linkNode.getAttribute("target")).toBe(target);
        });

        it("should render external link on a node with target = _self", function () {
            var linkType = "ExternalLink";
            var target = '_self';
            var linkNode = document.createElement("a");
            var data = {
                'id': +new Date(),
                'type': linkType,
                'url': 'http://www.wix.com',
                'target': target
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.outerHTML).not.toBe(document.createElement("a").outerHTML);
            expect(linkNode.getAttribute("href")).toBe("http://www.wix.com");
            expect(linkNode.getAttribute("target")).toBe(target);
        });

        it("should NOT render external link with target = _self inside the editor (preview mode)", function () {
            var linkType = "ExternalLink";
            var target = '_self';
            var linkNode = document.createElement("a");
            var data = {
                'id': +new Date(),
                'type': linkType,
                'url': 'http://www.wix.com',
                'target': target
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            spyOn(this.linkRenderer, '_isViewerInsideEditor').andReturn(true);

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(null);
            expect(linkNode.getAttribute("target")).toBe(null);
        });
    });


    describe('Email Links Tests', function (){
        it("should render an Email link on a node without parameters (subject & body)", function () {
            var linkNode = document.createElement("a");
            var linkType = "EmailLink";
            var data = {
                'id': +new Date(),
                'type': linkType,
                'recipient': "admin123@wix.com"
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = 'mailto:admin123@wix.com';
            var expectedTarget = '_self';

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
        });

        it("should render an Email link on a node with subject parameter", function () {
            var linkNode = document.createElement("a");
            var linkType = "EmailLink";
            var data = {
                'id': +new Date(),
                'type': linkType,
                'recipient': "admin123@wix.com",
                'subject': "test subject"
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = 'mailto:admin123@wix.com?subject=test subject';
            var expectedTarget = '_self';

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
        });

        it("should render an Email link on a node with body parameter", function () {
            var linkNode = document.createElement("a");
            var linkType = "EmailLink";
            var data = {
                'id': +new Date(),
                'type': linkType,
                'recipient': "admin123@wix.com",
                'body': "test body"
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = 'mailto:admin123@wix.com?body=test body';
            var expectedTarget = '_self';

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
        });

        it("should render an Email link on a node with subject & body parameters", function () {
            var linkNode = document.createElement("a");
            var linkType = "EmailLink";
            var data = {
                'id': +new Date(),
                'type': linkType,
                'recipient': "admin123@wix.com",
                'subject': "test subject",
                'body': "test body"
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = 'mailto:admin123@wix.com?subject=test subject&body=test body';
            var expectedTarget = '_self';

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
        });

        it("should render an Email link for property panel", function () {
            var data = {
                'id': +new Date(),
                'type': "EmailLink",
                'recipient': "admin123@wix.com",
                'subject': "test subject",
                'body': "test body"
            };
            var linkDataItem = this.W.Data.createDataItem(data, "EmailLink");
            var expectedValue = 'Email - admin123@wix.com';
            spyOn(this.linkRenderer, '_getPreviewDataManager').andReturn({
                getDataByQuery: function(query){ return null; }
            });

            var actualValue = this.linkRenderer.renderLinkDataItemForPropertyPanel(linkDataItem);

            expect(actualValue).toBe(expectedValue);
        });
    });


    describe('Page Links Tests', function (){
        beforeEach(function () {
            this.linkRenderer = new this.LinkRenderer();
            spyOn(this.linkRenderer, '_getViewerManager').andReturn(W.Viewer);

            //Mock & spy Data Manager (to return mock page data)
            var that = this;
            this.mockPageId = 'some-page-id-abc123';
            this.mockPageTitle = 'some page title';
            this.mockPageUriSEO = 'some-page-address';
            var mockDataManager = {
                getDataByQuery: function(query){
                    if(query !== ('#' + that.mockPageId)) { return null; }
                    return {
                        title: that.mockPageTitle,
                        pageUriSEO: that.mockPageUriSEO,
                        get: function(attrName) {
                            return this[attrName];
                        }
                    };
                }
            };
            spyOn(this.linkRenderer, '_getPreviewDataManager').andReturn(mockDataManager);
            this.linkRenderer.resources.W.Data = mockDataManager;
        });

        it("should render a page link on a node", function () {
            var linkType = "PageLink";
            var linkNode = getCleanAchorTag();
            var data = {
                'id': +new Date(),
                'type': linkType,
                'pageId': "#" + this.mockPageId
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = '#!' + this.mockPageUriSEO +'/some-page-id-abc123';
            var expectedTarget = '_self';
            spyOn(this.linkRenderer, '_isHomePage').andReturn(false);
            spyOn(W.Viewer, 'goToPage');

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);
            linkNode.fireEvent('click', {
                preventDefault: function(){},
                event: { currentTarget: linkNode }
            });

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
            expect(W.Viewer.goToPage).toHaveBeenCalledWith(this.mockPageId);
        });

        it("should handle link to page without page address", function () {
            var linkType = "PageLink";
            var linkNode = getCleanAchorTag();
            var data = {
                'id': +new Date(),
                'type': linkType,
                'pageId': "#" + this.mockPageId
            };
            this.mockPageUriSEO = '';
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = '#!some-page-id-abc123';
            var expectedTarget = '_self';
            spyOn(this.linkRenderer, '_isHomePage').andReturn(false);
            spyOn(W.Viewer, 'goToPage');

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);
            linkNode.fireEvent('click', {
                preventDefault: function(){},
                event: { currentTarget: linkNode }
            });

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
            expect(W.Viewer.goToPage).toHaveBeenCalledWith(this.mockPageId);
        });

        it("should render a HOME PAGE link on a node - relative URL", function () {
            var linkType = "PageLink";
            var linkNode = getCleanAchorTag();
            var data = {
                'id': +new Date(),
                'type': linkType,
                'pageId': "#" + this.mockPageId
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = '#!some-page-address/some-page-id-abc123';
            var expectedTarget = '_self';
            spyOn(this.linkRenderer, '_isHomePage').andReturn(true);

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
        });

        it("should render a HOME PAGE link on a node - absolute URL", function () {
            var siteUrl = 'http://site-url.com';
            var linkType = "PageLink";
            var linkNode = getCleanAchorTag();
            var data = {
                'id': +new Date(),
                'type': linkType,
                'pageId': "#" + this.mockPageId
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedTarget = '_self';
            spyOn(this.linkRenderer, '_isHomePage').andReturn(true);
            spyOn(this.linkRenderer, '_getSiteUrl').andReturn(siteUrl);

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(siteUrl);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
        });

        it("should render a page link for property panel", function () {
            var data = {
                'id': +new Date(),
                'type': "PageLink",
                'pageId': "#" + this.mockPageId
            };
            var linkDataItem = this.W.Data.createDataItem(data, "PageLink");
            var expectedValue = 'Page - ' + this.mockPageTitle;
            spyOn(this.linkRenderer, '_isHomePage').andReturn(false);


            var actualValue = this.linkRenderer.renderLinkDataItemForPropertyPanel(linkDataItem);

            expect(actualValue).toBe(expectedValue);
        });

        it("should render a page link for property panel for a page that DOESN'T EXIST", function () {
            var data = {
                'id': +new Date(),
                'type': "PageLink",
                'pageId': "#pageIdThatDoesNotExist"
            };
            var linkDataItem = this.W.Data.createDataItem(data, "PageLink");
            var expectedValue = '#!pageIdThatDoesNotExist';
            spyOn(this.linkRenderer, '_isHomePage').andReturn(false);
            this.linkRenderer._getPreviewDataManager.andReturn({
                getDataByQuery: function(query){ return null; }
            });

            var actualValue = this.linkRenderer.renderLinkDataItemForPropertyPanel(linkDataItem);

            expect(actualValue).toBe(expectedValue);
        });

        it("should render a page link on a node from a legacy data item (| (pipe) between the page address and pageId)", function () {
            var linkType = "PageLink";
            var legacySeparator = '|';
            var linkNode = getCleanAchorTag();
            var data = {
                'id': +new Date(),
                'type': linkType,
                'pageId': '#!' + this.mockPageUriSEO + legacySeparator + 'some-page-id-abc123'
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = '#!' + this.mockPageUriSEO +'/some-page-id-abc123';
            var expectedTarget = '_self';
            spyOn(this.linkRenderer, '_isHomePage').andReturn(false);
            spyOn(W.Viewer, 'goToPage');

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);
            linkNode.fireEvent('click', {
                preventDefault: function(){},
                event: { currentTarget: linkNode }
            });

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
            expect(W.Viewer.goToPage).toHaveBeenCalledWith(this.mockPageId);
        });
    });


    describe('Document Links Tests', function (){
        it("should render a PDF document link on a node", function () {
            var linkNode = document.createElement("a");
            var linkType = "DocumentLink";
            var data = {
                'id': +new Date(),
                'type': linkType,
                'docId': Number(+new Date()).toString(32) + '.pdf',
                'name': "My-Awesome-Document.pdf"
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = 'http://media.wix.com/ugd/' + data.docId;
            var expectedTarget = '_blank';

            //Mock this value because serviceTopology.staticDocsUrl is not available in tests
            this.linkRenderer.MEDIA_STATIC_URL = 'http://media.wix.com/ugd/';

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
        });

        it("should render a document link on a node (not a PDF)", function () {
            var linkNode = document.createElement("a");
            var linkType = "DocumentLink";
            var data = {
                'id': +new Date(),
                'type': linkType,
                'docId': Number(+new Date()).toString(32) + '.docx',
                'name': "My-Awesome-Document.docx"
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = 'http://media.wix.com/ugd/' + data.docId + '?dn=%22' + data.name + '%22';
            var expectedTarget = '_blank';

            //Mock this value because serviceTopology.staticDocsUrl is not available in tests
            this.linkRenderer.MEDIA_STATIC_URL = 'http://media.wix.com/ugd/';

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(expectedTarget);
        });

        it("should render a document link for property panel", function () {
            var data = {
                'id': +new Date(),
                'type': "DocumentLink",
                'docId': Number(+new Date()).toString(32) + '.docx',
                'name': "My-Awesome-Document.docx"
            };
            var linkDataItem = this.W.Data.createDataItem(data, "DocumentLink");
            var expectedValue = 'Document - My-Awesome-Document.docx';
            spyOn(this.linkRenderer, '_getPreviewDataManager').andReturn({
                getDataByQuery: function(query){ return null; }
            });

            var actualValue = this.linkRenderer.renderLinkDataItemForPropertyPanel(linkDataItem);

            expect(actualValue).toBe(expectedValue);
        });
    });


    describe('LoginToWix Links Tests', function (){
        it("should attach a click event on the node and render an empty link", function () {
            var linkNode = getCleanAchorTag();
            var linkType = "LoginToWixLink";
            var data = {
                'id': +new Date(),
                'type': linkType,
                'postLoginUrl': '',
                'postSignupUrl': '',
                'dialog': ''
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedHrefValue = '#';
            spyOn(this.linkRenderer, '_handleLoginToWixLink').andCallThrough();

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);

            expect(linkNode.getAttribute("href")).toBe(expectedHrefValue);
            expect(linkNode.getAttribute("target")).toBe(null);
            expect(this.linkRenderer._handleLoginToWixLink).toHaveBeenCalledWithEquivalentOf(linkNode, linkDataItem);
        });

        it("should handle the click event on a LoginToWix link node", function () {
            var linkNode = getCleanAchorTag();
            var linkType = "LoginToWixLink";
            var data = {
                'id': +new Date(),
                'type': linkType,
                'postLoginUrl': 'test1',
                'postSignupUrl': 'test2',
                'dialog': 'login'
            };
            var linkDataItem = this.W.Data.createDataItem(data, linkType);
            var expectedArgsArr = [
                data.postSignupUrl, data.postLoginUrl, data.dialog, 'HTML'
            ];

            //Mock the conditions of a wix site (LoginToWix works only in wix sites)
            window['animateForm'] = { callForm: function(argsArr){} };
            spyOn(window.animateForm, 'callForm');

            this.linkRenderer.renderLink(linkNode, linkDataItem, this.mockComponent);
            linkNode.fireEvent('click', { preventDefault: function(){} });

            expect(window.animateForm.callForm).toHaveBeenCalledWithEquivalentOf(expectedArgsArr);
        });

        it("should render a LoginToWix link for property panel", function () {
            var data = {
                'id': +new Date(),
                'type': "LoginToWixLink",
                'postLoginUrl': 'test1',
                'postSignupUrl': 'test2',
                'dialog': 'login'
            };
            var linkDataItem = this.W.Data.createDataItem(data, "LoginToWixLink");
            var expectedValue = 'Login / Signup Dialog';
            spyOn(this.linkRenderer, '_getPreviewDataManager').andReturn({
                getDataByQuery: function(query){ return null; }
            });

            var actualValue = this.linkRenderer.renderLinkDataItemForPropertyPanel(linkDataItem);

            expect(actualValue).toBe(expectedValue);
        });
    });
});