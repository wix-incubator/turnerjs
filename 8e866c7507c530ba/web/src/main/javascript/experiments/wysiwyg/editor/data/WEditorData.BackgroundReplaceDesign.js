define.experiment.dataItem('TOP_TABS.BackgroundReplaceDesign', function (experimentStrategy) {

    var strategy = experimentStrategy;

    return strategy.customizeField(function (tabs) {
        tabs.items = [
            {name: 'Pages',     label: 'SIDE_BTN_PAGES',    labelType: 'langKey', id: 'tbPages',    command: 'WEditorCommands.Pages',       commandParameter: 'pagesPanel'},
            {name: 'Design',    label: 'BACKGROUND',   labelType: 'langKey', id: 'tbDesign',   command: 'WEditorCommands.ShowBackgroundDesignPanel',      commandParameter: 'designPanel'},
            {name: 'Add',       label: 'SIDE_BTN_ADD',      labelType: 'langKey', id: 'tbAdd',      command: 'WEditorCommands.ShowComponentCategories', commandParameter: 'addPanel'},
            {name: 'Market',    label: 'SIDE_BTN_MARKET',   labelType: 'langKey', id: 'tbMarket',   command: 'WEditorCommands.Market',      commandParameter: 'marketPanel', component: 'wysiwyg.editor.components.AppMarketTab'},
            {name: 'Settings',  label: 'SIDE_BTN_SETTINGS', labelType: 'langKey', id: 'tbSettings', command: 'WEditorCommands.Settings',    commandParameter: 'settingsPanel'}
        ];
        return tabs;
    });
});