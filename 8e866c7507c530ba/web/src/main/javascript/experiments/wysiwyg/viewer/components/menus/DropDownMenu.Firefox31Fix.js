define.experiment.component('wysiwyg.viewer.components.menus.DropDownMenu.Firefox31Fix', function (componentDefinition, experimentStrategy) {

    var def = componentDefinition,
        strategy = experimentStrategy;

    def.methods({
        initialize: strategy.after(function () {
            if (Browser && Browser.firefox31) {
                this.injects().Viewer.addEvent('SiteReady', this.initFirefox31Fix.bind(this));
            }
        }),

        dispose: strategy.after(function () {
            if (Browser && Browser.firefox31) {
                this.injects().Viewer.removeEvent('SiteReady', this.initFirefox31Fix);
            }
        }),

        initFirefox31Fix: function () {
            this._firefoxFixTrialsLeft = 20;
            window.setTimeout(this.fixFirefox31Bug.bind(this), 150);
        },

        fixFirefox31Bug: function () {
            if (this._firefoxFixTrialsLeft > 0 && this._getButtonsWidth() > this.getWidth()) {
                this.render();
                this._firefoxFixTrialsLeft--;
                window.setTimeout(this.fixFirefox31Bug.bind(this), 150);
            }
        }
    });
});