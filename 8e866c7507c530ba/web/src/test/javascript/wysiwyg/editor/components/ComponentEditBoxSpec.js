describe("ComponentEditBox unit tests", function() {

    testRequire().components('wysiwyg.editor.components.ComponentEditBox',
                             'wysiwyg.viewer.components.HeaderContainer',
                             'wysiwyg.viewer.components.FooterContainer') ;

    beforeEach(function() {
        var args = {gridLines: null} ;
        var view = new Element('div') ;
        this.componentEditBox = new this.ComponentEditBox("fakeComp-Id", view, args) ;
    }) ;

    it("should ensure the component edit box is defined", function() {
        expect(this.componentEditBox).toBeDefined() ;
    }) ;

    it("should compare to see if two given containers are equal", function() {
        var nullContainerA = null ;
        var nullContainerB = null ;
        var header  = new this.HeaderContainer('header-id', new Element('div'), {}) ;
        var footer  = new this.FooterContainer('footer-id', new Element('div'), {}) ;
        var footer2 = new this.FooterContainer('footer-id2', new Element('div'), {}) ;

        var containerA = {logic: header,    htmlNode: header.$view} ;
        var containerB = {logic: footer,    htmlNode: footer.$view} ;
        var containerC = {logic: footer2,   htmlNode: footer2.$view} ;

        var result1 = this.componentEditBox._areContainersEqual(nullContainerA, nullContainerB) ;
        var result2 = this.componentEditBox._areContainersEqual(nullContainerA, containerB) ;
        var result3 = this.componentEditBox._areContainersEqual(containerA, nullContainerB) ;
        var result4 = this.componentEditBox._areContainersEqual(containerA, containerB) ;
        var result5 = this.componentEditBox._areContainersEqual(containerB, containerC) ;
        var result6 = this.componentEditBox._areContainersEqual(containerC, containerC) ;

        expect(result1).toBeFalsy() ;
        expect(result2).toBeFalsy() ;
        expect(result3).toBeFalsy() ;
        expect(result4).toBeFalsy() ;
        expect(result5).toBeFalsy() ;
        expect(result6).toBeTruthy() ;
    }) ;

}) ;