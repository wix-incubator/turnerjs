describe('Unit: LinkRendererService', function () {

    var linkRenderer;

    function MockLinkRendererClass() {
    }

    MockLinkRendererClass.prototype.renderLinkDataItemForPropertyPanel = function() {
    };

    var MockWixImportsService = function() {
        return {
            importClass: function() {
                return MockLinkRendererClass;
            }
        };
    };

    beforeEach(module('angularEditor'));
    beforeEach(module(function($provide) {
        $provide.factory('wixImports', MockWixImportsService);
    }));

    beforeEach(inject(function(_linkRenderer_) {
        linkRenderer = _linkRenderer_;
    }));

    describe('renderLinkForPropertyPanel', function() {
        it('should get the data item from the preview data manager', function() {
            var query = '#1234';


            linkRenderer.renderLinkForPropertyPanel(query);

            expect(W.Preview.getPreviewManagers().Data.getDataByQuery).toHaveBeenCalledWith(query);
        });

        it('should call the linkRenderer instance with the received data object', function() {
            var query = '#1234';
            spyOn(MockLinkRendererClass.prototype, 'renderLinkDataItemForPropertyPanel');

            linkRenderer.renderLinkForPropertyPanel(query);

            expect(MockLinkRendererClass.prototype.renderLinkDataItemForPropertyPanel).toHaveBeenCalled();
        });
    });
});