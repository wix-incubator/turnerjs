/**
 * @class wysiwyg.viewer.components.inputs.DateInput
 */
define.component('wysiwyg.viewer.components.inputs.DateInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts( {
        'year':{type:Constants.ComponentPartTypes.HTML_ELEMENT},
        'month':{type:Constants.ComponentPartTypes.HTML_ELEMENT},
        'day':{type:Constants.ComponentPartTypes.HTML_ELEMENT}
    });

    def.binds(['_userChange']);

    def.states({
        'validation':[
            'valid',
            'invalid'
        ]
    });

    def.dataTypes(['Text']);

    /**
     * @lends wysiwyg.viewer.components.inputs.DateInput
     */
    def.methods({
        initialize:function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.addEvent(this.VALID_STATE_CHANGED_EVENT, function (isValid) {
                this.setState(isValid ? 'valid' : 'invalid', 'validation');
            }.bind(this));
        },

        _onAllSkinPartsReady: function () {
            this._skinParts.year.addEvent(Constants.CoreEvents.CHANGE, this._userChange);
            this._skinParts.month.addEvent(Constants.CoreEvents.CHANGE, this._userChange);
            this._skinParts.day.addEvent(Constants.CoreEvents.CHANGE, this._userChange);
            var currentYear = new Date().getUTCFullYear();
            var i;
            for (i = 1979; i < currentYear + 6; i++) {
                this._skinParts.year.options.add(new Option(i, i));
            }
            for (i = 1; i < 13; i++) {
                this._skinParts.month.options.add(new Option(i, i));
            }
        },

        render:function () {
            var i;
            var isoDate = this._data.get('text');
            var parsedDate = new Date(isoDate);
            var year = parsedDate.getUTCFullYear();
            var month = parsedDate.getUTCMonth();
            var day = parsedDate.getUTCDate();

            this._skinParts.year[year - 1979].selected = true;
            this._skinParts.month[month].selected = true;
            while (this._skinParts.day.options.length) {
                this._skinParts.day.options.remove(this._skinParts.day.options[0]);
            }
            for (i = 1; i < this._getDaysForMonth(year, month) + 1; i++) {
                this._skinParts.day.options.add(new Option(i, i));
            }
            this._skinParts.day[day - 1].selected = true;
        },

        _userChange:function () {
            var date = new Date(0);
            date.setUTCFullYear(this._skinParts.year.getSelected()[0].value);
            date.setUTCMonth(this._skinParts.month.getSelected()[0].value - 1);
            date.setUTCDate(this._skinParts.day.getSelected()[0].value);
            this.getDataItem().set('text', date.toISOString());
            this.fireEvent('selectionChanged', date.toISOString());
        },

        _getDaysForMonth:function (year, month) {
            month--;
            return new Date(year, month, 0).getDate();
        }
    });

});