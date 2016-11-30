define(['testUtils', 'utils', 'lodash', 'components/components/wTwitterTweet/wTwitterTweet'], function (testUtils, utils, _, wTwitterTweet) {
    'use strict';

    describe('WTwitterTweet Component', function () {

        function _createComponent(props) {
            return testUtils.getComponentFromDefinition(wTwitterTweet, props);
        }

        function getIFrameProps(comp) {
            return comp.getSkinProperties().iframe;
        }

        beforeEach(function () {
            this.props = testUtils.mockFactory.mockProps().setCompData({
                defaultText: "someText",
                accountToFollow: "someAccount",
                urlFormat: "hashBang"
            }).setCompProp({
                dataLang: "en"
            }).setNodeStyle({
                width: 60,
                height: 62
            });
            this.props.structure.componentType = 'wysiwyg.viewer.components.WTwitterTweet';

            this.urlParams = {
                'href': 'https://twitter.com/share',
                'lang': this.props.compProp.dataLang,
                'url': 'mockExternalBaseUrl',
                'text': this.props.compData.defaultText,
                'related': this.props.compData.accountToFollow,
                origin: utils.urlUtils.origin(),
                compId: this.props.id,
                widgetType: 'TWEET'

            };
        });

        describe('Skin Properties', function () {

            describe("iFrame structure", function () {

                describe('iFrame Source', function () {

                    it("should have a valid source according to given properties - desktop", function () {
                        var wTwitterTweetComp = _createComponent(this.props),
                            iFrameProps = getIFrameProps(wTwitterTweetComp);

                        expect(iFrameProps.src).toBe('/static/external/twitter.html?' + utils.urlUtils.toQueryString(this.urlParams));
                    });


                    it("should have a valid source according to given properties - mobile", function () {
                        spyOn(this.props.siteData, 'isMobileView').and.returnValue(true);
                        _.assign(this.urlParams, {'size': 'l'});
                        var wTwitterTweetComp = _createComponent(this.props),
                            skinProperties = wTwitterTweetComp.getSkinProperties(),
                            iFrameProps = skinProperties.iframe;

                        expect(iFrameProps.src).toBe('/static/external/twitter.html?' + utils.urlUtils.toQueryString(this.urlParams));
                    });

                    it('Should remove the hash part if in master page', function () {
                        this.props.rootId = 'masterPage';
                        this.props.siteData.currentUrl = {
                            hash: '#currentHash'
                        };

                        var wTwitterTweetComp = _createComponent(this.props);
                        var iFrameSrc = getIFrameProps(wTwitterTweetComp).src;


                        expect(iFrameSrc).toBe('/static/external/twitter.html?' + utils.urlUtils.toQueryString(this.urlParams));
                    });

                    it('should keep the hash part when not in master page or home page', function () {
                        this.props.rootId = 'someOtherPage';
                        var hash = '#!title/pageId';

                        this.props.siteData.currentUrl = {
                            hash: hash
                        };
                        this.props.siteData.setRootNavigationInfo({
                            title: 'title',
                            pageId: 'pageId'
                        });

                        var wTwitterTweetComp = _createComponent(this.props);
                        var iFrameSrc = getIFrameProps(wTwitterTweetComp).src;

                        this.urlParams.url += hash;

                        expect(iFrameSrc).toBe('/static/external/twitter.html?' + utils.urlUtils.toQueryString(this.urlParams));
                    });

                });

                describe('iFrame Style', function () {

                    it("should have size of 100%", function () {
                        var wTwitterTweetComp = _createComponent(this.props),
                            iFrameProps = getIFrameProps(wTwitterTweetComp);

                        expect(iFrameProps.width).toEqual(this.props.style.width);
                        expect(iFrameProps.height).toEqual(this.props.style.height);
                    });

                });

            });

        });

    });
});
