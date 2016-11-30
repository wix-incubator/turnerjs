define.dataItem.multi({
    'CK_EDITOR_PARAGRAPH_STYLES': {
        type: 'map',
        items:{
            "h1" : {"tag": "h1", 'cssClass': 'font_0'},
            "h2" : {"tag": "h2", 'cssClass': 'font_2'},
            "h3" : {"tag": "h3", 'cssClass': 'font_3'},
            "h4" : {"tag": "h4", 'cssClass': 'font_4'},
            "h5" : {"tag": "h5", 'cssClass': 'font_5'},
            "h6" : {"tag": "h6", 'cssClass': 'font_6'},
            "p" : {"tag": "p", 'cssClass': 'font_7'},
            "div" : {"tag": "div", 'cssClass': 'font_8'},
            "address" : {"tag": "address", 'cssClass': 'font_9'}
        }
    },

    'CK_EDITOR_TITLE_STYLES':{
        type: 'map',
        items:{
            "h1" : {"tag": "h1", 'cssClass': 'font_0'},
            "h2" : {"tag": "h2", 'cssClass': 'font_1'},
            "h3" : {"tag": "h3", 'cssClass': 'font_2'}
        }
    },

    'CK_EDITOR_COLORS': {
        type: 'list',
        items: [
            {

            }
        ]
    },

    'CK_EDITOR_FONT_SIZES': {
        type: 'map',
        items:
        {
            "default" : {"value": 2, "label": "TOOLBAR_DROP_DOWN_DEFAULT_VALUE"},
            "size_0" : {"value": "6px", "label": "6 px"},
            "size_1" : {"value": "8px", "label": "8 px"},
            "size_2" : {"value": "9px", "label": "9 px"},
            "size_3" : {"value": "10px", "label": "10 px"},
            "size_4" : {"value": "11px", "label": "11 px"},
            "size_5" : {"value": "12px", "label": "12 px"},
            "size_6" : {"value": "13px", "label": "13 px"},
            "size_7" : {"value": "14px", "label": "14 px"},
            "size_8" : {"value": "15px", "label": "15 px"},
            "size_9" : {"value": "16px", "label": "16 px"},
            "size_10" : {"value": "18px", "label": "18 px"},
            "size_11" : {"value": "24px", "label": "24 px"},
            "size_12" : {"value": "30px", "label": "30 px"},
            "size_13" : {"value": "36px", "label": "36 px"},
            "size_14" : {"value": "48px", "label": "48 px"},
            "size_15" : {"value": "60px", "label": "60 px"},
            "size_16" : {"value": "72px", "label": "72 px"}
        }

    },

    'CK_EDITOR_LETTER_SPACING': {
        type: 'map',
        items:
        {
            "default" : {"value": 2, "label": "TOOLBAR_DROP_DOWN_DEFAULT_VALUE"},
            "space_0" : {"value": "-0.1em", "label": "-0.1"},
            "space_1" : {"value": "-0.05em", "label": "-0.05"},
            "space_2" : {"value": "0.0em", "label": "0.0"},
            "space_3" : {"value": "0.1em", "label": "0.1"},
            "space_4" : {"value": "0.2em", "label": "0.2"},
            "space_5" : {"value": "0.3em", "label": "0.3"},
            "space_6" : {"value": "0.4em", "label": "0.4"},
            "space_7" : {"value": "0.5em", "label": "0.5"},
            "space_8" : {"value": "0.6em", "label": "0.6"},
            "space_9" : {"value": "0.7em", "label": "0.7"}
        }

    },

    'CK_EDITOR_LINE_HEIGHT': {
        type: 'map',
        items:
        {
            "default" : {"value": 2, "label": "TOOLBAR_DROP_DOWN_DEFAULT_VALUE"},
            "height_05" : {"value": "0.5em", "label": "0.5"},
            "height_06" : {"value": "0.6em", "label": "0.6"},
            "height_07" : {"value": "0.7em", "label": "0.7"},
            "height_08" : {"value": "0.8em", "label": "0.8"},
            "height_09" : {"value": "0.9em", "label": "0.9"},
            "height_10" : {"value": "1em", "label": "1"},
            "height_11" : {"value": "1.1em", "label": "1.1"},
            "height_12" : {"value": "1.2em", "label": "1.2"},
            "height_13" : {"value": "1.3em", "label": "1.3"},
            "height_14" : {"value": "1.4em", "label": "1.4"},
            "height_15" : {"value": "1.5em", "label": "1.5"},
            "height_16" : {"value": "1.6em", "label": "1.6"},
            "height_17" : {"value": "1.7em", "label": "1.7"},
            "height_18" : {"value": "1.8em", "label": "1.8"},
            "height_19" : {"value": "1.9em", "label": "1.9"},
            "height_20" : {"value": "2em", "label": "2"},
            "height_22" : {"value": "2.25em", "label": "2.25"},
            "height_25" : {"value": "2.5em", "label": "2.5"},
            "height_27" : {"value": "2.75em", "label": "2.75"},
            "height_30" : {"value": "3em", "label": "3"}
        }

    },

    'CK_EDITOR_JUSTIFICATION_TYPES': {
        type: 'map',
        items:
        {
            "justifyLeft" : {"iconSrc": "richtext/aligndrop.png", "spriteOffset": {x:0, y:-60}, "iconSize":{width:20, height:20}, "command": "justifyleft", "toolTipId": "Text_Editor_Align_Left_ttid"},
            "justifyCenter" : {"iconSrc": "richtext/aligndrop.png", "spriteOffset": {x:0, y:-40}, "iconSize":{width:20, height:20}, "command": "justifycenter", "toolTipId": "Text_Editor_Center_ttid"},
            "justifyRight" : {"iconSrc": "richtext/aligndrop.png", "spriteOffset": {x:0, y:0}, "iconSize":{width:20, height:20}, "command": "justifyright", "toolTipId": "Text_Editor_Align_Right_ttid"},
            "justifyBlock" : {"iconSrc": "richtext/aligndrop.png", "spriteOffset": {x:0, y:-20}, "iconSize":{width:20, height:20}, "command": "justifyblock", "toolTipId": "Text_Editor_Justify_ttid"}
        }
    },

    'CK_EDITOR_EFFECTS': {
        type: 'map',
        items:
        {
            "effect_0"  :  {
                "effectName": "Clear Effect",
                "iconSrc": "richtext/xclose.png",
                "iconSize":{width:9, height:15},
                "iconMargin":"18px 0px 0px 0px",
                "value": 2,
                "titleKey": "TOOLBAR_EFFECTS_CLEAR_EFFECT"},
            "effect_1"  :  {
                "effectName": "Inset",
                "label":"A",
                "labelShadow": "rgba(255, 255, 255, 0.6) 1px 1px 1px, rgba(0, 0, 0, 0.6) -1px -1px 1px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_1",
                "value":"rgba(255, 255, 255, 0.6) 1px 1px 1px, rgba(0, 0, 0, 0.6) -1px -1px 1px"},
            "effect_2"  :  {
                "effectName": "Bottom",
                "label":"A",
                "labelShadow": "rgba(0, 0, 0, 0.298039) 0px 3px 0px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_2",
                "value": "rgba(0, 0, 0, 0.298039) 0px 5px 0px"},
            "effect_3"  :  {
                "effectName": "Blur",
                "label":"A",
                "labelShadow": "rgba(0, 0, 0, 0.4) 0px 4px 5px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_3",
                "value": "rgba(0, 0, 0, 0.4) 0px 4px 5px"},
            "effect_4"  :  {
                "effectName": "Black Outline",
                "label":"A",
                "labelShadow": "rgba(0, 0, 0, 0.498039) -1px -1px 0px, rgba(0, 0, 0, 0.498039) -1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px -1px 0px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_4",
                "value": "rgba(0, 0, 0, 0.498039) -1px -1px 0px, rgba(0, 0, 0, 0.498039) -1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px -1px 0px"},
            "effect_5"  :  {
                "effectName": "White Outline",
                "label":"A",
                "labelShadow": "rgb(255, 255, 255) -1px -1px 0px, rgb(255, 255, 255) -1px 1px 0px, rgb(255, 255, 255) 1px 1px 0px, rgb(255, 255, 255) 1px -1px 0px,rgb(153, 153, 153) 0px 0px 10px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_5",
                "value": "rgb(255, 255, 255) -1px -1px 0px, rgb(255, 255, 255) -1px 1px 0px, rgb(255, 255, 255) 1px 1px 0px, rgb(255, 255, 255) 1px -1px 0px"},
            "effect_6"  :  {
                "effectName": "White Glow",
                "label":"A",
                "labelShadow": "rgb(255, 255, 255) -2px -2px 2px, rgb(255, 255, 255) -2px 2px 2px, rgb(255, 255, 255) 2px 2px 2px, rgb(255, 255, 255) 2px -2px 2px, rgba(0, 0, 0, 0.5) 0 0 11px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_6",
                "value": "rgb(255, 255, 255) 0px 0px 6px"},
            "effect_7"  :  {
                "effectName": "3D",
                "label":"A",
                "labelShadow": "rgb(200, 200, 200) 1px 1px 0px, rgb(180, 180, 180) 0px 2px 0px, rgb(160, 160, 160) 0px 3px 0px, rgba(140, 140, 140, 0.498039) 0px 4px 0px, rgb(120, 120, 120) 0px 0px 0px, rgba(0, 0, 0, 0.498039) 0px 5px 10px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_7",
                "value": "rgb(200, 200, 200) 1px 1px 0px, rgb(180, 180, 180) 0px 2px 0px, rgb(160, 160, 160) 0px 3px 0px, rgba(140, 140, 140, 0.498039) 0px 4px 0px, rgb(120, 120, 120) 0px 0px 0px, rgba(0, 0, 0, 0.498039) 0px 5px 10px"},
            "effect_8"  :  {
                "effectName": "Double",
                "label":"A",
                "labelShadow": "rgb(255, 255, 255) 3px 3px 0px, rgba(0, 0, 0, 0.2) 6px 6px 0px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_8",
                "value": "rgb(255, 255, 255) 3px 3px 0px, rgba(0, 0, 0, 0.2) 6px 6px 0px"},
            "effect_9"  :  {
                "effectName": "Anaglyphic",
                "label":"A",
                "labelShadow": "rgba(10, 189, 240, 0.298039) 3px 3px 0px, rgba(254, 1, 1, 0.298039) -3px -3px 0px",
                "titleKey": "TOOLBAR_EFFECTS_EFFECT_9",
                "value": "rgba(10, 189, 240, 0.298039) 3px 3px 0px, rgba(254, 1, 1, 0.298039) -3px -3px 0px"}
        }
    },

    'CK_EDITOR_COMPONENT_SIZE': {
        type: 'map',
        items:
        {
            "default" : {"value": "Actual", "label": "TOOLBAR_COMPONENT_SIZE_ACTUAL"},
            "size_0" : {"value": "24%", "label": "TOOLBAR_COMPONENT_SIZE_SMALL"},
            "size_1" : {"value": "49%", "label": "TOOLBAR_COMPONENT_SIZE_MEDIUM"},
            "size_2" : {"value": "74%", "label": "TOOLBAR_COMPONENT_SIZE_LARGE"},
            "size_3" : {"value": "100%", "label": "TOOLBAR_COMPONENT_SIZE_EXTRA_LARGE"}
        }

    }
,

    'CK_EDITOR_VIDEO_COMPONENT_SIZE': {
        type: 'map',
        items:
        {
            "size_1" : {"value": "49%", "label": "TOOLBAR_COMPONENT_SIZE_SMALL"},
            "size_2" : {"value": "74%", "label": "TOOLBAR_COMPONENT_SIZE_MEDIUM"},
            "default" : {"value": "100%", "label": "TOOLBAR_COMPONENT_SIZE_LARGE"}
        }

    }

});