define(['lodash', 'componentsPreviewLayer/previewExtensions/socialComponentsPreviewExtension',
        'componentsPreviewLayer/previewExtensions/helpers/previewModifications'],
    function (_, socialComponentsPreviewExtension, previewModifications) {
        'use strict';

        describe('socialComponentsPreviewExtension blocking layer', function () {

            it('should call createBlockLayer if isSocialInteractionAllowed is false', function () {
                var mixin = socialComponentsPreviewExtension('wysiwyg.viewer.components.WFacebookComment');
                spyOn(previewModifications, 'createBlockLayer');
                mixin.props = {
                    renderFlags: {
                        isSocialInteractionAllowed: false
                    }
                };

                var refData = {
                    key: 'val',
                    '': {
                        onClick: _.noop
                    }
                };
                mixin.transformRefData(refData);
                expect(previewModifications.createBlockLayer).toHaveBeenCalledWith(refData, 'wysiwyg.viewer.components.WFacebookComment');
            });

            it('should not call createBlockLayer if isSocialInteractionAllowed is true', function () {
                var mixin = socialComponentsPreviewExtension('wysiwyg.viewer.components.WFacebookComment');
                spyOn(previewModifications, 'createBlockLayer');
                mixin.props = {
                    renderFlags: {
                        isSocialInteractionAllowed: true
                    }
                };

                var refData = {
                    key: 'val',
                    '': {
                        onClick: _.noop
                    }
                };
                mixin.transformRefData(refData);
                expect(previewModifications.createBlockLayer).not.toHaveBeenCalled();
            });
        });


        describe('onClick', function () {
            it('should call callback from props on click', function () {
                var mixin = socialComponentsPreviewExtension('wysiwyg.viewer.components.WFacebookComment');

                var spiedCallback = jasmine.createSpy('previewTooltipCallback');

                mixin.props = {
                    renderFlags: {
                        isSocialInteractionAllowed: false
                    },
                    renderRealtimeConfig: {
                        previewTooltipCallback: spiedCallback
                    }
                };

                var refData = {
                    key: 'val',
                    '': {
                        onClick: _.noop
                    }
                };

                var mockBoundingRect = {x: 20, y: 20};

                var mockEvt = {
                    target: {
                        getBoundingClientRect:_.constant(mockBoundingRect)
                    }
                };

                mixin.transformRefData(refData);

                refData[''].onClick(mockEvt);

                expect(spiedCallback).toHaveBeenCalledWith(mockBoundingRect, "PREVIEW_TOOLTIP_GOTO_LIVE_SITE");
            });
        });

    });
