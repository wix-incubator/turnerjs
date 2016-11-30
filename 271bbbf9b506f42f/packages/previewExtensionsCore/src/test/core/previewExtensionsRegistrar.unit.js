define(['lodash', 'siteUtils', 'wixappsCore', 'previewExtensionsCore/core/previewExtensionsRegistrar'],
    function (_, siteUtils, wixapps, previewExtensionsRegistrar) {
        'use strict';

        describe('Components Preview Layer - Preview Extensions', function () {

            describe('registerCompExtension', function () {
                it('Should add the component extension by component to an extensions map', function () {
                    var extension = {
                        some:'extension'
                    };
                    var extendSpy = spyOn(siteUtils.compFactory, 'extend');

                    previewExtensionsRegistrar.registerCompExtension('compTypeA', extension);
                    previewExtensionsRegistrar.extendCompClasses();

                    expect(extendSpy).toHaveBeenCalledWith('compTypeA', extension);
                });
            });

            describe('registerProxyExtension', function () {
                it('Should add the proxy extension', function () {
                    var extension = {
                        some: 'extension'
                    };

                    var extendSpy = spyOn(wixapps.proxyFactory, 'extend');

                    previewExtensionsRegistrar.registerProxyExtension('mock', extension);
                    previewExtensionsRegistrar.extendProxyClasses();

                    expect(extendSpy).toHaveBeenCalledWith('mock', extension);
                });
            });

            describe('registerMixinExtension', function(){
                describe('when the passed mixin already has mixins', function(){
                    it('should add the extension as a mixin of the passed mixin', function(){
                        var extension = {extensionMethod: _.noop};
                        var mixin = {
                            mixins: ['someMixin']
                        };
                        var mixinsBefore = _.clone(mixin.mixins);

                        previewExtensionsRegistrar.registerMixinExtension(mixin, extension);
                        previewExtensionsRegistrar.extendCompMixinClasses();

                        expect(_.includes(mixin.mixins, extension)).toBe(true);
                        expect(mixin.mixins.length).toEqual(mixinsBefore.length + 1);
                    });

                    describe('when a mixin extension is already registered', function(){
                        it('should replace the registered mixin extension with the new passed one', function(){
                            var extensionA = {extensionMethodA: _.noop};
                            var extensionB = {extensionMethodB: _.noop};
                            var mixin = {
                                mixins: ['someMixin']
                            };

                            previewExtensionsRegistrar.registerMixinExtension(mixin, extensionA);
                            previewExtensionsRegistrar.registerMixinExtension(mixin, extensionB);
                            previewExtensionsRegistrar.extendCompMixinClasses();

                            expect(_.includes(mixin.mixins, extensionB)).toBe(true);
                            expect(_.includes(mixin.mixins, extensionA)).toBe(false);
                        });
                    });

                });
                describe('when the passed mixin does not have mixins', function(){
                    it("should add the extension as a mixin of the passed mixin", function(){
                        var extension = {extensionMethod: _.noop};
                        var mixin = {};

                        previewExtensionsRegistrar.registerMixinExtension(mixin, extension);
                        previewExtensionsRegistrar.extendCompMixinClasses();

                        expect(mixin.mixins).toEqual([extension]);
                    });
                });
            });
        });
    });
