define(['componentsPreviewLayer/previewExtensions/helpers/previewModifications',
        'previewExtensionsCore'],
    function (previewModifications, previewExtensionsCore) {
        'use strict';
        describe('previewModifications helper - ', function () {
            var previewExtensionsHooks = previewExtensionsCore.hooks;
            describe('createBlockLayer - ', function () {
                it('should create a full height/width blocking div in the parent container\'s children', function () {
                    var expectedDivProps = {
                        style: {
                            position: 'absolute',
                            top: '0px',
                            left: '0px',
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer'
                        }
                    };
                    var refData = {};

                    previewModifications.createBlockLayer(refData);

                    var blockingDiv = refData[""].addChildren[0];
                    expect(blockingDiv.props).toContain(expectedDivProps);
                });

                it('should add an onClick event handler that triggers the onLikeBlocked hook', function() {
                    var onLikeBlockedSpy = jasmine.createSpy('onLikeBlocked');
                    spyOn(previewExtensionsHooks, 'getHookFn').and.returnValue(onLikeBlockedSpy);
                    var refData = {};

                    previewModifications.createBlockLayer(refData, 'someCompType', 'someHookName');
                    refData[""].addChildren[0].props.onClick('someEventVar');

                    expect(previewExtensionsHooks.getHookFn).toHaveBeenCalledWith('someCompType', 'someHookName');
                    expect(onLikeBlockedSpy).toHaveBeenCalledWith('someEventVar');
                });
            });
        });
    });
