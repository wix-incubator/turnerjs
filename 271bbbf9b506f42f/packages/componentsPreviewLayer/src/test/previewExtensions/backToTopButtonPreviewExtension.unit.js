define(['lodash', 'componentsPreviewLayer/previewExtensions/backToTopButtonPreviewExtension'],
    function (_, backToTopButtonPreviewExtension) {
        'use strict';

        describe('backToTopButtonPreviewExtension - ', function () {

            describe('back to top allowed', function() {

                it('should NOT add display:none to refData root', function() {
                    backToTopButtonPreviewExtension.props = {
                        isBackToTopButtonAllowed: true
                    };
                    var refData = {
                        style: {
                            display: 'block'
                        }
                    };

                    backToTopButtonPreviewExtension.transformRefData(refData);

                    expect(refData).toEqual({
                        style: {
                            display: 'block'
                        }
                    });
                });

            });

            describe('back to top NOT allowed', function() {

                it('should add display:none to refData root', function() {
                    backToTopButtonPreviewExtension.props = {
                        isBackToTopButtonAllowed: false
                    };
                    var refData = {
                        style: {
                            display: 'block'
                        }
                    };

                    backToTopButtonPreviewExtension.transformRefData(refData);

                    expect(refData[''].style.display).toEqual('none');
                });

            });

        });

    });
