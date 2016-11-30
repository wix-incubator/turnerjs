define([
    'lodash',
    'dataFixer/helpers/CompsMigrationHelper',
    'coreUtils'
], function (_, CompsMigrationHelper, coreUtils) {
    'use strict';

    function getEmptyBackground() {
        return {
            type: 'MediaContainerDesignData',
            id: coreUtils.guidUtils.getUniqueId('dataItem', '-'),
            background: {
                id: coreUtils.guidUtils.getUniqueId('dataItem', '-'),
                type: 'BackgroundMedia',
                mediaRef: null,
                alignType: 'center',
                fittingType: 'fill',
                colorOpacity: 0,
                colorOverlay: '',
                colorOverlayOpacity: 1,
                imageOverlay: '',
                scrollType: 'none',
                color: '#FFFFFF'
            }
        };
    }

    function getDefaultColumnsContainerProperties() {
        return {
            'columnsMargin': 0,
            'frameMargin': 0,
            'fullWidth': true,
            'rowMargin': 0,
            'siteMargin': 0,
            'type': 'StripColumnsContainerProperties'
        };
    }

    function getDefaultColumnProperties() {
        return {
            type: 'ColumnProperties',
            alignment: 50
        };
    }

    function createColumnFromStrip(comp, cache) {
        return {
            'id': _.get(cache, [comp.id, 'mediaId'], coreUtils.guidUtils.getUniqueId('media')),
            'type': 'Container',
            'layout': {
                'width': comp.layout.width,
                'height': comp.layout.height,
                'x': 0,
                'y': 0,
                'scale': 1,
                'rotationInDegrees': 0,
                'anchors': [
                    {
                        'distance': 0,
                        'topToTop': 0,
                        'originalValue': 0,
                        'type': 'BOTTOM_PARENT',
                        'locked': true,
                        'targetComponent': comp.id
                    }
                ],
                'fixedPosition': false
            },
            'components': comp.components,
            'componentType': 'wysiwyg.viewer.components.Column',
            'styleId': 'strc1'
        };
    }

    function migrateAnchors(comp, column) {
        _.forEach(comp.components, function (childComp) {
            var anchors = _.get(childComp, ['layout', 'anchors'], []);
            _.forEach(anchors, function (anchor) {
                if (anchor.type === 'BOTTOM_PARENT') {
                    anchor.targetComponent = column.id;
                }
            });
        });
    }

    function migrateBehaviors(comp, column) {
        if (comp.behaviors) {
            column.behaviors = _.clone(comp.behaviors);
            delete comp.behaviors;
        }
        if (comp.behaviorQuery) {
            column.behaviorQuery = comp.behaviorQuery;
            delete comp.behaviorQuery;
        }
    }

    function migrateStrip(pageJson, cache, mobileView, comp) {
        comp.componentType = 'wysiwyg.viewer.components.StripColumnsContainer';
        delete comp.skin;
        comp.styleId = 'strc1';

        this.setComponentProperties(pageJson, comp, getDefaultColumnsContainerProperties(), cache);

        var column = createColumnFromStrip(comp, cache);

        migrateAnchors(comp, column);
        migrateBehaviors(comp, column);

        _.set(cache, [comp.id, 'mediaId'], column.id);

        this.setComponentProperties(pageJson, column, getDefaultColumnProperties(), cache);

        column.designQuery = comp.designQuery;
        delete comp.designQuery;

        if (!mobileView) {
            comp.layout.width = 980;
            var designDataWithEmptyBackground = getEmptyBackground();
            this.setComponentDesignData(pageJson, comp, designDataWithEmptyBackground, cache);
        } else {
            comp.layout.width = 320;
            comp.designQuery = _.get(cache, [comp.id, 'designQuery']);
            this.deleteComponentData(pageJson, comp);
        }
        delete comp.dataQuery;

        comp.components = [column];
    }

    var MIGRATION_MAP = {
        'wysiwyg.viewer.components.StripContainer': migrateStrip
    };

    var migrationHelper = new CompsMigrationHelper(MIGRATION_MAP);

    /**
     * @exports utils/dataFixer/plugins/migrateStripToColumnsContainer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: migrationHelper.migratePage.bind(migrationHelper)
    };

    return exports;
});
