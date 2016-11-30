define.experiment.Class('wysiwyg.editor.components.traits.BindValueToData.WatermarkSettings', function(def, strategy){
    def.methods({
        getFilteredMap: function(rawData, filter){
            if (!rawData || typeof rawData != 'object') {
                return rawData;
            }
            var filteredData = {};
            filter.forEach(function (key) {
                filteredData[key] = rawData[key];
            });
            return filteredData;
        }
    });
});