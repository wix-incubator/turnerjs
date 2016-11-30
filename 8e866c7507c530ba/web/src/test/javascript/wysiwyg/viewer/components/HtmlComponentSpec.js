describe('HtmlComponent', function () {
    beforeEach(function () {
        var dataItem = W.Data.createDataItem({
            type: 'HtmlComponent',
            sourceType: 'external'
        });

        ComponentsTestUtil.buildComp(
            "wysiwyg.viewer.components.HtmlComponent",
            "wysiwyg.viewer.skins.HtmlComponentSkin",
            dataItem
        );
    });

//    xdescribeExperiment({'IsasharSequrityFixes': 'New'}, "preview mode", function(){
//        it('check that HtmlComponent presents the right URL in the iFrame (external)', function() {
//            var dataItem = W.Data.createDataItem({
//                type:'HtmlComponent',
//                sourceType:'external',
//                url:'http://www.wix.com/'
//            });
//            var logic = this.compLogic;
//            logic.setDataItem(dataItem);
//
//            logic.render();
//
//            expect(logic._iframe.src).toBe(dataItem.get('url'));
//        });
//    });


    it('check that HtmlComponent presents the right URL in the iFrame (tempUrl)', function () {
        var dataItem = W.Data.createDataItem({
            type: 'HtmlComponent',
            sourceType: 'tempUrl',
            url: 'http://www.wix1.com/'
        });
        var logic = this.compLogic;
        logic.setDataItem(dataItem);

        logic.render();

        expect(logic._iframe.src).toBe(dataItem.get('url'));
    });

    it('check that HtmlComponent presents the right URL in the iFrame (htmlEmbedded)', function () {
        var dataItem = W.Data.createDataItem({
            type: 'HtmlComponent',
            sourceType: 'htmlEmbedded',
            url: 'http://www.wix2.com/'
        });
        var logic = this.compLogic;
        logic.setDataItem(dataItem);

        logic.render();

        expect(logic._iframe.src).toBe(dataItem.get('url'));
    });

    it('check that HtmlComponent maximum default height is 5000px', function () {
        var logic = this.compLogic;
        logic._sizeLimits = undefined;
        sl = logic.getSizeLimits();
        expect(sl.maxH).toBe(logic.MAX_HTML_COMPONENT_HEIGHT_DEFAULT);
    });

    //describeExperiment({'HtmlComponentRelativePath':'New'}, 'HtmlComponent', function() {
    describe('Relative Path', function () {
        beforeEach(function () {
            var that = this;
            this.mockHtmlComponentTopologyProperty = 'http://mockusername.wix.com.usrfiles.com/';
//            this._staticTopologyProp = "//static.wixstatic.com";
            spyOn(this.compLogic.resources.W.Config, 'getServiceTopologyProperty').andCallFake(function (param) {
                if (param === 'staticHTMLComponentUrl') {
                    return that.mockHtmlComponentTopologyProperty;
                }
            });
        });

        it('should return absolute urls in a correct absolute url format', function () {
            var expectedUrl = this.mockHtmlComponentTopologyProperty + 'mockId.html',
                actualUrl;
            this.compLogic._data.set('url', expectedUrl);

            actualUrl = this.compLogic.getIFrameSrc();

            expect(actualUrl).toBe(expectedUrl);
        });

        it('should add the "http" protocol to the url if it is missing', function () {
            var urlWithoutProtocol = 'someurl.without.protocol.com/mockId.html',
                expectedUrl = 'http://' + urlWithoutProtocol,
                actualUrl;
            this.compLogic._data.set('url', urlWithoutProtocol);

            actualUrl = this.compLogic.getIFrameSrc();

            expect(actualUrl).toBe(expectedUrl);
        });

        it('should return urls that start with `html/` with `staticHTMLComponentUrl` topology property prefix', function () {
            var urlWithoutTopologyPrefix = 'html/mockId.html',
                expectedUrl = this.mockHtmlComponentTopologyProperty + urlWithoutTopologyPrefix,
                actualUrl;
            this.compLogic._data.set('url', urlWithoutTopologyPrefix);
            this.compLogic._data.set('sourceType', 'tempUrl');

            actualUrl = this.compLogic.getIFrameSrc();

            expect(actualUrl).toBe(expectedUrl);
        });

        it('should only add protocol and not add full topology for relative urls which start with something other than "html/"', function () {
            var mockRelativeUrl = 'something/other/mockId.html',
                expectedUrl = 'http://' + mockRelativeUrl,
                actualUrl;
            this.compLogic._data.set('url', mockRelativeUrl);
            this.compLogic._data.set('sourceType', 'tempUrl');

            actualUrl = this.compLogic.getIFrameSrc();
            expect(actualUrl).toBe(expectedUrl);
        });

        it('should only add protocol (and not full topology url) to relative urls if it is missing', function () {
            var mockRelativeUrl = 'someString/mockId.html',
                expectedUrl = 'http://' + mockRelativeUrl,
                actualUrl;
            this.compLogic._data.set('url', mockRelativeUrl);
            this.compLogic._data.set('sourceType', 'tempUrl');

            actualUrl = this.compLogic.getIFrameSrc();

            expect(actualUrl).toBe(expectedUrl);
        });
    });
//
//    describeExperiment({'IsasharSequrityFixes':'New'}, 'HtmlComponent', function() {
//        beforeEach(function() {
//            this._staticTopologyProp = W.Config.getServiceTopologyProperty("staticServerUrl");
//            this._staticTopologyProp = this._staticTopologyProp.replace('.wix.', '.usrfiles.');
//        });
//
//        it('should return urls that start with `http://` in full', function(){
//            this.compLogic._data.set('url', '//static.wixstatic.com/mockId.html');
//            var result = this.compLogic.getIFrameSrc();
//            expect(result).toBe(this._staticTopologyProp + 'mockId.html');
//        });
//
//        it('should return urls that start with `//static.wixstatic.com` in full', function(){
//            this.compLogic._data.set('url', '//static.wixstatic.com/mockId.html');
//            var result = this.compLogic.getIFrameSrc();
//            expect(result).toBe(this._staticTopologyProp + 'mockId.html');
//        });
//
//        it('should return urls that start with `static.wix.com` with `http` prefix', function(){
//            this.compLogic._data.set('url', 'static.wix.com/mockId.html');
//            var result = this.compLogic.getIFrameSrc();
//            expect(result).toBe(this._staticTopologyProp + 'mockId.html');
//        });
//
//        it('should return urls that start with `html/` with `staticServerUrl` topology property prefix', function(){
//            this.compLogic._data.set('url', 'html/mockId.html');
//            this.compLogic._data.set('sourceType', 'tempUrl');
//            var result = this.compLogic.getIFrameSrc();
//            expect(result).toBe(this._staticTopologyProp + 'html/mockId.html');
//        });
//
//        it('should add `staticServerUrl` topology property to relative urls', function(){
//            this.compLogic._data.set('url', 'mockId.html');
//            this.compLogic._data.set('sourceType', 'tempUrl');
//            var result = this.compLogic.getIFrameSrc();
//            expect(result).toBe(this._staticTopologyProp + 'mockId.html');
//        });
//
//        it('should add `staticServerUrl` topology property to non-matching regex urls', function(){
//            this.compLogic._data.set('url', 'someString/mockId.html');
//            this.compLogic._data.set('sourceType', 'tempUrl');
//            var result = this.compLogic.getIFrameSrc();
//            expect(result).toBe(this._staticTopologyProp + 'someString/mockId.html');
//        });
//    })
});


