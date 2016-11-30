define(['lodash', 'wixappsCore'], function (_, /** wixappsCore */wixapps) {
    'use strict';

    var localizer = wixapps.localizer;
    var wixappsLogger = wixapps.wixappsLogger;

    /**
     * @class wixAppsBuilder.AppPart2Presenter
     * @param partApi
     * @constructor
     */
    function AppPart2Presenter(partApi) {
        this.partApi = partApi;
    }

    AppPart2Presenter.prototype = {
        getViewVars: function () {
            if (!this.userTags) {
                this.userTags = {
                    enabled: false,
                    items: [
                        {value: "", text: ""}
                    ],
                    selectedValue: ''
                };

                var appPartSelectorDefinition = this.partApi.getAppPartDefinition().dataSelectorDef;

                if (appPartSelectorDefinition) {
                    /** @type AppRepoDefinition */
                    var appRepo = this.partApi.getRepo();
                    var dataSelectorDefinition = appRepo.dataSelectors[appPartSelectorDefinition.id];

                    if (dataSelectorDefinition.logicalTypeName === 'IB.TagsFilteredList' && appPartSelectorDefinition.predefinedSettings) {
                        this.userTags.items = _.map(appPartSelectorDefinition.predefinedSettings.tags, function (value) {
                            return {
                                value: value,
                                text: appRepo.tags[value]
                            };
                        });

                        // Add tag 'all' at first option.
                        this.userTags.items.unshift({value: 'all', text: localizer.localize('@FILTER_DIALOG_All_Tags@', this.partApi.getLocalizationBundle())});

                        this.userTags.selectedValue = appPartSelectorDefinition.predefinedSettings.selectedTag;
                        this.userTags.enabled = true;
                    }
                }
            }

            return {
                userTags: this.userTags
            };
        },

        onTagChanged: function (event) {
            var dataSelector = this.partApi.getDataSelector();
            var appPartSelectorDefinition = this.partApi.getAppPartDefinition().dataSelectorDef;
            var tagIds = event.payload.value === 'all' ? appPartSelectorDefinition.predefinedSettings.tags : [event.payload.value];

            // Update the tags in the dataSelector instance.
            this.partApi.setCssState('loading');
            this.userTags.selectedValue = event.payload.value;
            dataSelector.setTags(tagIds, function () {
                this.partApi.setCssState('content');

                wixappsLogger.reportEvent(this.partApi.siteData, wixappsLogger.events.TAG_SELECTED_IN_VIEWER);
            }.bind(this));
        }
    };

    return AppPart2Presenter;
});
