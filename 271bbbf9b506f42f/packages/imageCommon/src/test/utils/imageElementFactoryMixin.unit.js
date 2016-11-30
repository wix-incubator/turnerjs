define(['react', 'lodash', 'imageCommon', 'utils'], function (React, _, imageCommon, utils) {
    'use strict';

    var imageElementFactoryMixin = imageCommon.imageElementFactoryMixin;

    describe('imageElementFactoryMixin', function () {

        var reactTestUtils = React.addons.TestUtils;

        describe('getImageComponents', function () {

            beforeEach(function () {
                var CompContructor = function () {
                    this.props = {};
                };
                _.assign(CompContructor.prototype, imageElementFactoryMixin);
                this.comp = new CompContructor();

                this.imageTransformObject = {
                    css: {
                        img: {},
                        container: {}
                    },
                    uri: 'mockUri'
                };
            });

            it('should assign load events if events exist', function () {
                var spiedEvents = spyOn(this.comp, 'assignLoadEvents').and.callThrough();
                var onload = _.noop;
                var onerror = _.noop;
                var uri = this.imageTransformObject.uri;

                this.comp.getImageComponents(this.imageTransformObject);
                expect(spiedEvents).not.toHaveBeenCalled();

                this.comp.getImageComponents(this.imageTransformObject, onload, onerror);
                expect(spiedEvents).toHaveBeenCalledWith(onload, onerror, uri);
                expect(this.comp.imageForLoadEvents.onload).toBe(onload);
                expect(this.comp.imageForLoadEvents.onerror).toBe(onerror);
                expect(this.comp.imageForLoadEvents.src).toEqual(uri);

            });

            it('should get image attributes with no filter', function () {
                var spiedGetImage = spyOn(this.comp, 'getImageAttributes').and.callThrough();

                this.comp.getImageComponents(this.imageTransformObject);
                expect(spiedGetImage).toHaveBeenCalledWith(this.imageTransformObject, '', '');

                var imageAttributes = this.comp.getImageAttributes(this.imageTransformObject, '', '');
                expect(imageAttributes.alt).toEqual('');
                expect(imageAttributes.src).toEqual(this.imageTransformObject.uri);
                expect(imageAttributes.style.filter).toBeUndefined();
            });

            it('should get image attributes with filter', function () {
                var imageAttributes = this.comp.getImageAttributes(this.imageTransformObject, 'filterId', '');
                expect(imageAttributes.style.filter).toEqual('url(#filterId)');
                expect(imageAttributes.style.WebkitFilter).toEqual('url(#filterId)');
            });

            it('should get svg attributes if effect name exists', function () {
                var spiedGetSvg = spyOn(this.comp, 'getSvgAttributes').and.callThrough();
                this.comp.props.effectName = 'blur';

                this.comp.getImageComponents(this.imageTransformObject);
                expect(spiedGetSvg).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));

            });

            it('should get filter attributes if effect name exists', function () {
                var spiedGetFilter = spyOn(this.comp, 'getSvgDefsAttributes').and.callThrough();
                var spiedSvgFilters = spyOn(utils.svgFilters, 'getFilter').and.callThrough();
                this.comp.props.effectName = 'blur';

                this.comp.getImageComponents(this.imageTransformObject);
                expect(spiedGetFilter).toHaveBeenCalledWith(this.comp.props.effectName, jasmine.any(String), jasmine.any(Object));
                expect(spiedSvgFilters).toHaveBeenCalledWith(jasmine.any(String), this.comp.props.effectName, jasmine.any(Object));

                var svgDefsAttributes = this.comp.getSvgDefsAttributes(this.comp.props.effectName, 'filterId');
                expect(svgDefsAttributes.dangerouslySetInnerHTML).toEqual(jasmine.any(Object));
                expect(svgDefsAttributes.dangerouslySetInnerHTML.__html).toEqual(jasmine.any(String), jasmine.any(Object));
            });

            it('should return a react component for image', function () {
                var result = this.comp.getImageComponents(this.imageTransformObject);
                expect(result).not.toEqual(jasmine.any(Array));
                expect(reactTestUtils.isElementOfType(result, 'img')).toBeTruthy();

            });

            it('should return an array of react components for image with effect', function () {
                this.comp.props.effectName = 'blur';
                var result = this.comp.getImageComponents(this.imageTransformObject);
                expect(result).toEqual(jasmine.any(Array));
                expect(reactTestUtils.isElement(result[0], 'img')).toBeTruthy();
                expect(reactTestUtils.isElement(result[0], 'svg')).toBeTruthy();
            });

        });

    });
});
