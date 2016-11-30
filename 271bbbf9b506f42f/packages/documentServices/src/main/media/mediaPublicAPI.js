define(['documentServices/media/globalImageQualityData'], function (imageQuality) {
    'use strict';
    return {
        methods: {
            media: {
                imageQuality: {
                    /**
                     * Get the global quality data item
                     * @returns {object} of schema type GlobalImageQuality
                     */
                    get: imageQuality.get,
                    /**
                     * Update (or create new) the global image quality data item of the site
                     * @param {object} data a GlobalImageQuality data item
                     */
                    update: {dataManipulation: imageQuality.update},
                    /**
                     * Reset the global quality data item (We never remove the item, only its content)
                     */
                    reset: {dataManipulation: imageQuality.reset}
                }
            }
        }
    };
});
