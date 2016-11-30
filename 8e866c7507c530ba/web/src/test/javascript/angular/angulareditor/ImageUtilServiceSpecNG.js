describe('Unit: ImageUtils service', function () {

    var imageUtils;

    function MockImageUrlNew() {
    }

    MockImageUrlNew.prototype._getUrlForPyramid = function() {
    };

    beforeEach(module('angularEditor'));

    beforeEach(function() {
        spyOn(W.Classes, 'getClass').and.callFake(function(className, cb) {
            cb(MockImageUrlNew);
        });

        spyOn(MockImageUrlNew.prototype, '_getUrlForPyramid').and.returnValue('someValue');
    });

    beforeEach(inject(function(_imageUtils_) {
        imageUtils = _imageUtils_;
    }));

    describe('General functionality', function() {
        it('should call imageUrlNew\'s _getUrlForPyramid method when getUrlForPyramid is called', function() {
            var actualValue = imageUtils.getUrlForPyramid('someParam');

            expect(actualValue).toEqual('someValue');
        });
    });
});