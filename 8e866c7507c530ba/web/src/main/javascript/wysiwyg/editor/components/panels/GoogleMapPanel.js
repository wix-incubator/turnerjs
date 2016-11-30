/**
 * @Class wysiwyg.editor.components.panels.GoogleMapPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.GoogleMapPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_getLocationFromAddressField', '_getGeoLocationFromAddress', '_getGeoLocationFromAddress']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['GeoMap']);

    def.fields({
        API_KEY : 'AIzaSyCWeeateTaYGqsHhNcmoDfT7Us-vLDZVPs'
    });

    /**
     * @lends wysiwyg.editor.components.panels.GoogleMapPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            var thisPanel = this;
            this.addInputGroupField(function(){
                this.addSubmitInputField( this._translate("GOOGLE_MAP_ADDRESS"),
                        this._translate("GOOGLE_MAP_ADDRESS_PH"),
                        null,
                        null,
                        this._translate("GENERAL_FIND"),
                        null,
                        null
                    ).bindToField('address').bindHooks(thisPanel._getLocationFromAddressField).runWhenReady( function(submitInputLogic) {
                        this._addressInput = submitInputLogic;
                    }.bind(thisPanel));
            });


            this.addInputGroupField(function(){
                var infoText = this.addSubmitTextAreaField( this._translate("GENERAL_DESCRIPTION"), this._translate("GOOGLE_MAP_DESCRIPTION_PH"), null, null, '50px', this._translate("GENERAL_SET"), null).bindToField('addressInfo');
                this.addEnabledCondition(infoText, function() {
                    return (thisPanel._previewComponent.getState() != 'error');
                }.bind(thisPanel));
            });


            this.addInputGroupField(function(){
                this.addComboBox(this._translate('GOOGLE_MAP_MAP_TYPE')).bindToProperty('mapType');
            });

            this.addInputGroupField(function(){
                this.addLabel(this._translate('GOOGLE_MAP_ALLOW'));
                this.addCheckBoxField(this._translate('GOOGLE_MAP_SHOW_CONTROL_MAP_TYPE')).bindToProperty('showMapType');
                this.addCheckBoxField(this._translate('GOOGLE_MAP_SHOW_CONTROL_ZOOM')).bindToProperty('showZoom');
                this.addCheckBoxField(this._translate('GOOGLE_MAP_SHOW_CONTROL_POSITION')).bindToProperty('showPosition');
                this.addCheckBoxField(this._translate('GOOGLE_MAP_SHOW_CONTROL_STREET_VIEW')).bindToProperty('showStreetView');
                this.addCheckBoxField(this._translate('GOOGLE_MAP_ALLOW_MAP_DRAGGING')).bindToProperty('mapDragging');
            });

            this.addStyleSelector();
            this.addAnimationButton();
        },

        /**
         * - Calls google api (async) to transform address to lat/long data fields.
         * - Presents a validation error in case no such address is found
         * @param address
         */

        _getLocationFromAddressField: function(address) {
            if(address.match(/(-?[0-9]+\.[0-9]+), *?(-?[0-9]+\.[0-9]+)/g)) {
                return this._getGeoLocationFromCoordinates(address);
            } else {
                return this._getGeoLocationFromAddress(address);
            }
        },

        _getGeoLocationFromCoordinates: function(address) {
            var latlngStr = address.split(',',2);
            var lat = parseFloat(latlngStr[0]);
            var lng = parseFloat(latlngStr[1]);

            var req = new Request.JSONP({
                url: 'http://maps.googleapis.com/maps/api/js?key=AIzaSyCWeeateTaYGqsHhNcmoDfT7Us-vLDZVPs&sensor=true',
                onComplete: function(){
                    var geocoder = new google.maps.Geocoder();
                    var latlng = new google.maps.LatLng(lat,lng);
                    geocoder.geocode({'latLng': latlng}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                this._previewComponent.setState('normal');
                                var locationObj = latlng;
                                this._data.setFields({'address': address});
                                this._data.setFields({'latitude': locationObj.lat(), 'longitude': locationObj.lng()});
                                this._addressInput.resetInvalidState();
                            }
                        } else {
                            this._previewComponent.setState('error');
                            this._addressInput.showValidationMessage(this._translate('GOOGLE_MAP_INVALID_ADDRESS_VAL_ERR'));
                            this._data.setFields({"latitude" : null, "longitude": null});
                        }
                    }.bind(this));
                }.bind(this)
            }).send();

            return address;
        },

        _getGeoLocationFromAddress : function (address) {
            var req = new Request.JSONP({
                url: 'http://maps.googleapis.com/maps/api/js?key=AIzaSyCWeeateTaYGqsHhNcmoDfT7Us-vLDZVPs&sensor=true',
                onComplete: function(){
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode( { 'address': address}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            this._previewComponent.setState("normal");
                            var locationObj = results[0].geometry.location;
                            this._data.setFields({"latitude" : locationObj.lat(), "longitude":locationObj.lng()});
                            this._addressInput.resetInvalidState();
                        }
                        else {
                            this._previewComponent.setState("error");
                            this._addressInput.showValidationMessage(this._translate('GOOGLE_MAP_INVALID_ADDRESS_VAL_ERR'));
                            this._data.setFields({"latitude" : null, "longitude": null});
                        }
                    }.bind(this));
                }.bind(this)
            }).send();

            return address;
        }
    });
});