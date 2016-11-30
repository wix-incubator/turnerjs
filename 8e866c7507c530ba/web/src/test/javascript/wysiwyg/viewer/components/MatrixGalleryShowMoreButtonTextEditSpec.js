/**
 * Created with JetBrains WebStorm.
 * User: Denish
 * Date: 05.12.13
 * Time: 9:16
 * To change this template use File | Settings | File Templates.
 */
describe( 'MatrixGalleryShowMoreButtonTextEditSpec', function () {
    var matrixGalleryId = 'test';

    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.MatrixGallery')
        .resources('W.Data', 'W.ComponentLifecycle');

    var componentLogic,
        view,
        data,
        props,
        createComponent = function () {
            var builder = new this.ComponentBuilder(document.createElement('div'));
            componentLogic = null;

            builder.withType('wysiwyg.viewer.components.MatrixGallery')
                .withSkin('mock.viewer.skins.MatrixGalleryMockSkin')
                .withData(data)
                .onCreated(function (component) {
                    componentLogic = component;
//                    componentLogic.setComponentProperties(props);
                    componentLogic.getViewNode().setProperty('id', matrixGalleryId);

                    componentLogic.setWidth(100);
                    componentLogic.setHeight(100);
                })
                .create();

            waitsFor(function () {
                return componentLogic;
            }, "MatrixGallery to be ready", 1000);

            runs(function () {
                this.expect(componentLogic).not.toBeNull();
                view = componentLogic.getViewNode();
                this.expect(view).not.toBeNull();
            });
        };


    beforeEach(function () {
        data = this.W.Data.createDataItem({
            "type": "ImageList",
            'items': 'refList'
        });
        props = this.W.Data.createDataItem({
            'type': 'MatrixGalleryProperties',
            'showMoreLabel': 'Show More'
        });

        createComponent.call(this);
    });

    describe("When the Matrix Gallery is on page", function() {
        it("should come with Show More text by default", function() {
            var defaultOnClickBehaviorProperty = componentLogic.getComponentProperty('showMoreLabel');

            expect(defaultOnClickBehaviorProperty).toBe("Show More");
        });

        it("should come with showMoreLabel property", function() {
            var defaultOnClickBehaviorProperty = componentLogic.getComponentProperty('showMoreLabel');

            expect(defaultOnClickBehaviorProperty).not.toBe(undefined);
        });

//        it('the component textContent should be the same as the label text in the Data', function () {
//            var labelText = "Testing Button Label",
//                actualLabelText,
//                componentProperties = componentLogic.getComponentProperties();
//
//            this.ComponentLifecycle.registerComponent(componentLogic, false);
//            componentProperties.set({showMoreLabel: labelText});
//            this.ComponentLifecycle["@testRenderNow"](componentLogic);
//
//            actualLabelText = componentLogic.$view.textContent;
//            expect(actualLabelText).toEqual(labelText);
//        });
    });

});