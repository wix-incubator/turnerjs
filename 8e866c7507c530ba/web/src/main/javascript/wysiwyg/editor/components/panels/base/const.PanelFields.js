/**@class Constants.PanelFields */
define.Const('PanelFields', {
    Title: {
        compType: 'wysiwyg.editor.components.inputs.Label',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.TitleSkin',
            bold: 'wysiwyg.editor.skins.inputs.LabelBoldSkin'
        }
    },
    Label: {
        compType: 'wysiwyg.editor.components.inputs.Label',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.LabelSkin',
            'small': 'wysiwyg.editor.skins.inputs.LabelSmallSkin',
            'bold': 'wysiwyg.editor.skins.inputs.LabelBoldSkin',
            'notice': 'wysiwyg.editor.skins.inputs.LabelNoticeSkin',
            'purple': 'wysiwyg.editor.skins.inputs.LabelPurpleSkin',
            'upgrade': 'wysiwyg.editor.skins.inputs.LabelTPAFeatureSkin',
            'list': 'wysiwyg.editor.skins.inputs.SubLabelListSkin',
            'price': 'wysiwyg.editor.skins.inputs.LabelPriceSkin',
            'spotify': 'wysiwyg.editor.skins.inputs.LabelSpotifySkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }

    },
    SubLabel: {
        compType: 'wysiwyg.editor.components.inputs.Label',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.SubLabelSkin',
            'small': 'wysiwyg.editor.skins.inputs.SubLabelSkinSmall',
            'bold': 'wysiwyg.editor.skins.inputs.SubLabelSkinBold',
            'upgrade': 'wysiwyg.editor.skins.inputs.SubLabelLeftSkin',
            'help': 'wysiwyg.editor.skins.inputs.SubLabelWithHelpSkin'
        }
    },
    Input: {
        compType: 'wysiwyg.editor.components.inputs.Input',
        skins: {
            'default':         'wysiwyg.editor.skins.inputs.InputSkin',
            'floating':        'wysiwyg.editor.skins.inputs.InputFloatingSkin',
            'facebooklikebox': 'wysiwyg.editor.skins.inputs.InputFacebookLikeBoxSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    ButtonField: {
        compType: 'wysiwyg.editor.components.inputs.ButtonInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.button.ButtonInputSkin',
            'smaller': 'wysiwyg.editor.skins.inputs.button.ButtonInputSmallerSkin',
            'withArrow': 'wysiwyg.editor.skins.inputs.button.ButtonInputArrowSkin',
            'blueWithArrow': 'wysiwyg.editor.skins.inputs.button.ButtonInputBlueArrowSkin',
            'blue': 'wysiwyg.editor.skins.inputs.button.ButtonInputBlueSkin',
            'purple': 'wysiwyg.editor.skins.inputs.button.ButtonInputPurpleSkin',
            'toggle': 'wysiwyg.editor.skins.inputs.button.ButtonInputToggleSkin',
            'action': 'wysiwyg.editor.skins.inputs.button.ButtonInputActionSkin',
            'facebook': 'wysiwyg.editor.skins.inputs.button.ButtonInputFacebookSkin',
            'twitter': 'wysiwyg.editor.skins.inputs.button.ButtonInputTwitterSkin',
            'upgrade': 'wysiwyg.editor.skins.inputs.button.ButtonInputUpgradeSkin',
            'appUpgrade': 'wysiwyg.editor.skins.inputs.button.ButtonInputAppUpgradeSkin',
            'tpaAppUpgrade': 'wysiwyg.editor.skins.inputs.button.ButtonInputTpaAppUpgradeSkin',
            'blueSmaller': 'wysiwyg.editor.skins.inputs.button.ButtonInputBlueSmallerSkin',
            'link': 'wysiwyg.editor.skins.inputs.button.ButtonInputLinkSkin',
            'linkRight': 'wysiwyg.editor.skins.inputs.button.ButtonInputLinkRightSkin',
            'linkLeft': 'wysiwyg.editor.skins.inputs.button.ButtonInputLinkLeftSkin',
            'alignButton': 'wysiwyg.editor.skins.inputs.button.ButtonInputAlignSkin',
            'mainBarEditActions': 'wysiwyg.editor.skins.inputs.button.ButtonInputMainBarEditSkin',
            'mainBarDocActions': 'wysiwyg.editor.skins.inputs.button.ButtonInputMainBarDocSkin',
            'mainBarHelpIcon': 'wysiwyg.editor.skins.inputs.button.ButtonInputMainBarHelpSkin',
            'revertImage': 'wysiwyg.editor.skins.inputs.button.ButtonInputRevertImageSkin',
            'imageManager': 'wysiwyg.editor.skins.inputs.button.ButtonInputImageManagerSkin',
            'imageManagerDeleteBtn': 'wysiwyg.editor.skins.inputs.button.ButtonInputImageManagerDeleteBtnSkin',
            'narrow': 'wysiwyg.editor.skins.inputs.button.ButtonInputNarrowSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    addQuestionMark: false,
                    toolTipId: toolTipId,
                    toolTipGetter: function () {
                        return this._skinParts.view;
                    }
                };
            }
        }
    },
    CheckBox: {
        compType: 'wysiwyg.editor.components.inputs.CheckBox',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.CheckBoxSkin',
            'toggle': 'wysiwyg.editor.skins.inputs.ToggleCheckBoxSkin',
            'toggleButton': 'wysiwyg.editor.skins.inputs.ToggleCheckBoxButtonSkin'
        },
        args: {
            toolTip: function (toolTipId, toolTipGetter) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return (toolTipGetter === 'view' ? this._view : this._skinParts[toolTipGetter]);

                    }
                };
            }
        }
    },
    DialogCheckBox: {
        compType: 'wysiwyg.editor.components.inputs.DialogCheckBox',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.DialogCheckBoxSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    CheckBoxImage: {
        compType: 'wysiwyg.editor.components.inputs.CheckBoxImage',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.CheckBoxImageSkin',
            'noHover': 'wysiwyg.editor.skins.inputs.CheckBoxImageNoHoverSkin',
            'noHoverMultiLine': 'wysiwyg.editor.skins.inputs.CheckBoxImageMultilineNoHoverSkin'
        }
    },
    RadioButtons: {
        compType: 'wysiwyg.editor.components.inputs.RadioButtons',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.RadioButtonsSkin',
            'comfort': 'wysiwyg.editor.skins.inputs.RadioButtonComfortSkin'
        }
    },
    RadioImages: {
        compType: 'wysiwyg.editor.components.inputs.RadioImages',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.RadioImagesSkin'
        },
        args: {
            presetList: [
                {value: 'left', image: 'radiobuttons/radio_button_states.png', dimensions: {w: '35px', h: '33px'}, icon: 'radiobuttons/alignment/left.png'},
                {value: 'center', image: 'radiobuttons/radio_button_states.png', dimensions: {w: '35px', h: '33px'}, icon: 'radiobuttons/alignment/center.png'},
                {value: 'right', image: 'radiobuttons/radio_button_states.png', dimensions: {w: '35px', h: '33px'}, icon: 'radiobuttons/alignment/right.png'}
            ]
        }
    },
    InlineTextLinkField: {
        compType: 'wysiwyg.editor.components.inputs.InlineTextLinkInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.InlineTextLinkInputSkin',
            'withEditIcon': 'wysiwyg.editor.skins.inputs.InlineTextLinkInputWithEditIconSkin',
            'floating': 'wysiwyg.editor.skins.inputs.InlineTextLinkFloatingSkin',
            'slogan': 'wysiwyg.editor.skins.inputs.InlineTextLinkSloganSkin',
            'premiumSlogan': 'wysiwyg.editor.skins.inputs.InlineTextLinkPremiumSloganSkin',
            'tpaSupport': 'wysiwyg.editor.skins.inputs.InlineTextLinkInputTpaSupportSkin'
        }
    },
    ListEditorButton: {
        compType: 'wysiwyg.editor.components.inputs.ListEditorButton',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.button.ButtonInputBlueArrowSkin'
        }
    },
    ComboBox: {
        compType: 'wysiwyg.editor.components.inputs.ComboBox',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.ComboBoxSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    SelectionListInput: {
        compType: 'wysiwyg.editor.components.inputs.SelectionListInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.SelectionListInputSkin',
            'imagesList': 'wysiwyg.editor.skins.inputs.SelectionListImagesSkin',
            'appsList': 'wysiwyg.editor.skins.inputs.SelectionListAppsSkin'
        }
    },
    Link: {
        compType: 'wysiwyg.editor.components.inputs.Link',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.InputSkin',
            'floating': 'wysiwyg.editor.skins.inputs.InputFloatingSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            },
            previewData: function () {
                return this._data;
            }
        }
    },
    SubmitInput: {
        compType: 'wysiwyg.editor.components.inputs.SubmitInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.SubmitInputSkin',
            'twitterTimelineInput': 'wysiwyg.editor.skins.inputs.SubmitInputTwitterTimelineSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    SubmitTextArea: {
        compType: 'wysiwyg.editor.components.inputs.SubmitTextArea',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.SubmitTextAreaSkin'
        }
    },
    TextArea: {
        compType: 'wysiwyg.editor.components.inputs.TextArea',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.TextAreaSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    HtmlIsland: {
        compType: 'wysiwyg.editor.components.inputs.HtmlIsland',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.HtmlIslandSkin'
        }
    },
    Slider: {
        compType: 'wysiwyg.editor.components.inputs.Slider',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.SliderSkin',
            'sliderWithIcons': 'wysiwyg.editor.skins.inputs.SliderWithIconsSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    CircleSlider: {
        compType: 'wysiwyg.editor.components.inputs.CircleSlider',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.CircleSliderSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    ImageField: {
        compType: 'wysiwyg.editor.components.inputs.ImageInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.ImageInputSkin',
            'blue': 'wysiwyg.editor.skins.inputs.ImageInputBlueActionSkin',
            'organizeBlueAction': 'wysiwyg.editor.skins.inputs.ImageInputSkin',
            'gallery': 'wysiwyg.editor.skins.inputs.ImageInputForGallerySkin',
            'siteLogo': 'wysiwyg.editor.skins.inputs.SiteLogoInputSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    FlashField: {
        compType: 'wysiwyg.editor.components.inputs.FlashInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.ImageInputSkin',
            'organizeBlueAction': 'wysiwyg.editor.skins.inputs.ImageInputSkin'
        }
    },
    UserDocField: {
        compType: 'wysiwyg.editor.components.inputs.DocInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.DocInputSkin'
        }
    },
    ColorField: {
        compType: 'wysiwyg.editor.components.inputs.ColorInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.ColorInputSkin',
            'small': 'wysiwyg.editor.skins.inputs.ColorInputSmallSkin',
            'narrow': 'wysiwyg.editor.skins.inputs.ColorInputNarrowSkin',
            'dialog': 'wysiwyg.editor.skins.inputs.ColorDialogInputSkin'
        }
    },
    ColorGroupField: {
        compType: 'wysiwyg.editor.components.inputs.ColorGroup',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.ColorGroupSkin'
        }
    },
    ColorSelectorField: {
        compType: 'wysiwyg.editor.components.inputs.ColorSelectorField',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.ColorSelectorFieldSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: false,
                    toolTipGetter: function () {
                        return this._skinParts.adjustButton;
                    }
                };
            }
        }
    },
    ColorSelectorButton: {
        compType: 'wysiwyg.editor.components.ColorSelectorButton',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.ColorSelectorButtonFieldSkin'
        }
    },
    FontSelectorField: {
        compType: 'wysiwyg.editor.components.inputs.font.FontSelectorField',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.font.FontSelectorFieldSkin'
        }
    },
    EditableDataBox:{
        compType : 'wysiwyg.editor.components.inputs.EditableDataBox',
        skins : {
            'default': 'wysiwyg.editor.skins.inputs.EditableDataBoxSkin'
        }
     },
    BgScrollField: {
        compType: 'wysiwyg.editor.components.inputs.bg.BgScroll',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.bg.BgScrollSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    },
    BgAlignField: {
        compType: 'wysiwyg.editor.components.inputs.bg.BgAlign',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.bg.BgAlignSkin'
        }
    },
    BgTileField: {
        compType: 'wysiwyg.editor.components.inputs.bg.BgTile',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.bg.BgTileSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.tileTypes._skinParts.label;
                    }
                };
            }
        }
    },
    BgColorField: {
        compType: 'wysiwyg.editor.components.inputs.bg.BgColor',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.bg.BgColorSkin'
        }
    },
    BgImageField: {
        compType: 'wysiwyg.editor.components.inputs.bg.BgImage',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.bg.BgImageSkin'
        }
    },
    FontButtonField: {
        compType: 'wysiwyg.editor.components.FontButton',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.button.FontButtonInputSkin'
        }
    },
    FontColorField: {
        compType: 'wysiwyg.editor.components.inputs.font.FontColor',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.font.FontColorSkin'
        }
    },
    FontSizeField: {
        compType: 'wysiwyg.editor.components.inputs.font.FontSize',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.font.FontSizeSkin'
        }
    },
    FontFamilyField: {
        compType: 'wysiwyg.editor.components.inputs.font.FontFamily',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.font.FontFamilySkin'
        }
    },
    FontStyleField: {
        compType: 'wysiwyg.editor.components.inputs.font.FontStyle',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.font.FontStyleSkin'
        }
    },
    BoxShadowField: {
        compType: 'wysiwyg.editor.components.inputs.BoxShadowInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.BoxShadowInputSkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId
                };
            }
        }
    },
    BorderRadiusField: {
        compType: 'wysiwyg.editor.components.inputs.BorderRadiusInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.BorderRadiusInputSkin'
        }
    },
    AudioField: {
        compType: 'wysiwyg.editor.components.inputs.AudioInput',
        skins: {
            'default': 'wysiwyg.editor.skins.inputs.AudioInputSkin',
            'organizeBlueAction': 'wysiwyg.editor.skins.inputs.ImageInputSkin',
            'gallery': 'wysiwyg.editor.skins.inputs.ImageInputForGallerySkin'
        },
        args: {
            toolTip: function (toolTipId) {
                return {
                    toolTipId: toolTipId,
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                };
            }
        }
    }
});
//        FLOATING_DIALOG: {
//            Extends: 'DEFAULT',
//
//            ButtonInput         : {
//                'default' : 'wysiwyg.editor.skins.inputs.button.FloatingDialogButtonInputSkin',
//                'upgrade' : 'wysiwyg.editor.skins.inputs.button.ButtonInputUpgradeSkin',
//                'upgradeSale' : 'wysiwyg.editor.skins.inputs.button.ButtonInputUpgradeSaleSkin'
//            },
//            Label               : {
//                'default': 'wysiwyg.editor.skins.inputs.FloatingDialogTitleSkin',
//                'SubLabel': 'wysiwyg.editor.skins.inputs.LabelSkin'
//            },
//            SubLabel            : {
//                'default'                : 'wysiwyg.editor.skins.inputs.FloatingDialogDescriptionSkin',
//                'SubLabelBoldWithIcon'    : 'wysiwyg.editor.skins.inputs.PublishDialogOneMnTitleSkin'
//            }
//
//        }
//    }
//});