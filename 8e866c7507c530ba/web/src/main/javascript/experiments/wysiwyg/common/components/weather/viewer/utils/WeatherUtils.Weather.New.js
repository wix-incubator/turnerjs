define.experiment.newClass('wysiwyg.common.components.weather.viewer.utils.WeatherUtils.Weather.New', function(def) {

    def.methods({

        /**.
         * Performs XHR (or XDomainRequest for old IE) to specified url and returns Q promise, that resolves with result,
         * or rejects with status code
         *
         * @param {String} url to which send request
         * @param {String} [methodName] HTTP method to request with. Defaults to GET
         * @returns {Promise}
         */
        fetchRemoteData : function(url, methodName) {

            methodName = methodName || 'GET';
            var d = Q.defer();

            var xhr = ('XDomainRequest' in window) ? new window.XDomainRequest() : new window.XMLHttpRequest();
            xhr.open(methodName, url, true);

            function onLoad() {
                try {
                    var data = JSON.parse(xhr.responseText);
                    d.resolve(data);
                } catch (e) {
                    d.reject({code : -1, description : 'failed to parse json'});
                }
            }

            // XHR case

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        onLoad();
                    } else {
                        d.reject({code : xhr.status});
                    }
                }
            }.bind(this);

            // XDomainRequest cases

            xhr.onload = onLoad.bind(this);

            xhr.onerror = function() {
                d.reject({code : xhr.responseText});
            };

            xhr.send(null);

            return d.promise;
        },

        fetchRemoteJSONPData : function(url, params, cbKey) {
            var d = Q.defer();

            function onSuccess(response) {
                d.resolve(response);
            }

            function onError(error) {
                d.reject(error);
            }

            var request = new Request.JSONP ({
                url : url,
                callbackKey : cbKey || 'callback',
                data : params,
                onComplete : onSuccess,
                timeout : 5000,
                onFailure : onError
            });
            request.send();
            return d.promise;
        }
    });
});