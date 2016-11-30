define([
    "siteUtils", "definition!components/components/mediaRichText/mediaRichText", 'lodash', 'textCommon', 'utils', 'testUtils', 'react', 'fake!santaProps', 'components/bi/errors', 'reactDOM', 'reactDOMServer'
], function(siteUtils, mediaRichTextDef, _, textCommon, utils, /** testUtils */ testUtils, React, fakeSantaProps, errors, ReactDOM, ReactDOMServer) {
    'use strict';

    describe("mediaRichText", function(){
        var mrtDef;

        beforeEach(function(){
            spyOn(textCommon.textComponentsUtils, 'mobileTextTransformIfNeeded').and.callFake(_.identity);
            spyOn(textCommon.textComponentsUtils, 'convertDataQueryLinksIntoHtmlAnchors').and.callFake(_.identity);

            mrtDef = mediaRichTextDef(_, utils, ReactDOM, ReactDOMServer, fakeSantaProps, textCommon, errors, {
                buildGalleryJsonFromCkData: _.noop,
                isGalleryComponent: _.constant(false)
            });

            spyOn(siteUtils.compFactory, "getCompClass").and.returnValue(React.DOM.div);
            spyOn(fakeSantaProps.componentPropsBuilder, "getCompProps").and.returnValue({
                style: {}
            });
            this.props = testUtils.mockFactory.mockProps()
                .setCompData({
                    text: '<img src="innercomp.png" style="margin: 10px 0px 10px 1%; max-width: 100%; width: 24%; float: right;" ' +
                        'wix-comp="{&quot;id&quot;:&quot;innercomp_1&quot;,&quot;dataQuery&quot;:&quot;txtMediaxt3&quot;,&quot;propertyQuery&quot;:&quot;txtMediaxt3&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.WPhoto&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.photo.NoSkinPhoto&quot;,&quot;marginLeft&quot;:&quot;1%&quot;,&quot;marginRight&quot;:&quot;0px&quot;,&quot;dimsRatio&quot;:1.2,&quot;defaultWidth&quot;:205,&quot;width&quot;:0.24,&quot;floatValue&quot;:&quot;right&quot;}">">' +
                        '<img src="innerComp2.png" style="margin: 10px auto; max-width: 100%; clear: both; display: block; outline: rgb(0, 153, 255) solid 2px;" ' +
                        'wix-comp="{&quot;id&quot;:&quot;innercomp_txtMediac8y&quot;,&quot;dataQuery&quot;:&quot;txtMediac8y&quot;,&quot;propertyQuery&quot;:&quot;txtMediac8y&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.WPhoto&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.photo.NoSkinPhoto&quot;,&quot;marginLeft&quot;:&quot;auto&quot;,&quot;marginRight&quot;:&quot;auto&quot;,&quot;dimsRatio&quot;:1.2,&quot;defaultWidth&quot;:205,&quot;display&quot;:&quot;block&quot;}">' +
                        '<img src="http://img.youtube.com/vi/83nu4yXFcYU/0.jpg" style="display: block; clear: both; margin: 10px auto; max-width: 100%; min-width: 240px; width: 100%;" ' +
                        'wix-comp="{&quot;id&quot;:&quot;innercomp_txtMedia16gi&quot;,&quot;dataQuery&quot;:&quot;txtMedia16gi&quot;,&quot;propertyQuery&quot;:&quot;txtMedia16gi&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.Video&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.VideoSkin&quot;,&quot;src&quot;:&quot;&quot;,&quot;minWidth&quot;:&quot;240px&quot;,&quot;minHeight&quot;:&quot;180px&quot;,&quot;videoId&quot;:&quot;83nu4yXFcYU&quot;,&quot;videoType&quot;:&quot;YOUTUBE&quot;,&quot;width&quot;:1,&quot;display&quot;:&quot;block&quot;,&quot;marginLeft&quot;:&quot;auto&quot;,&quot;marginRight&quot;:&quot;auto&quot;,&quot;dimsRatio&quot;:0.7485714285714286,&quot;defaultWidth&quot;:350}">',
                    componentDataList: ["#txtMediaxt3", "#txtMedia16gi"]
                }).setNodeStyle({
                    width: 150,
                    height: 150
                }).setLayout({
                    scale: 1.0
                }).setProps({
                    id: 'mockId1',
                    structure: {
                        id: 'mockId1',
                        componentType: 'wysiwyg.viewer.components.MediaRichText'
                    }
                });
        });

        function removeReactAttributes(text) {
            var withoutReactAttributes = text.replace(/data-reactid="[^"]*"/g, "");
            withoutReactAttributes = withoutReactAttributes.replace(/data-react-checksum="[^"]*"/g, "");
            return withoutReactAttributes;
        }

        it("should remove wrong wix comp data and send bi event", function () {
            var reportBI = spyOn(this.props.siteAPI, "reportBI");
            this.props.compData.text = '<img src="wrongCompData.png" style="margin: 10px 0px 10px 1%; max-width: 100%; width: 24%; float: right;" wix-comp="{slkdmnasndoansdv}">';
            this.props.compData.componentDataList = [];
            this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);

            var reportBiCall = reportBI.calls.first(),
                reportErrorDefinition = reportBiCall.args[0],
                reportErrorParams = reportBiCall.args[1];


            expect(reportBI.calls.count()).toEqual(1);
            expect(_.isEqual(reportErrorDefinition, errors.MEDIA_RICH_TEXT_WRONG_COMP_DATA)).toBeTruthy();
            expect(reportErrorParams.errorDesc).toBeDefined();
            expect(reportErrorParams.errorStack).toBeDefined();

            expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('');
        });

        it("should send bi event for missing data queries", function () {
            var reportBI = spyOn(this.props.siteAPI, "reportBI");
            this.props.compData.text = '';
            this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);

            var expectedErrors = [
                [errors.MEDIA_RICH_MISSING_COMPONENT_PLACEHOLDER, {dataQuery: "#txtMediaxt3"}],
                [errors.MEDIA_RICH_MISSING_COMPONENT_PLACEHOLDER, {dataQuery: "#txtMedia16gi"}]
            ];

            expect(reportBI.calls.count()).toEqual(expectedErrors.length);
            _.forEach(reportBI.calls.all(), function(reportBiCall, key) {
                var reportErrorDefinition = reportBiCall.args[0],
                    reportErrorParams = reportBiCall.args[1],
                    expectedReportErrorDefinition = expectedErrors[key][0],
                    expectedReportErrorParams = expectedErrors[key][1];

                expect(_.isEqual(reportErrorDefinition, expectedReportErrorDefinition)).toBeTruthy();
                expect(_.isEqual(reportErrorParams, expectedReportErrorParams)).toBeTruthy();
            });

            expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('');
        });

        describe("when sv_safeHtmlString is closed", function() {
            it("should remove render unknown component type", function () {
                var reportBI = spyOn(this.props.siteAPI, "reportBI");

                this.props.compData.text = '<img src="/innercomp.png" style="margin: 10px 0px 10px 1%; max-width: 100%; width: 24%; float: right;" ' +
                                                'wix-comp="{&quot;id&quot;:&quot;innercomp_1&quot;,&quot;dataQuery&quot;:&quot;txtMediaxt3&quot;,&quot;propertyQuery&quot;:&quot;txtMediaxt3&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.WPhotoFake&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.photo.NoSkinPhoto&quot;,&quot;marginLeft&quot;:&quot;1%&quot;,&quot;marginRight&quot;:&quot;0px&quot;,&quot;dimsRatio&quot;:1.2,&quot;defaultWidth&quot;:205,&quot;width&quot;:0.24,&quot;floatValue&quot;:&quot;right&quot;}">">';
                this.props.compData.componentDataList = [];
                this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);

                var reportBiCall = reportBI.calls.first(),
                    reportErrorDefinition = reportBiCall.args[0],
                    reportErrorParams = reportBiCall.args[1],
                    expectedParams = {wixCompJson: {id: 'innercomp_1', dataQuery: 'txtMediaxt3', propertyQuery: 'txtMediaxt3', componentType: 'wysiwyg.viewer.components.WPhotoFake', styleId: '', skin: 'wysiwyg.viewer.skins.photo.NoSkinPhoto', marginLeft: '1%', marginRight: '0px', dimsRatio: 1.2, defaultWidth: 205, width: 0.24, floatValue: 'right', url: '/innercomp.png'}};


                expect(reportBI.calls.count()).toEqual(1);

                expect(_.isEqual(reportErrorDefinition, errors.MEDIA_RICH_TEXT_UNSUPPORTED_COMPONENT)).toBeTruthy();
                expect(_.isEqual(reportErrorParams, expectedParams)).toBeTruthy();

                expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<div id="innerContainer_txtMediaxt3"><div style="margin-top:10px;margin-bottom:10px;margin-left:1%;margin-right:0px;position:static;float:right;display:;clear:;width:36px;height:43.199999999999996px;"  ></div></div>"&gt;');
            });

            it("Should render all inner components without errors...", function () {
                var reportBI = spyOn(this.props.siteAPI, "reportBI");

                this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                expect(reportBI).not.toHaveBeenCalled();
                expect(this.comp).toBeDefined();
                expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<div id="innerContainer_txtMediaxt3"><div style="margin-top:10px;margin-bottom:10px;margin-left:auto;margin-right:auto;position:static;float:;display:block;clear:both;width:150px;height:112.28571428571428px;" ></div></div>"&gt;<div id="innerContainer_txtMediac8y"><div style="margin-top:10px;margin-bottom:10px;margin-left:auto;margin-right:auto;position:static;float:;display:block;clear:both;width:150px;height:112.28571428571428px;" ></div></div><div id="innerContainer_txtMedia16gi"><div style="margin-top:10px;margin-bottom:10px;margin-left:auto;margin-right:auto;position:static;float:;display:block;clear:both;width:150px;height:112.28571428571428px;"  ></div></div>');
            });

            it("Should render unsafe code", function() {
                this.props.compData.text = '<p on-click="console.log(\'unsafe code\')">An innocent paragraph</p>';
                this.props.compData.componentDataList = [];
                this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);

                expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<p on-click="console.log(\'unsafe code\')">An innocent paragraph</p>');
            });
        });

        describe("when sv_safeHtmlString is open", function() {
            beforeEach(function() {
                testUtils.experimentHelper.openExperiments(['sv_safeHtmlString']);
            });

            it("Should not render unsafe code", function() {
                this.props.compData.text = '<p on-click="console.log(\'unsafe code\')">An innocent paragraph</p>';
                this.props.compData.componentDataList = [];
                this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);

                expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<p>An innocent paragraph</p>');
            });

            it("should remove render unknown component type", function () {
                var reportBI = spyOn(this.props.siteAPI, "reportBI");

                this.props.compData.text = '<img src="/innercomp.png" style="margin: 10px 0px 10px 1%; max-width: 100%; width: 24%; float: right;" ' +
                                                'wix-comp="{&quot;id&quot;:&quot;innercomp_1&quot;,&quot;dataQuery&quot;:&quot;txtMediaxt3&quot;,&quot;propertyQuery&quot;:&quot;txtMediaxt3&quot;,&quot;componentType&quot;:&quot;wysiwyg.viewer.components.WPhotoFake&quot;,&quot;styleId&quot;:&quot;&quot;,&quot;skin&quot;:&quot;wysiwyg.viewer.skins.photo.NoSkinPhoto&quot;,&quot;marginLeft&quot;:&quot;1%&quot;,&quot;marginRight&quot;:&quot;0px&quot;,&quot;dimsRatio&quot;:1.2,&quot;defaultWidth&quot;:205,&quot;width&quot;:0.24,&quot;floatValue&quot;:&quot;right&quot;}">">';
                this.props.compData.componentDataList = [];
                this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);

                var reportBiCall = reportBI.calls.first(),
                    reportErrorDefinition = reportBiCall.args[0],
                    reportErrorParams = reportBiCall.args[1],
                    expectedParams = {wixCompJson: {id: 'innercomp_1', dataQuery: 'txtMediaxt3', propertyQuery: 'txtMediaxt3', componentType: 'wysiwyg.viewer.components.WPhotoFake', styleId: '', skin: 'wysiwyg.viewer.skins.photo.NoSkinPhoto', marginLeft: '1%', marginRight: '0px', dimsRatio: 1.2, defaultWidth: 205, width: 0.24, floatValue: 'right', url: '/innercomp.png'}};


                expect(reportBI.calls.count()).toEqual(1);

                expect(_.isEqual(reportErrorDefinition, errors.MEDIA_RICH_TEXT_UNSUPPORTED_COMPONENT)).toBeTruthy();
                expect(_.isEqual(reportErrorParams, expectedParams)).toBeTruthy();

                expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<div id="innerContainer_txtMediaxt3"><div style="margin-top:10px;margin-bottom:10px;margin-left:1%;margin-right:0px;position:static;float:right;display:;clear:;width:36px;height:43.199999999999996px;"  ></div></div>"&gt;');
            });

            it("Should render all inner components without errors...", function () {
                var reportBI = spyOn(this.props.siteAPI, "reportBI");

                this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                expect(reportBI).not.toHaveBeenCalled();
                expect(this.comp).toBeDefined();
                expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<div id="innerContainer_txtMediaxt3"><div style="margin-top:10px;margin-bottom:10px;margin-left:auto;margin-right:auto;position:static;float:;display:block;clear:both;width:150px;height:112.28571428571428px;" ></div></div>"&gt;<div id="innerContainer_txtMediac8y"><div style="margin-top:10px;margin-bottom:10px;margin-left:auto;margin-right:auto;position:static;float:;display:block;clear:both;width:150px;height:112.28571428571428px;" ></div></div><div id="innerContainer_txtMedia16gi"><div style="margin-top:10px;margin-bottom:10px;margin-left:auto;margin-right:auto;position:static;float:;display:block;clear:both;width:150px;height:112.28571428571428px;"  ></div></div>');
            });
        });

        describe('Custom Wix Html tags', function() {
            describe("when sv_safeHtmlString is open", function() {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments(['sv_safeHtmlString']);
                });

                it('Should convert custom wline tags to valid HTML', function() {
                    var lineComponent = {
                        customTag:'wline',
                        validTag: 'div'
                    };

                    var nonParsedWithCustomTag = '<' + lineComponent.customTag + '></' + lineComponent.customTag + '>';
                    var convertedHtmlText = '<' + lineComponent.validTag + '></' + lineComponent.validTag + '>';

                    expect(
                      mrtDef._convertComponentsPlaceHoldersToRenderedComponents(nonParsedWithCustomTag)
                    ).toBe(convertedHtmlText);
                });

                it('Should leave unknown custom tags intact', function() {
                    var unknown = {
                        customTag:'sometag',
                        otherTag: 'somediv'
                    };
                    var unknownTagHtml = '<' + unknown.customTag + '></' + unknown.customTag + '>';

                    expect(
                      mrtDef._convertComponentsPlaceHoldersToRenderedComponents(unknownTagHtml)
                    ).toBe(unknownTagHtml);
                });
            });

            describe("when sv_safeHtmlString is closed", function() {
                it('Should convert custom wline tags to valid HTML', function() {
                    var lineComponent = {
                        customTag:'wline',
                        validTag: 'div'
                    };

                    var nonParsedWithCustomTag = '<' + lineComponent.customTag + '></' + lineComponent.customTag + '>';
                    var convertedHtmlText = '<' + lineComponent.validTag + '></' + lineComponent.validTag + '>';

                    expect(
                      mrtDef._convertComponentsPlaceHoldersToRenderedComponents(nonParsedWithCustomTag)
                    ).toBe(convertedHtmlText);
                });

                it('Should leave unknown custom tags intact', function() {
                    var unknown = {
                        customTag:'sometag',
                        otherTag: 'somediv'
                    };
                    var unknownTagHtml = '<' + unknown.customTag + '></' + unknown.customTag + '>';

                    expect(
                      mrtDef._convertComponentsPlaceHoldersToRenderedComponents(unknownTagHtml)
                    ).toBe(unknownTagHtml);
                });
            });

        });

        describe('convert iframe tags', function() {
            beforeEach(function() {
                this.props.siteData.serviceTopology.staticHTMLComponentUrl = 'BASE_URL/';

            });

            describe("when sv_safeHtmlString is open", function() {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments(['sv_safeHtmlString']);
                });

                it('Should render perm html comps', function() {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="100%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;100%&quot;,&quot;align&quot;:&quot;left&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;perm&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="BASE_URL/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:left;" sandbox="allow-scripts allow-same-origin allow-popups" width="100%"></iframe><p class="font_8">&nbsp;</p>');
                });

                it('Should render temp html comps', function() {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="100%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;100%&quot;,&quot;align&quot;:&quot;right&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;temp&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="//0.htmlcomponentservice.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:right;" sandbox="allow-scripts allow-same-origin allow-popups" width="100%"></iframe><p class="font_8">&nbsp;</p>');
                });

                it('Should render urls', function() {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="http://www.walla.com" width="100%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;100%&quot;,&quot;align&quot;:&quot;center&quot;,&quot;type&quot;:&quot;website&quot;,&quot;websiteUrl&quot;:&quot;http://www.walla.com&quot;,&quot;relativeUrl&quot;:&quot;&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="//www.walla.com" style="display: block; clear: both; margin: 0 auto;" sandbox="allow-scripts allow-same-origin allow-popups" width="100%"></iframe><p class="font_8">&nbsp;</p>');
                });
            });

            describe("when sv_safeHtmlString is closed", function() {
                it('Should render perm html comps', function() {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="100%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;100%&quot;,&quot;align&quot;:&quot;left&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;perm&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="BASE_URL/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:left;" sandbox="allow-scripts allow-same-origin allow-popups" width="100%"></iframe><p class="font_8">&nbsp;</p>');
                });

                it('Should render temp html comps', function() {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="100%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;100%&quot;,&quot;align&quot;:&quot;right&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;temp&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="//0.htmlcomponentservice.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:right;" sandbox="allow-scripts allow-same-origin allow-popups" width="100%"></iframe><p class="font_8">&nbsp;</p>');
                });

                it('Should render urls', function() {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="http://www.walla.com" width="100%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;100%&quot;,&quot;align&quot;:&quot;center&quot;,&quot;type&quot;:&quot;website&quot;,&quot;websiteUrl&quot;:&quot;http://www.walla.com&quot;,&quot;relativeUrl&quot;:&quot;&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="//www.walla.com" style="display: block; clear: both; margin: 0 auto;" sandbox="allow-scripts allow-same-origin allow-popups" width="100%"></iframe><p class="font_8">&nbsp;</p>');
                });
            });
        });

        describe('convert iframe tags on mobile', function() {
            beforeEach(function () {
                this.props.id = 'abcd';
                this.props.siteData.serviceTopology.staticHTMLComponentUrl = 'BASE_URL/';
                this.props.siteData.measureMap = {width: {'abcd': '100'}};
                spyOn(this.props.siteData, 'isMobileView').and.returnValue(true);

            });

            describe("when sv_safeHtmlString is open", function() {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments(['sv_safeHtmlString']);
                });

                it('no dims ratio - should be the same as desktop', function () {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="77%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;77%&quot;,&quot;align&quot;:&quot;left&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;perm&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="BASE_URL/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:left;" sandbox="allow-scripts allow-same-origin allow-popups" width="77%"></iframe><p class="font_8">&nbsp;</p>');
                });

                it('dims ratio less than 1 - width 99% height same as desktop', function () {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="77%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;77%&quot;,&quot;align&quot;:&quot;left&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;perm&quot;,&quot;dimsRatio&quot;:&quot;0.5&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="BASE_URL/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:left;" sandbox="allow-scripts allow-same-origin allow-popups" width="99%"></iframe><p class="font_8">&nbsp;</p>');
                });

                it('should be 99% width and height should use ratio', function () {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="77%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;77%&quot;,&quot;align&quot;:&quot;left&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;perm&quot;,&quot;dimsRatio&quot;:&quot;2&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="198px" src="BASE_URL/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:left;" sandbox="allow-scripts allow-same-origin allow-popups" width="99%"></iframe><p class="font_8">&nbsp;</p>');
                });
            });

            describe("when sv_safeHtmlString is closed", function() {
                it('no dims ratio - should be the same as desktop', function () {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="77%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;77%&quot;,&quot;align&quot;:&quot;left&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;perm&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="BASE_URL/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:left;" sandbox="allow-scripts allow-same-origin allow-popups" width="77%"></iframe><p class="font_8">&nbsp;</p>');
                });

                it('dims ratio less than 1 - width 99% height same as desktop', function () {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="77%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;77%&quot;,&quot;align&quot;:&quot;left&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;perm&quot;,&quot;dimsRatio&quot;:&quot;0.5&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="315" src="BASE_URL/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:left;" sandbox="allow-scripts allow-same-origin allow-popups" width="99%"></iframe><p class="font_8">&nbsp;</p>');
                });

                it('should be 99% width and height should use ratio', function () {
                    this.props.compData.text = '<iframe class="htmlComp" frameborder="0" height="315" src="//static.usrfiles.com/html/a8f220_b61de211442761b421ff5d2489b31496.html" width="77%" wix-comp="{&quot;componentType&quot;:&quot;htmlComp&quot;,&quot;width&quot;:&quot;77%&quot;,&quot;align&quot;:&quot;left&quot;,&quot;type&quot;:&quot;htmlCode&quot;,&quot;websiteUrl&quot;:&quot;&quot;,&quot;relativeUrl&quot;:&quot;html/a8f220_b61de211442761b421ff5d2489b31496.html&quot;,&quot;urlStatus&quot;:&quot;perm&quot;,&quot;dimsRatio&quot;:&quot;2&quot;,&quot;classes&quot;:{&quot;htmlComp&quot;:1}}"></iframe><p class="font_8">&nbsp;</p>';

                    this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
                    expect(removeReactAttributes(ReactDOM.findDOMNode(this.comp).innerHTML)).toEqual('<iframe class="htmlComp" frameborder="0" height="198px" src="BASE_URL/html/a8f220_b61de211442761b421ff5d2489b31496.html" style="float:left;" sandbox="allow-scripts allow-same-origin allow-popups" width="99%"></iframe><p class="font_8">&nbsp;</p>');
                });
            });
        });
//
// Example for re-rendering component in test
//       it("test setProps", function (done) {
//            this.comp = testUtils.getComponentFromDefinition(mrtDef, this.props);
//            this.comp.setProps({compData: {text: 'other'}}, function(){
//                //test comp
//                done();
//            });
//
//        });
    });


});
