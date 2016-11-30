describeExperiment({'PinterestComponent':'New'}, "HelpersPinterestComponentSpec", function(){

    testRequire()
        .resources('W.Utils');

    describe('getQueryStringAsObject() tests', function(){

        it('should check url and not window.location when url is defined', function(){
            var url = "http://www.example.com?param1=value1",
                queryObject = W.Utils.getQueryStringParamsAsObject(url);

            expect(queryObject.param1).toBeDefined();
        });

        it('should check window.location when url is not defined', function(){
            var queryObject = W.Utils.getQueryStringParamsAsObject();

            expect(queryObject.param1).not.toBeDefined();
        });

        it('should return an object with the params in the given url', function(){
            var url = "http://www.example.com?param1=value1&param2=value2&param3=value3",
                queryObject = W.Utils.getQueryStringParamsAsObject(url);

            expect(queryObject.param1).toBeDefined();
            expect(queryObject.param2).toBeDefined();
            expect(queryObject.param3).toBeDefined();
        });

        it ('should return an object with the values in the given url', function(){
            var url = "http://www.example.com?param1=value1&param2=value2&param3=value3",
                queryObject = W.Utils.getQueryStringParamsAsObject(url);

            expect(queryObject.param1).toBe('value1');
            expect(queryObject.param2).toBe('value2');
            expect(queryObject.param3).toBe('value3');
        });

        it('should not contain parameters not specified in the given url', function(){
            var url = "http://www.example.com?param1=value1&param2=value2&param3=value3",
                queryObject = W.Utils.getQueryStringParamsAsObject(url);

            expect(Object.keys(queryObject).length).toBe(3);
        });
    });
});