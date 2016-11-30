describe('Unit: WixImports Service', function() {

    var wixImports;

    beforeEach(module('editorInterop'));

    beforeEach(inject(function(_wixImports_) {
        wixImports = _wixImports_;
    }));

    describe('Calling importClass', function() {
        it('Should call getClass on W.Classes with the class name', function() {
            var className = 'someClass';
            spyOn(W.Classes, 'getClass');

            wixImports.importClass(className);

            expect(W.Classes.getClass).toHaveBeenCalledWith(className);
        });
    });
});