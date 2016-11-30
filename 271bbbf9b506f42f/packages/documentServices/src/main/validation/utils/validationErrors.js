define(['lodash'], function (_) {
    'use strict';

    var dataPathErrorTemplate = _.template("Expected comp {id: <%= compId %>} to have {id: <%= query %>} in the <%= type %> map, in page <%= pageId %>");

    /**
     *
     * @param {{
     *  compId: string,
     *  query: string,
     *  type: string,
     *  pageId: string
     * }} errorOptions
     *
     * @constructor
     */
    function DataPathError(errorOptions) {
        this.name = 'DataPathError';
        this.message = dataPathErrorTemplate(errorOptions);
        this.stack = (new Error()).stack;
    }

    DataPathError.prototype = Object.create(Error.prototype);

    return {
        DataPathError: DataPathError
    };
});
