define.experiment.newClass('wysiwyg.viewer.managers.SocialActivityDataManager.SocialActivity.New', function(def) {

    def.inherits('core.managers.data.DataManager');


    def.fields({});

    def.statics({
        _defaultPresets: {
            'id01': {
                'type': 'SocialActivitySettings',
                'activeNetworks': ["fb", "tw"],
                iconSize: 35,
                showCondition: 1,
                theme: 'light'
            },
            'id02': {
                'type': 'SocialActivitySettings',
                'activeNetworks': ["fb", "tw", "pi"],
                iconSize: 25,
                showCondition: 1,
                theme: 'default'
            },
            'id03':{
                'type': 'SocialActivitySettings',
                'activeNetworks': ["fb", "tw", "pi"],
                iconSize: 25,
                showCondition: 1,
                theme: 'default'
            },
            'id04': {
                'type': 'SocialActivitySettings',
                'activeNetworks': ["fb", "tw", "pi"],
                iconSize: 25,
                showCondition: 1,
                theme: 'default'
            }
        }
    });

    def.resources(['SN.FacebookSocialNetwork', 'SN.TwitterSocialNetwork', 'SN.PinterestSocialNetwork']);

    def.methods({
        initialize: function() {
            this.parent();
        },
        getDefaultPreset: function(){
            //TODO: Check return type;
            return Object.values(this.getPresets())[0];
        },
        getPresets: function(){

            if(!this.isDataAvailable('#id01')){
                this._createPreset();
            }

            return this.getDataByQueryList(Object.keys(this._defaultPresets).map(function(str){ return '#' + str; }));
        },
        _createPreset: function(){
            _.each(this._defaultPresets, function(obj, index){
                this.addDataItem(index, obj);
            }, this);
        },
        isPreset: function(dataItem){
            if(dataItem && this._defaultPresets[dataItem.get('id')]){
                return true;
            }

            return false;
        },
        getSocialNetwork: function(networkName){
            var networks = {
                fb: this.resources.SN.FacebookSocialNetwork,
                tw: this.resources.SN.TwitterSocialNetwork,
                pi: this.resources.SN.PinterestSocialNetwork
            };

            return networks[networkName] || networks;
        }
    });


//    var cssRules = {
//        sheet: function(doc){
//            if(!this.styleSheet){
//                var style = doc.createElement("style");
//                // WebKit hack :(
//                style.appendChild(doc.createTextNode(""));
//                doc.head.appendChild(style);
//                this.styleSheet = style.sheet;
//            }
//            return this.styleSheet;
//        },
//        addCSSRule: function(doc, selector, rules, index) {
//            var sheet = this.sheet(doc);
//            console.log(sheet);
//            if(sheet.insertRule) {
//                sheet.insertRule(selector + "{" + rules + "}", index);
//            }
//            else {
//                sheet.addRule(selector, rules, index);
//            }
//        },
//        resetStyles: function(compId){
//            for (var i=0; i< this.styleSheet.rules.length; i++){
//                if(this.styleSheet.rules[i].selectorText.indexOf(compId) >= 0){
//                    this.styleSheet.removeRule(i);
//                }
//            }
//        }
//    };
//
//    def.inherits('bootstrap.managers.BaseManager');
//
//    def.utilize(['core.components.image.ImageUrlNew']);
//
//    def.statics({
//        defaultPreset: null,
//        _socialBarActiveComponents: null,
//        _activeComponents: {},
//        _stylesAppended: false,
//        _document: null,
//        THEME_NAMES: {
//            'default': 'dark',
//            'light': 'light'
//        }
//    });
//
//    def.methods({
//        initialize: function(params){
//            this.defaultPreset = this.getDefaultPreset();
//            this._socialBarActiveComponents = this._getDataFromLocalStorage();
//
//            this.serverAddress = new this.imports.ImageUrlNew();
//
////            if($('live-preview-iframe')){
////                resource.getResources(["W.Editor", "W.Preview", "W.Commands", "W.Theme"], function (resources) {
////                    console.log('editor');
////                    this._resources = resources;
////                    this._compFactory = this._resources.W.Preview;
////                    this._resources.W.Commands.registerCommandAndListener("PreviewIsReady", this, this._init);
////                }.bind(this));
////            } else {
////                resource.getResources(["W.Viewer", "W.Commands", "W.Theme"], function (resources) {
////                    console.log('viewer');
////                    this._resources = resources;
////                    this._compFactory = this._resources.W.Viewer;
////                    this._init();
////                }.bind(this));
////            }
//
//            resource.getResources(["W.Viewer", "W.Commands", "W.Theme"], function (resources) {
//                console.log('viewer');
//                this._resources = resources;
//                this._compFactory = this._resources.W.Viewer;
//                this._init();
//            }.bind(this));
//
//        },
//        _init: function(){
//            var that = this;
//            Object.keys(that._socialBarActiveComponents).forEach(function(key){
//                that.addSBarToComponent(key);
//            });
//            this._isReady = true;
//        },
//        getDefaultPreset: function(){
//            return {
//                activeNetworks: {
//                    'fb': true,
//                    'tw': true,
//                    'pi': true
//                },
//                iconSize: 25,
//                showCondition: 1,
//                theme: 'default'
//            };
//        },
//        _getComponentById: function(componentId){
//            return this._compFactory.getCompLogicById(componentId);
//        },
//        _getDataFromLocalStorage: function(){
//            var componentsLocalData;
//
//            if(componentsLocalData = localStorage.getItem('SocialActivity.activeComponents')){
//                componentsLocalData = JSON.parse(componentsLocalData);
//            } else {
//                componentsLocalData = {};
//            }
//
//            return componentsLocalData;
//        },
//        _setDataToLocalStorage: function(){
//            localStorage.setItem('SocialActivity.activeComponents', JSON.stringify(this._socialBarActiveComponents));
//        },
//        isComponentSocialActive: function(componentId){
//            return (componentId in this._socialBarActiveComponents);
//        },
//        getComponentSBsrSettings: function(componentId){
//            if(componentId && this.isComponentSocialActive(componentId)){
//                return ((componentId in this._socialBarActiveComponents) && this._socialBarActiveComponents[componentId] !== "" ? this._socialBarActiveComponents[componentId] : this.getDefaultPreset());
//            }
//            return this.getDefaultPreset();
//        },
//        turnOnOffComponentSocialActivity: function(componentId, isOn){
//            if(!componentId) return;
//
//            if(!this.isComponentSocialActive(componentId) && isOn){
//                this._socialBarActiveComponents[componentId] = "";
//
//                this.addSBarToComponent(componentId);
//
//            } else if(!isOn && this.isComponentSocialActive(componentId)){
//
//                this.removeSBarFromComponent(componentId);
//
//                delete this._socialBarActiveComponents[componentId];
//            }
//
//            this._setDataToLocalStorage();
//        },
//        isComponentTurnedOn: function(componentId){
//            return (componentId in this._activeComponents);
//        },
//        addSBarToComponent: function(componentId){
//            console.log(this.isComponentSocialActive(componentId), componentId);
//
//            if(this.isComponentSocialActive(componentId) && !this.isComponentTurnedOn(componentId)){
//                if(W.Config.env.$isPublicViewerFrame){
//                    setTimeout(function(){
//                        var cmp = this._getComponentById(componentId);
//                        cmp && cmp.on(Constants.LifecycleSteps.RENDER, this, this._onRender);
//                        console.log('Add', cmp);
//                        this._activeComponents[componentId] = true;
//                    }.bind(this), 0);
//                } else {
//                    var cmp = this._getComponentById(componentId);
//                    cmp && cmp.on(Constants.LifecycleSteps.RENDER, this, this._onRender);
//                    cmp && this.buildSocialBar(cmp);
//                    this._activeComponents[componentId] = true;
//                }
//
//            }
//        },
//        removeSBarFromComponent: function(componentId){
//            var cmp = this._getComponentById(componentId);
//            console.log('remove', cmp);
//            cmp && cmp.off(Constants.LifecycleSteps.RENDER, this, this._onRender);
//            cmp && this._removeSocialBar(cmp);
//            delete this._activeComponents[componentId];
//        },
//        _onRender: function(evt){
//            var comp = evt.target,
//                invalidation = evt.data.invalidations._invalidations;
//
//            if('firstRender' in invalidation || 'skinChange' in invalidation){
//                this.buildSocialBar(comp);
//            }
//        },
//        buildSocialBar: function(comp, customSettings){
//            this._removeSocialBar(comp);
//            var _doc = $('live-preview-iframe') ? $('live-preview-iframe').contentDocument : document;
//            if(!this._stylesAppended){
//                cssRules.addCSSRule(_doc, ".socialActivityBar", 'position: absolute; bottom: 10px; right: 10px;');
//                cssRules.addCSSRule(_doc, ".socialActivityBar li", 'display: inline-block; list-style:none; width: 25px; height: 25px; background: transparent no-repeat right center; background-size: 100%; margin-right: 3px');
//                this._stylesAppended = true;
//            }
//
//            var settings = customSettings || this.getComponentSBsrSettings(comp.getComponentId()),
//                componentView = comp._view,
//                self = this,
//                sBar = document.createElement('ul');
//
//            sBar.addClass('socialActivityBar');
//
//            Object.keys(settings.activeNetworks).forEach(function(sn){
//                var li = document.createElement('li');
//                sBar.appendChild(li);
//
//                li['style']['backgroundImage'] = 'url(' + this.getIconsLink(sn, settings.theme) + ')';
//
//                (function(socialNetwork, component){
//
//                    li.addEventListener('click', function(e){
//
//                        self._socialAction(socialNetwork, component, self.serverAddress);
//
//                    }, false)
//                })(sn, comp);
//            }.bind(this));
//
//            if(settings.showCondition == '2'){
//                cssRules.addCSSRule(_doc, "#" +comp.getComponentId()+ " .socialActivityBar", 'display: none;');
//                cssRules.addCSSRule(_doc, "#" +comp.getComponentId()+ ":hover .socialActivityBar", 'display: block;');
//            }
//
//            cssRules.addCSSRule(_doc, "#" +comp.getComponentId()+ " .socialActivityBar li", 'height: '+ settings.iconSize +'px; width: '+ settings.iconSize +'px');
//
//            comp.sBar = sBar;
//
//            componentView.appendChild(sBar);
//        },
//        _removeSocialBar: function(comp){
//            if(comp.sBar){
//                comp.sBar.dispose();
//                cssRules.resetStyles(comp.getComponentId());
//                delete comp.sBar;
//            }
//        },
//        getIconsLink: function(name, theme){
//            var imgLink = this._resources.W.Theme.getProperty("WEB_THEME_DIRECTORY");
//
//            imgLink = imgLink.replace('viewer', 'editor_web');
//            return [imgLink, 'social_activity',(name + '_' + this.THEME_NAMES[theme] + '.png')].join('/')
//        },
//        saveData: function(data, componentID){
//            if(componentID in this._socialBarActiveComponents){
//                this._socialBarActiveComponents[componentID] = data;
//                this._setDataToLocalStorage();
//                this.buildSocialBar(this._getComponentById(componentID));
//            }
//        },
//        _socialAction: function(socialNetwork, component, serverAddress){
//            var _dataForShare = {};
//            if(component.getDataItem()._dataType === "Image"){
//                _dataForShare['image'] = serverAddress.getImageAbsoluteUrlFromRelativeUrl(component.getDataItem()._data.uri);
//                _dataForShare['title'] = component.getDataItem()._data.title;
//                _dataForShare['description'] = component.getDataItem()._data.description;
//            }
//            var url = "",
//            sn = {
//                'fb': function(){
//                    url = "https://www.facebook.com/sharer/sharer.php?u=" + _dataForShare['image'] + '&t=' +  _dataForShare['title'];
//                },
//                'tw': function(){
//                    url = "http://www.twitter.com/intent/tweet?url="+ _dataForShare['image'] + "&via=wix.com&text="+ _dataForShare['title'];
//                },
//                'pi': function(){
//                    url = "http://www.pinterest.com/pin/create/button/?media="+_dataForShare['image'] + "&description=" + _dataForShare['description'];
//                }
//            };
//
//            if(sn[socialNetwork]){
//
//                sn[socialNetwork](component);
//
//                window.open(url, 'newwindow', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=585,height=368');
//            }
//        }
//    });
});