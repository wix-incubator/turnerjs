describeExperiment({'WalkMe': 'New'}, "test Walkme", function(){
    testRequire().resources('W.Commands').classes('wysiwyg.editor.managers.wedit.WalkMe');

    beforeEach(function(){
        spyOn(this.WalkMe.prototype, "initialize").andCallFake(function(){
            console.log('fake initialize');
        });
        this.walkme = new this.WalkMe();
        this.handler = this.walkme._handleWalkMeEvent;
        this.eventData = {Type: '', WalkthruId: ''};
        this.backupWalkmeApi = window.WalkMeAPI
        window.WalkMeAPI = {startWalkthruById: function(){ }};
    });

    afterEach(function(){
        window.WalkMeAPI = this.backupWalkmeApi;
    });

    describe('Test Walkme event handling', function(){
        it('should report the WALK_ME_LOADED event', function(){
            this.eventData.Type = 'PlayerInitComplete';
            expect(function(){
                this.handler(this.eventData)
            }.bind(this)).toReportEvent(wixEvents.WALK_ME_LOADED);
        });

        it('should report the WALK_ME_BUTTON_CLICKED event', function(){
            this.eventData.Type = 'BeforeMenuOpen';
            expect(function(){
                this.handler(this.eventData)
            }.bind(this)).toReportEvent(wixEvents.WALK_ME_BUTTON_CLICKED);
        });

        it('should report the WALK_ME_STEP_BEGUN event', function(){
            this.eventData.Type = 'WalkthruSelected';

            expect(function(){
                this.handler(this.eventData)
            }.bind(this)).toReportEvent(wixEvents.WALK_ME_STEP_BEGUN, {g1: this.eventData.WalkthruId});
        });

        it('should report the WALK_ME_STEP_SHOWN event', function(){
            this.eventData.Type = 'NewStepShown';

            expect(function(){
                this.handler(this.eventData)
            }.bind(this)).toReportEvent(wixEvents.WALK_ME_STEP_SHOWN, {g1: this.eventData.WalkthruId});
        });

        it('should report the WALK_ME_HELP_CLICKED event', function(){
            this.eventData.Type = 'HelpCenter';

            expect(function(){
                this.handler(this.eventData)
            }.bind(this)).toReportEvent(wixEvents.WALK_ME_HELP_CLICKED);
        });

        it('should report the WALK_ME_MENU_CLOSED event', function(){
            this.eventData.Type = 'AfterMenuClose';

            expect(function(){
                this.handler(this.eventData)
            }.bind(this)).toReportEvent(wixEvents.WALK_ME_MENU_CLOSED);
        });

        it('should report the WALK_ME_CLOSED event', function(){
            this.eventData.Type = 'UserStoppedWalkthruAfterStop';
            expect(function(){
                this.handler(this.eventData)
            }.bind(this)).toReportEvent(wixEvents.WALK_ME_CLOSED, {g1: this.eventData.WalkthruId});
        });

        it('should execute the ShowHelpDialog command on "HelpCenter" event', function(){
            this.eventData.Type = 'HelpCenter';
            spyOn(this.Commands, 'executeCommand');

            this.handler(this.eventData);
            expect(this.Commands.executeCommand).toHaveBeenCalledWith('WEditorCommands.ShowHelpDialog', {helpId: 'TopBar'});
        });

        it('should report the FIRST_TIME_WALK_ME_EVENT event', function(){
            expect(function(){
                this.walkme.showFirstTimeWelcomeScreen()
            }.bind(this)).toReportEvent(wixEvents.FIRST_TIME_WALK_ME_PRESENTED);
        });

        it('should report error if WalkMe failed to load', function(){
            window.WalkMeAPI = null;

            expect(function(){
                this.walkme.startFirstWalkMe()
            }.bind(this)).toReportError(wixErrors.WALK_ME_FAILED_TO_LOAD);

            expect(function(){
                this.walkme.showFirstTimeWelcomeScreen()
            }.bind(this)).toReportError(wixErrors.WALK_ME_FAILED_TO_LOAD);
        });
    });

});

