define([
    'tpaIntegration/driver/driver',
    'tpaIntegration/driver/pingpong',
    'jasmine-boot'
], function (driver, Pingpong) {
    'use strict';

    describe('wix style', function () {


        describe('font themes', function () {
            var compId = 'comp-iuz94kgk';
            var comp;

            beforeAll(function (done) {
                comp = new Pingpong(compId);
                comp.onReady(done);
            });

            it('should replace theme key with theme css value', function (done) {
                var injectedStyleId = 'wix-style-injected';
                var injectedStyleEditorFormatId = 'wix-style-editor-format-injected';

                var wixStyleTpl;
                var wixStyleTplEditorKeyFormat;
                var expected;

                driver.getStyleData(compId, function (styleData) {
                    wixStyleTpl = '<style wix-style="" id="'+injectedStyleId+'">';
                    wixStyleTplEditorKeyFormat = '<style wix-style="" id="'+injectedStyleEditorFormatId+'">';
                    expected = '<style wix-style="" id="">';
                    for (var key in styleData.siteTextPresets) {
                        wixStyleTpl += '.' + key + '{ {{' + key + '}} }';
                        wixStyleTplEditorKeyFormat += '.' + key + '{ {{' + styleData.siteTextPresets[key].editorKey + '}} }';
                        expected += '.' + key + '{ ' + styleData.siteTextPresets[key].value + ' }';
                    }
                    wixStyleTpl += '</style>';
                    wixStyleTplEditorKeyFormat += '</style>';
                    expected += '</style>';

                    debugger;

                    comp.injectDOM(wixStyleTpl, 'head')
                        .then(function () {
                        comp.injectDOM(wixStyleTplEditorKeyFormat, 'head')
                        .then(function () {

                            /*
                            * TODO: after merging and releasing https://github.com/wix-private/js-sdk/pull/148/files
                            * update driver.getSDKUrl version and replace comp.injectScript... line with
                            * comp.injectScript(driver.getSDKUrl(), 'head')
                            * */
                            comp.injectScript(driver.getRunnerDependenciesPath() + 'wixStyleTemplatingRunner/Wix.js', 'head')
                            .then(setTimeout(function () {
                                    comp.getDOMNode('#' + injectedStyleId)
                                        .then(function (evaluatedStyle) {
                                            comp.getDOMNode('#' + injectedStyleEditorFormatId)
                                                .then(function (evaluatedStyleEditorKey) {
                                                    expect(evaluatedStyleEditorKey.replace(injectedStyleEditorFormatId, '')).toEqual(expected);
                                                    expect(evaluatedStyle.replace(injectedStyleId, '')).toEqual(expected);
                                                    done();
                                                });
                                        });
                                }, 300)
                            );
                        });
                    });
                });
            });

        });
    });
});