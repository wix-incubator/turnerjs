define(['testUtils', 'core/core/siteAspectsRegistry'],
    function (testUtils, siteAspectsRegistry) {
    'use strict';

    describe('svSessionChangeEventAspect', function () {
        var factory = testUtils.mockFactory;

        function createComponent(id) {
            this.components[id] = {
                props: {
                    id: id
                },
                sendPostMessage: jasmine.createSpy('sendPostMessage')
            };
            return this.components[id];
        }

        var sessionChangeAspect;

        beforeEach(function () {
            this.components = {};

            var SvSessionChangeEventAspec = siteAspectsRegistry.getSiteAspectConstructor('svSessionChangeEvent');

            var siteData = factory.mockSiteData();
            siteData.svSession = '123';
            var aspectSiteApi = factory.mockSiteAspectSiteAPI(siteData);
            sessionChangeAspect = new SvSessionChangeEventAspec(aspectSiteApi);
        });

        it("should notify registered components about session change", function(){
            var comp = createComponent.call(this, 'comp');
            var comp2 = createComponent.call(this, 'comp2');
            sessionChangeAspect.registerToSessionChanged(comp);
            sessionChangeAspect.registerToSessionChanged(comp2);

            sessionChangeAspect.notifySessionChanged('abc');

            expect(comp.sendPostMessage).toHaveBeenCalledWith({
                intent: 'addEventListener',
                eventType: 'SESSION_CHANGED',
                params: {
                    userSession: 'abc'
                }
            });
            expect(comp2.sendPostMessage).toHaveBeenCalled();
        });

        it("should not notify component if it was unregistered", function(){
            var comp = createComponent.call(this, 'comp');
            sessionChangeAspect.registerToSessionChanged(comp);
            sessionChangeAspect.unRegisterToSessionChanged(comp);

            sessionChangeAspect.notifySessionChanged();

            expect(comp.sendPostMessage).not.toHaveBeenCalled();
        });




    });
});
