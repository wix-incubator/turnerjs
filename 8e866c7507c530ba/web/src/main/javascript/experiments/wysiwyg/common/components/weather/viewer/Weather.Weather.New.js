define.experiment.newComponent('wysiwyg.common.components.weather.viewer.Weather.Weather.New', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.propertiesSchemaType('WeatherProperties');
    def.dataTypes(['Weather']);

    def.utilize([
        'wysiwyg.common.components.weather.viewer.utils.WeatherUtils',
        'wysiwyg.common.components.weather.common.WeatherConsts'
    ]);

    def.skinParts({
        'degreesBox' : {type : 'htmlElement'},
        'degreesValue'  : {type : 'htmlElement'},
        'degreesUnit'   : {type : 'htmlElement'}
    });

    def.fields({
        degrees: null
    });

    def.statics({
        UNIT_MAP : {
            fahrenheit : 'F',
            celsius : 'C'
        },
        _resizableSides : [
        ],
        _logEnabled : false,
        _weatherUtils : null,
        _weatherConsts : null
    });

    def.resources(['W.Config']);

    def.methods({

        initialize : function(a, b, c) {
//            this.setMinW(60);
            this.parent(a, b, c);
            this._weatherUtils = new this.imports.WeatherUtils();
            this._weatherConsts = new this.imports.WeatherConsts();
        },

        /**
         * Executed after user changed something in editor (either location or degree unit)
         * @param event
         * @config {boolean} [options.all] if true, will enforce data refetch and rerender
         * @private
         */
        _onDataChange: function (event, options) {

            var dataItem = this.getDataItem();

            if (this._isFieldChanged(event, 'locationId') || options.all) {

                this._displayTemperature('', '');

                var location = dataItem.get('locationId');
                this._log('Location changed: ' + location);

                if (location) {
                    this._fetchWeatherData(location).then(function (data) {
                        this.degrees = data.degrees;
                        if (this.degrees !== null) {
                            this._log('Fetched: ' + this.degrees);
                            var unit = dataItem.get('degreesUnit');
                            this._displayTemperature(this.degrees, unit);
                        }
                    }.bind(this));
                }
            }

            if (this._isFieldChanged(event, 'degreesUnit') && this.degrees !== null) {
                var unit = dataItem.get('degreesUnit');
                if (unit && this.degrees !== null) {
                    this._displayTemperature(this.degrees, unit);
                }
            }

            this._updateFontSizeForMobile();
        },

        /**
         * Performs rendering of temperature
         *
         * @param degrees
         * @param unit
         * @private
         */
        _displayTemperature : function(degrees, unit) {
            this._log('Unit: ' + unit);
            if (unit && degrees !== null && degrees !== undefined) {
                this._skinParts.degreesValue.innerHTML = this._setTemperatureSign(
                    this._convertTemperature(degrees, unit)
                );
                this._skinParts.degreesUnit.innerHTML = this.UNIT_MAP[unit];
            } else{
                this._skinParts.degreesUnit.innerHTML = '';
                this._skinParts.degreesValue.innerHTML = '';
            }
            this.setWidth(this._skinParts.degreesBox.offsetWidth);
        },

        /**
         * Using DataChange event object determine, if field with name fieldName has changed
         * @param {object} event
         * @param {string} fieldName
         * @returns {boolean}
         * @private
         */
        _isFieldChanged : function(event, fieldName) {
            return !!_.find(event.data.invalidations._invalidations.dataChange, function(item) {
                // item.field === undefined - fixes Reset Item button in mobile editor
                return item.field === fieldName || item.field === undefined;
            });
        },

        /**
         * Looks for temperature for selected in editor locationId using wunderground.com API. We expect, that supplied
         * location is valid, since we use same service to select it.
         *
         * @see http://www.wunderground.com/weather/api/
         *
         * @param location id of location in wunderground.com
         * @returns {Promise} which resolves to
         * {
         *   degrees : 42, // temperature in Kelvin
         *   location : 'London'// location name
         * }
         * or rejects with:
         * {
         *   code : 404 // Http status code
         *   serviceCode : 404 // response is OK, but service says 'not found'
         * }
         * @private
         */
        _fetchWeatherData : function(location) {

            if (!location) {
                return Q.reject();
            }
            var deferred = Q.defer(),
//                url = 'http://api.wunderground.com/api/' + this._weatherConsts.API_KEY + '/conditions/q/zmw:' + location + '.json';
                lat = location.split(this._weatherConsts.LOCATION_ID_SEPARATOR)[0],
                lng = location.split(this._weatherConsts.LOCATION_ID_SEPARATOR)[1],
                url = 'http://api.openweathermap.org/data/2.5/weather?mode=json&units=kelvin&lat=' + lat + '&lon=' + lng;

            this._weatherUtils.fetchRemoteJSONPData(url, {}).then(function(data) {
                deferred.resolve({degrees : data.main.temp});
            }, function(reason) {
                deferred.reject(reason);
            });

            this._log('Started to load weather data');
            return deferred.promise;
        },

        _updateFontSizeForMobile : function() {
            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                var fontSize = this.getComponentProperties().get('mobileFontSize');
                if (typeof(fontSize) === 'number') {
                    this._skinParts.degreesUnit.setStyle('font-size', fontSize);
                    this._skinParts.degreesValue.setStyle('font-size', fontSize);
                    return;
                }
            }
            this._skinParts.degreesUnit.setStyle('font-size', null);
            this._skinParts.degreesValue.setStyle('font-size', null);
        },

        _onRender: function (e) {

            if (e.data.invalidations.isInvalidated([
                this.INVALIDATIONS.SKIN_CHANGE
            ])) {
                this._onDataChange(e, {all : true});
            } else if (e.data.invalidations.isInvalidated([
                this.INVALIDATIONS.FIRST_RENDER,
                this.INVALIDATIONS.PROPERTIES_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE
            ])) {
                this._onDataChange(e, {});
            }
        },

        /**
         *
         * @param {number} kelvinValue
         * @param {string} targetUnit target unit to convert value to. 'celsius' and 'fahrenheit' are supported only
         * @private
         * @return {number} temperature converted to targetUnit
         */
        _convertTemperature : function(kelvinValue, targetUnit) {
            if (kelvinValue === null || kelvinValue === undefined) {
                return null;
            }
            var newValue;
            if (targetUnit === 'celsius') {
                newValue = kelvinValue - 273.15;
            } else if (targetUnit === 'fahrenheit') {
                newValue = 9 / 5 * (kelvinValue - 273) + 32;
            } else {
                throw new Error('Unknown target unit ' + targetUnit);
            }
            return newValue;

        },

        _setTemperatureSign : function(value) {
            value = Math.round(value);
            if (value < 0) {
                return '-' + Number.toFixed(Math.abs(value), 0);
            } else if (value > 0 ) {
                return '+' + Number.toFixed(Math.abs(value), 0);
            } else {
                return '0';
            }
        },

        _log : function(message) {
            if (this._logEnabled) {
                console.log(message);
            }
        }
    });
});
