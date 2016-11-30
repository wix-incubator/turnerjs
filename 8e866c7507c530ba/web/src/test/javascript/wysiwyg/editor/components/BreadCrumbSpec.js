describe("Bread crumb unit tests", function() {

    testRequire().classes('wysiwyg.editor.components.BreadCrumb') ;

    beforeEach(function() {
        this._breadCrumb = new this.BreadCrumb() ;
    }) ;

    it("should ensure that the breadcrumb is defined for the tests", function() {
        expect(this._breadCrumb).toBeDefined() ;
    }) ;

    it("should be able to compare the last crumb to the added crumb", function() {
        var crumb1          = {'a':123, 'b': {'c': {'d': 111}}} ;
        var crumb2          = {'a':123, 'b': {'c': {'d': 888}}} ;
        var crumb1duplicate = {'a':123, 'b': {'c': {'d': 111}}} ;

        this._breadCrumb.pushCrumb(crumb1) ;
        var areDifferentCrumbsSame  = this._breadCrumb._isEqualToLastCrumb(crumb2) ;
        var areDuplicatedCrumbsSame = this._breadCrumb._isEqualToLastCrumb(crumb1duplicate) ;

        expect(areDifferentCrumbsSame).toBeFalsy() ;
        expect(areDuplicatedCrumbsSame).toBeTruthy() ;
    }) ;

    it("should not be able to add the same crumb twice consequently into the breadcrumb", function() {
        var crumb1          = {'a':123, 'b': {'c': {'d': 111}}} ;
        var crumb2          = {'a':123, 'b': {'c': {'d': 888}}} ;

        this._breadCrumb.pushCrumb(crumb1) ;
        this._breadCrumb.pushCrumb(crumb1) ;
        this._breadCrumb.pushCrumb(crumb2) ;
        this._breadCrumb.pushCrumb(crumb2) ;
        this._breadCrumb.pushCrumb(crumb2) ;
        this._breadCrumb.pushCrumb(crumb1) ;

        expect(this._breadCrumb.getBreadcrumbLength()).toBe(3) ;
    }) ;

}) ;