define(['lodash', 'testUtils', 'pinterestFollow'], function (_, testUtils, pinterestFollow) {
    'use strict';

    describe('PinterestFollow tests', function () {

        function createPinterestFollowProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(pinterestFollow, _.merge({
                compData:{
                    label: 'Some Label',
                    urlChoice: 'www.pinterest.com/farmers-market/'
                },
                structure: {componentType: 'wysiwyg.viewer.components.PinterestFollow'}
            }, partialProps));
        }

        function createPinterestFollowComp(numberOfItems, partialProps) {
            partialProps = partialProps || {};
            var props = createPinterestFollowProps(partialProps);
            return testUtils.getComponentFromDefinition(pinterestFollow, props);
        }


        describe('Pinterest Follow url', function () {

            beforeEach(function(){
               this.pinterestFollowComp = createPinterestFollowComp();
                this.href = this.pinterestFollowComp.getSkinProperties().followButton.href;
            });

            it('Should start with //www', function () {
                expect(this.href).toStartWith('//www');
            });

            it('Should contain pinterest.com', function () {
                expect(this.href).toContain('pinterest.com');
            });

            it('Should contain pinterest only once', function () {
                var regex = new RegExp(this.pinterestFollowComp.props.compData.urlChoice, 'g');
                expect(this.href.match(regex).length).toBe(1);
            });
        });
    });
});
