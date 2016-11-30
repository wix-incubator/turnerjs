define.component('wysiwyg.editor.components.dialogs.ExperimentsDialog', function(compDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.resources(['W.Experiments', 'W.Utils']);

    def.utilize(['core.managers.serverfacade.RESTClient']);

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.binds(['_onCheckBoxClick', '_onBeforeClose', '_getExperimentsJsonFromProduction']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._experiments={};
            this._experimentsArray=[];
            this._getExperiments(this._experiments, this._experimentsArray);
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('onDialogClosing', this._onBeforeClose);
            this._rest = new this.imports.RESTClient();
            this._checkboxes = {};
            this._isLeavePagePopUp = false;
            this._isRightClickMenu = false;
            this._isWConsole = false;
            this._topologyUrl = 'none';
            this._topologyUrls = {
                'Pita': 'http://wysiwyg.pita.wixpress.com/web/SLM.debug.json',
                'Bestflash': 'http://wysiwyg.bestflashwebsitebuilder.com/wixapps/SLM.debug.json'
            };
            this._topologyRadios = [
                {label: 'None', value: 'none'},
                {label: 'Pita', value: this._topologyUrls.Pita},
                {label: 'Bestflash', value: this._topologyUrls.Bestflash},
                {label: 'Custom URL', value: 'custom'}
            ];
            this._isCustomTopology = false;

        },

        _getExperiments: function(asObject, asArray){
            var experimentsManager = this.resources.W.Experiments;
            var experimentIds = experimentsManager.getAllDefinedExperimentIds();
            experimentIds.forEach(function(expId) {
                if (expId == 'dev') {
                    return;
                }

                var experimentDescriptor = experimentsManager.getExperimentDescriptor(expId);
                if (!experimentDescriptor) {
                    return;
                }

                var expDesc = experimentDescriptor.description;
                var expOwner = experimentDescriptor.owner;

                var opened = experimentsManager.isDeployed(expId);
                var created = new Date(experimentDescriptor.createTime);
                var expObj = {expId: expId, opened: opened, description: expDesc, owner: expOwner, created: created};
                asObject[expId] = expObj;
                asArray.push(expObj);
            });

            function sortExperiments(a, b) {
                if (a.expId > b.expId) {
                    return 1;
                }
                if (b.expId > a.expId) {
                    return -1;
                }
                return 0;
            }

            asArray.sort(sortExperiments);
        },

        _createFields: function(){
            var query = this.resources.W.Utils.getQueryStringAsObject();
            this._query = query;
            this._isLeavePagePopUp = (query['leavePagePopUp'] == 'false');
            this._isRightClickMenu = (query['rcm'] == 'true');
            this._isWConsole = (query['wconsole'] == 'false');
            this._topologyUrl = query['topology_url'] || 'none';
            this._isCustomTopology = !(Object.contains(this._topologyUrls ,this._topologyUrl)) && this._topologyUrl != 'none' ;

            this.addBreakLine('10px');

            this.addInputGroupField(function(panel){

                var selectToplogy = this.addRadioButtonsField('Add Topology URL', panel._topologyRadios, panel._topologyUrl, null, 'inline');
                selectToplogy.runWhenReady(function(logic){
                    if (panel._isCustomTopology){
                        logic.setValue('custom');
                    }
                });
                selectToplogy.addEvent('inputChanged', function(event){
                    if (event.value == 'custom'){
                        panel._topologyUrl = panel.customInput.getValue();
                        panel.customInput.enable();
                        panel._isCustomTopology = true;
                    } else {
                        panel._topologyUrl = event.value;
                        panel.customInput.setValue(panel._topologyUrl);
                        panel.customInput.disable();
                        panel._isCustomTopology = false;
                    }
                });

                this.addBreakLine('5px');

                panel.customInput = this.addInputField(null, 'Custom Topology URL');
                panel.customInput.runWhenReady(function(logic){
                        if (panel._topologyUrl != 'none'){
                            logic.setValue(panel._topologyUrl);
                        }
                        if (!panel._isCustomTopology){
                            logic.disable();
                        }
                    });

                this.addBreakLine('10px');


                this.addCheckBoxField('Suppress "Are you sure you want to leave" Popup').addEvent('inputChanged',function(event){
                    panel._isLeavePagePopUp = event.value;
                }).setValue(panel._isLeavePagePopUp);

                this.addCheckBoxField('Show right click context menu in editor (Requires "RightClick" experiment)').addEvent('inputChanged',function(event){
                    panel._isRightClickMenu = event.value;
                }).setValue(panel._isRightClickMenu);

                this.addCheckBoxField('Show Console Errors (Stop WConsole)').addEvent('inputChanged',function(event){
                    panel._isWConsole = event.value;
                }).setValue(panel._isWConsole);


                this.addBreakLine(6, '1px solid #D6D5C3', 8);

                this.addInputGroupField(function(panel){
                    this.setNumberOfItemsPerLine(0, 10);

                    this.addButtonField(null, 'Select Production Experiments', null, null, 'blue').addEvent('click', function(){
                        panel._getExperimentsJsonFromProduction();
                    });

                    this.addButtonField(null, 'Deselect All').addEvent('click', function(){
                        panel._checkExperimentsFromList(null);
                    });
                }, 'skinless');

            });

            this.addBreakLine('10px');

            this.setNumberOfItemsPerLine(0, 10);

            for (var i=0; i<this._experimentsArray.length; i++){
                var experimentInfo = this._experimentsArray[i];

                this.addCheckBoxField(experimentInfo.expId).setValue(experimentInfo.expId).addEvent('inputChanged', this._onCheckboxChange.bind(this)).runWhenReady(this._onCheckboxReady.bind(this));

                this.addLabel((this._jirafy(experimentInfo.description) || experimentInfo.expId) + " (" + experimentInfo.created.toDateString() +")").runWhenReady(this._onLabelReady.bind(this));
                this.addLabel(experimentInfo.owner || 'Unknown').runWhenReady(this._onOwnerReady.bind(this));

                this.addBreakLine(0, '1px solid #D6D5C3', 8);
            }
        },

        /**
         * Get the experiments list from production
         */
        _getExperimentsJsonFromProduction: function(){
            if (this._productionRunningExperiments){
                this._checkExperimentsFromList(this._productionRunningExperiments);
            } else {
                this._rest.get('/html/app-info/html/running-experiments.json?p=getMeIn', null, {
                    onSuccess: this._onGetFromProductionSuccess.bind(this),
                    onError  : function(error){
                        throw new Error('Could not load experiments from production., make sure you have the following in your Yoavche: <proxy forPathPrefix="/production/*" targetHost="editor.wix.com" targetPort="80"/>', error);
                    }
                });
            }
        },

        /**
         * On success cleanup and normalize the list to fit our expected format
         * @param json
         * @private
         */
        _onGetFromProductionSuccess: function(json){
            var parsedJson = this._cleanExperimentList(json);
            this._productionRunningExperiments = this._normalizeExperimentList(parsedJson);
            this._checkExperimentsFromList(this._productionRunningExperiments);
        },

        /**
         * Set experiment object to lowecase keys and values
         * @param list
         * @return {Object}
         * @private
         */
        _normalizeExperimentList: function(list){
            var lowerRunningExperiments = {};
            for (var runningExperiment in list){
                var experimentName = runningExperiment.toLowerCase();
                var experimentGroup = list[runningExperiment].toLowerCase();
                lowerRunningExperiments[experimentName] = experimentGroup;
            }

            return lowerRunningExperiments;
        },

        /**
         * Clean unwanted experiments from the list
         * @param experimentList
         * @return {*}
         * @private
         */
        _cleanExperimentList: function(experimentList){
            var list = experimentList;
            for (var experimentId in list){
                if (this._isAppsExperiment(experimentId) || this._isLanguageExperiemnt(experimentId) || this._isFlagExperiemnt(experimentId)) {
                    delete list[experimentId];
                }
            }
            return list;
        },

        _isAppsExperiment: function(experimentId){
            var appMatch = /^App~\w{1,}~\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/i;
            return appMatch.test(experimentId);
        },

        _isLanguageExperiemnt: function(experimentId){
            var langMatch = /^Lang_[a-z]{2,}/i;
            return (langMatch.test(experimentId) || experimentId == 'MultiLang');
        },

        _isFlagExperiemnt: function(experimentId){
            var flagMatch = /^FLAG_/i;
            return flagMatch.test(experimentId);
        },

        _checkExperimentsFromList: function(list){
            var key;
            list = list || {};
            for (key in this._checkboxes){
                if (this._checkboxes.hasOwnProperty(key)){
                    var modelKey = key.split(' ')[0];
                    var value = !!list[modelKey];
                    if (this._checkboxes[key].getValue() != value){
                        this._checkboxes[key].setValue(value);
                        this._checkboxes[key].fireChangeEvent();
                    }
                }
            }
        },

        _markExperimentRow: function(checkboxElement, value){
            var row = checkboxElement.getParents('.inline-component-group')[0];
            if (value){
                row.setStyle('background-color', '#F2F1C9');
            } else {
                row.setStyle('background-color', '');
            }
        },

        _onCheckboxChange: function(event){
            //            var experimentInfo = this._experiments[event.valueString];
            //
            //            experimentInfo.opened = !experimentInfo.opened;
            //            var experiment = {};
            //            experiment[experimentInfo.expId] = experimentInfo.groupId;
            //            if(!experimentInfo.opened && W.Experiments.isDeployed(experiment)){
            //                experimentInfo.toBeClosed = true;
            //            }
            // Don't kill me, this is an ugly hack
            this._markExperimentRow(event.compLogic.getViewNode(), event.value);
        },

        _onCheckboxReady: function(logic){
            this._checkboxes[logic.getValueString()] = logic;
            var view = logic._skinParts.view;
            var isOpened = this._experiments[logic.getValueString()].opened;
            this._markExperimentRow(logic.getViewNode(), isOpened);
            logic.setChecked(isOpened);
            view.setStyles({'width': '220px', 'line-height': '1.1em'});
        },

        _onLabelReady: function(logic){
            var view = logic.getViewNode();
            view.setStyles({'width': '350px', 'display': 'inline-block', 'line-height': '1.1em'});
            view.addClass('bold');
        },

        _onOwnerReady: function(logic){
            var view = logic.getViewNode();
            view.setStyles({'width': '50px', 'display': 'inline-block', 'line-height': '1.1em'});
            view.addClass('italic');
        },

        _onOkClick: function(){
            var url = "http://" + window.location.host + window.location.pathname + this._buildExperimentsQuery();
            this._loadEditor(url);
        },

        _onCheckBoxClick: function(){

        },

        _buildExperimentsQuery: function(){

            var query = window.location.search || '';
            var queryArr = [];
            var newQuery = '';

            if (query){
                query = query.replace(/\?|(experiment=|topology_url=|leavePagePopUp=|rcm=|wconsole=)[\w\d:\./%#@]*&?/g, '');
                queryArr = query.split('&').filter(function(item){
                    return !!item;
                });
            }

            if (!queryArr.contains("mode=debug")){
                queryArr.push("mode=debug");
            }
            if (this._isLeavePagePopUp){
                queryArr.push("leavePagePopUp=false");
            }
            if (this._isRightClickMenu){
                queryArr.push("rcm=true");
            }
            if (this._isWConsole){
                queryArr.push("wconsole=false");
            }
            if (this._topologyUrl !== 'none'){
                queryArr.push('topology_url=' + this._topologyUrl);
            }

            for (var key in this._checkboxes){
                var checkBox = this._checkboxes[key];
                var id = checkBox.getValueString();

                var isDeployed = this.resources.W.Experiments.isDeployed(id);
                var isChecked = checkBox.getValue();
                if (isChecked && !isDeployed) {
                    queryArr.push("experiment=" + id + ":New");
                } else if (isDeployed && !isChecked) {
                    queryArr.push("experiment=" + id + ":NONE");
                }
            }

            newQuery = '?' + queryArr.join('&');

            return newQuery;
        },

        _loadEditor: function(url){
            window.location = url;
        },

        _onBeforeClose: function(e){
            if (e && e.result == 'OK'){
                this._onOkClick();
            }
        },

        _jirafy: function(str) {
            if (str.indexOf('#WOH-') === -1) {
                return str;
            }

            var WOH = str.split(' ').filter(function(d){
                return d.indexOf('#WOH-') === 0;
            })[0];

            var taskId = WOH.replace('#WOH-', '');
            var taskHref = '<a target="_blank" href="http://jira.wixpress.com/browse/WOH-' + taskId + '">' + WOH + '</a>';

            str = str.replace(WOH, taskHref);

            return str;
        }
    });
});
