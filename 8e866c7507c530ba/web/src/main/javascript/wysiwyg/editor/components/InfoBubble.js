define.component('wysiwyg.editor.components.InfoBubble', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.inherits('core.components.base.BaseComp');

    def.resources([]);

    def.skinParts({
        wrapper: {type:'htmlElement'},
        titleLabel: {type:'htmlElement'},
        close: {type:'htmlElement'},
        body: {type:'htmlElement'},
        footer: {type:'htmlElement'},
        checkbox: {type:'htmlElement'},
        checkboxLabel: {type:'htmlElement'}
    });

    def.binds(['_onCloseBtnClick', '_onCheckBoxChange']);

    def.fields({});

    def.statics({});

    def.methods({

        /*
        * args = {
        *   width: bubble width
        * }
        */
        initialize: function(compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);

            this._texts = {
                titleText: args.titleText || "",
                bodyText: args.bodyText || "",
                checkBoxText: args.checkBoxText || ""
            }
        },

        _onRender: function (renderEvent) {
            var invalidation = renderEvent.data.invalidations;
            if (invalidation.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._skinParts.close.addEvent("click", this._onCloseBtnClick);
                if(this._texts.titleText) {
                    this._skinParts.titleLabel.set("html", this._texts.titleText);
                    this._skinParts.body.setStyle("padding-top", "30px");
                } else {
                    this._skinParts.body.setStyle("padding-left", "10px");
                }
                this._skinParts.body.set("html", this._texts.bodyText);
                if(this._texts.checkBoxText){
                    this._skinParts.checkboxLabel.set("html", this._texts.checkBoxText);
                    this._skinParts.checkbox.addEvent("click", this._onCheckBoxChange);
                } else {
                    this._skinParts.footer.collapse();
                }
            }
        },

        _onCloseBtnClick: function () {
            this.fireEvent("close", null);
        },

        _onCheckBoxChange: function () {
            this.fireEvent("change", this._skinParts.checkbox.checked);
        },

        dispose: function () {
            this.exterminate();
        }

    });
});

