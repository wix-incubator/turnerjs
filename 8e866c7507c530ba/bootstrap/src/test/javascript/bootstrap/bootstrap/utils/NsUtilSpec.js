describe('nsUtil', function () {
    var testObj;
    var value = 'Hello World';

    beforeEach(function () {
        testObj = {};
    });

    afterEach(function () {

    });


    describe('setNameSpace', function () {

        it('should set an object chain as defined in the nsString', function () {
            nsUtil.setNameSpace(testObj, 'a.b.c.d.e.f', value);
            expect(testObj.a.b.c.d.e.f).toBe(value);
        });

    });

    describe('getNameSpace', function () {

        it('should get the value from the namespace', function () {
            nsUtil.setNameSpace(testObj, 'a.b.c.d.e.f', value);
            expect(nsUtil.getNameSpace(testObj, 'a.b.c.d.e.f')).toBe(value);
        });

    });

});
