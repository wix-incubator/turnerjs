describe("ExperimentsList", function () {
    var asyncSpec = new AsyncSpec(this);
    testRequire().resources('ExperimentsList');
    testRequire().resources('BrowserUtils');


    var EDITOR_EXP = { "editor_exp": "New", "foo": "bar1"};
    var RENDERER_EXP = { "renderer_exp": "New", "foo": "bar2"};
    var QUERY_EXP = { "query_exp": "New", "foo": "bar3"};

    beforeEach(function () {
        spyOn(this.ExperimentsList, '_getEditorExperiments').andReturn(EDITOR_EXP);
        spyOn(this.ExperimentsList, '_getRendererExperiments').andReturn(RENDERER_EXP);
    });

    describe("when getting experiments from the queryString", function () {
        it("should parse the data correctly", function () {
            spyOn(this.BrowserUtils, 'getQueryParams').andReturn({
                'experiment': ["myexp:new", "myotherexp:new"]
            });
            var data = this.ExperimentsList._getExperimentsFromQuery();
            expect(data).toBeEquivalentTo({myexp: 'new', myotherexp: 'new'});
        });

        it("should have a default group 'new'", function () {
            spyOn(this.BrowserUtils, 'getQueryParams').andReturn({
                'experiment': ["myexp", "myotherexp"]
            });
            var data = this.ExperimentsList._getExperimentsFromQuery();
            expect(data).toBeEquivalentTo({myexp: 'new', myotherexp: 'new'});
        });

        it("should parse the data to lower case", function () {
            spyOn(this.BrowserUtils, 'getQueryParams').andReturn({
                'experiment': ["myExp:NEW", "myOtherExp:NEW"]
            });
            var data = this.ExperimentsList._getExperimentsFromQuery();
            expect(data).toBeEquivalentTo({myexp: 'new', myotherexp: 'new'});
        });
    });

    xdescribe("get experiments from model (editor or renderer)", function () {

        it("should use editorModel experiments if in editor", function () {
            spyOn(this.ExperimentsList, '_isInEditor').andReturn(true);
            spyOn(this.ExperimentsList, '_getExperimentsFromQuery').andReturn({});
            var experiments = this.ExperimentsList.getExperimentsList();
            expect(experiments).toBeEquivalentTo(EDITOR_EXP);
        });

        it("should use rendererModel experiments if not in editor", function () {
            spyOn(this.ExperimentsList, '_isInEditor').andReturn(false);
            spyOn(this.ExperimentsList, '_getExperimentsFromQuery').andReturn({});
            var experiments = this.ExperimentsList.getExperimentsList();
            expect(experiments).toBeEquivalentTo(RENDERER_EXP);
        });
    });

    describe("if experiments are present in the query parameters", function () {

        it("should append experiments from query to model", function () {
            spyOn(this.ExperimentsList, '_isInEditor').andReturn(true);
            spyOn(this.ExperimentsList, '_getExperimentsFromQuery').andReturn(QUERY_EXP);

            var experiments = this.ExperimentsList.getExperimentsList();
            expect(experiments).toBeEquivalentTo(Object.append({}, EDITOR_EXP, QUERY_EXP));
        });

        it("should favor experiments from the query string", function () {
            spyOn(this.ExperimentsList, '_isInEditor').andReturn(true);
            spyOn(this.ExperimentsList, '_getExperimentsFromQuery').andReturn(QUERY_EXP);

            var experiments = this.ExperimentsList.getExperimentsList();
            expect(experiments.foo).toBe(QUERY_EXP.foo);
        });
    });



    describe("isExperimentMerged Tests", function () {
        beforeEach(function () {
            delete this.ExperimentsList._lowerCaseExperimentsObject;
            var that = this;
            this.mockMergedExperimentsResource = { value: {} };
            spyOn(define, 'getDefinition').andCallFake(function () {
                return that.mockMergedExperimentsResource;
            });
        });

        /**
         * @deprecated
         */
        it("should return false if the experiment is NOT in the list", function () {
            var mergedExperimentName = 'dummy_name';

            var isMerged = this.ExperimentsList.isExperimentMerged('web', mergedExperimentName);

            expect(isMerged).toBe(false);
        });

        /**
         * @deprecated
         */
        it("should return true if the experiment is in the list", function () {
            var mergedExperimentName = 'dummyName';
            this.mockMergedExperimentsResource.value[mergedExperimentName] = true;

            var isMerged = this.ExperimentsList.isExperimentMerged('web', 'dummyname');

            expect(isMerged).toBe(true);
        });
    });


    describe('getMergedExperimentResource', function () {
        it('should return an empty object in case getDefinition returns falsy', function () {
            var actualResult;
            spyOn(define, 'getDefinition').andReturn(undefined);

            actualResult = this.ExperimentsList.getMergedExperimentResource('mockArtifactName');

            expect(actualResult).toEqual({});
        });
    });

    describe('getArtifactName', function () {
        it('should return "core" when resource name starts with "core" or "mobile.core"', function () {
            expect(this.ExperimentsList.getArtifactName('core.some.mock.name')).toBe('core');
            expect(this.ExperimentsList.getArtifactName('mobile.core.some.mock.name')).toBe('core');
        });

        it('should return "bootstrap" if the resource name starts with "bootstrap."', function () {
            expect(this.ExperimentsList.getArtifactName('bootstrap.some.mock.name')).toBe('bootstrap');
        });

        it('should return "wixapps" if the resource name starts with "wixapps."', function () {
            expect(this.ExperimentsList.getArtifactName('wixapps.some.mock.name')).toBe('wixapps');
        });

        it('should return "ecommerce" if the resource name starts with "ecommerce."', function () {
            expect(this.ExperimentsList.getArtifactName('ecommerce.some.mock.name')).toBe('ecommerce');
        });

        it('should return "skins" if the resource name starts with "skins."', function () {
            expect(this.ExperimentsList.getArtifactName('skins.some.mock.name')).toBe('skins');
        });

        it('should return "web" if the resource name doesnt start with one of the following: "core/mobile.core, bootstrap, wixapps, ecommerce, skins"', function () {
            expect(this.ExperimentsList.getArtifactName('some.other.mock.name')).toBe('web');
        });

    });

    describe('getExperimentName', function () {
        it('should get the experiment name if the resource ends with "new"', function () {
            expect(this.ExperimentsList.getExperimentName('wixapps.mock.some.ExperimentName.new')).toBe('experimentname');
            expect(this.ExperimentsList.getExperimentName('wixapps.mock.some.ExperimentName.New')).toBe('experimentname');
        });

        it('should get the experiment name if the resource does not end with "new"', function () {
            expect(this.ExperimentsList.getExperimentName('mockName.ExperimentName')).toBe('experimentname');
        });

        it('should always return lowercase names', function () {
            expect(this.ExperimentsList.getExperimentName('mockName.ExperimentName')).toBe('experimentname');
        });
    });

    describe('isMergedExperimentResource', function () {
        it('should return true when an experiment is specified as merged in the mergedExperiments resource', function () {
            spyOn(this.ExperimentsList, 'getArtifactName').andCallFake(function () {
            });
            spyOn(this.ExperimentsList, 'getExperimentName').andCallFake(function () {
                return 'mockmergedexperimentname';
            });
            spyOn(this.ExperimentsList, 'getMergedExperimentResource').andCallFake(function () {
                return {
                    mockmergedexperimentname: true
                };
            });

            expect(this.ExperimentsList.isMergedExperimentResource()).toBe(true);
        });

        it('should return false when an experiment is not specified as merged in the mergedExperiments resource', function () {
            spyOn(this.ExperimentsList, 'getArtifactName').andCallFake(function () {
            });
            spyOn(this.ExperimentsList, 'getExperimentName').andCallFake(function () {
                return 'mockSomeNotMergedExperimentName';
            });
            spyOn(this.ExperimentsList, 'getMergedExperimentResource').andCallFake(function () {
                return {};
            });

            expect(this.ExperimentsList.isMergedExperimentResource()).toBe(false);
        });
    });
});