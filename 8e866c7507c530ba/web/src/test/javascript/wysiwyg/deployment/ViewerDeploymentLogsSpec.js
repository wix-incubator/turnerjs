describe("ViewerDeploymentLogs", function(){
    beforeEach(function(){
        this.logMethodsObj = define.getBootstrapClass('deployment.ViewerDeploymentLogs');
    });

    var baseStepsArray = [{'pageId': 'page1', 'type': 'type1', 'time': '1'},{'pageId': 'page1', 'type': 'type2', 'time': '2'}, {'pageId': 'page2', 'type': 'type1', 'time': '3'}];

    var baseResult = {
        'page1': {
            'steps': {'type1': '1', 'type2': '2'},
            'time': '2',
            'step': 'type2'
        },
        'page2': {
            'steps': {'type1': '3'},
            'time': '3',
            'step': 'type1'
        }
    };

   describe("getPagesReportForBI340", function(){
        it("should return a map between page id and it's steps and the start time of page load", function(){
            var res = this.logMethodsObj.getPagesReportForBI340(baseStepsArray);

            expect(res.startTime).toBe(-1);

            expect(res.pagesReport).toBeEquivalentTo(baseResult);
        });
       it("should set the start time of a page to the time of 'start loading page data' step", function(){
           var pagesLog = _.cloneDeep(baseStepsArray);
           pagesLog.push({'pageId': 'page1', 'type': 'startData', 'time': '1'});

           var res = this.logMethodsObj.getPagesReportForBI340(pagesLog);

           expect(res.startTime).toBe('1');
       });

       it("should write the first error found on the page and not to write next steps for this page", function(){
           var pagesLog = _.cloneDeep(baseStepsArray);
           pagesLog[0].errorDesc = 'error1';
           pagesLog[1].errorDesc = 'error2';
           pagesLog[2].errorDesc = 'error3';


           var expectedResult = _.cloneDeep(baseResult);
           expectedResult.page1.error = 'error1';
           expectedResult.page1.time = '1';
           expectedResult.page1.step = 'type1';
           delete expectedResult.page1.steps.type2;
           expectedResult.page2.error = 'error3';

           var res = this.logMethodsObj.getPagesReportForBI340(pagesLog);

           expect(res.pagesReport).toBeEquivalentTo(expectedResult);
       });
       it("should not allow double steps for a page, taking only the first", function(){
           var pagesLog = _.cloneDeep(baseStepsArray);
           pagesLog.push({'pageId': 'page1', 'type': 'type1', 'time': '10'});
           pagesLog.push({'pageId': 'page2', 'type': 'type1', 'time': '11'});

           var res = this.logMethodsObj.getPagesReportForBI340(pagesLog);

           expect(res.pagesReport).toBeEquivalentTo(baseResult);
       });
   });
});