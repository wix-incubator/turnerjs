define.experiment.newComponent('wysiwyg.common.components.weather.editor.WeatherPanel.Weather.New', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.utilize([
        'wysiwyg.common.components.weather.viewer.utils.WeatherUtils',
        'wysiwyg.common.components.weather.common.WeatherConsts',
        'wysiwyg.common.components.weather.common.GoogleMaps'
    ]);

    def.binds(['_onLocationChanged']);

    def.dataTypes(['Weather']);

    def.skinParts({

        /**
         * This field is not bound to any model, since it needs some personal approach. We manually listen
         * to its input events, showing combobox with suggested location values. Selected value will be
         * supplied to location model.
         */
        selectLocation : {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: 'WEATHER_PANEL_SELECT_LOCATION_LABEL',
                buttonLabel: 'WEATHER_PANEL_SELECT_LOCATION_UPDATE_LABEL',
                maxLength: '50'
            },
            hookMethod: '_addLocationValidator'
//            bindToData: 'locationName'
        },
        choiceDegreesUnit : {
            type: Constants.PanelFields.RadioImages.compType,
            argObject: {
                labelText: 'WEATHER_PANEL_CHOICE_DEGREES_UNIT',
                display: 'inline',
                presetList: [
                    {
                        dimensions: {
                            h: 33,
                            w: 35
                        },
                        icon:  "radiobuttons/weather/fahrenheit.png",
                        image: "radiobuttons/radio_button_states.png",
                        value: 'fahrenheit'
                    },
                    {
                        dimensions: {
                            h: 33,
                            w: 35
                        },
                        icon: "radiobuttons/weather/celsius.png",
                        image: "radiobuttons/radio_button_states.png",
                        value: 'celsius'
                    }
                ]
            },
            bindToData: 'degreesUnit'
        },
        fontSizeWrapper : {
            type : 'htmlElement',
            visibilityCondition : function() {
                return W.Config.env.isViewingSecondaryDevice();
            }
        },
        fontSize : {
            type : Constants.PanelFields.Slider.compType,
            argObject: {
                min: 13,
                max: 150,
                step: 1,
                noFloats: true,
                units: 'px',
                leftIcon : 'button/small_textSize.png',
                rightIcon : 'button/bigIcon_textSize.png'
            },
            bindToProperty: 'mobileFontSize'
        },
        changeStyle : {
            type : Constants.PanelFields.ButtonField.compType,
            argObject : {
                buttonLabel : 'WEATHER_PANEL_CHANGE_STYLE_BUTTON_LABEL'
            }
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {
                buttonLabel: 'WEATHER_PANEL_ADD_ANIMATION_BUTTON_LABEL'
            }
        }
    });

    def.fields({
        _errorCode : null,
        /**
         * After user selects one of suggested inputs in ComboBox, its value is set to location input. We don't
         * need such event to trigger
         */
        _skipNextChangeEvent : false,
        /**
         * Since we use search on type with suggestions ComboBox for location input, it may end with
         * empty suggestions result. The we need to set error manually and trigger validation. This property
         * is set to true when we facing such use case
         */
        _isErrorSetAsync : false,
        /**
         * Either location input has focus or not. We should not display suggestions ComboBox if there is
         * no focus on location input
         */
        _hasFocus : false,
        _autocompletionRequest: null
    });

    def.statics({
        MIN_LOCATION_LENGTH_TO_SEARCH : 3,
        ERROR_CODE_MAP : {
            LOCATION_IS_REQUIRED : 'WEATHER_PANEL_ERROR_LOCATION_IS_REQUIRED',
            SERVICE_NOT_AVAILABLE : 'WEATHER_PANEL_ERROR_SERVICE_NOT_AVAILABLE',
            NO_SUCH_LOCATION : 'WEATHER_PANEL_ERROR_NO_SUCH_LOCATION',
            NOT_ENOUGH_LETTERS : 'WEATHER_PANEL_ERROR_NOT_ENOUGH_LETTERS',
            LOCATION_NAME_INVALID : 'WEATHER_PANEL_ERROR_LOCATION_NAME_INVALID' // deprecated

        },
        _logEnabled : true,
        _locationRegexp : /^[A-я\s\.,]+$/,
        _weatherUtils : null,
        _weatherConsts : null,
        _googleMaps : null,
        _autocompleteService: null,
        _placesService: null
    });

    def.methods({

        initialize : function(a, b, c) {
            this.parent(a, b, c);
            this._weatherUtils = new this.imports.WeatherUtils();
            this._weatherConsts = new this.imports.WeatherConsts();
            this._googleMaps = new this.imports.GoogleMaps();


        },

        _initSearchLocationField : function() {
//            var input = this._skinParts.selectLocation.$view.querySelector('input');
            var options = {
                types: ['(cities)']
            };
//
//            var autocomplete = new google.maps.places.Autocomplete(input, options);
            this._autocompleteService = new google.maps.places.AutocompleteService();
            this._placesService = new google.maps.places.PlacesService(document.createElement('div'));
            this._autocompletionRequest = options;

//            google.maps.event.addListener(autocomplete, 'place_changed', function() {
//                if (autocomplete.getPlace().geometry) {
//                    var location = autocomplete.getPlace().geometry.location;
//                    var id = location.lat() + this._weatherConsts.LOCATION_ID_SEPARATOR + location.lng();
//                    var dataItem = this._previewComponent.getDataItem();
//                    dataItem.set('locationId', id);
//                } else {
//                    this._errorCode = 'NO_SUCH_LOCATION';
//                    this._triggerValidation();
//                }
//            }.bind(this));

            this._addOnLocationChangedListener();
        },

        _addLocationValidator: function (definition) {
            definition.argObject.validatorArgs = { validators: [this._locationValidator.bind(this)] };
            return definition;
        },

        _locationValidator: function (location) {

            // Reset _errorCode, unless errorCode was set somewhere else
            if (!this._isErrorSetAsync) {
                this._errorCode = null;
            }
            this._isErrorSetAsync = false;

//            if (!this._locationRegexp.test(location)) {
//                this._errorCode = 'NO_SUCH_LOCATION';
//            }

            if (location.length < this.MIN_LOCATION_LENGTH_TO_SEARCH) {
                this._errorCode = 'NOT_ENOUGH_LETTERS';
            }

            if (!location.length) {
                this._errorCode = 'LOCATION_IS_REQUIRED';
            }

            if (this._errorCode) {
                this._showComboBoxWithSuggestions([]);
                return W.Resources.get('EDITOR_LANGUAGE', this.ERROR_CODE_MAP[this._errorCode]);
            }
        },

        _isNew : function() {
            var dataItem = this._previewComponent.getDataItem();
            return !dataItem.get('locationName') && !dataItem.get('locationId');
        },

        _setCurrentLocation : function() {
            navigator.geolocation.getCurrentPosition(function(geoposition) {
                var coords = geoposition.coords,
                    url = 'http://api.openweathermap.org/data/2.5/weather?mode=json&lat=' + coords.latitude + '&lon=' + coords.longitude;
                this._weatherUtils.fetchRemoteData(url).then(function(result) {
                    var locationName = result.name,
                        locationId = coords.latitude + this._weatherConsts.LOCATION_ID_SEPARATOR + coords.longitude;

                    this._setLocation(locationId, locationName);
                }.bind(this));
            }.bind(this));
        },

        _onAllSkinPartsReady : function() {
            if (this._isNew()) {
                this._setCurrentLocation();
            } else {
                this._setDefaultLocationString();
            }
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                this._googleMaps.load(this._initSearchLocationField.bind(this), ['places']);
            } else {
                this._initSearchLocationField();
            }
            this._skinParts.loadingIndicator.innerHTML = W.Resources.get('EDITOR_LANGUAGE', 'WEATHER_PANEL_LOADING_INDICATOR');
        },

        /**
         * Restores select location value.
         * Since selectLocation skinPart doesn't have bindToData, we manually restore it.
         * @private
         * @deprecated
         */
        _setDefaultLocationString : function() {
            this._skinParts.selectLocation.setValue(this._previewComponent.getDataItem().get('locationName'));
        },

        /**
         * Adds listener to selectLocation skinPart, which performs requests to weather service and renders results in
         * form of ComboBox
         *
         * @private
         * @deprecated
         */
        _addOnLocationChangedListener : function() {
            var debouncedHandler = _.debounce(this._onLocationChanged, 250);
            this._skinParts.selectLocation.addEvent(Constants.CoreEvents.INPUT_CHANGE, debouncedHandler);
            this._skinParts.selectLocation.addEvent(Constants.CoreEvents.BLUR, function() {
                setTimeout(function() {
                    this._showComboBoxWithSuggestions([]);
                    this._hasFocus = false;
                    this._log('Lost focus');
                }.bind(this), 300);
            }.bind(this));
            this._skinParts.selectLocation.$view.querySelector('input').addEvent(Constants.CoreEvents.FOCUS, function() {
                this._hasFocus = true;
                this._log('Received focus');
            }.bind(this));
        },

        _setLocation : function(id, name) {
            this._log(name, id);
            this._skinParts.selectLocation.setValue(name);
            var dataItem = this._previewComponent.getDataItem();
            dataItem.set('locationId', id);

            // Don't fire change event

            this._skipNextChangeEvent = true;
            dataItem.set('locationName', name, true);
        },

        /**
         * @deprecated
         * @private
         */
        _onLocationChanged : function() {
            if (!this.$alive) {
                return;
            }

            if (this._skipNextChangeEvent) {
                this._skipNextChangeEvent = false;
                return;
            }

            if (!this._hasFocus) {
                return;
            }

            var that = this;

            var query = (that._skinParts.selectLocation.getValue() || '').trim();
            if (query.length >= that.MIN_LOCATION_LENGTH_TO_SEARCH) {
                this._log('Starting to search ' + query);
                this._skinParts.loadingIndicator.style.display = 'block';
                this._findLocationsByName(query).then(function (result) {
                    that._log('Found for ' + result.query);
                    if (that._getSelectLocation() === result.query) {

                        if (!that._hasFocus) {
                            return;
                        }

                        that._errorCode = null;
                        that._showComboBoxWithSuggestions(result.list).then(function (result) {
                            that._getPlaceDetails(result.item.id).then(function(place) {
                                that._setLocation(place.id, result.item.name);
                            });
//                            that._setLocation(result.item.id, result.item.name);
                        });

                    } else {
                        that._log('Rejected: ' + query + ' !== ' + result.query);
                    }
                }, function(reason) {
                    that._onRemoteServiceError(reason);
                    that._triggerValidation();
                    that._showComboBoxWithSuggestions([]);
                }).finally(function() {
                    that._skinParts.loadingIndicator.style.display = 'none';
                });
            } else {
                this._showComboBoxWithSuggestions([]);
            }
        },

        _onRemoteServiceError : function(reason) {
            if (reason.code === 404) {
                this._errorCode = 'SERVICE_NOT_AVAILABLE';
            } else if (reason.code === 500) {
                this._errorCode = 'SERVICE_NOT_AVAILABLE';
            } else if (reason.serviceCode === 404) {
                this._errorCode = 'NO_SUCH_LOCATION';
            }
        },

        _triggerValidation : function() {
            this._isErrorSetAsync = true;
            this._skinParts.selectLocation._resetInvalidState();
            this._skinParts.selectLocation._changeEventHandler();
        },

        /**
         * @deprecated
         * @returns {*|string}
         * @private
         */
        _getSelectLocation : function() {
            return (this._skinParts.selectLocation.getValue() || '').trim();
        },

        /**
         * @deprecated
         * @param list
         * @returns {promise}
         * @private
         */
        _showComboBoxWithSuggestions : function(list) {
            var d = Q.defer();

            var container = this._skinParts.suggestedLocationsComboBox;
            container.innerHTML = '';

            var listItems = [], firstListItem = document.createElement('div'), fragment = document.createDocumentFragment();
            _.each(list, function(item) {
                item.name = item.name || item.sys.country;
                var listItem = firstListItem.cloneNode(true);
                listItem.innerHTML = item.name;
                listItem.className = 'suggestedLocationItem';
                listItems.push(listItem);
                fragment.appendChild(listItem);
            });
            container.appendChild(fragment);

            if (listItems.length) {
                var inputWidth = this._skinParts.selectLocation.$view.offsetWidth;
                this._log('Input width: ' + inputWidth);

                container.style.width = (inputWidth - 2) + 'px';
                container.style.display = 'block';

                container.addEvent('click', function (event) {

                    var index = _.indexOf(listItems, event.target);

                    // Closing immediately to not wait extra 300ms
                    this._showComboBoxWithSuggestions([]);

                    d.resolve({item : list[index]});
                }.bind(this));
            } else {
                container.style.display = 'none';
            }
            return d.promise;
        },

        /**
         * @deprecated
         * @param query
         * @returns {promise}
         * @private
         */
        _findLocationsByName : function(query) {
            var d = Q.defer(),
                that = this;
//            var url = 'http://autocomplete.wunderground.com/aq';
//            this._weatherUtils.fetchRemoteJSONPData(url, {
//                query : query,
//                h : 0
//            }, 'cb').then(function(data) {
//                var list = data.RESULTS.map(function(item){
//                    return {id : item.zmw, name : item.name};
//                });
//                if (list.length) {
//                    d.resolve({
//                        list  : list,
//                        query : this.query
//                    });
//                } else {
//                    d.reject({serviceCode : 404});
//                }
//            }.bind({query : query}), function(reason) {
//                d.reject(reason);
//            });

            this._autocompletionRequest.input = query;
            this._autocompleteService.getPlacePredictions(this._autocompletionRequest, function(prediction, status) {
//                var defArray = [];
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    that._log(prediction);
//                    _.each(prediction, function(item) {
//                        defArray.push(this._getPlaceDetails(item.reference));
//                    }, this);

//                    Q.all(defArray).then(function(items) {
                        d.resolve({list: prediction.map(function(item) {
                            return {
                                id: item.reference,
                                name: item.description
                            };
                        }), query: this.query});
//                    });
                } else {
                    that._log(status);
                    d.reject({serviceCode: 404});
                }
            }.bind({query: query}));
            return d.promise;
        },

        _getPlaceDetails: function(reference) {
            var d = Q.defer();
            this._placesService.getDetails({reference: reference}, function(details, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK ||
                    status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    var location = details.geometry.location;
                    d.resolve({
                        id: location.lat() + this._weatherConsts.LOCATION_ID_SEPARATOR + location.lng(),
                        name: details.name
                    });
                } else {
                    d.reject({serviceCode: 404});
                }
            }.bind(this));
            return d.promise;
        },

        _log : function(message) {
            if (this._logEnabled) {
                console.log(message);
            }
        }
    });
});
