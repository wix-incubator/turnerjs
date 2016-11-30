describe('ArtifactLocationMap', function () {
    var asyncSpec =  new AsyncSpec(this);
    testRequire().resources('scriptLoader');
    testRequire().resources('BrowserUtils');
    testRequire().resources('ExperimentsList');

    var scriptLoader = null;
    var BrowserUtils = null;
    var ExperimentsList = null;

    var serverTopology = {
        bootstrap: "/bootstrap",
        mock: "../mock",
        'html-test-framework': "/html-test-framework",
        plugins: "../mock/scriptloader",
        other: "other"
    };
    var cachedScriptLocationMap = null;

    beforeEach(function(){
        cachedScriptLocationMap = serviceTopology.scriptsLocationMap;
        serviceTopology.scriptsLocationMap = serverTopology;
        scriptLoader = this.scriptLoader;
        BrowserUtils = this.BrowserUtils;
        ExperimentsList = this.ExperimentsList;

        this.getIndexTopology = getIndexTopology.bind( {
            'scriptLoader' : scriptLoader,
            'BrowserUtils' : BrowserUtils
        } );
    });

    afterEach(function(){
        serviceTopology.scriptsLocationMap = cachedScriptLocationMap;
    });

    it("make sure dependencies exists",function(){
        expect(scriptLoader).toBeDefined();
        expect(BrowserUtils).toBeDefined();
    });

    asyncSpec.it("should not return topology locations with a trailing slash", function(done){
        var fake_state_map = {
            topology : {
                'bootstrap': 'bootstrap/fake/url/with/a/trailing/slash/'
            }
        };
        serviceTopology.scriptsLocationMap = fake_state_map.topology;
        getIndexTopology({debug : false}, {}, function(map){
            expect(map.all.bootstrap.lastIndexOf('/')).not.toBe(map.all.bootstrap.length -1);
            done();
        });
    })

    describe('debug mode', function(){
        asyncSpec.it('should set index.debug.json files when in debug mode', function(done){
            getIndexTopology({debug : true},{}, function(map){
                expect(map.manifestsUrls).toContain("/bootstrap/index.debug.json");
                done();
            });
        });

        asyncSpec.it('should set index.debug.json files for specific artifacts when debugModeArtifacts contains them', function(done){
            getIndexTopology({debug : false, debugModeArtifacts: {bootstrap:true}},{}, function(map){
                expect(map.manifestsUrls).toContain("/bootstrap/index.debug.json");
                done();
            });
        });

        asyncSpec.it('should set index.json files when not in debug mode', function(done){
            getIndexTopology({debug : false}, {}, function(map){
                expect(map.manifestsUrls).toContain("/bootstrap/index.json");
                done();
            });
        });
    });

    describe('converMap', function(){

        asyncSpec.it("should map old artifact names according to the aliases",function(done){
            var artifactDefMap = {
                'aliases' : {
                    'bootstrap' : 'new_bootstrap'
                }
            };
            getIndexTopology({debug : false}, artifactDefMap, function(map){
                expect(map.all['new_bootstrap']).toBe(serverTopology.bootstrap);
                done();
            });
        });

        asyncSpec.it("should not replace name if there is no artifcat in the source name",function(done){
            var artifactDefMap = {
                'aliases' : {
                    'no_such_value_exists' : 'bootstrap'
                }
            };
            getIndexTopology({debug : false}, artifactDefMap, function(map){
                expect(map.all['bootstrap']).toBe(serverTopology.bootstrap);
                done();
            });
        });

        asyncSpec.it("should exclude artifacts according to the exclude array",function(done){
            var artifactDefMap = {
                'exclude' : {
                    'mock': true,
                    'html-test-framework': true
                }
            };
            getIndexTopology({debug : false}, artifactDefMap, function(map){
                expect(map.manifestsUrls).not.toContain('/html-test-framework/index.debug.json');
                expect(map.manifestsUrls).not.toContain('/mock/index.debug.json');
                done();
            });
        });

        asyncSpec.it("should replace the urls according to baseUrl map",function(done){
            var artifactDefMap = {
                'baseUrls' : {
                    'bootstrap' : "hello"
                }
            };
            getIndexTopology({debug : false}, artifactDefMap, function(map){
                expect(map.all.bootstrap).toBe(artifactDefMap.baseUrls.bootstrap);
                done();
            });
        });

        asyncSpec.it("should support empty baseUrl map values",function(done){
            var artifactDefMap = {
                'baseUrls' : {
                    'bootstrap' : ""
                }
            };
            getIndexTopology({debug : false}, artifactDefMap, function(map){
                expect(map.all.bootstrap).toBe(artifactDefMap.baseUrls.bootstrap);
                done();
            });
        });
    });


    describe('filter unopened experiments', function(){
        asyncSpec.it('should not filter anything if main-artifacts are not specified', function(done){
            var fake_state_map = {
                topology : {
                    'bootstrap': 'bootstrap_place/src/main',
                    'example_experiment' : 'example_experiment/src/main'
                },
                experiments : {
                    'experiment_someFakeExp' : 'New'
                }
            };
            serviceTopology.scriptsLocationMap = fake_state_map.topology;
            spyOn(ExperimentsList, 'getExperimentsList').andReturn(fake_state_map.experiments);

            getIndexTopology({debug : false}, {}, function(map){
                expect(map.manifestsUrls).toContain(fake_state_map.topology.example_experiment + "/index.json");
                expect(map.all.example_experiment).toBe(fake_state_map.topology.example_experiment);
                done();
            });
        });

        asyncSpec.it('should keep opened experiments in the topology', function(done){
            var fake_state_map = {
                topology : {
                    'bootstrap': 'bootstrap_place/src/main',
                    'example_experiment' : 'example_experiment/src/main'
                },
                experiments : {
                    'example_experiment' : 'New'
                }
            };
            serviceTopology.scriptsLocationMap = fake_state_map.topology;
            spyOn(ExperimentsList, 'getExperimentsList').andReturn(fake_state_map.experiments);

            getIndexTopology({debug : false}, { 'main-artifacts' : ['bootstrap'] }, function(map){
                expect(map.manifestsUrls).toContain(fake_state_map.topology.bootstrap + "/index.json");
                expect(map.all.bootstrap).toBe(fake_state_map.topology.bootstrap);
                expect(map.manifestsUrls).toContain(fake_state_map.topology.example_experiment + "/index.json");
                expect(map.all.example_experiment).toBe(fake_state_map.topology.example_experiment);
                done();
            });

        });

        asyncSpec.it('should remove unopened experiments from the topology', function(done){
            var fake_state_map = {
                topology : {
                    'bootstrap': 'bootstrap_place/src/main',
                    'example_experiment' : 'example_experiment/src/main'
                },
                experiments : {
                    'another_experiment' : 'New'
                }
            };
            serviceTopology.scriptsLocationMap = fake_state_map.topology;
            spyOn(ExperimentsList, 'getExperimentsList').andReturn(fake_state_map.experiments);

            getIndexTopology({debug : false}, { 'main-artifacts' : ['bootstrap'] }, function(map){
                expect(map.manifestsUrls).toContain(fake_state_map.topology.bootstrap + "/index.json");
                expect(map.all.bootstrap).toBe(fake_state_map.topology.bootstrap);
                expect(map.manifestsUrls).not.toContain(fake_state_map.topology.example_experiment + "/index.json");
                expect(map.all.example_experiment).not.toBeDefined();
                done();
            });
        });
    })
});