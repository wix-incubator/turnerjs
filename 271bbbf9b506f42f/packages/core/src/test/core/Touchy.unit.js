define(['lodash', 'core/core/Touchy'], function(_, Touchy) {
    'use strict';

    describe('Touchy tests', function () {

        var touchEvents;

        var mockTouchEvent = {
            touches: [{pageX: 0, pageY: 0}],
            target: {id: 'mockTarget'}
        };

        var swipeLeft = [-50, 0];
        var swipeRight = [50, 0];
        var swipeUp = [0, -50];
        var swipeDown = [0, 50];

        beforeEach(function() {
            touchEvents = touchEvents || {
                onSwipeLeft: jasmine.createSpy('onSwipeLeft'),
                onSwipeRight: jasmine.createSpy('onSwipeRight'),
                onSwipeUp: jasmine.createSpy('onSwipeUp'),
                onSwipeDown: jasmine.createSpy('onSwipeDown'),
                onTap: jasmine.createSpy('onTap')
            };
            this.touchy = new Touchy();
            this.ref = _.clone(touchEvents);
            this.touchy.registerTouchEvents(this.ref);
            this.mockTouchStartEvent = _.clone(mockTouchEvent);
            this.mockTouchMoveEvent = _.clone(mockTouchEvent);
        });

        it('Should register react touch events', function () {
            expect(this.ref.onTouchStart).toBeDefined();
            expect(this.ref.onTouchMove).toBeDefined();
            expect(this.ref.onTouchEnd).toBeDefined();
        });

        it('Should return correct swipe direction ( for deltaX/deltaY )', function() {
            expect(this.touchy.getSwipeDirection(50, 0)).toEqual('left');
            expect(this.touchy.getSwipeDirection(-50, 0)).toEqual('right');
            expect(this.touchy.getSwipeDirection(0, 50)).toEqual('up');
            expect(this.touchy.getSwipeDirection(0, -50)).toEqual('down');
        });

        it('Should call onSwipeLeft callback', function () {
            spyOn(this.touchy, 'isValidSwipe').and.returnValue(true);
            this.mockTouchMoveEvent.touches = [{pageX: swipeLeft[0], pageY: swipeLeft[1]}];
            this.ref.onTouchStart(this.mockTouchStartEvent);
            this.ref.onTouchMove(this.mockTouchMoveEvent);
            this.ref.onTouchEnd();
            expect(this.ref.onSwipeLeft).toHaveBeenCalledWith(this.touchy.data.evObj);
        });

        it('Should call onSwipeLeft callback', function () {
            spyOn(this.touchy, 'isValidSwipe').and.returnValue(true);
            this.mockTouchMoveEvent.touches = [{pageX: swipeRight[0], pageY: swipeRight[1]}];
            this.ref.onTouchStart(this.mockTouchStartEvent);
            this.ref.onTouchMove(this.mockTouchMoveEvent);
            this.ref.onTouchEnd();
            expect(this.ref.onSwipeRight).toHaveBeenCalledWith(this.touchy.data.evObj);
        });

        it('Should call onSwipeUp callback', function () {
            spyOn(this.touchy, 'isValidSwipe').and.returnValue(true);
            this.mockTouchMoveEvent.touches = [{pageX: swipeUp[0], pageY: swipeUp[1]}];
            this.ref.onTouchStart(this.mockTouchStartEvent);
            this.ref.onTouchMove(this.mockTouchMoveEvent);
            this.ref.onTouchEnd();
            expect(this.ref.onSwipeUp).toHaveBeenCalledWith(this.touchy.data.evObj);
        });

        it('Should call onSwipeDown callback', function () {
            spyOn(this.touchy, 'isValidSwipe').and.returnValue(true);
            this.mockTouchMoveEvent.touches = [{pageX: swipeDown[0], pageY: swipeDown[1]}];
            this.ref.onTouchStart(this.mockTouchStartEvent);
            this.ref.onTouchMove(this.mockTouchMoveEvent);
            this.ref.onTouchEnd();
            expect(this.ref.onSwipeDown).toHaveBeenCalledWith(this.touchy.data.evObj);
        });

        it('Should call onTap callback', function () {
            this.ref.onTouchStart(this.mockTouchStartEvent);
            this.ref.onTouchEnd();
            expect(this.ref.onTap).toHaveBeenCalledWith(this.touchy.data.evObj);
        });

        it('on Pinch swipe should not be called', function () {
            var mockTouchPinchEvent = {
                touches: [{pageX: 0, pageY: 0}, {pageX: 0, pageY: 0}],
                target: {id: 'mockTarget'}
            };
            this.ref.onTouchStart(mockTouchPinchEvent);
            this.ref.onTouchEnd();
            expect(this.ref.onSwipeDown).not.toHaveBeenCalledWith(this.touchy.data.evObj);
            expect(this.ref.onSwipeRight).not.toHaveBeenCalledWith(this.touchy.data.evObj);
            expect(this.ref.onSwipeLeft).not.toHaveBeenCalledWith(this.touchy.data.evObj);
            expect(this.ref.onSwipeUp).not.toHaveBeenCalledWith(this.touchy.data.evObj);
        });
    });
});
