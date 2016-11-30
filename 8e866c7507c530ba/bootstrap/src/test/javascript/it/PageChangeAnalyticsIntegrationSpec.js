function getAllPageIds(){
    if(window.publicModel && window.publicModel.pageList && window.publicModel.pageList.pages){
        return _.map(window.publicModel.pageList.pages, 'pageId');
    } else return [];
}

function getNextPageId(){
    var allPageIds = getAllPageIds(),
        currentPageId = W.Viewer.getCurrentPageId();
    return _.find(allPageIds, function(val){return val !== currentPageId;});
}
describe("Page Change & analytics integration:", function () {

    describe('When changing the page', function () {
        var originalDontSendReports = LOG._dontSendReports;
        beforeEach(function () {
            W.Config.getDebugMode = function () {
                return 'nodebug';
            };
            LOG._dontSendReports = false;
        });

        afterEach(function () {
            LOG._dontSendReports = originalDontSendReports;
        });

        it('a reportPageEvent should be triggered and an event should be sent to analytics', function() {
            spyOn(LOG._analytics, 'sendPageEvent');
            var nextPageId = getNextPageId();
            var ready;
            setTimeout(function(){ready=true;},2000);
            waitsFor(function(){return ready;},'',3000);
            runs(function(){
                W.Viewer.goToPage(nextPageId);
                ready = false;
                setTimeout(function(){ready=true;},2000);
            });
            waitsFor(function(){return ready;},'',3000);
            runs(function(){
                expect(LOG._analytics.sendPageEvent).toHaveBeenCalled();
            });
        });


    });
});
