describe('Log Messages', function() {

    describe('errors', function(){
        it('should have an error code', function(){
            var errorCode;

            for(var item in wixErrors) {
                errorCode = wixErrors[item]['errorCode'];

                expect(typeof(errorCode)).toBe('number');
            }
        });

        it('should have a unique error code', function(){
            var knownErrorCodes = {};
            var errorCode;

            for(var item in wixErrors) {
                errorCode = wixErrors[item]['errorCode'];

                expect(knownErrorCodes[errorCode], 'checking error code: ' + errorCode).toBeUndefined();

                knownErrorCodes[errorCode] = 'X';
            }
        });

        it('should have description, type, category, issue and severity', function(){
            var err;

            for(var item in wixErrors) {
                err = wixErrors[item];

                //ignores events starting with 'TPA_RESERVED_ERROR', which are defined in TPALogMessages.js and don't have these params in this file.
                if (item.substring(0, 18) != 'TPA_RESERVED_ERROR') {

                    expect(typeof(err.desc)).toBe('string');
                    expect(err.desc.length).toBeGreaterThan(0);

                    expect(typeof(err.type)).toBe('number');
                    expect(typeof(err.category)).toBe('number');
                    expect(typeof(err.issue)).toBe('number');
                    expect(typeof(err.severity)).toBe('number');

                }
            }
        });
    });

    describe('events', function(){
        it('should have biEventId', function(){
            var event;

            for(var item in wixEvents) {
                event = wixEvents[item];

                expect(typeof(event.biEventId)).toBe('number');
            }
        });

        it('should have description', function(){
            var event;

            for(var item in wixEvents) {
                event = wixEvents[item];

                expect(typeof(event.desc)).toBe('string');
                expect(event.desc.length).toBeGreaterThan(0);
            }
        });

        it('should have unique pair of ID and Adapter', function(){
            var knownEventIDs = {};
            var eventId;
            var adapter;
            var adapterOfSameID;
            var alreadyExists;
            var existingAdapter;

            for(var item in wixEvents) {
                eventId = wixEvents[item]['biEventId'];
                alreadyExists = knownEventIDs[eventId];
                existingAdapter = wixEvents[item]['biAdapter']
                adapter = existingAdapter ? existingAdapter : 0;

                if (alreadyExists) {
                    adapterOfSameID = wixEvents[alreadyExists]['biAdapter'];

                    var temp = adapter === adapterOfSameID;
                    expect(temp).toBeFalsy();
                }
                knownEventIDs[eventId] = item;
            }
        });
    });
});