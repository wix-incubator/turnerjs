resource.getResources(['mode', 'debugModeArtifacts', 'scriptLoader'], function(res){

    window.getIndexTopology.call(res, { debug : res.mode.debug, debugModeArtifacts: res.debugModeArtifacts },
        {
            aliases: {
                'web' : 'wysiwyg'
            },
            exclude: {
                'langs' : true,
                'mock' : true,
                'sitemembers' : true,
                'ecommerce' : W.isExperimentOpen('EcomArtifactDeploy') ? undefined : true,
                'automation' : W.isExperimentOpen('it') ? undefined : true,
                'cloud-editor-integration' : W.isExperimentOpen('WixCode') ? undefined : true,
                'editormenu' : true
            },
            baseUrls: {
                'external_apis' : ''
            },

            'main-artifacts' : [
                "ck-editor",
                "bootstrap",
                "sitemembers",
                "ecommerce",
                "langs",
                "wixapps",
                "core",
                "tpa",
                "skins",
                "wysiwyg",
                "cloud-editor-integration",
                "html-test-framework", //this is a temporary fix for the tests, which shouldn't affect production. UriD
                'mock',  //to allow mock skins in tests specs (EitanR)
                'automation'
            ]
        },
        function (ArtifactLocationMap) {
            define.resource('topology', ArtifactLocationMap.all);
            if(res.mode.test && typeof getTestManifestFromTheSpecRunner === 'function'){
                ArtifactLocationMap.manifestsUrls.unshift(getTestManifestFromTheSpecRunner());
            }
            define.resource('manifestsUrls', ArtifactLocationMap.manifestsUrls);

            res.scriptLoader.loadAllIndexes(ArtifactLocationMap.manifestsUrls, function () {
                define.resource('deployment', define.createBootstrapClassInstance('bootstrap.bootstrap.deploy.Deploy').init(window));
            });

        });
});
