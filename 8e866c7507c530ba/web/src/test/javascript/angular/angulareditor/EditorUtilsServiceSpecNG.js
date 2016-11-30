describe('Unit: EditorUtils service', function () {

    var editorUtils;

    beforeEach(module('angularEditor'));

    beforeEach(inject(function(_editorUtils_) {
        editorUtils = _editorUtils_;
    }));

    describe('getPositionRelativeToWindow - ', function() {
        it('should call W.Utils.getPositionRelativeToWindow with the element param', function() {
            spyOn(W.Utils, 'getPositionRelativeToWindow');
            var element = 'mockElement';

            editorUtils.getPositionRelativeToWindow(element);

            expect(W.Utils.getPositionRelativeToWindow).toHaveBeenCalledWith(element);
        });
    });
});