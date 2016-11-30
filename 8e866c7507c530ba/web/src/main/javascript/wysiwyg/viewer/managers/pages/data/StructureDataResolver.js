define.Class('wysiwyg.viewer.managers.pages.data.StructureDataResolver', function(classDefinition){
    "use strict";
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.viewer.managers.pages.data.LocalDataResolver');

    def.methods({

        _preparePageData: function(){
            var siteStructure = document.getElementById('SITE_STRUCTURE');
            if(!siteStructure){
                return;
            }
            var data = this._createSiteDataComponents(siteStructure),
                pagesContainer = _.find(data.components, { id: 'PAGES_CONTAINER' }),
                sitePages = _.find(pagesContainer.components, { id: 'SITE_PAGES' }),
                pages = sitePages.components;


            sitePages.components =[];

            this._siteData = {
                masterPage: {
                    structure: {
                        children: data.components
                    },
                    data: window.wixData
                },
                pages: []
            };

            this._fixPageData(this._siteData.masterPage);


            _.forEach(pages, function(page){

                var pageId = page.id;

                this._pageIds.push(pageId);

                var pageData = {
                    structure: page
                };

                this._fixPageData(pageData);

                this._pagesData[pageId] = pageData;

                this._siteData.pages.push(pageData);

            }.bind(this));

            this._setData(window.wixData);

            siteStructure.parentNode.removeChild(siteStructure);
            window.wixData = null;
            window.anchors = null;
        },

        _createSiteDataComponents: function(root){

            var data = {
                id: root.getAttribute('id'),
                skin: root.getAttribute('skin'),
                componentType: root.getAttribute('comp'),
                styleId: root.getAttribute('styleId'),
                dataQuery: root.getAttribute('dataQuery'),
                layout: {
                    width: root.getAttribute('width'),
                    height: root.getAttribute('height'),
                    x: root.getAttribute('x'),
                    y: root.getAttribute('y'),
                    anchors: window.anchors[root.getAttribute('id')]
                },
                propertyQuery: root.getAttribute('propertyQuery'),
                components: []

            };

            _.forEach(root.children, function(node){
                data.components.push(this._createSiteDataComponents(node));
            }.bind(this));

            return data;
        }
    });
});
