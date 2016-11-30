define(function () {
    'use strict';

    var styleMap = {
        Area: {
            'default': {'skin': 'wysiwyg.viewer.skins.area.AppleArea', 'style': 'c1'},
            'ecomCouponBox': {'skin': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin', 'style': 'ecom_cbx1'},
            'ecomCartHeader': {'skin': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin', 'style': 'ecom_ch1'},
            'ecomEmptyCartBG': {'skin': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin', 'style': 'ecom_ecbg1'}
        },
        Button: {
            'default': {'skin': 'wysiwyg.viewer.skins.button.BasicButton', 'style': 'b3'},
            'ecomViewCart': {'skin': 'wysiwyg.viewer.skins.button.BasicButton', 'style': 'ecom_vc1'},
            'ecomCheckout': {'skin': 'wysiwyg.viewer.skins.button.DisabledLayerButton', 'style': 'ecom_co1'},
            'ecomAddToCart': {'skin': 'wysiwyg.viewer.skins.button.BasicButton', 'style': 'ecom_atc1'},
            'ecomRemoveFromCart': {'skin': 'wysiwyg.viewer.skins.button.FixedFontButton', 'style': 'ecom_rfc1'},
            'ecomApplyCoupon': {'skin': 'wysiwyg.viewer.skins.button.ApplyButtonEcom', 'style': 'ecom_apl1'},
            'ecomAddProduct': {'skin': 'wysiwyg.viewer.skins.button.AddProductButton', 'style': 'ecom_ap1'}
        },
        Button2: {
            'default': {'skin': 'wysiwyg.viewer.skins.button.BasicButton', 'style': 'b3'},
            'ecomViewCart': {'skin': 'wysiwyg.viewer.skins.button.BasicButton', 'style': 'ecom_vc1'},
            'ecomCheckout': {'skin': 'wysiwyg.viewer.skins.button.DisabledLayerButton', 'style': 'ecom_co1'},
            'ecomAddToCart': {'skin': 'wysiwyg.viewer.skins.button.BasicButton', 'style': 'ecom_atc1'},
            'ecomRemoveFromCart': {'skin': 'wysiwyg.viewer.skins.button.FixedFontButton', 'style': 'ecom_rfc1'},
            'ecomApplyCoupon': {'skin': 'wysiwyg.viewer.skins.button.ApplyButtonEcom', 'style': 'ecom_apl1'},
            'ecomAddProduct': {'skin': 'wysiwyg.viewer.skins.button.AddProductButton', 'style': 'ecom_ap1'},
            'ecomFeedbackContinueShopping': {'skin': 'wysiwyg.viewer.skins.button.EcomFeedbackContinueShopping', 'style': 'ecom_fmcs1'},
            'ecomFeedbackContinueShopping2': {'skin': 'wysiwyg.viewer.skins.button.EcomFeedbackContinueShopping2', 'style': 'ecom_fmcs2'},
            'ecomFeedbackCheckout': {'skin': 'wysiwyg.viewer.skins.button.EcomFeedbackCheckoutButton', 'style': 'ecom_fmc1'}
        },
        ComboBox: {
            'default': {'skin': "wysiwyg.viewer.skins.input.ComboBoxInputSkinNoValidation", 'style': "wa_cb1"},
            'ecomComboBox': {'skin': "wixapps.integration.skins.ecommerce.inputs.ComboBoxInputSkin", 'style': ""},
            'ecomShippingComboBox': {'skin': "wysiwyg.viewer.skins.appinputs.EcomComboBoxInputSkin", 'style': "ecom_scb1"},
            'wixAppsGui': {'skin': "wixapps.integration.skins.inputs.ComboBoxInputSkin", 'style': ""}
        },
        TextArea: {
            'default': {'skin': "wysiwyg.viewer.skins.input.TextAreaInputSkin", 'style': "wa_tai1"},
            'ecomTextArea': {'skin': "wixapps.integration.skins.ecommerce.inputs.TextAreaInputSkin", 'style': ""}
        },
        TextAreaInput: {
            'default': {'skin': "TextAreaDefaultSkin", 'style': "ta_input"}
        },
        TextInput: {
            'default': {'skin': "wysiwyg.viewer.skins.appinputs.AppsTextInputSkin", 'style': "wa_ti1"},
            'ecomTextInput': {'skin': "wysiwyg.viewer.skins.appinputs.EcomTextInputSkin", 'style': "ecom_ti1"}
        },
        ErasableTextInput: {
            'default': {skin: 'wysiwyg.viewer.skins.appinputs.EcomErasableTextInputSkin', style: 'ecom_eti1'}
        },
        Gallery: {
            'default': {'skin': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridDefaultSkin', 'style': 'pagg1'},
            'productGallery': {'skin': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridSimple', 'style': 'pgg_cg0'},
            'contentGallery': {'skin': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoDetail', 'style': 'pgg_cg1'},
            'minipostGallery': {'skin': 'wysiwyg.viewer.skins.paginatedgrid.wixapps.PaginatedGridNoDetail', 'style': 'pgg_cg2'},
            'hoverGallery': {'skin': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoBG', 'style': 'pgg_cg3'},
            'blogGallery': {'skin': 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoDetail', 'style': 'pgg_cg4'}
        },
        Video: {
            'default': {'skin': "wysiwyg.viewer.skins.video.VideoDefault", 'style': 'v2'},
            'mediaLabel': {'skin': 'wysiwyg.viewer.skins.VideoSkin'}
        },
        Container: {
            'default': {'skin': 'wysiwyg.viewer.skins.area.AppleArea', 'style': 'c1'},
            'ecomCouponBox': {'skin': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin', 'style': 'ecom_cbx1'},
            'ecomCartHeader': {'skin': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin', 'style': 'ecom_ch1'},
            'ecomEmptyCartBG': {'skin': 'wysiwyg.viewer.skins.apps.DefaultBoxSkin', 'style': 'ecom_ecbg1'}
        },
        Image: {
            'default': {skin: "wysiwyg.viewer.skins.photo.NoSkinPhoto", style: "wp1"}
        },
        VideoThumb: {
            'default': {skin: "wysiwyg.viewer.skins.photo.NoSkinPhoto", style: "wp1"}
        },
        HorizontalLine: {
            'default': {skin: "wysiwyg.viewer.skins.FiveGridLineSkin", style: "hl1"}
        },
        VerticalLine: {
            'default': {skin: "wysiwyg.viewer.skins.VerticalLineSkin", style: "vl1"}
        },
        Table: {
            'default': {skin: "wysiwyg.viewer.skins.table.TableComponentDefaultSkin", style: "tblc1"}
        },
        VerticalList: {
            'default': {skin: "skins.core.InlineSkin", style: "vr1"},
            'ecomOptionsList': {skin: "skins.core.InlineSkin"}
        },
        List2: {
            'default': {skin: "skins.core.InlineSkin"}
        },
        PaginatedList: {
            'default': {skin: "skins.core.InlineSkin"}
        },
        FlowList: {
            'default': {skin: "skins.core.InlineSkin"}
        },
        Date: {
            'default': {skin: "wysiwyg.viewer.skins.WRichTextClickableSkin"}
        },
        MediaLabel: {
            'default': {skin: "wysiwyg.viewer.skins.WRichTextClickableSkin"}
        },
        Label: {
            'default': {skin: "wysiwyg.viewer.skins.WRichTextClickableSkin"}
        },
        InlineText: {
            'default': {skin: "skins.core.VerySimpleSkin"}
        },
        ClippedParagraph: {
            'default': {skin: "wysiwyg.viewer.skins.WRichTextClickableSkin"}
        },
        ClippedParagraph2: {
            'default': {skin: "wysiwyg.viewer.skins.WRichTextClickableSkin"}
        },
        Icon: {
            'default': {skin: "wixapps.integration.skins.IconSkin"}
        },
        ImageButton: {
            'default': {'skin': "wixapps.integration.skins.ImageButtonSkin"}
        },
        ImageButtonWithText: {
            'default': {skin: 'wysiwyg.viewer.skins.IconLeftImageButtonWithText'}
        },
        Toggle: {
            'default': {'skin': "wixapps.integration.skins.ToggleSkin"}
        },
        SliderGallery: {
            'default': {'skin': "wysiwyg.viewer.skins.galleryselectableslider.SelectableSliderGalleryDefaultSkin"}
        },
        TouchMediaZoomSlideshow: {
            'default': {'skin': "wysiwyg.viewer.skins.TouchMediaZoomSlideshow"}
        },
        TouchMediaZoomItem: {
            'default': {'skin': "wysiwyg.viewer.skins.TouchMediaZoomItem"}
        },
        NumericStepper: {
            'default': {'skin': "wysiwyg.common.components.numericstepper.viewer.skins.NumericStepperSimpleSkin", 'style': "nums1"}
        },
        Pagination: {
        'default': {skin: "skins.core.InlineSkin"}
        }
    };

    return styleMap;
});