describe('HtmlComponent getIframeUrl tests', function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.HtmlComponent')
        .resources('W.Data', 'W.Config');

    describe('test url change ', function () {
        beforeEach(function () {
            this.createComponent = function () {
                var that = this,
                    data = this.W.Data.createDataItem({type: 'HtmlComponent'}),
                    viewNode = document.createElement('div');

                this.componentLogic = null;
                this.builder = new this.ComponentBuilder(viewNode);
                this.builder
                    .withType('wysiwyg.viewer.components.HtmlComponent')
                    .withSkin('wysiwyg.viewer.skins.HtmlComponentSkin')
                    .withData(data)
                    .onCreated(function (component) {
                        that.componentLogic = component;
                    })
                    .create();

                waitsFor(function () {
                    return that.componentLogic !== null;
                }, 'Html Component to be ready', 1000);

                runs(function () {
                    var view;
                    this.expect(that.componentLogic).not.toBeNull();
                    view = that.componentLogic.getViewNode();
                    this.expect(view).not.toBeNull();
                });
            };

            this.createComponent();
        });

        it('should add a protocol to the url, if it is missing', function () {
            var urlWithoutProtocol = 'www.wix.com',
                actualUrl,
                logic = this.componentLogic;

            spyOn(logic, 'addProtocolIfMissing').andCallThrough();
            actualUrl = logic.addProtocolIfMissing(urlWithoutProtocol);
            expect(actualUrl).toBeginWith('http://');
            expect(actualUrl).toBeValidUrl();
        });

        it('should not add a protocol if it already present', function () {
            var urlWithProtocol = 'http://www.wix.com',
                actualUrl,
                logic = this.componentLogic;

            spyOn(logic, 'addProtocolIfMissing').andCallThrough();
            actualUrl = logic.addProtocolIfMissing(urlWithProtocol);
            expect(actualUrl).toBeValidUrl();
        });

        it('should use staticHTMLComponentUrl in the server topology', function () {
            var logic = this.componentLogic;
            spyOn(logic.resources.W.Config, 'getServiceTopologyProperty');

            logic.getIFrameSrc();

            expect(logic.resources.W.Config.getServiceTopologyProperty).toHaveBeenCalledWith('staticHTMLComponentUrl');
        });

        it('should replace occurrences of "static.wixstatic.com" with topology url if the sourceType is not external', function () {
            var fakeUrlInData = "//static.wixstatic.com/html/something",
                actualUrl,
                logic = this.componentLogic;

            spyOn(logic._data, 'get').andCallFake(function (key) {
                if (key === 'url') {
                    return fakeUrlInData;
                }
                if (key === 'sourceType') {
                    return 'some-string-which-is-not-external';
                }
                return '';
            });

            spyOn(logic.resources.W.Config, 'getServiceTopologyProperty').andCallFake(function () {
                return 'topology.staticsurl.com';
            });

            actualUrl = logic.getIFrameSrc();

            expect(actualUrl.indexOf('static.wixstatic.com')).toBe(-1);
        });

        it('should not replace occurrences of "static.wixstatic.com" with topology url if the sourceType is external', function () {
            var fakeUrlInData = "//static.wixstatic.com/html/something",
                actualUrl,
                logic = this.componentLogic;

            spyOn(logic._data, 'get').andCallFake(function (key) {
                if (key === 'url') {
                    return fakeUrlInData;
                }
                if (key === 'sourceType') {
                    return 'external';
                }
                return '';
            });

            spyOn(logic.resources.W.Config, 'getServiceTopologyProperty').andCallFake(function () {
                return 'topology.staticsurl.com';
            });

            actualUrl = logic.getIFrameSrc();

            expect(actualUrl.indexOf('static.wixstatic.com')).not.toBe(-1);
        });

    });
});