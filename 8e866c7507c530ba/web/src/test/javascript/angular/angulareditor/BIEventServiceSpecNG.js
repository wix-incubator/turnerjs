describe('Unit: BIEventsService', function () {

    var biEvent;

    beforeEach(module('angularEditor'));

    beforeEach(inject(function(_biEvent_) {
        biEvent = _biEvent_;
    }));


    describe('Event reporting - ', function() {
        it('should call window.LOG.reportEvent with the eventName and args', function() {
            spyOn(window.LOG, 'reportEvent');
            var eventName = 'someEvent',
                args = {
                    a: 1,
                    b: 2
                };

            biEvent.reportEvent(eventName, args);

            expect(window.LOG.reportEvent).toHaveBeenCalledWith(eventName, args);
        });
    });

    describe('Error reporting - ', function() {
        it('should call window.LOG.reportError with the error details', function() {
            spyOn(window.LOG, 'reportError');
            var errorName = 'someError',
                className = 'someClass',
                methodName = 'someMethod',
                args = {
                    a: 1,
                    b: 2
                };

            biEvent.reportError(errorName, className, methodName, args);

            expect(window.LOG.reportError).toHaveBeenCalledWith(errorName, className, methodName, args);
        });
    });
});