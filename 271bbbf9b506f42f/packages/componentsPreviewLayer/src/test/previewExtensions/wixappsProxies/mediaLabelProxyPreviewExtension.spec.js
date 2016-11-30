define(['previewExtensionsCore'], function (previewExtensionsCore) {

    'use strict';


    describe('mediaLabelProxyPreviewExtension', function () {

        beforeEach(function (done) {
            var MODULE_ID = 'componentsPreviewLayer/previewExtensions/wixappsProxies/mediaLabelProxyPreviewExtension';
            requirejs.undef(MODULE_ID);
            spyOn(previewExtensionsCore.registrar, 'registerProxyExtension');
            require([MODULE_ID], done);
        });


        it('should call previewExtensionsCore.registrar.registerProxyExtension', function () {
            expect(previewExtensionsCore.registrar.registerProxyExtension).toHaveBeenCalled();
        });


        describe('previewExtensionsCore.registrar.registerProxyExtension call arguments', function () {

            var callArguments;


            beforeEach(function () {
                callArguments = previewExtensionsCore.registrar.registerProxyExtension.calls.first().args;
            });


            describe('first (proxyType)', function () {

                it('should be "MediaLabel"', function () {
                    var proxyType = callArguments[0];
                    expect(proxyType).toBe('MediaLabel');
                });

            });


            describe('second (extension)', function () {

                var extension;


                beforeEach(function () {
                    extension = callArguments[1];
                });


                it('should be an object', function () {
                    expect(extension).toEqual(jasmine.any(Object));
                });


                describe('.isViewDefCompChangedInNextProps', function () {

                    it('should be a function', function () {
                        expect(extension.isViewDefCompChangedInNextProps).toEqual(jasmine.any(Function));
                    });


                    describe('return value', function () {

                        it('should be true if called with {viewDef: {comp: {property: "value"}}} in the context {props: {viewDef: {comp: {property: "otherValue"}}}}', function () {
                            var nextProps = {viewDef: {comp: {property: 'value'}}};
                            var context = {props: {viewDef: {comp: {property: 'otherValue'}}}};
                            var isViewDefCompChangedInNextProps = extension.isViewDefCompChangedInNextProps.call(context, nextProps);
                            expect(isViewDefCompChangedInNextProps).toBe(true);
                        });


                        it('should be false if called with {viewDef: {comp: {property: "value"}}} in the context {props: {viewDef: {comp: {property: "value"}}}}', function () {
                            var nextProps = {viewDef: {comp: {property: 'value'}}};
                            var context = {props: {viewDef: {comp: {property: 'value'}}}};
                            var isViewDefCompChangedInNextProps = extension.isViewDefCompChangedInNextProps.call(context, nextProps);
                            expect(isViewDefCompChangedInNextProps).toBe(false);
                        });


                        it('should be true if called with {viewDef: {comp: {otherProperty: "value"}}} in the context {props: {viewDef: {comp: {otherProperty: "otherValue"}}}}', function () {
                            var nextProps = {viewDef: {comp: {otherProperty: 'value'}}};
                            var context = {props: {viewDef: {comp: {otherProperty: 'otherValue'}}}};
                            var isViewDefCompChangedInNextProps = extension.isViewDefCompChangedInNextProps.call(context, nextProps);
                            expect(isViewDefCompChangedInNextProps).toBe(true);
                        });


                        it('should be false if called with {viewDef: {comp: {otherProperty: "otherValue"}}} in the context {props: {viewDef: {comp: {otherProperty: "otherValue"}}}}', function () {
                            var nextProps = {viewDef: {comp: {otherProperty: 'otherValue'}}};
                            var context = {props: {viewDef: {comp: {otherProperty: 'otherValue'}}}};
                            var isViewDefCompChangedInNextProps = extension.isViewDefCompChangedInNextProps.call(context, nextProps);
                            expect(isViewDefCompChangedInNextProps).toBe(false);
                        });

                    });

                });

            });

        });

    });

});