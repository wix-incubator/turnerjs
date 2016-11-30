define(['lodash', 'documentServices/platform/services/sdkAPIService'],
    function (_, sdkAPIService) {
        'use strict';

    describe('editor api mapping', function () {
        it('should build a flat api to rpc', function () {
            var openPanel = _.noop.bind(1);
            var closePanel = _.noop.bind(2);
            var listChildren = _.noop.bind(3);
            var api = {
                editor: {
                    openPanel: openPanel,
                    closePanel: closePanel
                },
                vfs: {
                    listChildren: listChildren
                }
            };

            var sdkAPI = sdkAPIService.getAPIForSDK(api);
            expect(_.get(sdkAPI, 'editor.openPanel')).toBeDefined();
            expect(sdkAPI["editor.openPanel"]).toEqual(openPanel);

            expect(_.get(sdkAPI, 'editor.closePanel')).toBeDefined();
            expect(sdkAPI["editor.closePanel"]).toBe(closePanel);

            expect(_.get(sdkAPI, 'vfs.listChildren')).toBeDefined();
            expect(sdkAPI["vfs.listChildren"]).toBe(listChildren);
        });
    });
});
