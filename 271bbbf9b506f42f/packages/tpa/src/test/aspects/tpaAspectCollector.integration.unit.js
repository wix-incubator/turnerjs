define([
        'core',
        'tpa/aspects/tpaAspectCollector',
        'tpa/aspects/TPAWorkerAspect',
        'tpa/aspects/TPAPostMessageAspect',
        'tpa/aspects/TPAPopupAspect',
        'tpa/aspects/TPAModalAspect',
        'tpa/aspects/TPAPubSubAspect',
        'tpa/aspects/TPAPixelTrackerAspect'
    ],
    function(
        core,
        tpaAspectCollector,
        TPAWorkerAspect,
        TPAPostMessageAspect,
        TPAPopupAspect,
        TPAModalAspect,
        TPAPubSubAspect,
        TPAPixelTrackerAspect
    ) {
        'use strict';
        describe('tpaAspectCollector', function() {
            it('should register all the aspects', function() {

                function expectAspect(name, ctorFunc) {
                    var registry = core.siteAspectsRegistry;
                    var aspect = registry.getSiteAspectConstructor(name);
                    expect(aspect).toBe(ctorFunc);
                }

                expectAspect('tpaWorkerAspect', TPAWorkerAspect);
                expectAspect('tpaPostMessageAspect', TPAPostMessageAspect);
                expectAspect('tpaPopupAspect', TPAPopupAspect);
                expectAspect('tpaModalAspect', TPAModalAspect);
                expectAspect('tpaPubSubAspect', TPAPubSubAspect);
                expectAspect('tpaPixelTrackerAspect', TPAPixelTrackerAspect);
            });
        });

    }
);