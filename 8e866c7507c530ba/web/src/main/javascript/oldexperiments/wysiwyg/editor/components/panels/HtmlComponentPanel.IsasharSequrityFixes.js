define.experiment.component('wysiwyg.editor.components.panels.HtmlComponentPanel.IsasharSequrityFixes', function (compDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.resources(["W.Config"]);
    def.methods({
        render:function () {
            this.parent();

            var sourceType = this._data.get('sourceType');
            var url = this._data.get('url');

            if (sourceType == 'external') {
                this._stateCombo.setValue('external');
                //url = url.replace('.wix.', '.usrfiles.');
                this._src.setValue(url);
            }
            else { // htmlEmbedded and tempUrl
                this._stateCombo.setValue('embedded');

                if (url) {
                    // the content is a url, bring it from the server
                    this._showLoading(true);

                    if (this.getDataItem().get('sourceType') === "htmlEmbedded") {
                        url = this._validateAndFixUrl(url);
                    }
                    //url = url.replace('.wix.', '.usrfiles.');
                    this._fromUrlToHtml(url, function (response) {
                        this._showLoading(false);
                        if (response.success) {
                            this._html.setValue(response.html);
                        }
                        else {
                            this._showErrorMessage('HtmlComponentPanel.Errors.HtmlCannotBeRetrieved');
                        }
                    }.bind(this));
                }
            }
            this._setCorrectVisibility(sourceType == 'external');
        },

        _validateAndFixUrl: function(url) {
            var protocolRegex = /^(ftps|ftp|http|https).*$/;

            if (protocolRegex.test(url)) {
                return url;
            }

            if (url.indexOf('static.wix.com') >= 0) {
                return "http://" + url;
            }

            if (url.indexOf("html/") === 0) {
                return this.resources.W.Config.getServiceTopologyProperty("staticServerUrl") + url;
            }

            return url;
        }
    });
});
