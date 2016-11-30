define(['lodash', 'mediaContainer'], function (_, mediaContainer) {
    'use strict';

    /**
     * @class components.Column
     * @extends {components.MediaContainer}
     */
    var Column = _.cloneDeep(mediaContainer);

    Column.displayName = "Column";

    return Column;
});
