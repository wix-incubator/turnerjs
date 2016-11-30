define(['wixCodeInit/utils/messageHolder'], function(messageHolder) {
    'use strict';

    describe('messageHolder', function() {

        it('should forward messages to a connected target', function() {
            var msgTarget = jasmine.createSpy('msgTarget');
            var msgHolder = messageHolder.get();
            msgHolder.setMessageTarget(msgTarget);

            msgHolder.sendOrHoldMessage('first message');
            expect(msgTarget).toHaveBeenCalledWith('first message');

            msgHolder.sendOrHoldMessage({test: 'second message'});
            expect(msgTarget).toHaveBeenCalledWith({test: 'second message'});
        });

        it('should hold all messages and send them once a target is connected', function() {
            var msgTarget = jasmine.createSpy('msgTarget');
            var msgHolder = messageHolder.get();

            msgHolder.sendOrHoldMessage('first message');
            msgHolder.sendOrHoldMessage({test: 'second message'});

            msgHolder.setMessageTarget(msgTarget);

            expect(msgTarget.calls.count()).toEqual(2);
            expect(msgTarget.calls.argsFor(0)).toEqual(['first message']);
            expect(msgTarget.calls.argsFor(1)).toEqual([{test: 'second message'}]);
        });

    });
});
