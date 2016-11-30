define.Class('wysiwyg.editor.managers.WAlignmentTools', function(classDefinition, inheritStrategy){
     /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.resources(['W.Preview','W.Commands','W.Utils', 'W.Editor']);

    def.statics({//the long string are because i'm also using them to create the gui. however, when we use languages, we need to do something else here.
        AlignmentCommands:{
            UP:'Align Up',
            DOWN:'Align Down',
            LEFT:'Align Left',
            RIGHT:'Align Right',
            HCENTER:'Horizontal Center', //AKA Center
            VCENTER:'Vertical Center', //AKA Middle
            HSIZE:'Match Size Horizontally',
            VSIZE:'Match Size Vertically',
            HDISTR:'Distribute Horizontally',
            VDISTR:'Distribute Vertically'
        },
        AlignmentComponentClassesToIgnore:[
            'wysiwyg.viewer.components.HeaderContainer',
            'wysiwyg.viewer.components.FooterContainer'
        ]
    });

    def.fields({
        Options:{
            comps:null,
            prevPositionsAndSizes:[], //this is for the undo
            command:null,
            isRelative:null },
        Funcs:{
            getXorY:null,
            setXorY:null,
            getWidthOrHeight:null,
            getMinOrMax:null,
            setWidthOrHeight:null
        }
    });

    def.methods({//the following looked like 3 functions that are needed in any class...
        initialize:function () {
            this._isReady = true;
        },
        isReady:function () {
            return this._isReady;
        },
        clone:function () {
            return new this.$class();
        },
        arrangeComponents:function (components, command, isRelative) {
            //TODO: move all the interface to go through here, use the layoutcommands and call the relevant functions from here.
            //that will eliminate the need to call init and wrapup on every function, and it will make the gui code easier
            this._init(components, command, isRelative);
            switch (command) {
                case this.AlignmentCommands.LEFT:
                case this.AlignmentCommands.RIGHT:
                case this.AlignmentCommands.UP:
                case this.AlignmentCommands.DOWN:
                    this._align();
                    break;
                case this.AlignmentCommands.HCENTER:
                case this.AlignmentCommands.VCENTER:
                    this._center();
                    break;
                case this.AlignmentCommands.HSIZE:
                case this.AlignmentCommands.VSIZE:
                    this._matchSizes();
                    break;
                case this.AlignmentCommands.HDISTR:
                case this.AlignmentCommands.VDISTR:
                    this._distribute();
                    break;
            }
            this._reportComponentsMove(components);
            W.Editor.onComponentChanged(true);
        },

        _reportComponentsMove: function(components) {
            if (components.length){
                this.resources.W.Preview.getPreviewManagers().Layout.reportMove(components);
            }
        },

        undo:function (components) {
            var prevs = this.Options.prevPositionsAndSizes.pop();
            if (prevs == undefined) {
                return;
            }
            for (var i = 0; i < components.length; i++) {
                components[i].setX(prevs[i].x);
                components[i].setY(prevs[i].y);
                components[i].setWidth(prevs[i].width);
                components[i].setHeight(prevs[i].height);
            }
        },
        _init:function (components, command, isRelative) {
            this.Options.comps = components;
            this._savePrevPositionsAndSizes();
            this.Options.command = command;
            this.Options.isRelative = isRelative;
            this.Funcs.getXorY = this.getXorYFunc(command);
            this.Funcs.setXorY = this.setXorYFunc(command);
            this.Funcs.getWidthOrHeight = this.getWidthOrHeightFunc(command);
            this.Funcs.getMinOrMax = this.getMinOrMaxFunc(command);
            this.Funcs.setWidthOrHeight = this.setWidthOrHeightFunc(command);
        },
        _savePrevPositionsAndSizes: function () {
            var prevs = [];
            var comps = this.Options.comps;
            for (var i = 0; i < comps.length; i++) {
                prevs.push({x: comps[i].getX(), y: comps[i].getY(), width: comps[i].getWidth(), height: comps[i].getPhysicalHeight()});
            }
            this.Options.prevPositionsAndSizes.push(prevs); //push the latest 'prevs' into the stack
        },
        _align: function () {
            var targetXorY = this.getTargetXorY(this.Options.command);
            //now that we have the 'most' (left-most, upper-most, etc.), let's set the others accordingly
            for (var i = 0; i < this.Options.comps.length; i++) {
                this.Funcs.setXorY(this.Options.comps[i], targetXorY, this.Funcs.getWidthOrHeight(this.Options.comps[i]));
            }
        },
        _center: function () {
            var targetCenter = this.getTargetCenter();
            for (var i = 0; i < this.Options.comps.length; i++) {
                this.Funcs.setXorY(this.Options.comps[i], targetCenter, this.Funcs.getWidthOrHeight(this.Options.comps[i]));
            }
        },
        _matchSizes: function () {
            var targetSize = this.getTargetSize();
            for (var i = 0; i < this.Options.comps.length; i++) {
                this.Funcs.setWidthOrHeight(this.Options.comps[i], targetSize);
            }
        },
        _distribute:function () {
            //first, let's distribute according to the natural order they are in (i.e., the left-most will be the first if this is horizontal)
            this.Options.comps.sort(function (a, b) {
                return this.Funcs.getXorY(a) - this.Funcs.getXorY(b);
            }.bind(this)); //first we need to sort by X or Y (whichever is relevant here)

            //we'll sum the total margins and then distribute so that the margins will be even
            var sum = 0;
            for (var i = 1; i < this.Options.comps.length; i++) { //starting from the second one, because we'll measure the margin from the previous for each one
                sum += this.Funcs.getXorY(this.Options.comps[i]) - this.Funcs.getXorY(this.Options.comps[i - 1]) - this.Funcs.getWidthOrHeight(this.Options.comps[i - 1]);
            }
            //now, if it's relative to parent, we'll also take the two extra margins around the components (to the parent's frame) into the sum
            var margin = 0;
            if (this.Options.isRelative) {
                sum += this.Funcs.getXorY(this.Options.comps[0]); //one margin. no need to subtract the parent's x/y because it's relative anyway
                //now we add the 'far' margin, for which we subtract the far end of the last component from the far end of the parent
                var lastcomp = this.Options.comps[this.Options.comps.length - 1];
                sum += this.Funcs.getWidthOrHeight(lastcomp.getViewNode().getParent()) -
                    ( this.Funcs.getXorY(lastcomp) + this.Funcs.getWidthOrHeight(lastcomp) ); //other margin
                margin = sum / (this.Options.comps.length - 1 + 2); //taking these two margins into account when computing the average, too
            } else {
                margin = sum / (this.Options.comps.length - 1 );
            }
            //if relative, we need to set the first one's position according to the parent, and then continue from there. otherwise, the frist one remains in its place
            if (this.Options.isRelative) {
                this.Funcs.setXorY(this.Options.comps[0], margin, 0); //set the first one's position
            }
            for (i = 1; i < this.Options.comps.length; i++) {
                this.Funcs.setXorY(this.Options.comps[i], this.Funcs.getXorY(this.Options.comps[i - 1]) + this.Funcs.getWidthOrHeight(this.Options.comps[i - 1]) + margin); //each one's x (or y) should be set to the previous one's + the prev's width + the average margin
            }
        },
        /***
         * Checks if this component should be ignored when setting new position or new size.
         * The check is done with the classes listed in the array Constants.AlignmentComponentClassesToIgnore
         * Initially, this function was created to avoid moving or resizing the header/footer, while keeping them in the multi-select, so that other components could be aligned to the positions of the header/footer.
         * @param component - the component to be checked against the classes listed in Constants.AlignmentComponentClassesToIgnore
         * @private
         */
        _checkIfShouldIgnoreThisComponentClass:function (component) {
            //if the component's class is one of the classes listed for ignore, return true
            return (this.AlignmentComponentClassesToIgnore.contains(component.className));
        },

        getTargetXorY:function () {
            if (this.Options.isRelative) { //if it's relative to parent, we just need the relevant metric from the parent
                return this.Funcs.getWidthOrHeight(this.Options.comps[0].getViewNode().getParent());
            } else {          //otherwise, we need to find the 'most' metric from all the components (right-most, top-most, etc.)
                var most = this.Funcs.getXorY(this.Options.comps[0]) + this.Funcs.getWidthOrHeight(this.Options.comps[0]);
                for (var i = 1; i < this.Options.comps.length; i++) {
                    most = this.Funcs.getMinOrMax(most, this.Funcs.getXorY(this.Options.comps[i]) + this.Funcs.getWidthOrHeight(this.Options.comps[i]));
                }
                return most;
            }
        },
        getTargetCenter:function () { //perhaps i need to unify this with getTargetXorY, and not sure we'll need the command
            if (this.Options.isRelative) {
                return this.Funcs.getWidthOrHeight(this.Options.comps[0].getViewNode().getParent());
            } else {
                //to compute the average, first, get the sum of all centers (e.g. x+width/2). note that the width returned in this case is automatically half
                var sum = 0;
                for (var i = 0; i < this.Options.comps.length; i++) {
                    sum += this.Funcs.getXorY(this.Options.comps[i]) + this.Funcs.getWidthOrHeight(this.Options.comps[i]);
                }
                return sum / this.Options.comps.length; //return the average
            }
        },
        getTargetSize:function () {
            //we'll match to the first one. the first one in the array is also the first one that was selected
            return this.Funcs.getWidthOrHeight(this.Options.comps[0]); //there used to be an option here, matching the sizes to the parent, but it was removed
        },

        //GENERIC ALIGNMENT CLOSURE CREATORS
        getXorYFunc:function (command) {
            return function (component) {
                switch (command) {
                    case this.AlignmentCommands.LEFT:
                    case this.AlignmentCommands.RIGHT:
                    case this.AlignmentCommands.HCENTER:
                    case this.AlignmentCommands.HSIZE:
                    case this.AlignmentCommands.HDISTR:
                        return component.getX();
                    case this.AlignmentCommands.UP:
                    case this.AlignmentCommands.DOWN:
                    case this.AlignmentCommands.VCENTER:
                    case this.AlignmentCommands.VSIZE:
                    case this.AlignmentCommands.VDISTR:
                        return component.getY();
                }
            }.bind(this);
        },
        getWidthOrHeightFunc:function (command) {
            return function (component) {
                switch (command) {
                    case this.AlignmentCommands.LEFT:
                        return 0; //in this case, no need for width
                    case this.AlignmentCommands.RIGHT:
                        return component.getWidth();
                    case this.AlignmentCommands.UP:
                        return 0;  //in this case, no need for height
                    case this.AlignmentCommands.DOWN:
                    case this.AlignmentCommands.VSIZE:
                    case this.AlignmentCommands.VDISTR:
                        return (component.getPhysicalHeight) ? component.getPhysicalHeight() : component.getHeight(); //sometimes we may be looking at the parent, which might be an HTML div without our fancy methods
                    case this.AlignmentCommands.HCENTER:
                        return component.getWidth() / 2;
                    case this.AlignmentCommands.VCENTER:
                        return (component.getPhysicalHeight) ? component.getPhysicalHeight() / 2 : component.getHeight() / 2;
                    case this.AlignmentCommands.HSIZE:
                    case this.AlignmentCommands.HDISTR:
                        return component.getWidth();
                }
            }.bind(this);
        },

        setXorYFunc:function (command) {
            return function (component, value, widthOrHeight) {
                if (this._checkIfShouldIgnoreThisComponentClass(component)) {
                    return;
                }
                switch (command) {
                    case this.AlignmentCommands.LEFT:
                    case this.AlignmentCommands.HSIZE:
                    case this.AlignmentCommands.HDISTR:
                        component.setX(value);
                        break;
                    case this.AlignmentCommands.RIGHT:
                    case this.AlignmentCommands.HCENTER:
                        component.setX(value - widthOrHeight);
                        break;
                    case this.AlignmentCommands.UP:
                    case this.AlignmentCommands.VSIZE:
                    case this.AlignmentCommands.VDISTR:
                        component.setY(value);
                        break;
                    case this.AlignmentCommands.DOWN:
                    case this.AlignmentCommands.VCENTER:
                        component.setY(value - widthOrHeight);
                        break;
                }
                this._reportPositionChanged(component);

            }.bind(this);
        },

        setWidthOrHeightFunc:function (command) {
            return function (component, value) {
                if (this._checkIfShouldIgnoreThisComponentClass(component)) {
                    return;
                }
                switch (command) {
                    case this.AlignmentCommands.HSIZE:
                        //let's make sure that this direction is allowed for resize
                        //i'm checking for both, although for now they are always in pairs, just in case there will be some future component that can be moved to the left, but not to the right for example.
                        //if that happens, then we need some more elaborate checks here
                        if (component._resizableSides.indexOf("RESIZE_LEFT") == -1 || component._resizableSides.indexOf("RESIZE_RIGHT") == -1) {
                            break;
                        }
                        //if we're exceeding the component's limits, we'll set to the limit
                        if (value > component._maximumWidth) {
                            component.setWidth(component._maximumWidth);
                            break;
                        }
                        if (value < component._minimumWidth) {
                            component.setWidth(component._minimumWidth);
                            break;
                        }
                        component.setWidth(value);
                        break;
                    case this.AlignmentCommands.VSIZE:
                        //see comment on HZISE above
                        if (component._resizableSides.indexOf("RESIZE_TOP") == -1 || component._resizableSides.indexOf("RESIZE_BOTTOM") == -1) {
                            break;
                        }
                        //if we're exceeding the component's limits, we'll set to the limit
                        if (value > component._maximumHeight) {
                            component.setWidth(component._maximumHeight);
                            break;
                        }
                        if (value < component._minimumHeight) {
                            component.setWidth(component._minimumHeight);
                            break;
                        }
                        var extraPix = component.getExtraPixels();
                        component.setHeight(value - extraPix.top - extraPix.bottom);
                        break;
                }
                this._reportPositionChanged(component);
            }.bind(this);
        },

        _reportPositionChanged:function (component) {
            var oldCoordinates = component.getLastCoordinates();
            var newCoordinates = component.getCurrentCoordinates();
            var oldDimensions = component.getLastDimensions();
            var newDimensions = component.getCurrentDimensions();

            var changedComponentIds = [component.getComponentId()];
            var changedComponents = changedComponentIds.map(function (compId) {
                return this.resources.W.Preview.getCompLogicById(compId);
            }.bind(this));
            var ySortedElements = this.resources.W.Preview.getPreviewManagers().Layout._getSiblingsYSortedArray(changedComponents[0]);
            var ySortedElementIds = ySortedElements.map(function (comp) {
                return comp.getComponentId();
            }.bind(this));
            var changeData = {
                data:{
                    changedComponentIds:changedComponentIds,
                    ySortedElementIds:ySortedElementIds,
                    oldCoordinates:oldCoordinates,
                    newCoordinates:newCoordinates,
                    oldDimensions:oldDimensions,
                    newDimensions:newDimensions
                }
            };

            this.resources.W.Commands.executeCommand('WEditorCommands.ComponentMoved', changeData);
        },

        getMinOrMaxFunc:function (command) {
            return function (value1, value2) {
                switch (command) {
                    case this.AlignmentCommands.LEFT:
                    case this.AlignmentCommands.UP:
                        return Math.min(value1, value2);
                    case this.AlignmentCommands.RIGHT:
                    case this.AlignmentCommands.DOWN:
                        return Math.max(value1, value2);
                }
            }.bind(this);
        }
    });


});
