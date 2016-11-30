define(['lodash',
        'documentServices/editorData/composers/WixAppsComposer',
        'documentServices/editorData/composers/GeneralComposer'],
    function(_, WixAppsComposer, GeneralComposer) {
        'use strict';

        var COMPOSERS = {
            wixapps: WixAppsComposer,
            general: GeneralComposer
        };

        /**
         * Returns composed data for a list of composers and their corresponding pages
         *
         * @param {Object} ps
         * @param {Object} pagePointers
         * @returns {Object}
         */
        function getData(ps, pagePointers) {
            var composedData = {};
            _.forEach(COMPOSERS, function(composerClass) {
                var composerKey = composerClass.key;
                composedData[composerKey] = getComposerPagesData(ps, composerClass, pagePointers);
            });

            return composedData;
        }

        /**
         * Returns composed data for given pages
         *
         * @param {Object} ps
         * @param {Object} composerClass
         * @param {Object} pagePointers
         * @returns {Object}
         */
        function getComposerPagesData(ps, composerClass, pagePointers) {
            var data = {};

            _.forEach(pagePointers, function(pagePointer) {
                if (typeof composerClass.compose === 'function') {
                    var pageData = ps.dal.get(pagePointer);
                    var pageId = pageData.structure.id;
                    data[pageId] = composerClass.compose(ps, pageData);
                } else {
                    throw new Error('Composer with key: ' + composerClass.key + ' did not expose/implement the compose function');
                }
            });

            return data;
        }

        return {
            COMPOSERS: COMPOSERS,
            getData: getData,
            getComposerPagesData: getComposerPagesData
        };
});
