describe("Integration test for the (Static)GridLines feature.", function() {

    var GRID_LINES_SELECTOR = '[comp="wysiwyg.editor.components.StaticGridLines"]' ;

    function verifyChildrenSizeInDom(domElement, sizeInPixels, isEqual) {
        for(var i=0; i < domElement.children.length; i++) {
            var child = domElement.children[i] ;
            var childSizes = child.getBoundingClientRect() ;
            if(isEqual) {
                expect(childSizes.width).toBe(sizeInPixels) ;
                expect(childSizes.height).toBe(sizeInPixels) ;
            } else {
                expect(childSizes.width).not.toBe(sizeInPixels) ;
                expect(childSizes.height).not.toBe(sizeInPixels) ;
            }
        }
    }

    it("Should make sure that the GridLines can be turned off.", function() {
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(function() {
                    return automation.WebElement.waitForElementToExist(document.body, GRID_LINES_SELECTOR) ;
                })
                .then(function(viewNode) {
                    return automation.Component.waitForComponentReady(viewNode.$logic) ;
                })
                .then(function(gridLines) {
                    gridLines.hideAllGridLines() ;
                    expect(gridLines.areGridLinesTurnedOn()).toBeFalsy() ;
                    return gridLines.$view ;
                })
                .then(function(gridLinesViewNode) {
                    verifyChildrenSizeInDom(gridLinesViewNode, 0, true) ;
                }) ;
        }) ;
    }) ;

    it("Should make sure that the GridLines can be turned on.", function() {
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(function() {
                    return automation.WebElement.waitForElementToExist(document.body, GRID_LINES_SELECTOR) ;
                })
                .then(function(viewNode) {
                    return automation.Component.waitForComponentReady(viewNode.$logic) ;
                })
                .then(function(gridLines) {
                    gridLines.showAllGridLines() ;
                    expect(gridLines.areGridLinesTurnedOn()).toBeTruthy() ;
                    return gridLines.$view ;
                })
                .then(function(gridLinesViewNode) {
                    verifyChildrenSizeInDom(gridLinesViewNode, 0, false) ;
                }) ;
        }) ;
    }) ;
}) ;
