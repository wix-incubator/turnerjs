define.experiment.component('wysiwyg.common.components.subscribeform.editor.SubscribeFormPanel.SubscribeFormSendNewsletter', function(componentDefinition, strategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.skinParts(strategy.merge({
        sendNewslettersLabel : {
            type      : Constants.PanelFields.Label.compType,
            argObject : {
                labelText : 'SFORM_SEND_NEWSLETTER_TEXT'
            }
        },
        sendNewsletters      : {
            type      : Constants.PanelFields.ButtonField.compType,
            argObject : {
                buttonLabel      : 'SFROM_SEND_NEWSLETTER_BUTTON_LABEL',
                toolTip          : {
                    toolTipId : 'SFORM_SEND_NEWSLETTER_BUTTON_TEXT'
                }
            },
            command          : 'WEditorCommands.OpenExternalLink',
            commandParameter : {
                href : W.Config.siteNeverSavedBefore() ? 'http://www.wix.com/lphtml/shoutout-lp' :
                    'http://www.wix.com/my-account/site/' + W.Config.getMetaSiteId() + '/app/?' +
                    'referralInfo=editor-subscribe-settings&' +
                    'appDefinitionId=135c3d92-0fea-1f9d-2ba5-2a1dfb04297e#/135c3d92-0fea-1f9d-2ba5-2a1dfb04297e?autoProvision=true'
            }
        },
        labelText: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                // SFORM_DASHBOARD_MESSAGE
                labelText: function() {
                    var msg = W.Resources.get('EDITOR_LANGUAGE', 'SFORM_NEW_DASHBOARD_MESSAGE');
                    if (W.Config.siteNeverSavedBefore()) {
                        return msg.replace(/\[.+\]/, function(token) {
                            return token.slice(1, token.length - 1);
                        }.bind(this));
                    } else {
                        return msg.replace(/\[.+\]/, function(token) {
                            var href = 'http://www.wix.com/my-account/site/' + W.Config.getMetaSiteId() + '/contacts/';
                            return '<a target="_blank" href="' + href + '">' + token.slice(1, token.length - 1) + '</a>';
                        }.bind(this));
                    }
                }.bind(this)
            }
        }
    }));

    def.methods({

        _onAllSkinPartsReady : function () {
            this.getSkinPart('sendNewsletters').addEvent('click', function () {
                LOG.reportEvent(wixEvents.SEND_NEWSLETTER_PRESSED, {});
            });
        }
    });
});
