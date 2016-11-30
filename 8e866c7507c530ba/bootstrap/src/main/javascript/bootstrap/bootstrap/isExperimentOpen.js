window.W = window.W || {};
(function(scope) {
    var f = scope.isExperimentOpen = function(experimentName) {
        if (typeof experimentName !== 'string') {
            throw new Error('experimentName argument must be a string, received: ' + JSON.stringify(experimentName));
        }

        if (window.W && window.W.Experiments) {
            return window.W.Experiments.isDeployed(experimentName);
        }

        function createDict() {
            return (Object.create && Object.create(null)) || {};
        }

        function getExperimentsFromQueryString(qs) {
            qs = qs || window.location.search;
            var regExp = /[&?]experiment=([^&:]+)(?:[:]([^&]+))?/ig,
                match, name, value, result = createDict();

            while(match = regExp.exec(qs)) {
                name = match[1].toLowerCase();
                value = match[2];
                result[name] = !value || value.toLowerCase() === 'new';
            }

            return result;
        }

        f.queryStringExperiments = f.queryStringExperiments || getExperimentsFromQueryString();

        experimentName = experimentName.toLowerCase();

        var experimentInQueryString = f.queryStringExperiments[experimentName];

        if (experimentInQueryString !== undefined) {
            return experimentInQueryString === true;
        }

        function modelToExperimentsSet(obj) {
            var result = createDict(), val;
            for(var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    val = obj[key];
                    if (typeof val === 'string' && val.toLowerCase() === 'new') {
                        result[key.toLowerCase()] = true;
                    }
                }
            }

            return result;
        }

        function getExperimentsFromModel() {
            var model = window.rendererModel || window.editorModel || {};
            return modelToExperimentsSet(model.runningExperiments);
        }

        f.modelExperiments = f.modelExperiments || getExperimentsFromModel();

        return !!f.modelExperiments[experimentName];
    };
})(window.W);
