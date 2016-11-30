/**
 * @Class wysiwyg.editor.components.panels.LoginButtonPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.LoginButtonPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel', '_createFields']);

    def.utilize(['wysiwyg.common.utils.SiteMemberLanguages']);

    def.resources(['topology']);

    def.dataTypes(['LoginButton',""]);

    /**
     * @lends wysiwyg.editor.components.panels.LoginButtonPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            this.addStyleSelector();
            this.addAnimationButton();
            var self = this;
            var languagesObj=new this.imports.SiteMemberLanguages();
            var langugesArr= languagesObj._getLanguages(this);
            this.addInputGroupField(function (panel) {
                self._setDefaultLanguage();
                this.addComboBoxField(this._translate("PAGE_SECURITY_CHOOSE_SITE_MEMBER_LANG"),langugesArr,null,null,'SiteMember_Settings_language_ttid').bindToField("language");

            });
            var iconUrl = this.resources.topology.skins + '/images/wysiwyg/core/themes/editor_web/siteMember/sitememberInfoIcon.png';
            this.addLabel('', {"margin-top":"12px"}, undefined, iconUrl, {x:"6px", y:"0px"},  {width:'45px', height:'18px'});
            this.addLabel( this._translate("Login_Button__More_Info"), {'textAlign':'left', 'margin':'10px 20px 0px 10px','font-size':'14px'});
        },
        _setDefaultLanguage: function (){
            var langToSet;
            if (!this.getDataItem()){
                langToSet =  "en";
                this.getDataItem().set("language",langToSet);
            }else{
                if (this.getDataItem() &&  !this.getDataItem()._data.language){
                    langToSet =  this.resources.W.Config.getLanguage() || "en";
                    this.getDataItem().set("language",langToSet);
                }
            }
        }
    });
});