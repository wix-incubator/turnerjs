define.experiment.component('wysiwyg.viewer.components.PageGroup.LandingPageSupport', function (componentDefinition, strategy) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.methods({

        _executeTransitionIfPossible: strategy.before(function(nextPage){
            if(this._currentPage){
                var isNextPageLanding = nextPage.$logic.isLanding();

                if(this.isCurrentPageLandingPage() !== isNextPageLanding){
                    W.Commands.executeCommand('Viewer.ToggleLandingPageMode', {toLanding: isNextPageLanding});
                }
            }
        }),

        isCurrentPageLandingPage: function(){
            if(typeof this._currentPage === 'undefined'){ //initial site load, the page group hasn't set it's page yet
                var viewer = this.resources.W.Viewer;
                // if currentPageId exists in viewer, then use it (i.e. switching from desktop to mobile)
                // otherwise use the homepageId in the site
                // otherwise use a blank string
                var currentPageId = viewer.getCurrentPageId() || viewer.getHomePageId() || '';
                var firstPage = viewer.getCompLogicById(currentPageId);
                // note that we do not set the currentPage to the first page *on purpose*, since it will otherwise be collapsed at the end of the transition
                // this is just to keep the page navigation as it is today without breaking things.. we can set it now, but then need to fix the executeTransitionIfPossible in pageGroup (non experiment),
                // which is not in the scope of this issue right now
                return firstPage && firstPage.isLanding();
            }
            return this._currentPage.$logic.isLanding();
        }
    });
});