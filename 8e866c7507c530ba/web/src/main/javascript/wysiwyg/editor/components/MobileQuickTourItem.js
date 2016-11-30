define.component('wysiwyg.editor.components.MobileQuickTourItem', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Resources', 'W.Config']);

    def.skinParts({
        title: {type:'htmlElement'},
        body: {type:'htmlElement'},
        navList: {type:'htmlElement'},
        nextButton: {type:'wysiwyg.editor.components.WButton', autoCreate:true},
        arrowContainer: {type:'htmlElement'}
    });

    def.binds(['_onNextBtnClick', '_onNavigationItemClick']);

    def.fields({
    });

    def.statics({
        TITLE_PATTERN:"MOBILE_QUICK_TOUR_%0%_TITLE",
        BODY_PATTERN:"MOBILE_QUICK_TOUR_%0%_BODY",
        BUTTON_LABEL_PATTERN:"MOBILE_QUICK_TOUR_%0%_BUTTON"
    });

    def.states({
        "fontsUsage" : ["default", "handwritten"]
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);

            this.$view.setStyle("opacity", 0);

            this._slideIndex = args.slideIndex;
            this._numOfSlides = args.numOfSlides;
            this._slideData = args.slideData;
            this._targetBounds = args.targetBounds;


        },

        _onRender: function (renderEvent) {
            var invalidation = renderEvent.data.invalidations;
            if (invalidation.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {

                this._setLocaleState();

                this._renderTitleText();
                this._renderBodyText();
                this._renderNextButton()
                this._renderItemPosition();
                this._renderNavigation();
                this._renderArrow();

                // Appear (animated)
                this.$view.tween("opacity", 0, 1);
            }
        },

        _setLocaleState: function(){
            var lang = this.resources.W.Config.getLanguage();
            if(["en","pt","es","de","fr"].indexOf(lang)>-1) {
                this.setState("handwritten", "fontsUsage");
            } else {
                this.setState("default", "fontsUsage");
            }
        },

        _renderTitleText: function(){
            this._skinParts.title.set('html',
                this._translate(this.TITLE_PATTERN.replace("%0%", this._slideData.id))
            );
        },

        _renderBodyText: function(){
            var bodyText = this._translate(this.BODY_PATTERN.replace("%0%", this._slideData.id));
            if(bodyText) {
                this._skinParts.body.set('html', bodyText);
            } else {
                this._skinParts.body.collapse();
            }
        },

        _renderNextButton: function(){
            var btnLabel = this._translate(this.BUTTON_LABEL_PATTERN.replace("%0%", this._slideData.id));
            if(btnLabel && btnLabel!="") {
                this._skinParts.nextButton.addEvent("click", this._onNextBtnClick);
                this._skinParts.nextButton.setLabel(btnLabel);
            } else {
                this._skinParts.nextButton.collapse();
            }
            this._skinParts.nextButton.render();
        },

        _renderItemPosition: function(){
            if(this._slideData.fixedPos) {
                this.$view.setStyle("left", this._slideData.fixedPos.x + "px");
                this.$view.setStyle("top", this._slideData.fixedPos.y + "px");
            } else if(this._slideData.relPos) {
                this.$view.setStyle("left", (this._slideData.relPos.x + this._targetBounds.x) + "px");
                this.$view.setStyle("top", (this._slideData.relPos.y + this._targetBounds.y) + "px");
            }
        },

        _renderNavigation: function(){
            var itemIndicator;
            for(var i=0; i<this._numOfSlides; i++) {
                itemIndicator = new Element('li');
                itemIndicator.insertInto(this._skinParts.navList);
                itemIndicator.addEvent(Constants.CoreEvents.CLICK, this._onNavigationItemClick);
                if(i===this._slideIndex) {
                    itemIndicator.addClass("selected");
                }
            }
        },

        _renderArrow: function(){
            if(this._slideData.arrowData){
                var container = this._skinParts.arrowContainer;
                var position = this.$view.getPosition();

                var fromPoint = {
                    x:position.x + this._slideData.arrowData.relStart.x,
                    y:position.y + this._slideData.arrowData.relStart.y
                };
                var toPoint = {
                    x:this._targetBounds.x + this._slideData.arrowData.relEnd.x,
                    y:this._targetBounds.y + this._slideData.arrowData.relEnd.y
                };

                var containerRect = {
                    x:Math.min(fromPoint.x, toPoint.x),
                    y:Math.min(fromPoint.y, toPoint.y),
                    w:toPoint.x > fromPoint.x ? toPoint.x - fromPoint.x : fromPoint.x - toPoint.x,
                    h:toPoint.y > fromPoint.y ? toPoint.y - fromPoint.y : fromPoint.y - toPoint.y
                };

                container.setStyle("left", containerRect.x);
                container.setStyle("top", containerRect.y);
                container.setStyle("width", containerRect.w);
                container.setStyle("height", containerRect.h);

                var arrowCurve = this._slideData.arrowData.curve;
                var invertX = this._slideData.relPos.x < 0;

                if(this._slideData.relPos.y < 0) {
                    this._drawArrow(invertX ? containerRect.w : 0, 0, invertX ? 0 : containerRect.w, containerRect.h, arrowCurve);
                } else {
                    this._drawArrow(invertX ? 0 : containerRect.w, containerRect.h, invertX ? containerRect.w : 0, 0, arrowCurve);
                }
            }
        },

        _drawArrow: function(x1, y1, x2, y2, arrowCurve) {
            var path = this._skinParts.arrowContainer.getElementById("arrowLine");

            var margin = 10;
            x1 += x1 < x2 ? margin : -margin;
            x2 += x1 < x2 ? -margin : margin;
            y1 += y1 < y2 ? margin : -margin;
            y2 += y1 < y2 ? -margin : margin;

            var xDiff = x2 - x1;
            var yDiff = y2 - y1;
            var cX = 0;
            var cY = 0;
            if(arrowCurve>0) {
                cX = xDiff * arrowCurve;
            } else if(arrowCurve<0) {
                cY = -yDiff * arrowCurve;
            }

            var d = "m%x1%,%y1% c0,0 %cX%,%cY% %xDiff%,%yDiff%";
            d = d.
                replace("%x1%", x1.toString()).
                replace("%y1%", y1.toString()).
                replace("%xDiff%", xDiff.toString()).
                replace("%yDiff%", yDiff.toString()).
                replace("%cX%", cX.toString()).
                replace("%cY%", cY.toString());

            path.setAttribute("d", d);
            path.setAttribute("marker-end", "url(#triangle)");
        },

        _onNavigationItemClick: function (item) {
            var nodeList = Array.prototype.slice.call(item.target.parentNode.children);
            var index = nodeList.indexOf(item.target);
            this.fireEvent("itemClick", index);
        },

        _onNextBtnClick: function () {
            this.fireEvent("nextClick", null);
        },

        _translate: function(key, fallBack) {
            return this.resources.W.Resources.get('EDITOR_LANGUAGE', key, fallBack);
        },

        dispose: function () {
            this._targetElement = null;
            this._slideData = null;
            this.exterminate();
        }

    });
});

