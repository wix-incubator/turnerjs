define.experiment.dataItem('LINK_BUTTONS_TYPE.WixStaff', function(experimentStrategy){
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    return strategy.merge({items:
        [
            {buttonLabel:'LINK_DLG_LOGIN', spriteOffset:{x:0, y:0}, linkType:'LOGIN'}
        ]
    });
});

define.experiment.dataItem('ADD_COMPONENT_TABS.WixStaff',  function(experimentStrategy){
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    return strategy.merge({items:
        {
            // Wix Homepage
            'languageDD':{type:'Button', category:'wixhomepage', 'iconSrc':'buttons/language_selection.png', 'label':'LANGUAGES_DROPDOWN', command:'WEditorCommands.AddComponent', commandParameter:{compType:'languagesDropDown', styleId:'wix_lang1'}, 'order': 600},
            'homepageLogin':{type:'Button', category:'wixhomepage', 'iconSrc':'buttons/add_btns_08.png', 'label':'HOMEPAGE_LOGIN', command:'WEditorCommands.AddComponent', commandParameter:{compType:'homePageLogin', styleId:'wix_login1'}, 'order': 610},
            'homepageMenu':{type:'Button', category:'wixhomepage', 'iconSrc':'buttons/top_menu.png', 'label':'HOMEPAGE_MENU', command:'WEditorCommands.AddComponent', commandParameter:{compType:'wixHomePageMenu', styleId:'wix_homepage_menu1'}, 'order': 620},
            'wixOfTheDay':{type:'Button', category:'wixhomepage', 'iconSrc':'buttons/wix_of_the_day.png', 'label':'WIXOFTHEDAY', command:'WEditorCommands.AddComponent', commandParameter:{compType:'wixOfTheDay', styleId:'wix_of_the_day1'}, 'order': 630},
            'tpaPlaceholder':{type:'Button', category:'wixhomepage', 'iconSrc':'buttons/place_holder.png', 'label':'COMP_TPAPlaceholder', command:'WEditorCommands.AddComponent', commandParameter:{compType:'tpaPlaceholder', styleId:'tpaPlaceholder1'}, 'order': 640}
        }
    });
});

define.experiment.dataItem('COMPONENT_SECTIONS.WixStaff', function(experimentStrategy){
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    return strategy.merge({items:
        [
            // Wix homepage
            {'type':'Button',
                'iconSrc':'buttons/wix_components.png',
                'toggleMode':false,
                'label':'WIN_HOMEPAGE',
                'command':'WEditorCommands.ShowComponentCategory',
                commandParameter:'wixhomepage'}
        ]
    });
});
