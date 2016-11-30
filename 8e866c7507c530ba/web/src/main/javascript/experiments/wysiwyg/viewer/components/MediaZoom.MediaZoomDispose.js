define.experiment.component('wysiwyg.viewer.components.MediaZoom.MediaZoomDispose', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _closeZoom:function () {
            this.collapse();
            this.injects().Viewer.exitFullScreenMode();
            this.setDataItem(null);
            this.resetIterator();
            this._emptyContainer(this._skinParts.virtualContainer);
            this._emptyContainer(this._skinParts.itemsContainer);
            this._skinParts.dialogBox.setStyles({'width':'100px'});
            this._opened = false;
            this.unlock();
            //tmp
            this._lastCurrentItem = null;
        },

        _transitionToCurrentDisplayer:function (currentDisplayer) {
            if (this._inTransition) return;
            this._inTransition = true;
            currentDisplayer.setStyle('opacity', '0.0');
            var container = this._skinParts.itemsContainer;
            var that = this;

            var changeBoxSizeAndShow = function () {
                that._emptyContainer(container);
                var size = currentDisplayer.getStyles('width', 'height');
                var topGap = that._getTopGap(size.height.replace('px', ''));
                container.adopt(currentDisplayer);
                that._emptyContainer(that._skinParts.virtualContainer);

                var fx_size = new Fx.Morph(that._skinParts.dialogBox, {'duration':that.transitionTime, 'link':'chain'});
                fx_size.addEvent('complete', function () {
                    var fx_show = new Fx.Tween(currentDisplayer, {'duration':that.transitionTime, 'link':'chain'});
                    fx_show.addEvent('complete', function () {
                        that.unlock();
                        that._inTransition = false;
                        //that.injects().Utils.forceBrowserRepaint();
                        fx_show.removeEvent('complete', arguments.callee);
                    });
                    fx_show.start('opacity', '1.0');
                    fx_size.removeEvent('complete', arguments.callee);
                });

                fx_size.start({
                    'width':size.width,
                    'min-height':size.height,
                    'margin-top':topGap + 'px'
                });
                if (fx_old) {
                    fx_old.removeEvent("complete", arguments.callee);
                }

            };
            if (container.hasChildNodes()) {
                var fx_old = new Fx.Tween(container.firstChild, {'duration':that.transitionTime, 'link':'chain', 'property':'opacity'});
                fx_old.addEvent('complete', changeBoxSizeAndShow);
                fx_old.start('0.0');
            }
            else {
                changeBoxSizeAndShow();
            }
        },

        _changeImageNoTransition:function (currentDisplayer) {
            var container = this._skinParts.itemsContainer;
            var that = this;

            this._emptyContainer(container);
            var size = currentDisplayer.getStyles('width', 'height');
            var topGap = that._getTopGap(size.height.replace('px', ''));
            container.adopt(currentDisplayer);
            this._emptyContainer(that._skinParts.virtualContainer);
            that._skinParts.dialogBox.setStyles({
                'width':size.width,
                'min-height':size.height,
                'margin-top':topGap + 'px'
            });
            that.unlock();
        },

        _emptyContainer: function(container){
            for (var i = 0; i < container.childNodes.length; i++) {
                var element = container.childNodes[i];
                if(element.getLogic){
                    element.getLogic().dispose();
                }else{
                    element.destroy();
                }
            }
            container.empty();
        }

    });

});
