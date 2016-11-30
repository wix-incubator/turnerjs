define(['lodash', 'utils', 'componentsPreviewLayer/previewExtensions/facebookLikePreviewExtension', 'componentsPreviewLayer/previewExtensions/helpers/previewModifications'],
    function (_, utils, facebookLikePreviewExtension, previewModifications) {
        'use strict';

        describe('Facebook Like Preview Extension - ', function () {


            describe('social interaction allowed', function () {

                it('should not create block layer', function () {
                    facebookLikePreviewExtension.props = {
                        isSocialInteractionAllowed: true
                    };

                    var refData = {};

                    facebookLikePreviewExtension.transformRefData(refData);

                    expect(refData).toEqual({});
                });

            });

            describe('social interaction NOT allowed', function () {

                it('should create block layer', function () {
                    spyOn(previewModifications, 'createBlockLayer');

                    facebookLikePreviewExtension.props = {
                        isSocialInteractionAllowed: false
                    };

                    var refData = {
                        '': {
                            onClick: _.noop
                        },
                        iframe: {
                            src: 'www.spider-pig.com'
                        }
                    };

                    facebookLikePreviewExtension.transformRefData(refData);

                    expect(previewModifications.createBlockLayer).toHaveBeenCalledWith(refData, 'wysiwyg.viewer.components.WFacebookLike');
                });

                it('should replace the iFrame src to wix like url', function () {
                    spyOn(previewModifications, 'createBlockLayer');

                    facebookLikePreviewExtension.props = {
                        isSocialInteractionAllowed: false
                    };

                    var refData = {
                        '': {
                            onClick: _.noop
                        },
                        iframe: {
                            src: 'www.spider-pig.com'
                        }
                    };

                    facebookLikePreviewExtension.transformRefData(refData);

                    var iframeUrl = utils.urlUtils.parseUrl(refData.iframe.src);
                    expect(iframeUrl.query.href).toEqual('http://www.wix.com/create/website');
                });

                it('should override the on click action', function () {
                    spyOn(previewModifications, 'createBlockLayer');

                    facebookLikePreviewExtension.props = {
                        isSocialInteractionAllowed: false
                    };

                    var onClick = _.noop;

                    var refData = {
                        '': {
                            onClick: onClick
                        },
                        iframe: {
                            src: 'www.spider-pig.com'
                        }
                    };

                    facebookLikePreviewExtension.transformRefData(refData);

                    expect(refData[''].onClick).not.toEqual(onClick);
                });

            });
        });
    });
