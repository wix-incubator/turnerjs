define(['lodash', 'previewExtensionsCore', 'wixappsBuilder'],
    function (_, previewExtensionsCore) {
        'use strict';

        var compType = 'wixapps.integration.components.AppPart2';

        function getViewVars() {
            var appPartDefinition = this.getAppPartDefinition();
            var viewDef = this.getViewDef(appPartDefinition.viewName, 'Array', this.getFormatName());
            return _.cloneDeep(viewDef.vars);
        }

        var extension = {
            isChanged: function () {
                var nextViewVars = getViewVars.call(this);
                var isChanged = !_.isEqual(this.viewVars, nextViewVars);
                this.viewVars = nextViewVars;
                return isChanged;
            }
        };

        previewExtensionsCore.registrar.registerCompExtension(compType, extension);
    });
