define.component('wysiwyg.editor.components.dialogs.ColorPickerDialog', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.inherits('mobile.core.components.base.BaseComponent');
    def.resources(['W.UndoRedoManager', 'W.Utils']);
    def.utilize(['core.utils.css.Color']);
    def.binds(['_recalculateByBoxAndSlider', '_onBeforeClose', '_onHexChanged']);
    def.skinParts({
        //Color Box
        SLBox          : {type: 'htmlElement'},
        SLBoxSolidColor: {type: 'htmlElement'},
        SOverlay       : {type: 'htmlElement'},
        LOverlay       : {type: 'htmlElement'},
        HSPointer      : {type: 'htmlElement'},
        //Hue Slider
        hueSlider      : {type: 'htmlElement'},
        hueBg          : {type: 'htmlElement'},
        hueBar         : {type: 'htmlElement'},
        //Color Inputs
        HInput         : {type: 'htmlElement'},
        SInput         : {type: 'htmlElement'},
        BInput         : {type: 'htmlElement'},
        //Hex and Alpha Inputs
        hexController  : {type: 'htmlElement'},
        hexInput       : {type: 'htmlElement'},
        alphaController: {type: 'htmlElement'},
        alphaInput     : {type: 'htmlElement'},
        //Color Preview
        originColor    : {type: 'htmlElement'},
        currentColor   : {type: 'htmlElement'}
    });
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            args = args || {};
            this._color = new this.imports.Color(args.color || '#FF0000');
            this._colorFullSL = this._createFullSLColor(this._color);
            this._isAlphaEnabled = args.enableAlpha !== false;
            this._closeCommand = this.injects().Commands.createCommand('cp');
            this._changeCB = args.onChange;
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('onDialogClosing', this._onBeforeClose);
            this._colorDetails = {isColorChanged: false};
        },

        render: function(){
            var themeDir = this.injects().Theme.getProperty('THEME_DIRECTORY');

            //TODO: move image src setting to skin once skin manager support placeholders in HTML
            this._skinParts.SOverlay.set('src', themeDir + 'colorPicker/s_overlay.png');
            this._skinParts.LOverlay.set('src', themeDir + 'colorPicker/l_overlay.png');
            this._skinParts.hueBg.set('src', themeDir + 'colorPicker/hue.png');

            // Get skin measurements
            this._measureGUI();
            // Initiate reset color
            this.setOriginalColor(this._color);
            // Set gui functionality
            this._setFunctionality();
            //Enable/Disable Alpha controller
            this.enableAlpha(this._isAlphaEnabled);
            // Resync color
            this._syncToColor();

        },

        getColor: function(){
            return new this.imports.Color(this._color);
        },

        setColor: function(newColor, updateOriginal){
            this._color = new this.imports.Color(newColor);
            this._colorFullSL = this._createFullSLColor(newColor);
            if (updateOriginal){
                this.setOriginalColor(this._color);
            }
            this._syncToColor('newColor');
        },

        getOriginalColor: function(){
            return new this.imports.Color(this._colorOrigin);
        },

        setOriginalColor: function(newColor){
            this._colorOrigin = new this.imports.Color(newColor);
            var alpha = (this._colorOrigin.getAlpha() === 0) ? 0.01 : this._colorOrigin.getAlpha(); // Need to put min opacity so area will stay clickable
            this._setBgColor(this._skinParts.originColor, this._colorOrigin);
        },

        enableAlpha: function(isAlphaEnabled){
            this._isAlphaEnabled = isAlphaEnabled;
            if (!isAlphaEnabled && this._color){
                this._color.setAlpha(1);
                this._syncToColor('alphaToggle');
                this._skinParts.alphaController.collapse();
            } else {
                this._skinParts.alphaController.uncollapse();
            }
        },

        _onBeforeClose: function(e){
            var cause = 'cancel';
            var color = this.getOriginalColor();
            if (e && e.result == 'OK'){
                cause = 'ok';
                color = this.getColor();
            }

            if (e.result == 'OK' && this._colorDetails && this._colorDetails.isColorChanged) {
                this.resources.W.UndoRedoManager.startTransaction();
                this._onColorChange(color, cause);
                this._colorDetails.isColorChanged = false;
            } else {
                this._onColorChange(color, cause);
            }
        },

        _onColorChange: function(color, cause){
            cause = cause || 'change';
            var oldColor = this.getOriginalColor();
            var evData = {color: color, cause: cause};
            if (!this.resources.W.Utils.areObjectsEqual(oldColor, color)) {
                this._colorDetails.isColorChanged = true;
                this._colorDetails.oldColor = this._colorDetails.newColor ? this._colorDetails.oldColor : oldColor;
                this._colorDetails.newColor = color;
            }
            if (this._colorDetails && this._colorDetails.isColorChanged) {
                evData.colorDetails = this._colorDetails;
            }
            this._changeCB(evData);
        },

        _onHexChanged: function(){
            var hexValue = this._skinParts.hexInput.value;
            if (hexValue === this._color.getHex()){
                return;
            }
            this._color.setHex(hexValue);
            this._colorFullSL.setHue(this._color.getHue());
            this._syncToColor('hexInput');
        },

        _syncToColor: function(causeByInput){
            var x, y, updateAlpha = (causeByInput == 'alphaInput' || causeByInput == 'newColor' || !causeByInput);
            // Remove alpha if not enabled
            if (!this._isAlphaEnabled){
                this._color.setAlpha(1);
            }

            // Saturation light box color
            this._setBgColor(this._skinParts.SLBoxSolidColor, this._colorFullSL);

            // Saturation light pointer position
            if (causeByInput != 'HSPointer' || causeByInput == 'newColor'){
                x = ((this._color.getSaturation() / 100) * this._slSize.x) - +this._slPointerHalfSize;
                y = (this._slSize.y - ((this._color.getBrightness() / 100) * this._slSize.y)) - this._slPointerHalfSize;
                this._skinParts.HSPointer.setStyles({'left': x, 'top': y});
            }

            // Hue bar position
            if (causeByInput != 'hueBar' || causeByInput == 'newColor'){
                y = (this._colorFullSL.getHue() / 360) * (this._hueSliderHeight - this._hueSliderBarHeight);
                this._skinParts.hueBar.setStyle('top', y);
            }

            // Alpha input
            if (causeByInput != 'alphaInput'){
                this._skinParts.alphaInput.value = Math.round(this._color.getAlpha() * 100);
            }

            // hue/saturation/brightness Input
            if (causeByInput != 'HInput'){
                this._skinParts.HInput.value = Math.round(this._color.getHue());
            }
            if (causeByInput != 'SInput'){
                this._skinParts.SInput.value = Math.round(this._color.getSaturation());
            }
            if (causeByInput != 'BInput'){
                this._skinParts.BInput.value = Math.round(this._color.getBrightness());
            }

            // Hex
            if (causeByInput != 'hexInput'){
                this._skinParts.hexInput.value = this._color.getHex().substr(1);
            }

            // Current color box
            this._setBgColor(this._skinParts.currentColor, this._color);

            // Dispatch color change event
            this._onColorChange(this._color, 'change');
        },

        _setBgColor: function(node, color){
            var bgColor;
            var hasRgba = Modernizr && Modernizr.rgba;
            var hasOpacity = Modernizr && Modernizr.opacity;

            if (hasRgba){
                bgColor = 'rgba(' + color.getRgba() + ')';
            } else {
                bgColor = color.getHex();
            }
            node.setStyle('background-color', bgColor);

            if (hasOpacity && !hasRgba){
                node.setStyle('opacity', color.getAlpha());
            } else {
                node.setStyle('filter', 'alpha(opacity=' + color.getAlpha() * 100 + ')');
            }
        },

        _measureGUI: function(){
            this._slPointerHalfSize = this._skinParts.HSPointer.getSize().x / 2;
            this._slSize = this._skinParts.SLBox.getSize();
            this._hueSliderHeight = this._skinParts.hueSlider.getSize().y;
            this._hueSliderBarHeight = this._skinParts.hueBar.getSize().y;
        },

        _setHexInput: function(){
            // Set hex input
            this._skinParts.hexInput.addEvent('keyup', this._onHexChanged);
            this._skinParts.hexInput.addEvent('paste', this._onHexChanged);
        },

        _setSatAndLumDrag: function(){
            // Set saturation & brightness pointer drag
            this._slPointerDrag = new Drag.Move(this._skinParts.HSPointer, {
                limit : {'x': [(0 - this._slPointerHalfSize), (this._slSize.x - this._slPointerHalfSize)],
                    'y'     : [(0 - this._slPointerHalfSize), (this._slSize.y - this._slPointerHalfSize)]},
                onDrag: this._recalculateByBoxAndSlider,
                snap  : 0
            });
        },

        _setSatAndLumClick: function(){
            // Set saturation & brightness direct click
            this._skinParts.SLBox.addEvent('mousedown', function(e){
                e = new Event(e);
                this._skinParts.HSPointer.setStyles({
                    'top' : e.page.y - this._skinParts.SLBox.getTop() - this._slPointerHalfSize,
                    'left': e.page.x - this._skinParts.SLBox.getLeft() - this._slPointerHalfSize
                });
                this._slPointerDrag.start(e);
                this._recalculateByBoxAndSlider();
            }.bind(this));
        },

        _setHueSliderDrag: function(){
            // Set hue slider
            var hueBarLeft = this._skinParts.hueBar.getStyle('left').toInt();
            hueBarLeft = (isNaN(hueBarLeft)) ? 0 : hueBarLeft;
            this._hueSliderDrag = new Drag.Move(this._skinParts.hueBar, {
                limit : {'x': [hueBarLeft, hueBarLeft],
                    'y'     : [0, (this._hueSliderHeight - this._hueSliderBarHeight)]},
                onDrag: this._recalculateByBoxAndSlider,
                snap  : 0
            });
        },

        _setHueSliderClick: function(){
            // Set hue slider direct click
            this._skinParts.hueSlider.addEvent('mousedown', function(e){
                e = new Event(e);
                this._skinParts.hueBar.setStyle('top', (e.page.y - this._skinParts.hueSlider.getTop()));
                this._hueSliderDrag.start(e);
                this._recalculateByBoxAndSlider();
            }.bind(this));
        },

        _setFunctionality: function(){

            this._setHexInput();
            this._setSatAndLumDrag();
            this._setSatAndLumClick();
            this._setHueSliderDrag();
            this._setHueSliderClick();

            // Set alpha slider drag
            this._setInputFunctionality(this._skinParts.alphaInput, 0, 100, 100, function(newVal){
                this._color.setAlpha(newVal / 100);
                this._syncToColor('alphaInput');
            }.bind(this));
            // Set hue/saturation/brightness inputs
            this._setInputFunctionality(this._skinParts.HInput, 0, 359, 359, function(newVal){
                if (newVal === this._color.getHue()){
                    return;
                }
                this._color.setHue(newVal);
                this._colorFullSL.setHue(newVal);
                this._syncToColor('HInput');
            }.bind(this));
            this._setInputFunctionality(this._skinParts.SInput, 0, 100, 100, function(newVal){
                if (newVal === this._color.getSaturation()){
                    return;
                }
                this._color.setSaturation(newVal);
                this._syncToColor('SInput');
            }.bind(this));
            this._setInputFunctionality(this._skinParts.BInput, 0, 100, 100, function(newVal){
                if (newVal === this._color.getBrightness()){
                    return;
                }
                this._color.setBrightness(newVal);
                this._syncToColor('BInput');
            }.bind(this));

            // Set origin color button
            this._skinParts.originColor.addEvent('click', function(){
                this.setColor(this._colorOrigin);
            }.bind(this));
        },

        _setInputFunctionality: function(input, min, max, defaultValue, changeCB){
            var inputMethod = function(e){
                e.stop();
                var newVal, curVal = input.value.toInt();
                curVal = Math.round(Number((isNaN(curVal)) ? defaultValue : curVal));
                if (e.type == Element.Events.mousewheel.base){
                    curVal += (e.wheel != -1) ? 1 : -1;
                }
                newVal = Math.min(curVal, max);
                newVal = Math.max(newVal, min);
                if (newVal != curVal || e.type == Element.Events.mousewheel.base){
                    input.value = newVal;
                }
                changeCB(newVal);
            }.bind(this);
            input.addEvents({'keyup': inputMethod, 'mousewheel': inputMethod});
        },

        _recalculateByBoxAndSlider: function(e){
            var satu = ((this._skinParts.HSPointer.getStyle('left').toInt() + this._slPointerHalfSize) / this._slSize.x) * 100;
            var light = 100 - (((this._skinParts.HSPointer.getStyle('top').toInt() + this._slPointerHalfSize) / this._slSize.y) * 100);
            var hue = ((this._skinParts.hueBar.getStyle('top').toInt()) / (this._hueSliderHeight - this._hueSliderBarHeight)) * 360;
            this._color.setHsb([hue, satu, light]);
            this._colorFullSL.setHue(hue);
            this._syncToColor();
        },

        _createFullSLColor: function(baseColor){
            var c = new this.imports.Color(baseColor);
            c.setSaturation(100);
            c.setBrightness(100);
            return c;
        }
    });

});
