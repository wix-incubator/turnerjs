/** @class wixapps.apps.rssfeed.GoogleFeed */
define.experiment.newClass('wysiwyg.common.components.weather.common.GoogleMaps.Weather.New', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(["scriptLoader"]);

    def.binds(["_mapsLoaded"]);

    def.fields({
        _readyCallback: null,
        _libraries: []
    });

    def.methods({
        load: function(readyCallback, libraries) {

            this._readyCallback = readyCallback;
            this._libraries = libraries;

            this.resources.scriptLoader.loadResource(
                {
                    url: 'http://maps.googleapis.com/maps/api/js?libraries=' + this._libraries.join(',') + '&sensor=true',
                    usePlugin: 'js'
                },
                this
            );
        },
        onLoad: function () {
            var scriptElement = document.createElement('script');
            scriptElement.setAttribute('src', 'http://maps.gstatic.com/cat_js/intl/ru_ALL/mapfiles/api-3/17/7/%7B' + (['main'].concat(this._libraries)).join(',') + '%7D.js');
            document.body.appendChild(scriptElement);
            scriptElement.onload = this._mapsLoaded.bind(this);
        },
        onFailed: function () {
        },
        _mapsLoaded: function () {
            if (this._readyCallback) {
                this._readyCallback();
            }
        }
    });
});