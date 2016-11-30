describe('Unit: EditorResourcesService', function () {

    var editorResources;

    beforeEach(module('angularEditor'));

    describe('debugModeGeneral functionality', function() {
        beforeEach(inject(function(_editorResources_) {
            editorResources = _editorResources_;
        }));

        describe('translate', function() {
            var key = 'someKey';
            var bundle = 'someBundle';
            var fallback = 'someFallback';

            beforeEach(function() {
                spyOn(W.Resources, 'get');
            });

            it('should call get on W.Resources with the key, bundle name and fallback', function() {
                editorResources.translate(key, bundle, fallback);

                expect(W.Resources.get).toHaveBeenCalledWith(bundle, key, fallback);
            });

            it('should default to "EDITOR_LANGUAGE" when no bundle is provided', function() {
                editorResources.translate(key, null, fallback);

                expect(W.Resources.get).toHaveBeenCalledWith('EDITOR_LANGUAGE', key, fallback);
            });
        });

        describe('getMediaStaticUrl', function() {
            it('should call getMediaStaticUrl on W.Config', function() {
                spyOn(W.Config, 'getMediaStaticUrl');

                editorResources.getMediaStaticUrl();

                expect(W.Config.getMediaStaticUrl).toHaveBeenCalled();
            });
        });
    });


    // Editor resource mocks
    var mode = {
        debug: false
    };
    var debugModeArtifacts = {
        wysiwyg: false,
        web: false
    };
    window.resource = {
        getResources: function(arrRes, callback) {
            callback({
                mode: mode,
                debugModeArtifacts: debugModeArtifacts
            });
        }
    };

    describe('getAngularPartialPath', function() {
        describe('without debug mode', function() {
            it('should return "angular/somepath.html" partial path', inject(function(editorResources) {
                var partialUrl = "somePath.html";
                var expectedPath = ('angular/' + partialUrl).toLowerCase();

                var actualPath = editorResources.getAngularPartialPath(partialUrl).toString();

                expect(expectedPath).toEqual(actualPath);
            }));
        });

        describe('in debug mode, running locally', function() {
            var oldWysiwyg;
            beforeEach(function() {
                mode.debug = true;
                oldWysiwyg = W.Resources.resources.topology.wysiwyg;
                W.Resources.resources.topology.wysiwyg = 'http://localhost/web';
            });

            it('should return a topology based partial', inject(function(editorResources) {
                var partialUrl = "somePath.html";
                var expectedPath = (W.Resources.resources.topology.wysiwyg + '/javascript/angular/' + partialUrl).toLowerCase();

                var actualPath = editorResources.getAngularPartialPath(partialUrl).toString();

                expect(actualPath).toEqual(expectedPath);
            }));

            afterEach(function() {
                mode.debug = false;
                W.Resources.resources.topology.wysiwyg = oldWysiwyg;
            });
        });
    });
});