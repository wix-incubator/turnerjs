describe( 'TextCompEditorLayoutHandler', function(){
    testRequire().
        classes('wysiwyg.editor.components.richtext.TextCompEditorLayoutHandler', 'bootstrap.utils.Events');

    beforeEach(function(){
        var mockCkClass = function(){
            this._width = 10;
            this._height = 10;
            this._contentHeight = 7;
            this.config = {
                autoGrow_minHeight: 0,
                autoGrow_maxHeight: 0 //means unlimited
            };
            this.isReady = function(){
                return true;
            };
            this.on = function(evType, callback, scope){
                this.addEvent(evType, function(){
                    callback.apply(scope, arguments);
                });
            };
            this.resize = function(width, height){
                var oldHeight = this._height;
                var oldWidth = this._width;
                this._width = width;
                this._height = height;
                this.fireEvent( 'resize', {data: {'newHeight':height, 'newWidth':width, 'oldWidth': oldWidth, 'oldHeight': oldHeight} });
            };

            this.autoGrow = function(height){
                if(height < this.config.autoGrow_minHeight){
                    height = this.config.autoGrow_minHeight;
                }
                if(height > this.config.autoGrow_maxHeight){
                    height = this.config.autoGrow_maxHeight;
                }
                this.fireEvent('autoGrow', {
                    data: {
                        newHeight: height,
                        currentHeight: this._height
                    }
                });
                this._height = height;
                this._contentHeight = height;
            };
            this.getResizable = function(){
                var self = this;
                return {
                    getSize: function(axis){
                        return self['_' + axis];
                    }
                }
            };
            window.CKEDITOR = {
                'plugins': {'autogrow': {'getContentHeight': function(){
                    return this._contentHeight;
                }.bind(this) }}
            };
        };
        var mockCompClass = function(){
            this._width = 10;
            this._height = 10;
            this._minHeight = 10;
            this._maxHeight = 100;
            this.resize = function(width, height){
                this._width = width;
                this.setHeight(height, false, false);
                this.fireEvent('resize');
            };
            this.endResize = function(){
                this.fireEvent('resizeEnd');
            };
            this.getPhysicalHeight = function(){
                return this._height;
            };
            this.getWidth = function(){
                return this._width;
            };
            this.setHeight = function(height, forceUpdate, triggersOnResize){
                if(height < this._minHeight){
                    height = this._minHeight;
                }
                this._height = height;
                if (triggersOnResize!=false){
                    this.fireEvent('resize');
                }
            };
            this.getSizeLimits = function(){
                return {
                    minH: this._minHeight,
                    maxH: this._maxHeight
                };
            };
            this.setMinH = function(height){
                this._minHeight = height;
            };
            this.setMaxH = function(height){
                this._maxHeight = height;
            }
        };

        var eventsObj = new this.Events();
        mockCkClass.prototype = eventsObj;
        mockCompClass.prototype = eventsObj;
        this.mockCk = new mockCkClass();
        this.mockComp = new mockCompClass();
        this.setStateSpy = jasmine.createSpy('setState');
        this.setFocusSpy = jasmine.createSpy('setFocus');
        this.handler = new this.TextCompEditorLayoutHandler({
            setState: this.setStateSpy,
            setFocus: this.setFocusSpy
        });
    });

    it("should init the class, start editing and update ck min height", function(){
        this.handler.setCkEditorInstance(this.mockCk);
        this.handler.startEditing(this.mockComp);
        //the initial size of the ck is set in the WRichTextEditor class
        expect(this.mockCk.config.autoGrow_minHeight).toBe(this.mockComp.getPhysicalHeight());
    });

    describe("component size change", function(){
        beforeEach(function(){
            this.handler.setCkEditorInstance(this.mockCk);
            this.handler.startEditing(this.mockComp);
        });

        it("should update ck height on height change", function(){
            this.mockComp.resize(this.mockComp.getWidth(), 20);
            expect(this.mockCk._height).toBe(20);
        });
        it("should update ck height on multiple height change", function(){
            var width = this.mockComp.getWidth();
            this.mockComp.resize(width, 20);
            expect(this.mockCk._height).toBe(20);
            this.mockComp.resize(width, 40);
            this.mockComp.resize(width, 30);
            expect(this.mockCk._height).toBe(30);
        });
        it("shouldn't allow height smaller than the ck content height, should set height to content height", function(){
            var contentHeight = this.mockCk._contentHeight;
            expect(contentHeight).toBeGreaterThan(5);
            //we call resize twice because on the first the check for min height won't be correct
            //this is fine since in real life the first will be fired with a really small difference
            this.mockComp.resize(this.mockComp.getWidth(), 11);
            this.mockComp.resize(this.mockComp.getWidth(), 5);
            expect(this.mockCk._height).toBe(contentHeight);
        });

        it("should change editor comp state on start resize", function(){
            this.mockComp.resize(this.mockComp.getWidth(), 20);
            expect(this.setStateSpy).toHaveBeenCalledWith('not-editable', 'editable');
        });
        it("should change editor comp state only once per resize session", function(){
            this.setStateSpy.reset();
            this.mockComp.resize(this.mockComp.getWidth(), 20);
            this.mockComp.resize(this.mockComp.getWidth(), 20);
            expect(this.setStateSpy).toHaveBeenCalledXTimes(1);
        });
        it("should change editor comp state on exd resize", function(){
            this.mockComp.resize(this.mockComp.getWidth(), 20);
            this.mockComp.endResize();
            expect(this.setStateSpy).toHaveBeenCalledWith('editable', 'editable');
        });
        //since we remove the data from the component this is what disables the user to make the component smaller than the content.
        it("should set component min height to the ck content height", function(){
            expect(this.mockComp._minHeight).not.toBe(this.mockCk._contentHeight);
            this.mockComp.resize(this.mockComp.getWidth(), 20);
            expect(this.mockComp._minHeight).toBe(this.mockCk._contentHeight);
        });
        it("should set the component min height back to the original value after resize end", function(){
            var originalValue = this.mockComp._minHeight;
            expect(originalValue).not.toBe(this.mockCk._contentHeight);
            this.mockComp.resize(this.mockComp.getWidth(), 20);
            this.mockComp.endResize();
            expect(this.mockComp._minHeight).toBe(originalValue);
        });
        it("should set ck min height to component height on end resize", function(){
            this.mockComp.resize(this.mockComp.getWidth(), 30);
            this.mockComp.endResize();
            expect(this.mockCk.config.autoGrow_minHeight).toBe(30);
        });

        describe("change including width", function(){
            //we set here the content height manually since we don't really have content
            it("should increase height if content is bigger than height, on decrease width, height no change", function(){
                this.mockCk._contentHeight = 30;
                expect(this.mockCk._contentHeight).toBeGreaterThan(this.mockCk._height);
                this.mockComp.resize(5, this.mockCk._height);
                expect(this.mockCk._height).toBe(30);
                expect(this.mockComp._height).toBe(30);
                expect(this.mockComp.getSizeLimits().minH).toBe(this.mockCk._contentHeight);
            });
            it("should increase and then decrease height, on width changes, height no change", function(){
                this.mockCk._contentHeight = 30;
                expect(this.mockCk._contentHeight).toBeGreaterThan(this.mockCk._height);
                this.mockComp.resize(5, this.mockCk._height);
                expect(this.mockCk._height).toBe(30);
                this.mockCk._contentHeight = 20;
                this.mockComp.resize(10, this.mockCk._height);
                expect(this.mockCk._height).toBe(20);
            });
            it("should decrease height to content height if content is smaller than height but bigger than last resize height, on increase width, height no change", function(){
                this.mockComp.resize(this.mockComp.getWidth(), 20);
                this.mockComp.endResize();
                this.mockCk.autoGrow(30);
                this.mockCk._contentHeight = 25;
                this.mockComp.resize(30, this.mockCk._height);
                expect(this.mockCk._height).toBe(25);
                expect(this.mockComp._height).toBe(25);
                expect(this.mockComp.getSizeLimits().minH).toBe(this.mockCk._contentHeight);
            });
            it("should set height to last resize height if content is smaller, on increase width, height no change", function(){
                this.mockComp.resize(this.mockComp.getWidth(), 20);
                this.mockComp.endResize();
                this.mockCk.autoGrow(30);
                this.mockCk._contentHeight = 10;
                this.mockComp.resize(5, this.mockCk._height);
                expect(this.mockCk._height).toBe(20);
                expect(this.mockComp._height).toBe(20);
                expect(this.mockComp.getSizeLimits().minH).toBe(this.mockCk._contentHeight);
            });

            it("should act as regular height resize if both width and height are changed", function(){
                this.mockCk.autoGrow(30);
                this.mockCk._contentHeight = 10;
                this.mockComp.resize(20, 20);
                expect(this.mockCk._height).toBe(20);
                expect(this.mockComp._height).toBe(20);
                expect(this.mockComp.getSizeLimits().minH).toBe(this.mockCk._contentHeight);
            });

            it("should not change height to content height if height was changed sometimes during this resize session", function(){
                this.mockComp.resize(this.mockComp.getWidth(), 20);
                this.mockCk._contentHeight = 10;
                this.mockComp.resize(100, 20);
                expect(this.mockCk._height).toBe(20);
                expect(this.mockComp._height).toBe(20);
            });
        });
    });

    describe("ck auto grow", function(){
        beforeEach(function(){
            this.handler.setCkEditorInstance(this.mockCk);
            this.handler.startEditing(this.mockComp);
        });
        it("should change the comp height on auto grow", function(){
            this.mockCk.autoGrow(40);
            expect(this.mockComp._height).toBe(40);
        });
        it("should fire auto sized on each size change", function(){
            spyOn(this.mockComp, 'fireEvent');
            this.mockCk.autoGrow(30);
            this.mockCk.autoGrow(40);
            expect(this.mockComp.fireEvent).toHaveBeenCalledWithFollowingPartialArguments('autoSized');
            expect(this.mockComp.fireEvent).toHaveBeenCalledXTimes(2);
        });
        it("shouldn't fire auto size if size wasn't changed", function(){
            spyOn(this.mockComp, 'fireEvent');
            this.mockCk.autoGrow(30);
            this.mockCk.autoGrow(30);
            expect(this.mockComp.fireEvent).toHaveBeenCalledWithFollowingPartialArguments('autoSized');
            expect(this.mockComp.fireEvent).toHaveBeenCalledXTimes(1);
        });
        it("shouldn't allow height smaller than the initial height, and set the height to initial height", function(){
            var initialHeight = this.mockCk._height;
            expect(initialHeight).toBeGreaterThan(5);
            this.mockCk.autoGrow(5);
            expect(this.mockComp._height).toBe(initialHeight);
        });
        it("shouldn't allow height smaller than the initial height, if content was once bigger", function(){
            var initialHeight = this.mockCk._height;
            expect(initialHeight).toBeGreaterThan(5);
            expect(30).toBeGreaterThan(initialHeight);
            this.mockCk.autoGrow(30);
            this.mockCk.autoGrow(40);
            this.mockCk.autoGrow(5);
            expect(this.mockComp._height).toBe(initialHeight);
        });
        it("should set height to last resize height when content is smaller, if component was resized to bigger size", function(){
            var initialHeight = this.mockCk._height;
            expect(initialHeight).toBeGreaterThan(5);
            expect(30).toBeGreaterThan(initialHeight);
            this.mockComp.resize(this.mockComp.getWidth(), 30);
            this.mockComp.endResize();
            this.mockCk.autoGrow(5);
            expect(this.mockComp._height).toBe(30);
        });
        it("shouldn't allow auto grow bigger than comp max height", function(){
            var initialHeight = this.mockCk._height;
            expect(200).toBeGreaterThan(this.mockComp._maxHeight);
            this.mockCk.autoGrow(200);
            expect(this.mockComp._height).toBe(this.mockComp._maxHeight);
        });
    });
});