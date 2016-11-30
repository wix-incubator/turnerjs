xdescribe('AdminLogin', function() {
    beforeEach(function(){
        var dataItem = W.Data.createDataItem({
            type:'Text',
            sourceType:'external'
        });

        ComponentsTestUtil.buildComp(
            "wysiwyg.viewer.components.AdminLogin",
            "mock.viewer.skins.PasswordLoginSkin",
            dataItem
        );
    });

    it('check validation of admin password', function() {
        var logic = this.compLogic;
        expect(logic._validateInput("aaa@bbb")).toBe(null);
        expect(logic._validateInput("123a_aa^b_b&b")).toBe(null);
        expect(logic._validateInput("חיעליעלחיעיע")).toBe(logic.ERR_MAP["9972"]);
    });
});