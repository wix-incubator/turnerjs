define.experiment.newComponent('wysiwyg.common.components.onlineclock.editor.OnlineClockPanel.OnlineClock', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['OnlineClock']);

    def.propertiesSchemaType('OnlineClockProperties');

    def.skinParts({
        location: {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: 'ONLINECLOCK_Location',
                maxLength: '150'
            }
        },
        locationSuggest : {
            type : 'htmlElement'
        },
        // TODO add current time indicator?
        timeFormat: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: {labelText: 'ONLINECLOCK_TimeFormat'},
            bindToProperty: 'timeFormat',
            dataProvider: [
                {label: 'HH:MM:SS, 24h', value: 'full_24'},
                {label: 'HH:MM, 24h', value: 'short_24'},
                {label: 'HH:MM:SS AM/PM, 12h', value: 'full_12'},
                {label: 'HH:MM AM/PM, 12h', value: 'short_12'}
            ]
        },
        showDate: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: {labelText: 'ONLINECLOCK_ShowDate'},
            bindToProperty: 'showDate'
        },
        dateFormat: {
            type: Constants.PanelFields.ComboBox.compType,
            argObject: {labelText: 'ONLINECLOCK_DateFormat'},
            bindToProperty: 'dateFormat',
            dataProvider: [
                {label: 'January, 01', value: 'monthfirst'},
                {label: '01, January', value: 'datefirst'},
                {label: 'Jan/01', value: 'monthfirstshort'},
                {label: '01/Jan', value: 'datefirstshort'}
            ],
            enabledCondition: function () {
                return this._previewComponent.getComponentProperties().get('showDate');
            }
        },
        fontSizeWrapper : {
            type : 'htmlElement',
            visibilityCondition : function() {
                return W.Config.env.isViewingSecondaryDevice();
            }
        },
        timeFontSize : {
            type : Constants.PanelFields.Slider.compType,
            argObject: {
                labelText: 'ONLINECLOCK_TimeFontSize',
                min: 12,
                max: 60,
                step: 1,
                noFloats: true,
                units: 'px',
                leftIcon : 'button/small_textSize.png',
                rightIcon : 'button/bigIcon_textSize.png'
            },
            bindToProperty: 'mobileTimeFontSize'
        },
        dateFontSize : {
            type : Constants.PanelFields.Slider.compType,
            argObject: {
                labelText: 'ONLINECLOCK_DateFontSize',
                min: 12,
                max: 60,
                step: 1,
                noFloats: true,
                units: 'px',
                leftIcon : 'button/small_textSize.png',
                rightIcon : 'button/bigIcon_textSize.png'
            },
            bindToProperty: 'mobileDateFontSize'
        },
        textAlign: {
            type: Constants.PanelFields.RadioImages.compType,
            argObject: {
                labelText: 'BUTTON_TEXT_ALIGN',
                display: 'inline',
                presetList: Constants.PanelFields.RadioImages.args.presetList
            },
            bindToProperty: 'textAlign'
        },
        changeStyle: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'CHOOSE_STYLE_TITLE'}
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
        }
    });

    def.utilize(['core.managers.serverfacade.CorsRESTClient']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._restClient = new this.imports.CorsRESTClient();
        },

        _onAllSkinPartsReady : function() {
            var location = this._skinParts.location, that = this;

            location.addEvent(
                Constants.CoreEvents.INPUT_CHANGE,
                _.debounce(this._onLocationChanged.bind(this), 250)
            );
            location.addEvent(
                Constants.CoreEvents.FOCUS,
                function () {
                    location._hasFocus = true;
                }
            );
            location.addEvent(
                Constants.CoreEvents.BLUR,
                function () {
                    location._hasFocus = false;
                    setTimeout(that._hideSuggest.bind(that), 500);
                }
            );

            this._updateLocationInput();
        },

        _updateLocationInput: function () {
            this._skinParts.location.setValue(this._previewComponent.getComponentProperties().get('location'));
        },

        _onLocationChanged: function () {
//            if (!this.$alive) {
//                return;
//            }
            // TODO q
            if (!this._skinParts || !this._skinParts.location._hasFocus) return;
            var location = this._skinParts.location.getValue(),
                url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location +
                this._previewComponent.getGoogleApiKeyParam();
            this._restClient.get(url, null, {
                onSuccess: function (response) {
                    if (response.results.length) {
                        this._showSuggest(response.results);
                    } else {
                        // TODO Error
                    }
                }.bind(this)
            });
        },

        _showSuggest: function (results) {
            this._hideSuggest(true);
            document.createDocumentFragment();
            var ul = document.createElement('ul'), li;
            Object.forEach(results, function (result, i) {
                li = document.createElement('li');
                li.innerHTML = result.formatted_address;
                li.setAttribute('result-number', i);
                ul.appendChild(li);
            });
            ul.addEvent('click', function (e) {
                var target = e.target,
                    result = results[target.getAttribute('result-number')],
                    coords = result.geometry.location;

                this._previewComponent.getDataItem().set('latitude', coords.lat);
                this._previewComponent.getDataItem().set('longitude', coords.lng);

                this._previewComponent.getComponentProperties().set('location', result.formatted_address);
                this._hideSuggest();
            }.bind(this));
            this._skinParts.locationSuggest.appendChild(ul);
        },

        _hideSuggest: function (noUpdate) {
            (noUpdate || this._updateLocationInput());
            this._skinParts.locationSuggest.empty();
        }
    });

});