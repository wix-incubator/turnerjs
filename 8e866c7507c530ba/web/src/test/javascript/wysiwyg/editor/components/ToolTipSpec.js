describe('wysiwyg.editor.components.ToolTip', function() {
    describe('test tooltip component', function(){
        var toolTipId = 'someTipId';
        beforeEach(function() {
            this.testComp = W.Components.createComponent(
                'wysiwyg.editor.components.ToolTip',
                'wysiwyg.editor.skins.ToolTipSkin',
                undefined,
                {labelText: ''},
                null,
                function(logic){
                    this.tipTest = logic;
                    this.tipTest.options= {
                        tipId: toolTipId,
                        cookieName: "tips"
                    }
                    this.isComplete = true;
                }.bind(this)
            );

            waitsFor( function(){
                return this.isComplete;
            }.bind(this),
                'tooltip component creation',
                1000);
        });
        it('should register new command', function(){

            spyOn(this.tipTest, '_callTip');
            var obj = {
                getViewNode:function(){
                    return {
                        getPosition:function(){
                            return{y:"555",x:"666"}
                        },
                        getHeight:function(){return "555"},
                        getWidth:function(){return "555"}
                    }
                }
            };
            W.Commands.executeCommand('Tooltip.ShowTip', {id:"generalTip"}, obj);
            waitsFor(function(){
                return this.tipTest._callTip.callCount > 0 ;
            }.bind(this),5000);
        });
        //remove on experiment
        it('we should have an html element ready on init', function(){
            expect(typeOf(this.tipTest.tipNode)).toBe("element")
        });

        it('check that every action has action func for event delegation / when no function', function(){
//            var e = {
//                preventDefault:function(){},
//                target:{
//                    get:function(what){
//                        return what;
//                    }
//                }
//            }
            var nodes = this.tipTest.tipNode.getChildren().getChildren();
            var action;
//            this.tipTest.getLogic = function(){return this;}
            for(var i=0;i<=nodes[0].length;i++){
                action = nodes[0][i] ? nodes[0][i].get('action') : false;
                if(action){
//                    e.target.get = function(what){return action}
//                    this.tipTest._handleEvent(e);

                    expect(this.tipTest[action]).toBeDefined();
                }
            }
            expect(this.tipTest["lala"]).toBeFalsy();
        });

        describe('Test cookie mechanism', function(){

            var params = {
                    id:'someTipId'
                },
                source;

            beforeEach(function(){
                W.Data.dataMap.TOOLTIPS._data.toolTips = {
                    'someTipId':{
                        'isMoreLess':false,
                        'title':'this tip should not be seen',
                        'content':'blah',
                        'isDontShowAgain':true,
                        "isPublished":true,
                        'help':{
                            "isMoreHelp":false,
                            "text":null,
                            "url":""
                        }
                    }
                };
            });

            afterEach(function(){
                /* clean the cookie */
                W.CookiesManager.removeCookieParam(this.tipTest.options.cookieName,toolTipId);
            })

            it('Should place a cookie with toolTip id, when dont-show-again is checked', function(){
                var checkbox = document.createElement("input");
                checkbox.setAttribute('type','checkbox');
                checkbox.setAttribute('action','dontShow');
                checkbox.setAttribute('checked','true');
                var clickEvent = {target : checkbox};

                this.tipTest._handleEvent.apply(this.testComp,[clickEvent]);

                expect(W.CookiesManager.getCookieParams(this.tipTest.options.cookieName).indexOf(toolTipId)).toBeGreaterThan(-1);
            });

            it('Should not show tip if tip id in cookie', function(){
                W.CookiesManager.setCookieParam(this.tipTest.options.cookieName,toolTipId);
                spyOn(this.tipTest, '_showTip');

                this.tipTest._callTip(params, source);

                expect(this.tipTest._showTip).not.toHaveBeenCalled();
            });

        });

        it('dont show tip if its not in the map', function(){
            spyOn(this.tipTest, '_callTip') ;
            expect(this.tipTest._callTip({id:"neverEverATipId"}, {})).toBeFalsy();
        });
        it('callTip should call showTip', function(){
            spyOn(this.tipTest, '_showTip')  ;
            var params = {
                id:'someTip'
            }  ;
            W.Data.dataMap.TOOLTIPS._data.toolTips = {
                someTip:{
                    title:'blah',
                    content:'blah',
                    isDontShowAgain:'false',
                    isMoreLess:'false',
                    help:{
                        isMoreHelp:false
                    }
                }
            }   ;
            var source = {source:{getViewNode:function(){return{}}}}  ;
            this.tipTest._callTip(params, source)  ;
            expect(this.tipTest._showTip).toHaveBeenCalled();
        });

        //remove on experiment
        it("don't show tip after CloseTip command runs", function(){
            spyOn(this.tipTest, '_showToolTipCmd');
            spyOn(this.tipTest, '_closeToolTipCmd');
            spyOn(this.tipTest, '_callTip');

            this.tipTest._showToolTipCmd({id:"generalTip"});
            this.tipTest._closeToolTipCmd({id:"generalTip"});

            waitsFor(function(){
                return this.tipTest._showToolTipCmd.wasCalled && this.tipTest._closeToolTipCmd.wasCalled;
            }.bind(this), 500);

            runs(function() {
                expect(this.tipTest._callTip).not.toHaveBeenCalled();
            });
        });

    });
});
