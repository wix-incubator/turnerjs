define.experiment.component('Editor.wysiwyg.common.components.onlineclock.viewer.OnlineClock.OnlineClock', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.resources(['W.Config', 'W.Utils']);

    def.panel({
        logic: 'wysiwyg.common.components.onlineclock.editor.OnlineClockPanel',
        skin: 'wysiwyg.common.components.onlineclock.editor.skins.OnlineClockPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        componentPanel: ''
    });

    def.statics({
        '12_hour_clock_countries' : ['CAN', 'GBR', 'PHL', 'USA'],
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            }
        }
    });

    def.methods({
        initialize: strategy.after(function (compId, viewNode, args) {
            this._resizableSides = [];
            this._rotatable = true;
        }),
        _onFirstRender: strategy.after(function (e) {
            if (this.getComponentProperties().get('timeFormat') === '') {
                if (~this['12_hour_clock_countries'].indexOf(this.resources.W.Utils.getCountryCode())) {
                    this.getComponentProperties().set('timeFormat', 'full_12');
                } else {
                    this.getComponentProperties().set('timeFormat', 'full_24');
                }
            }
            this._resetSize();
        }),
        _onEachRender: strategy.before(function (e) {
            if (!this.resources.W.Config.env.$isEditorFrame) {
                if (e.data.invalidations.isInvalidated([
                    this.INVALIDATIONS.DATA_CHANGE,
                    this.INVALIDATIONS.PROPERTIES_CHANGE,
                    this.INVALIDATIONS.STYLE_PARAM_CHANGE,
                    this.INVALIDATIONS.SKIN_CHANGE
                ])) {
                    this._resetSize();
                } else if (e.data.invalidations.isInvalidated([this.INVALIDATIONS.MEASURED_SIZE_DIFFERS_FROM_REQUESTED])) {
                    this._updateSize();
                }
            }
        }),
        _resetSize: function () {
            this.setWidth(30);
            this.setHeight(15);
        },
        _updateSize: function () {
            var measure = this.getMeasure();
            this.setWidth(measure.width);
            this.setHeight(measure.height);
        }
    });

});
