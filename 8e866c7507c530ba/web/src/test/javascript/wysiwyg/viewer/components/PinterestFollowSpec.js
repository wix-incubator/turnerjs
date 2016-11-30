describe("PinterestFollow", function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.PinterestFollow')
        .resources('W.Data', 'W.ComponentLifecycle', 'W.Utils', 'W.Config');

    beforeEach(function () {
        var componentLogicName = 'pinterestButton';
        this[componentLogicName] = null;

        this.createPinterestPinComponent = function () {
            var data = this.W.Data.createDataItem({
                    'type': 'PinterestFollow',
                    'urlChoice': 'killthemall/',
                    'label': 'something something'
                }),
                builder = new this.ComponentBuilder(document.createElement('div'));

            builder
                .withType('wysiwyg.viewer.components.PinterestFollow')
                .withSkin('mock.viewer.skins.PinterestFollowSkin')
                .withData(data)
                ._with("htmlId", "mockId")
                .onWixified(function (component) {
                    this.componentLogic = component;
                }.bind(this))
                .create();

            waitsFor(function () {
                return this.componentLogic;
            }, "Pinterest Follow Button to be ready", 1000);
        };

        this.createPinterestPinComponent(componentLogicName);

    });

    describe('tests for the components structure', function () {
        it('should contain exactly two DIV tags', function () {
            expect(this.componentLogic._skinParts.followButton.getElementsByTagName('DIV').length).toBe(2);
        });
//        it('should contain exactly one A tag', function () {
//            expect(this.componentLogic._skinParts.followButton.getElementsByTagName('A').length).toBe(1);
//        });
        it('should contain exactly two child elements', function () {
            expect(this.componentLogic._skinParts.followButton.children.length).toBe(2);
        });
    });

    describe('tests for the components href value', function () {
        it('the share url must begin with "//pinterest.com/"', function () {
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            var hrefUrl = this.componentLogic._skinParts.followButton.getAttribute('href'),
                prefix = '//www.pinterest.com/';

            expect(hrefUrl).toBeginWith(prefix);
        });
    });

    describe('tests for components dataSchema', function () {
        it('the component textContent should be the same as the label text in the Data', function () {
            var labelText = "testing description",
                actualLabelText;

            this.componentLogic.getDataItem().setFields({label: labelText});
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

            actualLabelText = this.componentLogic.$view.textContent;
            expect(actualLabelText).toEqual(labelText);
        });

        it('The url in href attribute should equal the url in the data schema', function () {
            var hrefAttribute = 'myfakepinterestpage/',
                actualUrl;

            this.componentLogic.getDataItem().setFields({urlChoice: hrefAttribute});
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            actualUrl = this.componentLogic._skinParts.followButton.getAttribute('href');
            hrefAttribute = "//www.pinterest.com/" + hrefAttribute;

            expect(actualUrl).toBe(hrefAttribute);
        });

        it('A tag should contain the target="_blank" attribute', function () {
            var targetValue = this.componentLogic._skinParts.followButton.getAttribute('target');

            expect(targetValue).toBe("_blank");
        });

    });
});
