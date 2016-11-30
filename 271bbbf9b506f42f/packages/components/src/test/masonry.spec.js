define(['lodash', 'testUtils', 'components/components/galleries/masonry'], function (_, testUtils, masonry) {
    'use strict';

    describe('Masonry component', function () {

        var styleProps = {
            textColor: '#fff',
            descriptionColor: '#fff',
            textBackgroundColor: '#000',
            backgroundMouseoverColor: '#fff',
            textButtonColor: '#000'
        };

        var mockTpaPostMessageAspect = {
            sendPostMessage: function () {
            }
        };

        var mockImageItems;

        function createMockMasonry(styleProperties) {
            var props = testUtils.mockFactory.mockProps();
            var mockData = props.siteData.mock;
            mockImageItems = [mockData.imageData()];
            props.setCompData(mockData.imageList({items: mockImageItems}))
                .setCompProp({
                    mockProp1: 'mockProp1'
                }).setThemeStyle({
                    style: {
                        properties: styleProperties
                    },
                    id: 'mockStyleId'
                });
            props.structure.componentType = 'tpa.viewer.components.Masonry';

            props.siteData.getColor = function () {
                return '1,2,3';
            };
            props.siteData.publicModel = {externalBaseUrl: 'externalBaseUrl'};
            props.siteAPI.registerMockSiteAspect('tpaPostMessageAspect', mockTpaPostMessageAspect);

            return testUtils.getComponentFromDefinition(masonry, props);
        }

        beforeEach(function() {
           this.masonryComp = createMockMasonry(styleProps);
        });

        describe('Testing patchMessageProps behavior', function() {

            var version1LegacyStyles = {
                textColor: '#000',
                descriptionColor: '#000',
                textBackgroundColor: '#fff',
                backgroundMouseoverColor: '#000',
                alphaBackgroundMouseoverColor: 0.4
            };

            it('Should override style properties when version is undefined ( or equals to 1 )', function() {

                var messageProps = {
                    version: undefined,
                    textColor: 'color',
                    descriptionColor: 'color',
                    textBackgroundColor: 'color',
                    backgroundMouseoverColor: 'color',
                    alphaBackgroundMouseoverColor: 0.1
                };

                spyOn(this.masonryComp, 'getStyleData').and.returnValue(messageProps);

                this.masonryComp.patchMessageProps(messageProps);

                expect(messageProps).toEqual(jasmine.objectContaining(version1LegacyStyles));
            });

            it('Should replace messageProps with legacy version1 styles ( version is undefined )', function() {

                var messageProps = {
                    version: undefined
                };

                spyOn(this.masonryComp, 'getStyleData').and.returnValue(messageProps);

                this.masonryComp.patchMessageProps(messageProps);

                expect(messageProps).toEqual(jasmine.objectContaining(version1LegacyStyles));
            });

            it('Should replace messageProps with legacy version1 styles ( version equals to 1 )', function() {

                var messageProps = {
                    version: '1'
                };

                spyOn(this.masonryComp, 'getStyleData').and.returnValue(messageProps);

                this.masonryComp.patchMessageProps(messageProps);

                expect(messageProps).toEqual(jasmine.objectContaining(version1LegacyStyles));
            });

            it('Should not replace messageProps with legacy version1 styles ( version equals to 2 )', function() {

                var messageProps = {
                    version: '2'
                };

                spyOn(this.masonryComp, 'getStyleData').and.returnValue(messageProps);

                var origMessageProps = _.clone(messageProps);

                this.masonryComp.patchMessageProps(messageProps);

                expect(messageProps).toEqual(origMessageProps);
            });
        });

    });

});
