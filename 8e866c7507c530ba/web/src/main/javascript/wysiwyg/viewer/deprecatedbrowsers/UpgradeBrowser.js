(function(languageCode, webTopologyURL, deprecatedBrowsers) {
    var $body = document.body,
        $head  = document.getElementsByTagName('head')[0];

    var Config = {
        /* upgrade message template */
        upgradeTemplate: '<div id="upgrade-browser-inner">' +
                           '<i id="upgrade-browser-logo"></i>' +
                           '<span id="upgrade-browser-message">{{MESSAGE}}</span>' +
                           '<span id="upgrade-browser-link-wrapper">' +
                             '<i id="upgrade-browser-link-cl"></i>' +
                             '<a href="https://www.google.com/intl/{{LANG_CODE}}/chrome/browser/" id="upgrade-browser-link" target="_blank">{{UPGRADE_BUTTON}}</a>' +
                             '<i id="upgrade-browser-link-cr"></i>' +
                           '</span>' +
                           '<a href="#" id="upgrade-browser-close-button"></a>' +
                         '</div>',

        /* save original values */
        origBodyMargin: $body.style.marginTop,

        /* fixed container height */
        upgradeContainerHeight: '37px',

        /* cookie defaults */
        wixUpgradeBrowserCookie: 'wix-upgrade-browser',
        wixUpgradeBrowserCookieTTL: 2592000000, // 1 month

        /* language defaults */
        defaultLanguage: 'en',

        /* abs css path */
        stylesheetPath: webTopologyURL + '/css/wysiwyg/UpgradeBrowser.css',

        /* images path */
        imagesPath: webTopologyURL + '/images/wysiwyg/viewer/deprecatedbrowsers/upgradebrowser'
    };

    var Utils = {

        CSS: {
            load: function(url) {
                var link  = document.createElement('link');
                link.rel  = 'stylesheet';
                link.type = 'text/css';
                link.href = url;
                link.media = 'all';
                $head.appendChild(link);
            }
        },

        Cookies: {
            set: function(cookieName, value, persistenceMilliseconds) {
                var expires = '', date;
                if (persistenceMilliseconds) {
                    date = new Date();
                    date.setTime(date.getTime() + persistenceMilliseconds);
                    expires = '; expires=' + date.toGMTString();
                }
                document.cookie = cookieName + '=' + value + expires + '; path=/';
            },

            get: function(cookieName){
                var results = document.cookie.match(new RegExp('\\b' + cookieName + '=(.*?)(;|$)'));
                return (results && results[1]) || null;
            },

            has: function(cookieName) {
                return !!this.get(cookieName);
            }
        },

        Events: {
            on: function(event, context, callback) {
                context = context || window;
                if (context.addEventListener) {
                    context.addEventListener(event, callback, false);
                } else {
                    context.attachEvent('on' + event, callback);
                }
            }
        },

        Browser: {
            ie6: function() {
                return navigator.appName == 'Microsoft Internet Explorer' && navigator.userAgent.indexOf('MSIE 6.') > -1;
            },

            ie7: function() {
                return navigator.appName == 'Microsoft Internet Explorer' && navigator.userAgent.indexOf('MSIE 7.') > -1;
            },

            ie8: function() {
                return navigator.appName == 'Microsoft Internet Explorer' && navigator.userAgent.indexOf('MSIE 8.') > -1;
            },

            ie9: function() {
                return navigator.appName == 'Microsoft Internet Explorer' && navigator.userAgent.indexOf('MSIE 9.') > -1;
            },

            safari: function() {
                var safariRegex = /Version\/[1-6]\.\d.*Safari/;
                return safariRegex.test(navigator.userAgent);
            }
        }

    };
    
    var Langs = {
        'en': {
            'MESSAGE': 'You are using an outdated version of Internet Explorer. For a faster, safer browsing experience',
            'UPGRADE_BUTTON': 'Upgrade Now'
        },
        'de': {
            'MESSAGE': 'Sie verwenden eine veraltete Version des Internet Explorers. Für einen schnelleren und sichereren Browser',
            'UPGRADE_BUTTON': 'Jetzt aktualisieren'
        },
        'es': {
            'MESSAGE': 'Estás usando una versión antigua de Internet Explorer. Para una navegación más rápida y segura',
            'UPGRADE_BUTTON': 'Actualiza Ahora'
        },
        'fr': {
            'MESSAGE': 'Veuillez mettre à jour votre version d’Internet Explorer afin de profiter d’une navigation optimale et sécurisée',
            'UPGRADE_BUTTON': 'Mettre à Jour'
        },
        'it': {
            'MESSAGE': 'Stai utilizzando una versione non aggiornata di Internet Explorer. Per un’esperienza di navigazione più veloce e sicura',
            'UPGRADE_BUTTON': 'Aggiorna Ora'
        },

        'jp': {
            'MESSAGE': '古いバージョンのInternet Explorerを利用されています。より速く安全なブラウジングを実現するためには',
            'UPGRADE_BUTTON': '今すぐアップデート'
        },
        'ko': {
            'MESSAGE': 'Internet Explorer 의 오래된 버전을 사용하고 있습니다. 빠르고 안전 브라우징 경험을 원하신다면, 지금 업그레이드 하세요.',
            'UPGRADE_BUTTON': '업그레이드'
        },
        'pl': {
            'MESSAGE': 'Używasz przestarzałej wersji przeglądarki Internet Explorer. Dla szybszego, bezpieczniejszego przeglądania stron',
            'UPGRADE_BUTTON': 'Uaktualnij teraz'
        },
        'pt': {
            'MESSAGE': 'A sua versão do Internet Explorer está desatualizada. Para uma navegação mais rápida e segura',
            'UPGRADE_BUTTON': 'Instale Agora'
        },

        'ru': {
            'MESSAGE': 'Вы используете устаревшую версию Internet Explorer. Для более быстрого, безопасного поиска',
            'UPGRADE_BUTTON': 'Обновите сейчас'
        },

        'tr': {
            'MESSAGE': 'Internet Explorer\'ın eski bir sürümünü kullanıyorsunuz. Daha hızlı ve güvenli bir tarama deneyimi için',
            'UPGRADE_BUTTON': 'Şimdi Yükseltin'
        }

    };

    var MessageHandler = {
        _cachedSelectors : {
            $upgradeContainer: '',
            $closeBtn: ''
        },
        _deprecatedBrowser : '',

        init: function() {
            this._deprecatedBrowser = this._detectBrowser() || 'UNKNOWN';

            if (this._isDeprecatedBrowser() && this._shouldSeeMessage()) {
                this._loadStyles();
                this._addUpgradeMessageContainer();
                this._bindCloseButton();
                this._adjustResourceURLs();
                this._addBodyMargin();
                this._showUpgradeContainer();
            }
        },

        dispose: function() {
            this._restoreBodyMargin();
            this._hideUpgradeContainer();
            this._stopShowingTheMessage();
        },

        _shouldSeeMessage: function() {
            return !Utils.Cookies.has(Config.wixUpgradeBrowserCookie + '-' + this._deprecatedBrowser);
        },

        /* private methods */

        _detectBrowser: function() {
            var i, browser, len;
            for (i=0, len=deprecatedBrowsers.length; i < len; i++) {
                browser = deprecatedBrowsers[i];
                if (Utils.Browser[browser] && Utils.Browser[browser]()) {
                    return browser;
                }
            }
            return undefined;
        },

        _isDeprecatedBrowser: function() {
            return this._deprecatedBrowser !== 'UNKNOWN';
        },

        _loadStyles: function() {
            Utils.CSS.load(Config.stylesheetPath);
        },

        _addUpgradeMessageContainer: function() {
            var template = this._getTranslatedTemplate(Config.upgradeTemplate),
                $el = document.createElement('div');

            $el.id = 'upgrade-browser';
            $el.className = this._deprecatedBrowser;
            $el.innerHTML = template;
            this._cachedSelectors.$upgradeContainer = $body.appendChild($el);
        },

        _getTranslatedTemplate: function(template) {
            var translations = Langs[languageCode] ? Langs[languageCode] : Langs[Config.defaultLanguage];

            template = template.replace('{{MESSAGE}}',        translations.MESSAGE);
            template = template.replace('{{UPGRADE_BUTTON}}', translations.UPGRADE_BUTTON);
            template = template.replace('{{LANG_CODE}}',      languageCode);

            return template;
        },

        _adjustResourceURLs: function() {
            var browserName = this._deprecatedBrowser.substring(0, this._deprecatedBrowser.length - 1),
                $upgradeBrowserLogo = document.getElementById('upgrade-browser-logo'),
                $upgradeLinkLeftCorner = document.getElementById('upgrade-browser-link-cl'),
                $upgradeLink = document.getElementById('upgrade-browser-link'),
                $upgradeLinkRightCorner = document.getElementById('upgrade-browser-link-cr'),
                imagesURL = Config.imagesPath;

            if (this._deprecatedBrowser === 'ie6') {
                $upgradeBrowserLogo.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imagesURL + '/deprecated-browser-' + browserName + '.png", sizingMethod="crop")';

                $upgradeLink.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imagesURL + '/bg-action-link-bd.png", sizingMethod="scale")';
                $upgradeLinkLeftCorner.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imagesURL + '/bg-action-link-cl.png", sizingMethod="crop")';
                $upgradeLinkRightCorner.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imagesURL + '/bg-action-link-cr.png", sizingMethod="crop")';

                this._cachedSelectors.$closeBtn.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imagesURL + '/close-button.png", sizingMethod="crop")';
            } else {
                $upgradeBrowserLogo.style.backgroundImage = 'url(' + imagesURL +
                                                                    '/deprecated-browser-' + browserName + '.png)';

                this._cachedSelectors.$closeBtn.style.backgroundImage = 'url(' + imagesURL + '/close-button.png)';

                $upgradeLink.style.backgroundImage = 'url(' + imagesURL + '/bg-action-link-bd.png)';
                $upgradeLinkLeftCorner.style.backgroundImage = 'url(' + imagesURL + '/bg-action-link-cl.png)';
                $upgradeLinkRightCorner.style.backgroundImage = 'url(' + imagesURL + '/bg-action-link-cr.png)';
            }
        },

        _addBodyMargin: function() {
            $body.style.marginTop = Config.upgradeContainerHeight;
        },

        _restoreBodyMargin: function() {
            $body.style.marginTop = Config.origBodyMargin;
        },

        _bindCloseButton: function() {
            var self = this;
            this._cachedSelectors.$closeBtn = document.getElementById('upgrade-browser-close-button');
            Utils.Events.on('click', this._cachedSelectors.$closeBtn, function(){
                self.dispose();
                return false;
            });
        },

        _stopShowingTheMessage: function() {
            Utils.Cookies.set(Config.wixUpgradeBrowserCookie + '-' + this._deprecatedBrowser, true, Config.wixUpgradeBrowserCookieTTL);
        },

        _hideUpgradeContainer: function() {
            this._cachedSelectors.$upgradeContainer.style.display = 'none';
        },

        _showUpgradeContainer: function() {
            this._cachedSelectors.$upgradeContainer.style.display = 'block';
        }
    };

    MessageHandler.init();

})(rendererModel.languageCode, serviceTopology.scriptsLocationMap.web, ['ie6', 'ie7', 'ie8', 'ie9', 'safari']);