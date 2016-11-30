/**
 * @class wysiwyg.editor.utils.Spinner
 *
 * This utility can be used for creating a spinner (preloader) that is blocking all interface while waiting for something
 *
 */

define.Class('wysiwyg.editor.utils.Spinner', function(def){
    def.resources([
        'W.Preview',
        'W.EditorDialogs',
        'W.Theme',
        'W.Utils'
    ]);

    def.statics({
        visible: false,
        el: null,
        _animation: true,
        _container: null,
        _styleSheet: null,
        _transitionName: null,
        _transitionEndEvent: null,
        _utils: null
    });

    def.methods({
        initialize: function(sets){
            this._sets = sets || {};
            this._gag();
            this._container = this._sets.container || document.body;
            this._utils = this.resources.W.Utils;
            this._create(sets);
        },

        show: function(){
            var el = this.el;

            if (!el.parentNode){ // if anybody uses the same container for its preloader, that one can override current in DOM.
                this._create();
            }

            el.addClass('visible');

            if (this._animation){
                window.requestAnimationFrame(function(){
                    el.addClass('show');
                }.bind(this));
            }
        },

        hide: function(){
            var el = this.el;

            if (this._animation){
                el.removeClass('show');
            } else{
                el.removeClass('visible');
            }
        },

        destroy: function(){
            var preloader = this.el;

            if (preloader.parentNode){ //is el in DOM
                this._container.removeChild(preloader);
            }

            this.el = null;
        },

        _gag: function(){
            window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

            if ('transition' in document.documentElement.style){
                this._transitionName = 'transition';
                this._transitionEndEvent = 'transitionend';
            } else if('webkitTransition' in document.documentElement.style){
                this._transitionName = 'webkitTransition';
                this._transitionEndEvent = 'webkitTransitionEnd';
            }
        },
        _create: function(sets){
            sets = sets || this._sets;
            var el = this.el = document.createElement('div'),
                style = this._styleSheet = document.createElement('style'),
                spinnerUrl = this.resources.W.Theme.getProperty("BG_DIRECTORY") + 'full_preloader.gif',
                id = this.id = 'id_'+new Date().getTime()+'_'+Math.floor(Math.random() * 1001);

            this._removeCached();
            el.appendChild(style);
            el.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this._utils.stopMouseWheelPropagation);
            this._container.appendChild(el);
            style.sheet.insertRule(
                '.preloader.'+id+' {' +
                    'background: '+ (sets.background || 'url("'+spinnerUrl+'") no-repeat center center, rgba(255, 255, 255, .5)') + ';' +
                    'bottom: '+ (sets.bottom || '0') + ';' +
                    'height: '+ (sets.height || 'auto') + ';' +
                    'left: '+ (sets.left || '0') + ';' +
                    'position: '+ (sets.position || 'fixed') +';' +
                    'right: '+ (sets.right || '0') + ';' +
                    'top: '+ (sets.top || '0') + ';' +
                    'width: '+ (sets.width || 'auto') + ';' +
                    'z-index: '+ (sets['z-index'] || '1001') + ';' +
                '}', 0);
            el.addClass('preloader '+id);

            if (sets.animation !== false && window.requestAnimationFrame && this._transitionEndEvent){
                el.addClass('animation');
                el.addEventListener(this._transitionEndEvent, this._finnishAnimation.bind(this));
            } else{
                this._animation = false;
            }
        },

        _removeCached: function(){ // removes preloader el if it was created in this container by another instance of Preloader
            var elToKill = null,
                hasPreloader = Array.prototype.some.call(this._container.children, function(child){
                    elToKill = child;
                    return child.hasClass('preloader');
                });

            if (hasPreloader){
                elToKill.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this._utils.stopMouseWheelPropagation);
                this._container.removeChild(elToKill);
            }
        },

        _finnishAnimation: function(e){
            if (!this.el.hasClass('show')){
                this.el.removeClass('visible');
            }
        }
    });
});