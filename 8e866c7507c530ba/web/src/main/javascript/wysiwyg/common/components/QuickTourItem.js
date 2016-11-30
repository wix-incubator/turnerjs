define.component('wysiwyg.common.components.QuickTourItem', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Resources']);

//    def.skinParts({
//        title: {type:'htmlElement'},
//        body: {type:'htmlElement'},
//        navList: {type:'htmlElement'},
//        nextButton: {type:'wysiwyg.common.components.SiteFeedbackButton', argObject:{
//            label:'slideBtn',
//            enabled:true
//        }},
//        arrowContainer: {type:'htmlElement'}
//    });

    def.methods({
        initialize: function (compId, viewNode, args) {
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

                this._renderTitleText();
                this._renderBodyText();
                this._renderNextButton();
                this._renderItemPosition();
                this._renderNavigation();
                this._renderArrow();

                // Appear (animated)
                this.$view.tween("opacity", 0, 1);
            }
        },

        _renderTitleText: function () {
            this._skinParts.title.set('html',
                this._translate(this.TITLE_PATTERN.replace("%0%", this._slideData.id))
            );
        },

        _renderBodyText: function () {
            var bodyText = this._translate(this.BODY_PATTERN.replace("%0%", this._slideData.id));
            if (bodyText) {
                this._skinParts.body.set('html', bodyText);
            } else {
                this._skinParts.body.collapse();
            }
        },

        _renderNextButton: function () {
            var btnLabel = this.BUTTON_LABEL_PATTERN.replace("%0%", this._slideData.id);
            if (btnLabel && btnLabel !== "") {
                this._skinParts.nextButton.on("click", this, this._onNextBtnClick);
                this._skinParts.nextButton.setLabel(btnLabel);
            } else {
                this._skinParts.nextButton.collapse();
            }
            this._skinParts.nextButton.render();
        },

        _renderItemPosition: function () {
            if (this._slideData.fixedPos) {
                this.$view.setStyle("left", this._slideData.fixedPos.x + "px");
                this.$view.setStyle("top", this._slideData.fixedPos.y + "px");
            } else if (this._slideData.relPos) {
                this.$view.setStyle("left", (this._slideData.relPos.x + this._targetBounds.x) + "px");
                this.$view.setStyle("top", (this._slideData.relPos.y + this._targetBounds.y) + "px");
            }
        },

        _renderNavigation: function () {
            var itemIndicator, i;
            for (i = 0; i < this._numOfSlides; i++) {
                itemIndicator = new Element('li');
                itemIndicator.insertInto(this._skinParts.navList);
                itemIndicator.on(Constants.CoreEvents.CLICK, this, this._onNavigationItemClick);
                if (i === this._slideIndex) {
                    itemIndicator.addClass("selected");
                }
            }
        },

        _renderArrow: function () {
            if (this._slideData.arrowData) {
                var arrowCurve = this._slideData.arrowData.curve,
                    container = this._skinParts.arrowContainer,
                    position = this.$view.getPosition(),
                    fromPoint = {
                        x: position.x + this._slideData.arrowData.relStart.x,
                        y: position.y + this._slideData.arrowData.relStart.y
                    };
                var toPoint = {
                    x: this._targetBounds.x + this._slideData.arrowData.relEnd.x,
                    y: this._targetBounds.y + this._slideData.arrowData.relEnd.y
                };

                var containerRect = {
                    x: Math.min(fromPoint.x, toPoint.x),
                    y: Math.min(fromPoint.y, toPoint.y),
                    w: Math.abs(toPoint.x - fromPoint.x),
                    h: Math.abs(toPoint.y - fromPoint.y)
                };

                container.setStyle("left", containerRect.x);
                container.setStyle("top", containerRect.y);
                container.setStyle("width", containerRect.w);
                container.setStyle("height", containerRect.h);


                this._drawArrow(fromPoint.x - containerRect.x, fromPoint.y - containerRect.y, toPoint.x - containerRect.x, toPoint.y - containerRect.y, arrowCurve);
            }
        },

        _drawArrow: function (x1, y1, x2, y2, arrowCurve) {
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
            if (arrowCurve > 0) {
                cX = xDiff * arrowCurve;
            } else if (arrowCurve < 0) {
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
            var nodeList = Array.prototype.slice.call(item.target.parentNode.children),
                index = nodeList.indexOf(item.target);
            this.trigger("itemClick", {index: index});
        },

        _onNextBtnClick: function () {
            this.trigger("nextClick", null);
        },

        _translate: function (key, fallBack) {
            return this.resources.W.Resources.get('EDITOR_LANGUAGE', key, fallBack);
        },

        dispose: function () {
            this._targetElement = null;
            this._slideData = null;
            this.exterminate();
        }
    });
});