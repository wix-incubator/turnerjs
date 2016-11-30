/**
 * @class bootstrap.utils.SupportUtils
 *
 * In this class we put all the scripts made for debugging purposes ONLY!!
 *
 */
define.utils('Debug', function(){
    return ({

    // ##########################################################################
    // ############  P U B L I C     M E T H O D S    ###########################
    // ##########################################################################

        addComponentDebugIndicators: function() {
            var pageComponents = this._getAllPageComponents();
            _(pageComponents).forEach(function(comp){
                var compView = comp.getViewNode();
                compView.style.border = '1px solid black';
                var indicatorElement = compView.getElementsByClassName('componentDebugIndicator')[0];
                if (!indicatorElement) {
                    indicatorElement = this.createDebugIndicatorElement('red', 'black');
                    compView.adopt(indicatorElement);
                }
                indicatorElement.textContent = this._getDebugIndicatorText(comp);
            }.bind(this));
        },

        removeComponentDebugIndicators: function() {
            var pageComponents = this._getAllPageComponents();
            _(pageComponents).forEach(function(comp){
                var compView = comp.getViewNode();
                compView.style.border = '';
                var indicatorElement = compView.getElementsByClassName('componentDebugIndicator')[0];
                if (indicatorElement) {
                    indicatorElement.dispose();
                }
            });
        },


    // ##########################################################################
    // ############  P R I V A T E   M E T H O D S    ###########################
    // ##########################################################################

        createDebugIndicatorElement: function(color, borderColor) {
            var indicatorElement = new Element('div', {
                styles: {
                    'display': 'block',
                    'border': '1px dashed '+borderColor,
                    'position': 'absolute',
                    'top': '-11px',
                    'line-height': '9px',
                    'color': color
                },
                'class': 'componentDebugIndicator'
            });
            return indicatorElement;
        },

        _getAllPageComponents: function() {
            return W.Preview.getPageComponents(W.Preview.getPreviewManagers().Viewer.getCurrentPageId(),W.Config.env.$viewingDevice);
        },

        _getDebugIndicatorText: function(comp) {
            return '(ID:'+comp.getComponentId()+',x='+comp.getX()+',y='+comp.getY()+',w='+comp.getWidth()+',h='+comp.getHeight()+',pH='+comp.getPhysicalHeight()+')';
        }


    });
});