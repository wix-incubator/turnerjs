define([], function () {
    "use strict";

    function getSchema() {
        var schema = {
            screenIn: {
                groups: ['animation', 'entrance']
            },
            bgScrub: {
                groups: ['animation', 'background']
            },
            pageTransition: {
                groups: ['transition', 'pageTransition']
            },
            exit: {
                groups: ['exit', 'animation']
            },
            load: {
                groups: ['transition', 'pageTransition']
            },
            modeIn: {
                groups: ['animation', 'entrance']
            },
            modeOut: {
                groups: ['animation', 'exit']
            },
            modeChange: {
                groups: ['animation', 'entrance'] //todo Shimi_Liderman 06/03/2016 19:29 change this to real groups
            }
        };

        return schema;
    }

    return {
        getSchema: getSchema
    };
});
