define(['testUtils', 'textCommon/utils/filterHtmlString'], function (testUtils, filterHtmlString) {
    'use strict';

    describe("fix text security issues", function () {

        beforeEach(function () {
            testUtils.experimentHelper.openExperiments(['sv_safeHtmlString']);
        });

        describe("allow wix links", function() {
            it("should allow dataquery on a tags", function(){
                this.htmlString = '<a dataquery="#link_id">Test1</a>gaga';
                expect(filterHtmlString(this.htmlString)).toEqual('<a dataquery="#link_id">Test1</a>gaga');
            });
        });

        describe("tests that should remove unsecure text parts", function(){
            it("should remove script inside href attribute", function(){
                this.htmlString = '<a href="JaVaScriPt:alert(Hi);">Test1</a>gaga';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href>Test1</a>gaga');
            });

            it("should remove script with spaces inside href attribute", function(){
                this.htmlString = '<a href = "    javaScript:alert(Hi)">Test2</a>';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href>Test2</a>');
            });

            it("should remove script with spaces inside href attribute and leave script word as regular text", function(){
                this.htmlString = '<a href = "java    script:alert(Hi)">Test my Script</a     >';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href>Test my Script</a>');
            });

            it("should remove attribute - onClick with spaces and leave same attribute as regular text", function(){
                this.htmlString = '<a href="#" alt="lala" Onclick    = "alert(Hi)">Test OnClick=alert(Hi)</a>';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href="#">Test OnClick=alert(Hi)</a>');
            });

            it("should remove attribute - onDragLeave", function(){
                this.htmlString = '<a href="" onDragLeave="alert(Hi)">zaza</a>';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href>zaza</a>');
            });

            it("should remove script with encoded chars inside href", function(){
                this.htmlString = '<a href="jav&#x0A;ascript:alert(Hi);">gaga</a>';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href>gaga</a>');
            });

            it("should remove script with encoded chars inside href", function(){
                this.htmlString = '<a href="jav&#x09;ascript:alert(Hi);">baga</a>';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href>baga</a>');
            });

            it("should remove script from image src", function(){
                this.htmlString = '<img src=" javascript:alert(Hi);"/>';
                expect(filterHtmlString(this.htmlString)).toEqual('<img src />');
            });

            it("should remove comments with script inside", function(){
                this.htmlString = '<!--<SCRIPT/XSS SRC="http://ha.ckers.org/xss.js"></SCRIPT>-->';
                expect(filterHtmlString(this.htmlString)).toEqual('');
            });

            it("should remove other comments with script inside", function(){
                this.htmlString = '<!--    <<SCRIPT>alert("XSS");//<</SCRIPT>   -->';
                expect(filterHtmlString(this.htmlString)).toEqual('');
            });

            it("should remove other comments with script inside", function(){
                this.htmlString = '<!--    <<SCRIPT>alert("XSS");//<</SCRIPT>   -->';
                expect(filterHtmlString(this.htmlString)).toEqual('');
            });

            it("should escape script tag", function(){
                this.htmlString = '<SCRIPT>alert("XSS");</SCRIPT>';
                expect(filterHtmlString(this.htmlString)).toEqual('');
            });

            it("should escape unknown tag", function(){
                this.htmlString = '<sometag>alert("XSS");</sometag>';
                expect(filterHtmlString(this.htmlString)).toEqual('');
            });

            it("should remove expression from style attribute but leave expression as regular text", function(){
                this.htmlString = '<header style="xss:expression(alert(Hi))">xss:expression(alert(Hi))</header>';
                expect(filterHtmlString(this.htmlString)).toEqual('<header style>xss:expression(alert(Hi))</header>');
            });

            it("should remove expression with spaces from style attribute", function(){
                this.htmlString = '<DIV STYLE="width: expression(alert(XSS));">haha</DIV>';
                expect(filterHtmlString(this.htmlString)).toEqual('<div style>haha</div>');
            });
        });

        describe("report on ignored attribures", function(){
            beforeEach(function() {
                testUtils.experimentHelper.openExperiments(['sv_textCompFilter']);
            });

            it("should report on removed tags", function() {
                var filteredContent = {};
                var expectedObj = {tags: [{tagName: 'iframe', count: 1}], attrs: [], attrValues: []};

                this.htmlString = '<div><iframe src="http://somedomain.com"></iframe><p>some other text</p></div>';
                filterHtmlString(this.htmlString, false, 'testComp', 123, function(eId, eDetails) {
                    filteredContent = JSON.parse(eDetails.filtered_content);
                });

                expect(JSON.stringify(filteredContent)).toEqual(JSON.stringify(expectedObj));
            });

            it("should report on removed attributes", function() {
                var filteredContent = {};
                var expectedObj = {tags: [], attrs: [{tagName: 'div', attrName: 'onclick', count: 1}], attrValues: []};

                this.htmlString = '<div onClick="hackComputer()"></div>';
                filterHtmlString(this.htmlString, false, 'testComp', 123, function(eId, eDetails) {
                    filteredContent = JSON.parse(eDetails.filtered_content);
                });

                expect(JSON.stringify(filteredContent)).toEqual(JSON.stringify(expectedObj));
            });

            it("should report on removed values", function() {
                var filteredContent = {};
                var expectedObj = {tags: [], attrs: [], attrValues: [{tagName: 'a', attrName: 'href', attrValue: 'javaScript:alert(Hi)', count: 1}]};// eslint-disable-line no-script-url

                this.htmlString = '<a href = "javaScript:alert(Hi)">Test2</a>';
                filterHtmlString(this.htmlString, false, 'testComp', 123, function(eId, eDetails) {
                    filteredContent = JSON.parse(eDetails.filtered_content);
                });

                expect(JSON.stringify(filteredContent)).toEqual(JSON.stringify(expectedObj));
            });

            it("should not report on anything", function() {
                var filteredContent = {};
                var expectedObj = {};

                this.htmlString = '<div><a href = "#someLocation">Test2</a><p>some paragraph</p></div>';
                filterHtmlString(this.htmlString, false, 'testComp', 123, function(eId, eDetails) {
                    filteredContent = JSON.parse(eDetails.filtered_content);
                });

                expect(JSON.stringify(filteredContent)).toEqual(JSON.stringify(expectedObj));
            });
        });

        describe("handle iframes", function() {
            it("should remove iframe tag", function(){
                this.htmlString = '<iframe src="http://somedomain.com"></iframe>';
                expect(filterHtmlString(this.htmlString)).toEqual('');
            });

            it("should keep iframe tag", function(){
                this.htmlString = '<iframe src="http://somedomain.com"></iframe>';
                expect(filterHtmlString(this.htmlString, true)).toEqual('<iframe src="http://somedomain.com"></iframe>');
            });

            it("should keep iframe tag and remove unsafe code", function(){
                this.htmlString = '<iframe src="javascript:alert(Hi);" on-click="maliciousCode()"></iframe>';
                expect(filterHtmlString(this.htmlString, true)).toEqual('<iframe src></iframe>');
            });
        });

        describe("tests that should pass secure text parts", function(){
            it("should pass regular text with javascript word", function(){
                this.htmlString = '<a href="">JaVascript:alert(Hi);</a>';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href>JaVascript:alert(Hi);</a>');
            });

            it("should pass regular text with javascript word", function(){
                this.htmlString = 'Test my Script';
                expect(filterHtmlString(this.htmlString)).toEqual('Test my Script');
            });

            it("should pass regular text with onClick word", function(){
                this.htmlString = '<a href="#" alt="lala">Test OnClick=alert(Hi)</a>';
                expect(filterHtmlString(this.htmlString)).toEqual('<a href="#">Test OnClick=alert(Hi)</a>');
            });

            it("should pass regular img tag", function(){
                this.htmlString = '<img src="http://domain.com/some/image.jpg" />';
                expect(filterHtmlString(this.htmlString)).toEqual('<img src="http://domain.com/some/image.jpg" />');
            });

            it("should pass regular text with expression word", function(){
                this.htmlString = '<div style="width:15px;">xss:expression(alert(Hi))</div>';
                expect(filterHtmlString(this.htmlString)).toEqual('<div style="width:15px;">xss:expression(alert(Hi))</div>');
            });

            it("should pass regular div tag", function(){
                this.htmlString = '<DIV STYLE="width:100%">haha</DIV>';
                expect(filterHtmlString(this.htmlString)).toEqual('<div style="width:100%;">haha</div>');
            });

            it("should pass class attribute ", function(){
                this.htmlString = '<p class="some-class">haha</p>';
                expect(filterHtmlString(this.htmlString)).toEqual('<p class="some-class">haha</p>');
            });

            it("should pass data-anchor attribute on <a> tags", function(){
                this.htmlString = '<a data-anchor="blah">haha</a>';
                expect(filterHtmlString(this.htmlString)).toEqual('<a data-anchor="blah">haha</a>');
            });

            it("should pass dir attribute", function(){
                this.htmlString = '<p dir="ltr">haha</p>';
                expect(filterHtmlString(this.htmlString)).toEqual('<p dir="ltr">haha</p>');
            });

            it("should pass <hatul> tag with 'class' attribute", function(){
                this.htmlString = '<hatul class="what-the-hell-is-this-tag">haha</hatul>';
                expect(filterHtmlString(this.htmlString)).toEqual('<hatul class="what-the-hell-is-this-tag">haha</hatul>');
            });
        });
    });
});
