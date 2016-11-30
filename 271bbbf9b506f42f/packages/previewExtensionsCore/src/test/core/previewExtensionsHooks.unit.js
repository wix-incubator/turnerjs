define(['lodash', 'previewExtensionsCore/core/previewExtensionsHooks'],
    function (_, previewExtensionsHooks) {
        'use strict';
        describe('Components Preview Layer - Preview Extensions Hooks', function () {
            describe('public api', function() {
                describe('setHookFn', function() {
                    beforeEach(function () {
                        previewExtensionsHooks.registerSupportedHooks('compA', ['onActionA', 'onActionB']);
                    });

                    it('Should save the hook if supported by the comp', function () {
                        previewExtensionsHooks.public.setHookFn('compA', 'onActionA', _.noop);

                        expect(previewExtensionsHooks.getHookFn('compA', 'onActionA')).toEqual(_.noop);
                    });

                    it('Should throw if a component doesn\'t support hooks', function () {
                        function registerHook() {
                            previewExtensionsHooks.public.setHookFn('compX', 'onActionA', _.noop);
                        }

                        expect(registerHook).toThrow('No supported hooks for component compX');
                    });

                    it('Should throw if a component doesn\'t support a specific hook', function () {
                        function registerHook() {
                            previewExtensionsHooks.public.setHookFn('compA', 'onActionX', _.noop);
                        }

                        expect(registerHook).toThrow("Unsupported hookName for component compA: onActionX");
                    });
                });

                it('getSupportedHooksByCompType should return the supported hooks for a component', function() {
                    previewExtensionsHooks.registerSupportedHooks('compA', ['onActionA', 'onActionB']);

                    expect(previewExtensionsHooks.public.getSupportedHooksByCompType('compA')).toEqual(['onActionA', 'onActionB']);
                });
            });

            describe('internal api', function() {
                describe('registerSupportedHooks', function () {
                    it('should store the supported hooks by compType', function () {
                        previewExtensionsHooks.registerSupportedHooks('compA', ['onActionA', 'onActionB']);

                        function setSupportedHook() {
                            previewExtensionsHooks.public.setHookFn('compA', 'onActionA', _.noop);
                        }
                        function setUnsupportedHook() {
                            previewExtensionsHooks.public.setHookFn('compA', 'onActionX', _.noop);
                        }
                        expect(setSupportedHook).not.toThrow();
                        expect(setUnsupportedHook).toThrow();
                    });
                });

                describe('getHookFn', function() {
                    beforeEach(function () {
                        previewExtensionsHooks.registerSupportedHooks('compB', ['onActionC']);
                        previewExtensionsHooks.public.setHookFn('compA', 'onActionA', _.noop);
                    });

                    it('should return a hook function (if set)', function () {
                        var hook = previewExtensionsHooks.getHookFn('compA', 'onActionA');

                        expect(hook).toEqual(_.noop);
                    });

                    it('Should return null if a hook isn\'t set for the component', function () {
                        var hook = previewExtensionsHooks.getHookFn('compA', 'onActionB');

                        expect(hook).toBeNull();
                    });

                    it('Should return null if no hooks have been set for the component', function () {
                        var hook = previewExtensionsHooks.getHookFn('compB', 'onActionC');

                        expect(hook).toBeNull();
                    });
                });
            });


        });
    });