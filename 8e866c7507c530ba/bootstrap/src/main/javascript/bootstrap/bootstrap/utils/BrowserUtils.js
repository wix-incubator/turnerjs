define.resource('BrowserUtils',{
    getQueryParams: function () {
        try{
            var result = {},
                queryString = this._getQueryString(),
                re = /([^&=]+)=([^&]*)/g, m;

            while (m = re.exec(queryString)) {
                var key = decodeURIComponent(m[1]).toLowerCase();
                var val = decodeURIComponent(m[2]);
                if (!result[key]){
                    result[key] = [];
                }
                result[key].push(val);
            }
            return result;
        } catch(e){
            return {};
        }
    },

    _getQueryString: function(){
        return location.search.substring(1);
    }
});