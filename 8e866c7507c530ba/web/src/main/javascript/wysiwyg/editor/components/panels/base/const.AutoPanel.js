/**@class Constants.AutoPanel */
define.Const('AutoPanel', {
    ALL_INLINE: 0,
    ALL_BLOCK: 1,
    INLINE_CLASS: 'inline-component',
    GROUP_CLASS: 'inline-component-group',
    COMPONENT_CLASS: 'autopanel-component',
    BREAK: null,
    Skins: {
        DEFAULT: {
            Title               :   {
                                        'default'      : 'wysiwyg.editor.skins.inputs.TitleSkin',
                                        'bold'         : 'wysiwyg.editor.skins.inputs.LabelBoldSkin'
                                    },
            Label               :   {
                                        'default'      : 'wysiwyg.editor.skins.inputs.LabelSkin',
                                        'small'         : 'wysiwyg.editor.skins.inputs.LabelSmallSkin',
                                        'bold'         : 'wysiwyg.editor.skins.inputs.LabelBoldSkin',
                                        'thin'         : 'wysiwyg.editor.skins.inputs.LabelThinSkin',
                                        'notice'       : 'wysiwyg.editor.skins.inputs.LabelNoticeSkin',
                                        'purple'       : 'wysiwyg.editor.skins.inputs.LabelPurpleSkin',
                                        'upgrade'      : 'wysiwyg.editor.skins.inputs.LabelTPAFeatureSkin',
                                        'list'         : 'wysiwyg.editor.skins.inputs.SubLabelListSkin',
                                        'price'        : 'wysiwyg.editor.skins.inputs.LabelPriceSkin'
                                    },
            SubLabel            :   {   'default'      : 'wysiwyg.editor.skins.inputs.SubLabelSkin',
                                        'small'        : 'wysiwyg.editor.skins.inputs.SubLabelSkinSmall',
                                        'bold'        : 'wysiwyg.editor.skins.inputs.SubLabelSkinBold',
                                        'upgrade'      : 'wysiwyg.editor.skins.inputs.SubLabelLeftSkin',
                                        'help'      : 'wysiwyg.editor.skins.inputs.SubLabelWithHelpSkin'
                                    },
            ButtonInput         :   {
                                      'default'      : 'wysiwyg.editor.skins.inputs.button.ButtonInputSkin',
                                      'smaller'      : 'wysiwyg.editor.skins.inputs.button.ButtonInputSmallerSkin',
                                      'withArrow'    : 'wysiwyg.editor.skins.inputs.button.ButtonInputArrowSkin',
                                      'blueWithArrow': 'wysiwyg.editor.skins.inputs.button.ButtonInputBlueArrowSkin',
                                      'blue'         : 'wysiwyg.editor.skins.inputs.button.ButtonInputBlueSkin',
                                      'purple'       : 'wysiwyg.editor.skins.inputs.button.ButtonInputPurpleSkin',
                                      'toggle'       : 'wysiwyg.editor.skins.inputs.button.ButtonInputToggleSkin',

                                      'action'       : 'wysiwyg.editor.skins.inputs.button.ButtonInputActionSkin',

                                      'facebook'     : 'wysiwyg.editor.skins.inputs.button.ButtonInputFacebookSkin',
                                      'twitter'      : 'wysiwyg.editor.skins.inputs.button.ButtonInputTwitterSkin',
                                      'upgrade'      : 'wysiwyg.editor.skins.inputs.button.ButtonInputUpgradeSkin',
                                      'appUpgrade'   : 'wysiwyg.editor.skins.inputs.button.ButtonInputAppUpgradeSkin',
                                      'tpaAppUpgrade': 'wysiwyg.editor.skins.inputs.button.ButtonInputTpaAppUpgradeSkin',
                                      'blueSmaller'  : 'wysiwyg.editor.skins.inputs.button.ButtonInputBlueSmallerSkin',
                                      'link'         : 'wysiwyg.editor.skins.inputs.button.ButtonInputLinkSkin',
                                      'linkRight'    : 'wysiwyg.editor.skins.inputs.button.ButtonInputLinkRightSkin',
                                      'linkLeft'     : 'wysiwyg.editor.skins.inputs.button.ButtonInputLinkLeftSkin',
                                      'alignButton'  : 'wysiwyg.editor.skins.inputs.button.ButtonInputAlignSkin',

                                      'mainBarEditActions': 'wysiwyg.editor.skins.inputs.button.ButtonInputMainBarEditSkin',
                                      'mainBarDocActions': 'wysiwyg.editor.skins.inputs.button.ButtonInputMainBarDocSkin',
                                      'mainBarHelpIcon' : 'wysiwyg.editor.skins.inputs.button.ButtonInputMainBarHelpSkin',
                                      'revertImage': 'wysiwyg.editor.skins.inputs.button.ButtonInputRevertImageSkin',

                                      'imageManager': 'wysiwyg.editor.skins.inputs.button.ButtonInputImageManagerSkin',
                                      'imageManagerDeleteBtn': 'wysiwyg.editor.skins.inputs.button.ButtonInputImageManagerDeleteBtnSkin',
                                      'blueCentered'         : 'wysiwyg.editor.skins.inputs.button.ButtonInputCenterBlueSkin'


            },
            ListItem            : {
                                     'default': 'wysiwyg.editor.skins.inputs.LabelSmallSkin'

            },
            InlineTextLinkInput : {
                                        'default'  : 'wysiwyg.editor.skins.inputs.InlineTextLinkInputSkin',
                                        'withEditIcon'  : 'wysiwyg.editor.skins.inputs.InlineTextLinkInputWithEditIconSkin',
                                        'floating'  : 'wysiwyg.editor.skins.inputs.InlineTextLinkFloatingSkin',
                                        'slogan'  : 'wysiwyg.editor.skins.inputs.InlineTextLinkSloganSkin',
                                        'premiumSlogan'  : 'wysiwyg.editor.skins.inputs.InlineTextLinkPremiumSloganSkin',
                                        'tpaSupport' : 'wysiwyg.editor.skins.inputs.InlineTextLinkInputTpaSupportSkin',
                                        'selectable' : 'wysiwyg.editor.skins.inputs.InlineTextLinkInputSelectableSkin'
            },
            ListEditorButton    : 'wysiwyg.editor.skins.inputs.button.ButtonInputBlueArrowSkin',
            InputGroup          : {
                                       'default'    : 'wysiwyg.editor.skins.inputs.InputGroupSkin',
                                       'orange'    : 'wysiwyg.editor.skins.inputs.InputGroupOrangeSkin',
                                       'skinless'   : 'wysiwyg.editor.skins.inputs.InputGroupSkinlessSkin',
                                       'menus'      : 'wysiwyg.editor.skins.inputs.InputGroupMenusSkin',
                                       'cform'      : 'wysiwyg.editor.skins.inputs.CFormInputGroupSkin',
                                       'purple'     : 'wysiwyg.editor.skins.inputs.InputGroupSkinPurple'

            },
            CollapsibleInputGroup: {
                                    'default' : 'wysiwyg.editor.skins.inputs.CollapsibleInputGroupSkin'
            },
            ComboBox            : 'wysiwyg.editor.skins.inputs.ComboBoxSkin',
            SelectionListInput  : {
                                        'default': 'wysiwyg.editor.skins.inputs.SelectionListInputSkin',
                                        'imagesList': 'wysiwyg.editor.skins.inputs.SelectionListImagesSkin',
                                        'appsList': 'wysiwyg.editor.skins.inputs.SelectionListAppsSkin'
            },
            RadioButton         : 'wysiwyg.editor.skins.inputs.RadioButtonSkin',
            RadioImage          : 'wysiwyg.editor.skins.inputs.RadioImageSkin',
            RadioButtons        : {
                                    'default': 'wysiwyg.editor.skins.inputs.RadioButtonsSkin',
                                    'comfort': 'wysiwyg.editor.skins.inputs.RadioButtonComfortSkin'
                                  },
            RadioImages         : 'wysiwyg.editor.skins.inputs.RadioImagesSkin',
            Input               : {
                                       'default': 'wysiwyg.editor.skins.inputs.InputSkin',
                                       'floating': 'wysiwyg.editor.skins.inputs.InputFloatingSkin',
                                        'strong' : 'wysiwyg.editor.skins.inputs.InputStrongLabelSkin'
            },

            Link                : 'wysiwyg.editor.skins.inputs.InputSkin',
            SubmitInput         : 'wysiwyg.editor.skins.inputs.SubmitInputSkin',
            SubmitTextArea      : 'wysiwyg.editor.skins.inputs.SubmitTextAreaSkin',
            TextArea            : 'wysiwyg.editor.skins.inputs.TextAreaSkin',
            HtmlIsland          : 'wysiwyg.editor.skins.inputs.HtmlIslandSkin',
            Slider              : {
                                    'default': 'wysiwyg.editor.skins.inputs.SliderSkin',
                                    'withIcons': 'wysiwyg.editor.skins.inputs.SliderWithIconsSkin',
                                    'withLabels': 'wysiwyg.editor.skins.inputs.SliderWithLabelsSkin'
            },
            CircleSlider        : 'wysiwyg.editor.skins.inputs.CircleSliderSkin',
            CheckBox            : {
                                    'default': 'wysiwyg.editor.skins.inputs.CheckBoxSkin',
                                    'toggle': 'wysiwyg.editor.skins.inputs.ToggleCheckBoxSkin',
                                    'toggleButton': 'wysiwyg.editor.skins.inputs.ToggleCheckBoxButtonSkin'
            },

            DialogCheckBox      : 'wysiwyg.editor.skins.inputs.DialogCheckBoxSkin',
            CheckBoxImage       : {'default':'wysiwyg.editor.skins.inputs.CheckBoxImageSkin',
                                    'noHover':'wysiwyg.editor.skins.inputs.CheckBoxImageNoHoverSkin',
                                    'noHoverMultiLine':'wysiwyg.editor.skins.inputs.CheckBoxImageMultilineNoHoverSkin'
                                  },
            ProgressBar         : 'wysiwyg.editor.skins.progress.ProgressBarSkin',
            Task                : 'wysiwyg.editor.skins.progress.TaskSkin',
            TaskList            : 'wysiwyg.editor.skins.progress.TaskListSkin',
            TaskListField       : 'wysiwyg.editor.skins.progress.TaskListFieldSkin',
            ImageInput          : {
                                    'default': 'wysiwyg.editor.skins.inputs.ImageInputSkin',
                                    'blue': 'wysiwyg.editor.skins.inputs.ImageInputBlueActionSkin',
                                    'organizeBlueAction': 'wysiwyg.editor.skins.inputs.ImageInputSkin',
                                    'gallery': 'wysiwyg.editor.skins.inputs.ImageInputForGallerySkin',
                                    'siteLogo':'wysiwyg.editor.skins.inputs.SiteLogoInputSkin'
            },
            FlashInput          : {
                                   'default': 'wysiwyg.editor.skins.inputs.ImageInputSkin',
                                   'organizeBlueAction': 'wysiwyg.editor.skins.inputs.ImageInputSkin'
            },
            DocInput            : 'wysiwyg.editor.skins.inputs.DocInputSkin',
            ColorInput          : {
                                        'default': 'wysiwyg.editor.skins.inputs.ColorInputSkin',
                                        'small': 'wysiwyg.editor.skins.inputs.ColorInputSmallSkin',
                                        'narrow': 'wysiwyg.editor.skins.inputs.ColorInputNarrowSkin',
                                        'dialog': 'wysiwyg.editor.skins.inputs.ColorDialogInputSkin'
                                  },
            ColorGroup          : 'wysiwyg.editor.skins.inputs.ColorGroupSkin',
            ColorSelectorField  : 'wysiwyg.editor.skins.inputs.ColorSelectorFieldSkin',
            ColorSelectorButton : 'wysiwyg.editor.skins.inputs.ColorSelectorButtonFieldSkin',
            FontSelectorField   : 'wysiwyg.editor.skins.inputs.font.FontSelectorFieldSkin',

            BgScroll            : 'wysiwyg.editor.skins.inputs.bg.BgScrollSkin',
            BgAlign             : 'wysiwyg.editor.skins.inputs.bg.BgAlignSkin',
            BgTile              : 'wysiwyg.editor.skins.inputs.bg.BgTileSkin',
            BgColor             : 'wysiwyg.editor.skins.inputs.bg.BgColorSkin',
            BgImage             : 'wysiwyg.editor.skins.inputs.bg.BgImageSkin',

            FontButton          : 'wysiwyg.editor.skins.inputs.button.FontButtonInputSkin',
            FontColor           : 'wysiwyg.editor.skins.inputs.font.FontColorSkin',
            FontSize            : 'wysiwyg.editor.skins.inputs.font.FontSizeSkin',
            FontStyle           : 'wysiwyg.editor.skins.inputs.font.FontStyleSkin',
            FontFamily          : 'wysiwyg.editor.skins.inputs.font.FontFamilySkin',

            BoxShadow           : 'wysiwyg.editor.skins.inputs.BoxShadowInputSkin',
            BorderRadius        : 'wysiwyg.editor.skins.inputs.BorderRadiusInputSkin',
            AudioInput          : {
                                   'default': 'wysiwyg.editor.skins.inputs.AudioInputSkin',
                                   'organizeBlueAction': 'wysiwyg.editor.skins.inputs.ImageInputSkin',
                                   'gallery': 'wysiwyg.editor.skins.inputs.ImageInputForGallerySkin'
                                },
            LanguageSelection   : 'wysiwyg.editor.skins.inputs.LanguageSelectionSkin',
            ProgressBarInput    : {
                                    'default': 'wysiwyg.editor.skins.inputs.ProgressBarDefaultSkin'
                                }

        },
        FLOATING_DIALOG: {
            Extends: 'DEFAULT',

            ButtonInput         : {
                                    'businessApps': 'wysiwyg.editor.skins.inputs.button.ButtonInputBusinessAppsSkin',
                                    'businessAppPromotion': 'wysiwyg.editor.skins.inputs.button.ButtonInputBusinessAppPromotionSkin',
                                    'default' : 'wysiwyg.editor.skins.inputs.button.FloatingDialogButtonInputSkin',
                                    'upgrade' : 'wysiwyg.editor.skins.inputs.button.ButtonInputUpgradeSkin',
                                    'upgradeSale' : 'wysiwyg.editor.skins.inputs.button.ButtonInputUpgradeSaleSkin',
                                    'purple'       : 'wysiwyg.editor.skins.inputs.button.ButtonInputPurpleSkin',
                                    'white'      : 'wysiwyg.editor.skins.inputs.button.ButtonInputSkin'
            },
            Label               : {
                                    'default': 'wysiwyg.editor.skins.inputs.FloatingDialogTitleSkin',
                                    'SubLabel': 'wysiwyg.editor.skins.inputs.LabelSkin'
            },
            SubLabel            : {
                                    'businessApps': 'wysiwyg.editor.skins.inputs.GreyWithMarginLabelSkin',
                                    'default'     : 'wysiwyg.editor.skins.inputs.FloatingDialogDescriptionSkin',
                                    'SubLabelBoldWithIcon': 'wysiwyg.editor.skins.inputs.PublishDialogOneMnTitleSkin'
            }

        }
    }
});

































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































