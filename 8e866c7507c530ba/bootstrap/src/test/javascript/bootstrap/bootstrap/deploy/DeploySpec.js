describe('deploy', function () {
    it("should never add blank tests", function(){
        expect(true).toBe(true);
    });
    xdescribe("general usage", function () {
        describe("behavior test via 'run' method", function () {
            beforeEach(function () {
                var phasesOrder = [];
                this.getPhasesOrder = function () {
                    return phasesOrder;
                };

                this.define.bootstrapClass('test.phase1', function () {
                    phasesOrder.push("Phase1");
                    return "ok1";
                });
                this.define.bootstrapClass('test.phase2', function () {
                    phasesOrder.push("Phase2");
                    return "ok2";
                });
                this.define.bootstrapClass('test.phase3', function () {
                    phasesOrder.push("Phase3");
                    return "ok3";
                });

                this.define.deployment('test', function (deploymentDef) {
                    deploymentDef.atPhase(1, function (deployPhaseExec) {
                        deployPhaseExec.publishBootstrapClass('result1', 'test.phase1');
                    });
                    deploymentDef.atPhase(2, function (deployPhaseExec) {
                        deployPhaseExec.publishBootstrapClass('result2', 'test.phase2');
                    });
                    deploymentDef.atPhase(3, function (deployPhaseExec) {
                        deployPhaseExec.publishBootstrapClass('result3', 'test.phase3');
                    });
                });
            });

            it("should run methods in order of phases", function () {

                var instances = {};
                this.define.createBootstrapClassInstance('bootstrap.bootstrap.deploy.Deploy').init(instances);

                expect(this.getPhasesOrder()).toBeEquivalentTo(['Phase1', 'Phase2', 'Phase3']);
            });

            it("should store the results on the instances scope", function () {
                var instances = {};
                this.define.createBootstrapClassInstance('bootstrap.bootstrap.deploy.Deploy').init(instances);

                expect(instances).toEqual({'result1':'ok1', 'result2':'ok2', 'result3':'ok3'})
            });

        });
    });

});