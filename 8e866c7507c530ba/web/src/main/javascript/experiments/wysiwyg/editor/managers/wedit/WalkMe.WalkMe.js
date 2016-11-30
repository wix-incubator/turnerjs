define.experiment.newClass('wysiwyg.editor.managers.wedit.WalkMe.WalkMe', function(classDefinition, experimentStrategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds([
        '_handleWalkMeEvent', 'callBackWhenWalkMeLoaded'
    ]);

    def.resources(['W.Commands', 'W.Config', 'W.Experiments']);

    def.methods({
        initialize: function(){
            this._addWalkThruScript();
            window.walkme_event = this._handleWalkMeEvent;
            window.walkme_player_event = this._handleWalkMeEvent;
            this._callBackWhenWalkMeLoaded = null;
        },

        /**
         * Adds the WalkMeThru script to the dom.
         * Currently we want to do this only when the experiment is ON.
         */
        _addWalkThruScript: function(){
            if(this.resources.W.Experiments.isExperimentOpen('Walkme2')) {
                var walkMeScript = new Element('script');
                walkMeScript.setAttribute("type", "text/javascript");
                walkMeScript.setAttribute("src", "https://d3b3ehuo35wzeh.cloudfront.net/users/d4c2475c160944ce881d2a0ac3d8330e/walkme_d4c2475c160944ce881d2a0ac3d8330e_https.js");
                document.head.appendChild(walkMeScript);
            }
            else{
                var walkMeAdditionalScript = new Element('script');
                walkMeAdditionalScript.setAttribute("type", "text/javascript");
                walkMeAdditionalScript.setAttribute("src", "http://walkme.external.s3.amazonaws.com/customers/Wix/custom/walkme-wix.js?v=6");
                document.head.appendChild(walkMeAdditionalScript);

                var walkMeCSS = new Element('link');
                walkMeCSS.setAttribute("type", "text/css");
                walkMeCSS.setAttribute("rel", "stylesheet");
                walkMeCSS.setAttribute("media", "all");
                walkMeCSS.setAttribute("href", "http://walkme.external.s3.amazonaws.com/customers/Wix/custom/walkme-wix.css");
                document.head.appendChild(walkMeCSS);

                var walkMeScript = new Element('script');
                walkMeScript.setAttribute("type", "text/javascript");
                walkMeScript.setAttribute("src", "http://cdn.walkme.com/users/2677/walkme_2677.js");
                document.head.appendChild(walkMeScript);
            }
        },

        /**
         * Listens to all WalkMe events
         */
        _handleWalkMeEvent: function(eventData){
            switch (eventData.Type){
                case 'PlayerInitComplete': //On Walkme load
                    if(this._callBackWhenWalkMeLoaded){
                        this._callBackWhenWalkMeLoaded();
                    }
                    LOG.reportEvent(wixEvents.WALK_ME_LOADED);
                    break;

                case 'BeforeMenuOpen': //When clicking the Walkme trigger
                    LOG.reportEvent(wixEvents.WALK_ME_BUTTON_CLICKED);
                    break;

                case 'WalkthruSelected': //When selecting an option in the main menu
                    LOG.reportEvent(wixEvents.WALK_ME_STEP_BEGUN, {g1: eventData.WalkthruId});
                    break;

                case 'NewStepShown': //When a new Walkme step is shown
                    LOG.reportEvent(wixEvents.WALK_ME_STEP_SHOWN, {g1: eventData.WalkthruId});

                    break;

                case 'HelpCenter': //When clicking on the help center link
                    LOG.reportEvent(wixEvents.WALK_ME_HELP_CLICKED);
                    W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', {helpId: 'TopBar'});
                    break;

                case 'AfterMenuClose': //When user closes walkme main menu
                    LOG.reportEvent(wixEvents.WALK_ME_MENU_CLOSED);

                    break;
                case 'UserStoppedWalkthruAfterStop': //After user leaves walkme
                    LOG.reportEvent(wixEvents.WALK_ME_CLOSED, {g1: eventData.WalkthruId});
                    break;

                case 'WalkthruCompleted': //When walkme completed walk through cycle
                    break;

                case 'OpenTicketClicked': //When clicking on the help center link (in new walkme API)
                    LOG.reportEvent(wixEvents.WALK_ME_HELP_CLICKED);
                    W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', {helpId: 'TopBar'});
                    break;

                default:
                    break;
            }
        },

        /**
         * Show the use the first time walk-thru welcome screen
         */
        showFirstTimeWelcomeScreen: function(){
            try{
                LOG.reportEvent(wixEvents.FIRST_TIME_WALK_ME_PRESENTED);
                if(this.resources.W.Experiments.isExperimentOpen('Walkme2')) {
                    WalkMePlayerAPI.toggleMenu();
                }
                else if(!WalkMeAPI.startWalkthruById(25157)){
                    LOG.reportError(wixErrors.WALK_ME_FAILED_TO_LOAD);
                }
            } catch(e){
                LOG.reportError(wixErrors.WALK_ME_FAILED_TO_LOAD);
            }
        },

        startFirstWalkMe: function(){
            try{
                if(!WalkMeAPI.startWalkthruById(6102)){
                    LOG.reportError(wixErrors.WALK_ME_FAILED_TO_LOAD);
                }
            } catch(e){
                LOG.reportError(wixErrors.WALK_ME_FAILED_TO_LOAD);
            }
        },

        callBackWhenWalkMeLoaded:function(callBack){
            this._callBackWhenWalkMeLoaded = callBack;
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._setWalkmeVisibility);
            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.SetViewerMode", this, this._setWalkmeVisibility);
        },

        _setWalkmeVisibility: function(params){
            var isPreview = this.resources.W.Config.env.isEditorInPreviewMode();
            var isMobile =  this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;

            if(WalkMePlayerAPI){
                if (isPreview || isMobile){
                    WalkMePlayerAPI.hidePlayer && WalkMePlayerAPI.hidePlayer();
                } else {
                    WalkMePlayerAPI.showPlayer();
                }
            }
        }

    });
});

