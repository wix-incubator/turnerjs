describe("Viewer Mobile Env Check:", function () {
    beforeEach(function () {
        this._mobileConfig = W.Config.mobileConfig;
    });
    describe("Checking if running on real iPhone or on chrome simulation", function () {

        describe("test get screen width", function(){
            it("should return a number under 600 in iphone", function(){
                var screenWidth = this._mobileConfig._getScreenWidth();
                var isMobile = false;
                if (/iphone/i.test(navigator.userAgent.toLowerCase())){
                    isMobile = screenWidth < 600
                }else{
                    //not mobile device
                    isMobile = true;
                }
                expect(isMobile).toBeTruthy();
            });

            it("should return a number under 600 in android", function(){
                var screenWidth = this._mobileConfig._getScreenWidth();
                var isMobile = false;
                if (/android/i.test(navigator.userAgent.toLowerCase())){
                    isMobile = screenWidth < 600
                }else{
                    //not mobile device
                    isMobile = true;
                }
                expect(isMobile).toBeTruthy();
            });
        });

    });
});