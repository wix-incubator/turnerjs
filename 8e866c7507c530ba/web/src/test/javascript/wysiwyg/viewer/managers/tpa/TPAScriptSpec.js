describeExperiment({'TPAScript': 'New'}, 'TPAScript', function () {

    testRequire().resources('W.TPA', 'W.Classes');

    beforeEach(function () {
        this.W.Classes.getClass('wysiwyg.viewer.managers.tpa.TPAWorkerWrapper', function (TPAWorkerWrapper) {

            this.TPAWorkerWrapper = TPAWorkerWrapper;

        }.bind(this));

        waitsFor(function () {

            return this.TPAWorkerWrapper;
        }, "The Value should be incremented", 750);
    });

    describe('Acceptance Test', function () {
        it('Should call callback function with the same comp id', function () {

            var worker = new this.TPAWorkerWrapper(),
                compId = worker.getCompId();

            spyOn(worker, "_handleWorkerNativeFunctions");

            worker.run(function () {
                console.log('console test');
            });

            waitsFor(function () {
                return worker._handleWorkerNativeFunctions.callCount > 0;
            }, "wait for callback async response", 500);

            runs(function () {
                expect(worker._handleWorkerNativeFunctions).toHaveBeenCalled();

                expect(worker._handleWorkerNativeFunctions.mostRecentCall.args[0].compId).toEqual(compId);

                worker.terminate();
            });
        });
    });


    describe('Worker native functions (alert console)', function () {

        it('Should call console log', function () {

            worker = new this.TPAWorkerWrapper();

            spyOn(worker, "_handleWorkerNativeFunctions");

            worker.run(function () {
                console.log('console test');
            });

            waitsFor(function () {
                return worker._handleWorkerNativeFunctions.callCount > 0;
            }, "wait for callback async response", 500);

            runs(function () {
                expect(worker._handleWorkerNativeFunctions).toHaveBeenCalled();

                expect(worker._handleWorkerNativeFunctions.mostRecentCall.args[0].func).toEqual('console');

                expect(worker._handleWorkerNativeFunctions.mostRecentCall.args[0].message).toEqual('console test');

                worker.terminate();
            });
        });

        it('Should call alert', function () {

            var worker = new this.TPAWorkerWrapper();

            spyOn(worker, "_handleWorkerNativeFunctions");

            worker.run(function () {
                alert('alert test');
            });

            waitsFor(function () {
                return worker._handleWorkerNativeFunctions.callCount > 0;
            }, "wait for callback async response", 500);

            runs(function () {
                expect(worker._handleWorkerNativeFunctions).toHaveBeenCalled();

                expect(worker._handleWorkerNativeFunctions.mostRecentCall.args[0].func).toEqual('alert');

                expect(worker._handleWorkerNativeFunctions.mostRecentCall.args[0].message).toEqual('alert test');

                worker.terminate();
            });
        });
    });

    describe('Worker TPA SDK function', function () {
        it('Should call SDK getSitePages', function () {
            var worker = new this.TPAWorkerWrapper();

            spyOn(worker, "_handleTPAScript");

            worker.run(function () {
                Wix.getSitePages(function (pages) {

                });
            });

            waitsFor(function () {
                return worker._handleTPAScript.callCount > 0;
            }, "wait for callback async response", 500);

            runs(function () {
                expect(worker._handleTPAScript).toHaveBeenCalled();

                expect(worker._handleTPAScript.mostRecentCall.args[0].compId).toBeDefined();

                expect(worker._handleTPAScript.mostRecentCall.args[0].type).toEqual(this.W.TPA.MessageTypes.GET_SITE_PAGES);

                worker.terminate();
            });
        });

        it('Should call Worker getSitePages callback from TPA Manager', function () {
            var worker = new this.TPAWorkerWrapper(),
                TPAManagerCallbackMessage = "TPAManager callback message";

            spyOn(worker, "_handleTPAScript");
            spyOn(worker, "_handleWorkerNativeFunctions");

            worker.run(function () {
                Wix.getSitePages(function (pages) {
                    console.log(pages);
                });
            });

            waitsFor(function () {
                return worker._handleTPAScript.callCount > 0;
            }, "wait for callback async response", 500);

            runs(function () {

                var context = worker.getCallerContext();
                //simulate TPA manager callback
                context.sendToCaller({
                    callId: 1,
                    msg: this.W.TPA.MessageTypes.GET_SITE_PAGES
                }, TPAManagerCallbackMessage);

                expect(worker._handleTPAScript).toHaveBeenCalled();

            });

            waitsFor(function () {
                return worker._handleWorkerNativeFunctions.callCount > 0;
            }, "wait for callback async response", 500);

            runs(function () {
                expect(worker._handleWorkerNativeFunctions).toHaveBeenCalled();

                expect(worker._handleWorkerNativeFunctions.mostRecentCall.args[0].compId).toBeDefined();

                expect(worker._handleWorkerNativeFunctions.mostRecentCall.args[0].func).toEqual('console');

                expect(worker._handleWorkerNativeFunctions.mostRecentCall.args[0].message).toEqual(TPAManagerCallbackMessage);

                worker.terminate();
            });
        });
    });


    describe('Iframe TPA SDK function', function () {
        it('Should call SDK getSitePages', function () {

            var worker = new this.TPAWorkerWrapper(true);

            spyOn(worker, "_handleTPAScript");

            worker.run(function () {
                Wix.getSitePages(function (pages) {

                });
            });

            waitsFor(function () {
                return worker._handleTPAScript.callCount > 0;
            }, "wait for callback async response", 500);

            runs(function () {
                expect(worker._handleTPAScript).toHaveBeenCalled();

                expect(worker._handleTPAScript.mostRecentCall.args[0].compId).toBeDefined();

                expect(worker._handleTPAScript.mostRecentCall.args[0].type).toEqual(this.W.TPA.MessageTypes.GET_SITE_PAGES);

                worker.terminate();
            });

        });

        it('Should call Iframe getSitePages callback from TPA Manager', function () {
            var worker = new this.TPAWorkerWrapper(true),
                TPAManagerCallbackMessage = "TPAManager callback message",
                compId = worker.getCompId();

            spyOn(worker, "_handleTPAScript");

            worker.run(function () {
                Wix.getSitePages(function (pages) {
                    Wix.navigateToPage('pageid');
                });
            });

            waitsFor(function () {
                return worker._handleTPAScript.callCount > 0;
            }, "wait for callback async response", 500);

            runs(function () {

                var context = worker.getCallerContext();
                //simulate TPA manager callback
                context.sendToCaller({
                    callId: 1,
                    msg: this.W.TPA.MessageTypes.GET_SITE_PAGES
                }, TPAManagerCallbackMessage);

                expect(worker._handleTPAScript).toHaveBeenCalled();
            });

            waitsFor(function () {
                return worker._handleTPAScript.callCount > 1;
            }, "wait for callback async response navigate to page", 500);

            runs(function () {
                expect(worker._handleTPAScript).toHaveBeenCalled();

                expect(worker._handleTPAScript.mostRecentCall.args[0].compId).toBeDefined();

                expect(worker._handleTPAScript.mostRecentCall.args[0].type).toEqual(this.W.TPA.MessageTypes.NAVIGATE_TO_PAGE);

                expect(worker._handleTPAScript.mostRecentCall.args[0].data.pageId).toEqual('pageid');

                expect(worker._handleTPAScript.mostRecentCall.args[0].compId).toEqual(compId);

                worker.terminate();
            });
        });

        it('Should terminate worker and remove iframe', function () {

            var worker = new this.TPAWorkerWrapper(true),
                compId = worker.getCompId();


            worker.run(function () {

            });

            expect(document.getElementById(compId)).toBeDefined();

            worker.terminate();

            expect(document.getElementById(compId)).toBeNull();
        });

    });


});

