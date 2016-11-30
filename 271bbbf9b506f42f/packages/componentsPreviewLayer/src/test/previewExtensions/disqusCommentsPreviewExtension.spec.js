define(['lodash', 'testUtils', 'utils', 'previewExtensionsCore', 'componentsPreviewLayer/previewExtensions/disqusCommentsPreviewExtension'],
    function (_, testUtils, utils, previewExtensionsCore) {
        'use strict';

        describe('controllerPreviewExtension', function () {
            var extension;
            var previewExtensionsRegistrar = previewExtensionsCore.registrar;

            beforeAll(function (done) {
                var DISQUS_COMMENTS_PREVIEW_EXTENSION_MODULE_ID =
                    'componentsPreviewLayer/previewExtensions/disqusCommentsPreviewExtension';

                require.undef(DISQUS_COMMENTS_PREVIEW_EXTENSION_MODULE_ID);

                spyOn(previewExtensionsRegistrar, 'registerCompExtension').and.callFake(function(compType, ext) {
                    extension = ext;
                });

                require([DISQUS_COMMENTS_PREVIEW_EXTENSION_MODULE_ID], done);

                previewExtensionsCore.registrar.extendCompClasses();
            });

            afterAll(function () {
                previewExtensionsRegistrar.resetAllExtensions();
            });

            it('Should register the extension in the extensions registrar', function () {
                expect(previewExtensionsRegistrar.registerCompExtension.calls.mostRecent().args).toEqual(['wysiwyg.common.components.disquscomments.viewer.DisqusComments', jasmine.any(Object)]);
            });

            describe('when component in editor', function () {
                beforeEach(function () {
                    var siteAPI = testUtils.mockFactory.mockSiteAPI();
                    this.mockedProps = testUtils.mockFactory.mockProps(siteAPI.getSiteData(), siteAPI)
                        .setCompData({disqusId: 'someDisqusId'});
                    this.mockedProps.structure.componentType = 'wysiwyg.common.components.disquscomments.viewer.DisqusComments';

                    spyOn(utils.urlUtils, 'toQueryString').and.callThrough();
                    spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('en');


                });

                it('should use \'editor\' keyword for instanceId generation', function () {
                    spyOn(utils.hashUtils.SHA256, 'hex_sha256');

                    var comp = testUtils.componentBuilder('wysiwyg.common.components.disquscomments.viewer.DisqusComments', this.mockedProps);
                    comp.getDisqusInstanceId();

                    expect(utils.hashUtils.SHA256.hex_sha256).toHaveBeenCalledWith('editor');
                });

                it('should not check if component on master page', function () {
                    var comp = testUtils.componentBuilder('wysiwyg.common.components.disquscomments.viewer.DisqusComments', this.mockedProps);

                    var refData = {
                        key: 'val'
                    };

                    extension.transformRefData.call(comp, refData);

                    expect(refData.disqusCommentsPreviewOverlay.style.display).toEqual('');
                });
            });
        });
    });
