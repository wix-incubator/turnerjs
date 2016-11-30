/**
 * @Class wysiwyg.viewer.components.wixhomepage.WixOfTheDay
 * @extends mobile.core.components.base.BaseComponent
 */
define.component('wysiwyg.viewer.components.wixhomepage.WixOfTheDay', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.traits(['wysiwyg.common.components.traits.LinkableComponent']);

    def.utilize(['core.components.image.ImageSettings']);

    def.binds(['_onCloseDescriptionClicked', '_onReadOnClicked', '_renderTexts', '_updateContainers']);

    def.skinParts({
        img: {
            type:'core.components.image.ImageNew',
            dataRefField:'*'
        },
        introContainer: { type: 'htmlElement' },
        descriptionContainer: { type: 'htmlElement' },
        introPreTitle: { type: 'htmlElement' },
        introTitle: { type: 'htmlElement' },
        introText: { type: 'htmlElement' },
        shortDescriptionText: { type: 'htmlElement' },
        descriptionText: { type: 'htmlElement' },
        readOn: { type: 'htmlElement' },
        closeDescription: { type: 'htmlElement' }
    });

    def.states(['opened','closed']);

    def.dataTypes(['Image']);

    def.fields({
        Translations: {
            en: {
                INTRO_PRE_TITLE: "GET INSPIRED WITH",
                INTRO_TITLE: "OF THE DAY",
                INTRO_TEXT: "Everyday we feature an amazing new website built with Wix.<br>Want your website featured?<br>Submit your URL to wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Read on",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Close"
            },
            es: {
                INTRO_PRE_TITLE: "Inspírate con el",
                INTRO_TITLE: "del día!",
                INTRO_TEXT: "Todos los días te presentamos un increíble sitio creado con Wix.<br>¿Quieres que tu sitio aparezca aquí?<br>Envíanos tu URL a wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Leer Más",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Cerrar"
            },
            fr: {
                INTRO_PRE_TITLE: "Inspirez-vous du",
                INTRO_TITLE: "du Jour!",
                INTRO_TEXT: "Nous exposons chaque jour le meilleur site créé avec Wix.<br>Vous voulez que votre site soit exposé?<br>Envoyez votre URL à wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "En lire plus",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Fermer"
            },
            it: {
                INTRO_PRE_TITLE: "Lasciati ispirare dal",
                INTRO_TITLE: "del giorno!",
                INTRO_TEXT: "Ogni giorno presentiamo un sito spettacolare creato con Wix.<br>Vuoi che anche il tuo sito venga preso in considerazione?<br>Inviaci il tuo URL a wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Continua a leggere",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Chiudi"
            },
            pl: {
                INTRO_PRE_TITLE: "Zainspiruj sie",
                INTRO_TITLE: "EM DNIA!",
                INTRO_TEXT: "Kazdego dnia prezentujemy nowa, niesamowita witryne zbudowana z Wix.<br>Chcesz, aby twoja witryna zostala wyrózniona?<br>Przeslij jej adres URL na wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Czytaj wiecej",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Zamknij"
            },
            pt: {
                INTRO_PRE_TITLE: "INSPIRE-SE COM O",
                INTRO_TITLE: "DO DIA!",
                INTRO_TEXT: "Todos os dias nós exibimos um site incrível construído com o Wix.<br>Quer ver o seu site aqui?<br>Envie o seu endereço URL para wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Leia mais",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Fechar"
            },
            ko: {
                INTRO_PRE_TITLE: "영감 얻기",
                INTRO_TITLE: "오늘의 WIX",
                INTRO_TEXT: "당사는 날마다 Wix에 새롭고 멋진 웹사이트를 구축합니다.<br>귀하의 웹사이트에 특징을 추가하시겠습니까?<br>wixofday@wix.com으로 귀하의 URL을 보내주십시오.",
                READ_ON_BUTTON_LABEL: "읽기",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "닫기"
            },
            ja: {
                INTRO_PRE_TITLE: "インスパイアされよう！\r\n\r\n",
                INTRO_TITLE: "WIX おすすめサイト！",
                INTRO_TEXT: "Wixで作成された素晴らしいウェブサイトを毎日ご紹介します。あなたのウェブサイトも紹介したいですか？\nあなたのURLをwixofday@wix.com宛てにお送りください。",
                READ_ON_BUTTON_LABEL: "続きを読む",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "閉じる"
            },

            nl: {
                INTRO_PRE_TITLE: "GET INSPIRED WITH",
                INTRO_TITLE: "OF THE DAY",
                INTRO_TEXT: "Everyday we feature an amazing new website built with Wix.<br>Want your website featured?<br>Submit your URL to wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Read on",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Close"
            },

            ru: {
                INTRO_PRE_TITLE: "Вдохновитесь сайтом",
                INTRO_TITLE: "ДНЯ",
                INTRO_TEXT: "Каждый день мы демонстрируем вам новые, уникальные сайты, созданные с помощью Wix!<br>Хотите, чтобы и ваш сайт стал Сайтом Дня?<br>Пришлите нам адрес URL на wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "читать далее",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "закрыть"
            },

            nl: {
                INTRO_PRE_TITLE: "GET INSPIRED WITH",
                INTRO_TITLE: "OF THE DAY",
                INTRO_TEXT: "Everyday we feature an amazing new website built with Wix.<br>Want your website featured?<br>Submit your URL to wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Read on",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Close"
            },

            sv: {
                INTRO_PRE_TITLE: "GET INSPIRED WITH",
                INTRO_TITLE: "OF THE DAY",
                INTRO_TEXT: "Everyday we feature an amazing new website built with Wix.<br>Want your website featured?<br>Submit your URL to wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Read on",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Close"
            },

            no: {
                INTRO_PRE_TITLE: "GET INSPIRED WITH",
                INTRO_TITLE: "OF THE DAY",
                INTRO_TEXT: "Everyday we feature an amazing new website built with Wix.<br>Want your website featured?<br>Submit your URL to wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Read on",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Close"
            },

            da: {
                INTRO_PRE_TITLE: "GET INSPIRED WITH",
                INTRO_TITLE: "OF THE DAY",
                INTRO_TEXT: "Everyday we feature an amazing new website built with Wix.<br>Want your website featured?<br>Submit your URL to wixofday@wix.com",
                READ_ON_BUTTON_LABEL: "Read on",
                CLOSE_DESCRIPTION_BUTTON_LABEL: "Close"
            }




        }
    });

    /**
     * @lends wysiwyg.viewer.components.wixhomepage.WixOfTheDay
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._SettingsClass = this.imports.ImageSettings;
            if (window['userApi']) {
                this._userApi = window.userApi;
            }

            this.setState('closed');
        },

        _translate: function(key) {
            var languageID = 'en';
            if (this._userApi) {
                languageID = this._userApi.getLanguage();
            }

            return this.Translations[languageID][key];
        },

        render: function() {
            this._renderImage();
            this._renderTexts();
            this.parent();
        },

        _updateContainers: function () {
            if (this.getState() == 'closed') {
                this._skinParts.introContainer.setStyle('display', 'block');
                this._skinParts.descriptionContainer.setStyle('display', 'none');
            } else {
                this._skinParts.introContainer.setStyle('display', 'none');
                this._skinParts.descriptionContainer.setStyle('display', 'block');
            }
        },

        _renderTexts: function(){
            this._updateContainers();
            this._skinParts.introPreTitle.innerHTML = this._translate('INTRO_PRE_TITLE');
            this._skinParts.introTitle.innerHTML = this._translate('INTRO_TITLE');
            this._skinParts.introText.innerHTML = this._translate('INTRO_TEXT');
            this._skinParts.descriptionText.innerHTML = this._data.get('description');
            this._skinParts.shortDescriptionText.innerHTML = this._data.get('description');
            this._skinParts.readOn.innerHTML = this._translate('READ_ON_BUTTON_LABEL');
            this._skinParts.closeDescription.innerHTML = this._translate('CLOSE_DESCRIPTION_BUTTON_LABEL');
        },

        _renderImage: function(){
            if(!this._layoutInitialized){
                return;
            }
            var image = this._skinParts.img;
            if(!image || !image.getOriginalClassName){
                return;
            }
            var settings = this._getImageSettings();
            image.setSettings(settings);
            image.setHeight(274, false, false);
            image.setWidth(344, false, false);
        },


        _getImageSettings: function(){
            if(!this._imageSettings){
                this._imageSettings = new this.imports.ImageSettings(this._SettingsClass.CropModes.FIT_WIDTH, 344, 274);
            }
            return this._imageSettings;
        },


        _onReadOnClicked: function(event){
            event.stopPropagation();
            this.setState('opened');
            W.Utils.Tween.to(this._skinParts.introContainer, 0.3, {opacity:0, onComplete:this._updateContainers});
            W.Utils.Tween.to(this._skinParts.descriptionContainer, 0.3, {delay:0.3, opacity:1});
        },

        _onCloseDescriptionClicked: function(event){
            event.stopPropagation();
            this.setState('closed');
            W.Utils.Tween.to(this._skinParts.descriptionContainer, 0.3, {opacity:0, onComplete:this._updateContainers});
            W.Utils.Tween.to(this._skinParts.introContainer, 0.3, {delay:0.3, opacity:1});
        },

        _onAllSkinPartsReady: function(){
            this._skinParts.readOn.addEvent(Constants.CoreEvents.CLICK, this._onReadOnClicked);
            this._skinParts.closeDescription.addEvent(Constants.CoreEvents.CLICK, this._onCloseDescriptionClicked);
        },

        /**
         * On dispose - remove all external event bindings
         */
        _removeAllDomEvents: function(){
            this._skinParts.readOn.removeEvent(Constants.CoreEvents.CLICK, this._onReadOnClicked);
            this._skinParts.closeDescription.removeEvent(Constants.CoreEvents.CLICK, this._onCloseDescriptionClicked);
        },

        dispose: function(){
            this._removeAllDomEvents();
            this.parent();
        }
    });
});