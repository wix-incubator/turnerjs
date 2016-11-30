define.experiment.dataItem('MOBILE_ADD_PANELS.HideMobileActionBar', function () {
    return {
        type: 'PropertyList',
        items: [
            {
                'type'      : 'Button',
                'iconSrc'   : 'buttons/back-to-top.png',
                'toggleMode': false,
                'label'     : 'BACK_TO_TOP_BUTTON',
                'command'   : 'WEditorCommands.ShowMobileBackToTopButtonPanel'
            },
            {
                'type'      : 'Button',
                'iconSrc'   : 'buttons/hidden_elements.png',
                'toggleMode': false,
                'label'     : 'HIDDEN_ITEMS_BUTTON',
                'commandParameter'  : 'mobileHiddenElementsPanel',
                'command'   : 'WEditorCommands.MobileHiddenElements'
            }
        ]
    }
});




