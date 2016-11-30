define(['lodash', 'react', 'core/fonts/FontRuler', 'reactDOM', 'utils'
], function(_, React, FontRuler, ReactDOM, utils) {
    'use strict';

    describe('FontRuler', function () {

        beforeEach(function() {
            this.loadCallBack = jasmine.createSpy();
            this.fontRuler = React.addons.TestUtils.renderIntoDocument(React.createElement(FontRuler, {
                fontFamily: 'font_a',
                onLoadCallback: this.loadCallBack
            }));
            spyOn(utils.animationFrame, 'request').and.callFake(function (callback) {
                callback();
            });
            spyOn(_, 'defer').and.callFake(function (callback) {
                callback();
            });
        });

        it('should call the provided callback on scroll event if the content node size has changed', function(){
            this.fontRuler.contentNodeOrigSize = {offsetWidth: 10, offsetHeight: 10};
            React.addons.TestUtils.Simulate.scroll(ReactDOM.findDOMNode(this.fontRuler), {});
            expect(this.loadCallBack).toHaveBeenCalled();
        });

        it('should not call the provided callback on scroll event if the content node size has not changed', function(){
            React.addons.TestUtils.Simulate.scroll(ReactDOM.findDOMNode(this.fontRuler), {});
            expect(this.loadCallBack).not.toHaveBeenCalled();
        });
    });
});
