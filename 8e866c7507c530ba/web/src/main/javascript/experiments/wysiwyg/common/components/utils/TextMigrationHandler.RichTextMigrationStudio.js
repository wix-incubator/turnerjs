/**
 * studio migration, doesn't apply line-height on the blocks, and doesn't add the line height span
 */
define.experiment.Class('wysiwyg.common.utils.TextMigrationHandler.RichTextMigrationStudio', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        migrateComponent:function (editedComponent) {
            this._changeData(editedComponent);
            this._changeSkin(editedComponent);

            var dataItem = editedComponent.getDataItem();
            if (dataItem && dataItem.get('text')) {
                var text = this.migrateText(dataItem.get('text'), null, null);
                if(this._hasStyleOverrides){
                    editedComponent.getViewNode().addClass('hasOverrides');
                }
                return text;
            }
            return null;
        },

        /**
         *
         * @param html
         * @param defaultTag
         * @param defaultClass
         */
        migrateText:function (html, defaultTag, defaultClass) {
            this._hasStyleOverrides = false;
            defaultTag = defaultTag || 'p';
            defaultClass = defaultClass || 'font_8';
            if (typeOf( html) !== "string" ) {
                //BI?
                return null;
            }
            if(html === ""){
                return '<{0} class="{1}"></{0}>'.substitute([defaultTag, defaultClass]);
            }
            //var container = document.createElement('div').set('html', html);
            var container = new Element('div');
            container.set('html', html);
            this._hasStyleOverrides = this._stylesMigration.migrateElement(container, defaultTag, defaultClass);
            this._simpleMigration.migrateElement(container);
            return container.get('html');
        }
    });

});