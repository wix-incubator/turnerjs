define(['santaProps', 'lodash'], function (santaProps, _) {
    "use strict";
    /**
     * @lends test.compProps
     * @type {{addSiteData: addSiteData, setCompData: setCompData, setCompProp: setCompProp, setSkin: setSkin}}
     */
    var propsEnhancement = {

        addSiteData: function (item, dataType) {
            this.siteData[dataType] = item;
            return this;
        },
        setCompBehaviors: function (item) {
            this.siteData.addBehaviors(item, this.pageId);
            this.compBehaviors = item;
            this.structure.behaviorQuery = item.id;
            return this;
        },
        /**
         *
         * @param {data.compDataItem} item
         * @returns {propsEnhancement}
         */
        setCompData: function (item) {
            if (_.isString(item)) {
                this.compData = this.siteAPI.getSiteData().getDataByQuery(item, this.pageId, 'document_data');
                this.structure.dataQuery = item;
            } else {
                this.siteData.addData(item, this.pageId);
                this.compData = item;
                this.structure.dataQuery = item.id;
            }
            return this;
        },
        setCompProp: function (item) {
            this.siteData.addProperties(item, this.pageId);
            this.compProp = item;
            this.structure.propertyQuery = item.id;
            return this;
        },
        addCompAction: function (actionName) {
            var action = {
                type: 'comp',
                sourceId: this.id,
                name: actionName
            };
            this.compActions[actionName] = action;
            return this;
        },
        setThemeStyle: function (item) {
            this.siteData.addCompTheme(item, this.pageId);
            this.structure.styleId = item.id;
            this.styleId = item.id;
            this.loadedStyles[item.id] = item.id;
            return this;
        },
        setSkin: function (skin) {
            this.skin = skin;
            this.structure.skin = skin;
            return this;
        },
        setNodeStyle: function (style) {
            this.style = style;
            return this;
        },
        setProps: function (props) {
            return _.merge(this, props);
        },
        setLayout: function(layout){
            this.structure.layout = layout;
            return this;
        },
        addModeOverride: function(modeOverride){
            this.structure.modes = this.structure.modes || {};
            var compModes = this.structure.modes;

            compModes.overrides = compModes.overrides || [];
            compModes.overrides.push(modeOverride);
            return this;
        },
        addModeDefinition: function(modeDefinition){
            this.structure.modes = this.structure.modes || {};
            var compModes = this.structure.modes;

            compModes.definitions = compModes.definitions || [];
            compModes.definitions.push(modeDefinition);
            return this;
        }

    };

    return function getProps(siteAPI) {
        var myStructure = {id: _.uniqueId('test_')};
        var props = santaProps.componentPropsBuilder.getCompProps(myStructure, siteAPI, 'masterPage', {}, {});
        delete props.ref;
        _.assign(props, propsEnhancement);
        return props;
    };

});
