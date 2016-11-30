define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.WalkMe', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(strategy.merge([
        '_callBackWhenWalkMeLoaded'
    ]));

    def.utilize(strategy.merge(['wysiwyg.editor.managers.wedit.WalkMe']));

    def.methods({

        _siteLoadedExtra:strategy.after(function (siteStructureData) {
            if (window.wixEditorLangauge == "en") {
                this._walkMe = new this.imports.WalkMe();
                this._walkMe.callBackWhenWalkMeLoaded(this._callBackWhenWalkMeLoaded);
            }
        }),

        _callBackWhenWalkMeLoaded:function(){
            this.fireEvent('WALK_ME_LOADED', this._walkMe);
        },

        getWalkMe:function () {
            return this._walkMe;
        }
    });


});

