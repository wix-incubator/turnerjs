define.experiment.newComponent('wysiwyg.editor.components.dialogs.SocialActivitySettings.SocialActivity', function (def) {
    def.inherits('mobile.core.components.base.BaseComponent');

    def.traits(['wysiwyg.editor.components.panels.traits.SkinPartsProcessing']);

    def.dataTypes(['SocialActivitySettings']);

    def.resources(['W.Preview', 'W.Editor', 'W.Theme', 'W.Components']);

    def.statics({
        initialized: false
    });

    def.skinParts({
        descriptionSocialActivitySettings: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                labelText: "Adjust what social action to show and how the buttons look. For your convenience, the settings will be the same for all social panels on your website"
            }
        },
        socialGroupLabel: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                labelText: "Choose action to show"
            }
        },
        socialNetworks: {type: 'htmlElement'},
        theme: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: { labelText: 'Choose Icon Style:' },
            dataProvider: [
                {label: 'Default', value: 'default'},
                {label: 'Light', value: 'light'}
            ],
            bindToData: "theme"
        },
        iconSize: {
            type: Constants.PanelFields.Slider.compType,
            argObject: {
                labelText: 'Adjust Icon Size (in pixels)',
                min: 1,
                max: 100,
                step: 1,
                noFloats: true,
                units: 'px'
            },
            bindToData: "iconSize"
        },
        showCondition: {
            type: Constants.PanelFields.RadioButtons.compType,
            argObject: {
                presetList: [{
                    label: "Show Always",
                    value: 1
                }, {
                    label: "Show on Mouseover",
                    value: 2
                }]
            },
            bindToData: "showCondition"
        }
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);

            console.log(this.resources.W.Preview.getPreviewManagers().SocialActivityDataManager);

        },
        _onRender: function(){

            if(!this.initialized){
                this.on('panelFieldsReady', this , this._addSocialCheckBoxes);
                this.initialized = true;
            } else {
                this._setIconsByTheme(this._data.get('theme'), this.resources.W.Preview.getPreviewManagers().SocialActivityDataManager)
            }

            console.log(this._data);
        },
        _addSocialCheckBoxes: function(){
            var manager = this.resources.W.Preview.getPreviewManagers().SocialActivityDataManager,
                networks = manager.getSocialNetwork(),
                container = this._skinParts['socialNetworks'];

                for(var i in networks){
                    var li = document.createElement('li');
                    container.appendChild(li);

                    var checkBox = this.resources.W.Components.createComponent(
                        'wysiwyg.editor.components.inputs.CheckBox',
                        'wysiwyg.editor.skins.inputs.CheckBoxSkin',
                        undefined,
                        {
                            labelText: networks[i].label
                        },
                        null,
                        function(logic){
                            this._activeCheckBox(networks[i]['name'], logic);
                        }.bind(this)
                    );

                    li.setAttribute('data-network', networks[i]['name']);
                    checkBox.insertInto(li);
                }

            this._setIconsByTheme(this._data.get('theme'), manager);
        },
        _setIconsByTheme: function(theme, manager){
            var sNetwork = manager.getSocialNetwork();

            var liList = this._skinParts['socialNetworks'].querySelectorAll('li');

            [].forEach.call(liList, function(li){
                var snProperty;
                if(snProperty = sNetwork[li.dataset['network']]){
                    li['style']['backgroundImage'] = 'url(' + snProperty.getFullIconUrl() + snProperty.iconName[theme] + ')';
                }
            });
        },
        _activeCheckBox: function(name, checkBox){
            var activeNetworks = this._data.get('activeNetworks');
            if(!!~activeNetworks.indexOf(name)){
                checkBox.setChecked(true);
            }

            checkBox.addEvent('inputChanged', this._onCheckBoxInputChanged.bind(this));
        },
        _onCheckBoxInputChanged: function(evt){
            var networks = this._data.get('activeNetworks').slice(),
                sn = evt.compLogic.$view.parentNode.dataset['network'];

            if(evt.value && sn && networks.indexOf(sn) < 0){
                networks.push(sn);
                this._data.set('activeNetworks', networks);
            } else if(!evt.value && sn && networks.indexOf(sn) >= 0){
                networks.splice(networks.indexOf(sn), 1);
                this._data.set('activeNetworks', networks);
            }
        }
    });
});
