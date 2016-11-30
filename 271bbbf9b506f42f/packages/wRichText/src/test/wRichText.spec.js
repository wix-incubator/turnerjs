define(["wRichText", 'lodash', 'testUtils'], function(wRichText, _, /** testUtils */ testUtils) {
    'use strict';

    describe("wRichText", function(){

        function createWRichTextComponent(props) {
            return testUtils.getComponentFromDefinition(wRichText, props);
        }

        function createWRichTextProps(partialProps, siteData) {
            return testUtils.santaTypesBuilder.getComponentProps(wRichText, _.merge({
                structure: {},
                compData: {},
                compProp: {}
            }, partialProps), siteData);
        }

        describe("when sv_safeHtmlString is open", function() {
            beforeEach(function () {
                testUtils.experimentHelper.openExperiments(['sv_safeHtmlString']);
            });

            it("render comp", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                    compData: {
                        text: 'bla'
                    }
                }));

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('bla');
            });

            it("render comp without text", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps());

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('');
            });

            it("render comp with empty text", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                    compData: {
                        text: ''
                    }
                }));

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('');
            });

            it("removes unsafe code", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                    compData: {
                        text: '<!--<SCRIPT/XSS SRC="http://ha.ckers.org/xss.js"></SCRIPT>-->'
                    }
                }));

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('');
            });

            it("removes iframes", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                    compData: {
                        text: '<iframe src="somedomain.com"></iframe>'
                    }
                }));

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('');
            });
        });

        describe("when sv_safeHtmlString is closed", function() {
            it("keeps unsafe code", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                    compData: {
                        text: '<!--<SCRIPT/XSS SRC="http://ha.ckers.org/xss.js"></SCRIPT>-->'
                    }
                }));

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('<!--<SCRIPT/XSS SRC="http://ha.ckers.org/xss.js"></SCRIPT>-->');
            });

            it("render comp", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                    compData: {
                        text: 'bla'
                    }
                }));

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('bla');
            });

            it("render comp without text", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps());

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('');
            });

            it("render comp with empty text", function () {
                var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                    compData: {
                        text: ''
                    }
                }));

                wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);

                expect(wRichTextComp._componentHtml).toEqual('');
            });
        });

        describe("links auto-generation", function(){
            describe("when sv_safeHtmlString is open", function() {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments(['sv_safeHtmlString']);
                });

                it("should render component with auto generated links instead of plain phone numbers, emails and urls", function () {
                    var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                        compData: {
                            text: 'Lorem 0541112222 ipsum dolor@sit.amet, consectetur adipiscing http://elit.Integer.nec/odio?Praesent libero. Sed'
                        },
                        isMobileView: true
                    }));

                    wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);
                    var docFrag = window.document.createDocumentFragment();
                    var container = docFrag.appendChild(window.document.createElement('div'));
                    container.innerHTML = wRichTextComp._componentHtml;

                    var childAnchorsData = _.map(container.querySelectorAll("a"), 'dataset');
                    expect(_.filter(childAnchorsData, {'type': 'phone'}).length).toBe(1);
                    expect(_.filter(childAnchorsData, {'type': 'mail'}).length).toBe(1);
                    expect(_.filter(childAnchorsData, {'type': 'external'}).length).toBe(1);
                });

                it("should not auto generated phone links if not in mobile view", function () {
                    var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                        compData: {
                            text: 'Lorem 0541112222 ipsum'
                        }
                    }));

                    wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);
                    var docFrag = window.document.createDocumentFragment();
                    var container = docFrag.appendChild(window.document.createElement('div'));
                    container.innerHTML = wRichTextComp._componentHtml;

                    var childAnchorsData = _.map(container.querySelectorAll("a"), 'dataset');
                    expect(_.filter(childAnchorsData, {'type': 'phone'}).length).toBe(0);
                });
            });
            describe("when sv_safeHtmlString is closed", function() {
                it("should render component with auto generated links instead of plain phone numbers, emails and urls", function () {
                    var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                        compData: {
                            text: 'Lorem 0541112222 ipsum dolor@sit.amet, consectetur adipiscing http://elit.Integer.nec/odio?Praesent libero. Sed'
                        },
                        isMobileView: true
                    }));

                    wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);
                    var docFrag = window.document.createDocumentFragment();
                    var container = docFrag.appendChild(window.document.createElement('div'));
                    container.innerHTML = wRichTextComp._componentHtml;

                    var childAnchorsData = _.map(container.querySelectorAll("a"), 'dataset');
                    expect(_.filter(childAnchorsData, {'type': 'phone'}).length).toBe(1);
                    expect(_.filter(childAnchorsData, {'type': 'mail'}).length).toBe(1);
                    expect(_.filter(childAnchorsData, {'type': 'external'}).length).toBe(1);
                });

                it("should not auto generated phone links if not in mobile view", function () {
                    var wRichTextComp = createWRichTextComponent(createWRichTextProps({
                        compData: {
                            text: 'Lorem 0541112222 ipsum'
                        }
                    }));

                    wRichTextComp.convertCompDataTextToHTML(wRichTextComp.props);
                    var docFrag = window.document.createDocumentFragment();
                    var container = docFrag.appendChild(window.document.createElement('div'));
                    container.innerHTML = wRichTextComp._componentHtml;

                    var childAnchorsData = _.map(container.querySelectorAll("a"), 'dataset');
                    expect(_.filter(childAnchorsData, {'type': 'phone'}).length).toBe(0);
                });
            });
        });
    });
});
