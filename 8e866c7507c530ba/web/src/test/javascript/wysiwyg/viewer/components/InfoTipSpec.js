
describe('InfoTipSpec', function() {
    describe('test tooltip component', function(){
        beforeEach(function() {
            W.Components.createComponent(
                'wysiwyg.common.components.InfoTip',
                'mock.viewer.skins.option.InfoTipSkin',
                undefined,
                {labelText: ''},
                null,
                function(logic){
                    this.tipTest = logic;
                    this.isComplete = true;
                }.bind(this)
            );

            waitsFor( function(){
                return this.isComplete;
            }.bind(this),
                'infotip component creation',
                1000);
        });
        it('we should have an html element ready on init', function(){
            expect(typeOf(this.tipTest.tipNode)).toBe("element")
        });
        it('callTip should call showTip', function(){
            spyOn(this.tipTest, '_showTip')  ;
            var source = {source:{getViewNode:function(){return{}}}}  ;
            var params = {id:1, content:"Tip text here"};
            this.tipTest._callTip(params, source)  ;
            expect(this.tipTest._showTip).toHaveBeenCalled();
        });
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
