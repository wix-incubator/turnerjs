describe("AbstractBackground", function() {

    testRequire().
        components('wysiwyg.viewer.components.background.AbstractBackground').
        resources("W.Viewer", "W.Theme", "W.Preview");

    beforeEach(function() {
        var mockViewer = {
            getCurrentPageId: function() {return "mainpage" ;},
            addEvent: function(eventName, listener){}
        } ;

        var mockPreviewManagers = { 'Theme': W.Theme, 'Viewer': mockViewer, 'Data': W.Data, 'Commands': W.Commands } ;
        spyOn(W.Preview, 'getPreviewManagers').andReturn(mockPreviewManagers) ;
        spyOn(W.Preview, 'getPreviewSite').andReturn(window) ;

        var bgDiv = new Element("div");
        this.background = new this.AbstractBackground("Fake-EditorPresenter-ID", bgDiv, null) ;
    }) ;

    it("Should ensure that Site Background exists.", function() {
        expect(this.background).toBeDefined() ;
    }) ;

    it("Should not run transition nor handle BG change null pageId page change.", function() {
        spyOn(this.background, '_renderBackground') ;
        spyOn(this.background, '_runTransition') ;

        var pageId = null ;
        this.background._onPageChange(pageId) ;

        expect(this.background._runTransition).not.toHaveBeenCalled() ;
        expect(this.background._renderBackground).not.toHaveBeenCalled() ;
    }) ;

    it("should not run transition on initial page change.", function() {
        spyOn(this.background, '_renderBackground') ;
        spyOn(this.background, '_runTransition') ;
        spyOn(this.background, '_handleTabletBackgroundPos') ;
        this.background._pageToChangeTo = null ;

        var pageId = 'somePageId' ;
        this.background._onPageChange(pageId) ;

        expect(this.background._runTransition).not.toHaveBeenCalled() ;
        expect(this.background._renderBackground).toHaveBeenCalled() ;
    }) ;

    it("should run transition on any page change", function() {
        spyOn(this.background, '_renderSecondaryBg') ;
        spyOn(this.background, '_runTransition') ;
        spyOn(this.background, '_handleTabletBackgroundPos') ;
        this.background._pageToChangeTo = "somePageId" ;

        var pageId = 'home-page' ;
        this.background._onPageChange(pageId) ;

        expect(this.background._renderSecondaryBg).toHaveBeenCalled() ;
        expect(this.background._runTransition).toHaveBeenCalled() ;
        expect(this.background._pageToChangeTo).toBe('home-page') ;
    }) ;

    it("should set the view port position to fixed for tablets if BG is set to fixed and not scroll", function() {
        var counter = 0 ;
        spyOn(this.background, '_isMobile').andCallFake(function() {
            if(counter === 0) {
                counter++ ;
                return false ;
            } else {
                return true ;
            }
        }) ;
        var fakeBgViewPortSkinPart = {setStyle: jasmine.createSpy()};
        this.background._bgViewPort = fakeBgViewPortSkinPart;
        this.background._isBgAttachmentFixed = true ;

        // check on tablet & desktop.
        this.background._handleTabletBackgroundPos() ;
        expect(fakeBgViewPortSkinPart.setStyle).toHaveBeenCalledWith("position", "fixed") ;

        // check on mobile
        this.background._handleTabletBackgroundPos() ;
        expect(fakeBgViewPortSkinPart.setStyle).toHaveBeenCalledWith("position", "absolute") ;
    }) ;

    it("should return the background-attachment property 'scroll' if on Android Native browser", function() {
        spyOn(this.background, '_isAndroidNativeBrowser').andReturn(true);
        var bgDefinition = jasmine.createSpy();

        var bgAttachment = this.background._resolveBgAttachment(bgDefinition);

        expect(bgAttachment).toBe("scroll");
        expect(bgDefinition).not.toHaveBeenCalled();
    });

    it("should return the background-attachment property 'scroll' if on Mobile", function() {
        spyOn(this.background, '_isMobile').andReturn(true);
        var bgDefinition = jasmine.createSpy();

        var bgAttachment = this.background._resolveBgAttachment(bgDefinition);

        expect(bgAttachment).toBe("scroll");
        expect(bgDefinition).not.toHaveBeenCalled();
    });

    it("should return the background-attachment property of the Background instance if on Desktop", function() {
        spyOn(this.background, '_isMobile').andReturn(false);
        spyOn(this.background, '_isAndroidNativeBrowser').andReturn(false);
        spyOn(this.background, '_isTablet').andReturn(false);
        var fakeBgDefinition = {getAttachment: jasmine.createSpy()};

        var bgAttachment = this.background._resolveBgAttachment(fakeBgDefinition);

        expect(fakeBgDefinition.getAttachment).toHaveBeenCalled();
    });
}) ;
