/**
 * @class wysiwyg.common.utils.TextMigrationHandler
 */
define.Class('wysiwyg.common.utils.TextMigrationHandler', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize(['wysiwyg.common.utils.TextStylesMigration',
    'wysiwyg.common.utils.TextSimpleFormatMigration']);

    def.resources(['W.Data', 'W.Config', 'W.Theme']);


    def.methods({
        initialize:function () {
            this._stylesMigration = new this.imports.TextStylesMigration();
            this._simpleMigration = new this.imports.TextSimpleFormatMigration();
            var self = this;
            if (this.resources.W.Config.env.$isEditorFrame) {
                this.resource.getResourceValue('W.Preview', function (preview) {
                    preview.getPreviewManagersAsync(self._initViewerManagers, self);
                });

            } else {
                this._initViewerManagers(this.resources.W);
            }
        },

        _initViewerManagers: function(managers){
            this._viewer = {
                theme:managers.Theme,
                data:managers.Data
            };
        },

        migrateComponent:function (editedComponent) {
            this._changeData(editedComponent);
            this._changeSkin(editedComponent);

            var dataItem = editedComponent.getDataItem();
            if (dataItem && dataItem.get('text')) {
                return this.migrateText(dataItem.get('text'), null, null);
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
            this._stylesMigration.migrateElement(container, defaultTag, defaultClass);
            this._simpleMigration.migrateElement(container);
            return container.get('html');
        },

        _changeData:function (editedComponent) {
            var text = editedComponent.getDataItem().get('text');
            var newData = this._viewer.data.addDataItemWithUniqueId('', {
                'type':'StyledText',
                'text':text,
                'stylesMapId':'CK_EDITOR_PARAGRAPH_STYLES'
            }).dataObject;
            editedComponent.setDataItem(newData);
        },

        _changeSkin: function (editedComponent) {
            this._viewer.theme.getStyle('txtNew', function (paramsMapper) {
                editedComponent.setStyle(paramsMapper);
            }, 'wysiwyg.viewer.skins.WRichTextNewSkin');
        }

    });
});
