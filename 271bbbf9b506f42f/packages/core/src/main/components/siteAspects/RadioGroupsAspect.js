/**
 * Created by alexandreroitman on 30/05/2016.
 */
define(['lodash', 'core/core/siteAspectsRegistry'], function(_, /** core.siteAspectsRegistry */siteAspectsRegistry) {
    "use strict";


    function RadioGroupsAspect() {
        this.radioGroups = {};
    }

    RadioGroupsAspect.prototype = {
        setRadioGroup: function(compId, groupName) {
            this.removeRadioFromGroup(compId);
            if (groupName) {
                var currentGroup = this.radioGroups[groupName];
                this.radioGroups[groupName] = currentGroup || {children: []};
                var currentChildren = this.radioGroups[groupName].children;

                this.radioGroups[groupName].children = currentChildren.concat([compId]);
            }
        },

        removeRadioFromGroup: function(compId) {
            var group = _.findKey(this.radioGroups, function(radioGroup){
                return _.includes(radioGroup.children, compId);
            });

            if (group) {
                if (this.radioGroups[group].selected === compId) {
                    delete this.radioGroups[group].value;
                }
                _.pull(this.radioGroups[group].children, compId);
            }
        },

        getRadioGroup: function(groupName) {
            return this.radioGroups[groupName];
        },

        setRadioGroupValue: function (compId, compValue) {
            var group = _.findKey(this.radioGroups, function(radioGroup){
                return _.includes(radioGroup.children, compId);
            });

            if (group) {
                this.radioGroups[group].value = compValue;
                this.radioGroups[group].selected = compId;
            }
        }
    };

    siteAspectsRegistry.registerSiteAspect('radioGroups', RadioGroupsAspect);

    return RadioGroupsAspect;
});
