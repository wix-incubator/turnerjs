define(['testUtils', 'lodash', 'components/components/itunesButton/itunesButton'],
    function (/** testUtils */ testUtils, _, itunesButton) {
    'use strict';


    describe('itunesButton component', function () {
        beforeEach(function(){
            this.props = testUtils.mockFactory.mockProps().setCompData({
                downloadUrl: ""
            }).setCompProp({
                language: 'en',
                openIn: '_blank'
            });

            var comp = _.clone(itunesButton);
            comp.props = this.props;
            this.itunesButtonComp = comp;
        });
        describe('English language was chosen', function(){
            it('should create the correct english image url', function () {
                var refData = this.itunesButtonComp.getSkinProperties();

                expect(refData.itunesImg.src).toEqual('/static/images/itunesButton/iTunesBtn_EN.svg');
            });
        });
        describe('No link url was set', function(){
            it('should create anchor without href', function(){
                var refData = this.itunesButtonComp.getSkinProperties();

                expect(refData.downloadButton.href).toBeUndefined();
            });
        });
        describe('Link url was set', function(){
            it("should set anchor href to be 'mockUrl'", function(){
                this.props.compData.downloadUrl = "mockUrl";

                var refData = this.itunesButtonComp.getSkinProperties();

                expect(refData.downloadButton.href).toEqual("mockUrl");
            });
        });
    });
});
