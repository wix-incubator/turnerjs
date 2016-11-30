define(['lodash', 'react', 'previewExtensionsCore', 'componentsPreviewLayer/previewExtensions/translations/tpaExtensionTranslations'],
    function (_, React, previewExtensionsCore, tpaExtensionTranslations) {
        'use strict';

        var compType = 'wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay';
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;

        var extension = {
            transformRefData: function transformRefData(refData) {
                if (this.props.compData.overlay !== 'unresponsive') {
                    return;
                }

                var BORDER_SIZE = 2;
                var outerWidth = this.props.compData.style.width - 2 * BORDER_SIZE;
                var widthIncludingPadding = Math.max(0, outerWidth);
                var hPadding = Math.floor(widthIncludingPadding * 0.1);
                var iconWidth = 45,
                    contentWidth = widthIncludingPadding - 2 * hPadding,
                    textContainerWidth = '100%';
                var lang = this.props.siteData.rendererModel.languageCode;

                var refDataChanges = {
                    "": {
                        style: {
                            display: 'table'
                        }
                    },
                    content: {
                        style: {
                            display: 'table-cell', //block
                            verticalAlign: 'middle',
                            paddingLeft: '24px',
                            paddingRight: '24px',
                            width: contentWidth
                        }
                    },
                    textTitle: {
                        children: getTranslatedText(lang, 'tpa_oops')
                    },
                    text: {
                        children: [
                            React.createElement('span', {
                                'dangerouslySetInnerHTML': {
                                    __html: getPreviewUnresponsiveTextPartA(this.props.siteData, this.props.compData.applicationId, lang)
                                }
                            }),
                            getLinkReactElement(this.props.siteData, this.props.compData.applicationId, refData.openHelp),
                            React.createElement('span', {}, ' ' + getTranslatedText(lang, 'tpa_unavail_problems_2'))
                        ]
                    },
                    img: {
                        style: {
                            marginLeft: '0px !important'
                        }
                    },
                    unavailableIcon: {
                        src: this.props.siteData.santaBase + '/static/images/tpaPreloader/alert-icon.png'
                    }
                };

                var refDataChangesForIcon = getDataChangesForIconOnTop();

                if (this.props.compData.style.width > 175) {
                    textContainerWidth = contentWidth - iconWidth;
                    refDataChangesForIcon = getDataChangesIconOnLeft(this.props, textContainerWidth);
                }

                _.merge(refDataChanges, refDataChangesForIcon);
                _.merge(refData, refDataChanges);
            }
        };


        var getLinkReactElement = function(siteData, applicationId, openHelp) { //eslint-disable-line react/display-name
            var appDefinitionId = getAppDefinitionId(siteData, applicationId);
            var appDefinitionName = getAppDefinitionName(siteData, applicationId);
            return React.createElement('a', {
                    'href': '#',
                    onClick: function(appDefId, openHelpMethod, event) {
                        event.stopPropagation();
                        openHelpMethod(appDefId);
                    }.bind(null, appDefinitionId, openHelp)
            }, appDefinitionName);
        };

        var getAppDefinitionId = function(siteData, applicationId) {
            var appData = siteData.getClientSpecMapEntry(applicationId);
            return appData.appDefinitionId;
        };

        var getAppDefinitionName = function(siteData, applicationId) {
            var appData = siteData.getClientSpecMapEntry(applicationId);
            return appData.appDefinitionName;
        };

        var getPreviewUnresponsiveTextPartA = function(siteData, applicationId, lang) {
            var appName = getAppDefinitionName(siteData, applicationId);
            var unResponsiveTextTemplate = _.template(getTranslatedText(lang, 'tpa_unavail_problems'));
            return ' ' + unResponsiveTextTemplate({
                appName: appName
            }) + ' ';
        };

        var getDataChangesIconOnLeft = function() {
            return {
                textContainer: {
                    style: {
                        verticalAlign: 'baseline',
                        display: 'block',
                        boxSizing: 'border-box',
                        float: 'left',
                        textAlign: 'left',
                        color: '#7a92a5',
                        fontWeight: '300',
                        fontSize: '13px'
                    }
                },
                textTitle: {
                    style: {
                        display: 'block',
                        color: '#2b5672',
                        fontSize: '14px',
                        fontWeight: '300',
                        lineHeight: '14px',
                        float: 'left'
                    }
                },
                iconContainer: {
                    style: {
                        width: 45,
                        boxSizing: 'border-box',
                        display: 'block',
                        marginBottom: 14,
                        marginTop: 14
                    }
                }
            };
        };

        var getDataChangesForIconOnTop = function() {
            return {
                textContainer: {
                    style: {
                        textAlign: 'center',
                        display: 'block'
                    }
                },
                iconContainer: {
                    style: {
                        display: 'block',
                        textAlign: 'center'
                    }
                }
            };
        };

        var getTranslatedText = function(lang, key) {
            return tpaExtensionTranslations[lang] && tpaExtensionTranslations[lang][key] ? tpaExtensionTranslations[lang][key] : tpaExtensionTranslations.en[key];
        };

        previewExtensionsRegistrar.registerCompExtension(compType, extension);
    });
