define.Class("external_apis.flickr.FlickrAPI", function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.fields({
        _apiKey: "0f1c119e0c156ac4b80052270d0a3202",
        _apiURL: "https://api.flickr.com/services/rest/?format=json",
        _callback:undefined
    });

    def.methods({

        getUserID:function(userName, callback){
            var data;
            data = {
                method:     "flickr.people.findByUsername",
                username:   userName
            };
            this._callback = callback;
            this._call(data, function(response){
                    var success;
                    var message;
                    success     = response.stat!="fail";
                    message     = response.message;
                    if (success===true){
                        callback(success, response.user.id);
                    }else{
                        callback(success, message);
                    }
                });
            },

        getTags:function(userID, callback){
             var data;
            data = {
                method:     "flickr.tags.getListUser",
                user_id:    userID
            };
            this._callback = callback;
            this._call(data, function(response){
                var message;
                var success;
                success     = response.stat!="fail";
                message     = response.message;
                if (success===true){
                    callback(success, response.who.tags.tag);
                }else{
                    callback(success, message);
                }
            });
        },

        /**
         *  performs a call to the Flickr API
         * @param params - params: Name of method, params: Params to add to method
         */
        _call:function(params, requestHandler){
            params.api_key = this._apiKey;
            var tmp = new Request.JSONP ({
                url:    this._apiURL,
                callbackKey:    "jsoncallback",
                data: params,
                onComplete: requestHandler,
                timeout:5000,
                onFailure: this._handleTimeout
            });
            tmp.send();
        },

        _handleTimeout:function(){
            if (this._callback){
                this._callback(false, "Failed connecting to Flickr. Please try again in a few minutes.");
            }
        }
    });
});