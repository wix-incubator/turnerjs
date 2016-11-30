/*global window, $, Wix, app, Image*/

app.directive('imageList', ['$window', '$document', 'transportService',  function($window, $document, transportService){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/imageListTpl.html',
        scope: {
            preview: '=',
            showPeek: '=',
            hidePeek: '=',
            removeImage: '=',
            selectedImg: '=',
            confirm: '='
        },
        link: function($scope, $el, $attr){
            var self,
                doc = $document[0];

            self = {
                _container: $el[0],
                _dragging: null,
                _draggingClass: ("classList" in doc.documentElement) ? 'dragging' : 'dragging ie9', // ie 9 detection
                _dropped: false,
                _tempWider: null,
                _styleSheet: null,
                _defaultImgContSize: null,
                _style: doc.createElement('style'),
                _defaultThumbSize: 120,
                _actualThumbSize: 120,
                _maxThumbSize: 256, // default width from css stylesheet: .sets .previewCont .preview figure
                _maxScrollBarWidth: 18, // max scroll bar width

                run: function(){
                    this._spikes();
                    $el.on('mouseenter mouseleave', '.imgCont', this._hover); // NOTE: yes, this should be in CSS! BUT because of default is prevented on 'dragover', browser doesn't know that mouse pointer was moved and results to unexpected hover effect
                    $el.on('dragstart', '.imgCont', this._dragStart);
                    $el.on('selectstart', '.imgCont', this._ie9fix);
                    $el.on('dragenter', '.imgCont', this._dragEnter);
                    $el.on('dragleave', '.imgCont', this._dragLeave);
                    $el.on('dragend', '.imgCont', this._dragEnd);
                    $el.on('dragover', '.imgCont', this._dragOver); // drop requires it to work
                    $el.on('dragover', this._dragOverOutside); // drop requires it to work
                    $window.$win.on('dragover', this._dragOverOutside);
                    $window.$win.on('resize', this._setImgContSize);
                    $el.on('drop', '.imgCont', this._drop);
                    $el.on('drop', this._toEdge);
                    $el.on('keydown', this._keydown);
                    $window.$win.on('keydown', this._disableBackspace);

                    transportService.pms.on('added', function(){
                        setTimeout(function(){ // yes this is crappy, but angular rerenders directive's content on digest, so this is only way to make animation work ($timeout doesn't fit)
                            $el.stop().animate({
                                scrollTop: 0
                            }, 500);
                        }, 0);
                    });

                    doc.head.appendChild(this._style);
                    this._setImgContSize();
                },

                _spikes: function(){
                    // ugly fix for a bag which reproduces
                    // on wide screen in chrome under the
                    // Windows when two big Iframes are on 
                    // the stage and in one of them 
                    // content with set transform css property isn't
                    // rendered
                    
                    //TODO: it's seemed like it is fixed in chrome 37.0.2062.94 m.
                    //TODO: But somewhy not all machines are automatically getting this update, 
                    //TODO: so we should wait some time before removing this ugly fix
                    
                    if (navigator.appVersion.indexOf('Win') > -1 && navigator.userAgent.indexOf('Chrome') > -1){
                        $el.removeClass('animation');
                    }
                },

                _setImgContSize: function(){
                    var size = self._defaultThumbSize,
                        elW = $el.width() - self._maxScrollBarWidth,
                        styleSheet = self._style.sheet;

                    size = Math.floor(elW / Math.floor(elW / size));
                    
                    if (size !== self._actualThumbSize){
                        if (styleSheet.cssRules.length){
                            while(styleSheet.cssRules.length){
                                styleSheet.deleteRule(0);
                            }
                        }

                        styleSheet.insertRule('.imageList .content .items .imgCont {width: '+size+'px; height: '+size+'px;}', 0);
                        styleSheet.insertRule('.imageList .content .items .imgCont.wider {padding-left: '+size+'px;}', 1);
                    }
                },

                _hover: function(e){
                    var el = $(e.currentTarget),
                        type = e.type;

                    if (type === 'mouseenter'){
                        el.addClass('hover');
                    } else{
                        el.removeClass('hover');
                    }
                },

                _keydown: function(e){
                    if (!$scope.confirm){
                        var keyCode = e.keyCode,
                            isLeftArrow = keyCode === 37,
                            isRightArrow = keyCode === 39,
                            isArrowKey = isLeftArrow || isRightArrow;


                        if (isArrowKey){
                            self._switchSelectedImg(isLeftArrow, isRightArrow);
                        } else if(keyCode === 46 || keyCode === 8){ // delete key or backspace
                            if ($scope.images.length){
                                $scope.$apply(function(){
                                    $scope.removeNode($scope.selectedImg.position);
                                });
                            }

                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }
                },

                _disableBackspace: function(e){
                    if (e.keyCode === 8){
                        e.preventDefault();
                        e.stopPropagation();
                    }
                },
                
                _switchSelectedImg: function(isLeftArrow, isRightArrow){
                    var pos = $scope.selectedImg.position,
                        images = $scope.images,
                        isAlreadySelected = pos !== undefined,
                        el = self._container,
                        newPos, newPreviewImg, currentEl;

                    if (isLeftArrow){
                        if (isAlreadySelected && pos - 1 > -1){
                            newPos = pos - 1;
                        } else{
                            newPos = images.length - 1;
                        }
                    } else if (isRightArrow){
                        if (isAlreadySelected && pos + 1 < images.length){
                            newPos = pos + 1;
                        } else {
                            newPos = 0;
                        }
                    }

                    newPreviewImg = images[newPos];
                    currentEl = $('#'+newPreviewImg.id)[0];

                    $scope.$apply(function(){
                        $scope.preview(newPreviewImg, newPos);

                        setTimeout(function(){ // yes this is crappy, but angular rerenders directive's content on digest, so this is only way to make animation work ($timeout doesn't fit)
                            if (el.scrollTop + el.offsetHeight < currentEl.offsetTop + currentEl.offsetHeight || currentEl.offsetTop < el.scrollTop){
                                $el.stop().animate({
                                    scrollTop: currentEl.offsetTop
                                }, 200);
                            }
                        }, 0);
                    });
                },

                _dragStart: function(e){
                    var el = e.currentTarget,
                        $elem = $(el),
                        dataTransfer = e.originalEvent.dataTransfer;

                    $scope.$apply($scope.hidePeek);
                    self._dropped = false;
                    $el.children().addClass('animation');

                    if ($window.requestAnimationFrame){
                        $window.requestAnimationFrame(function(){
                            $elem.addClass(self._draggingClass);
                        });
                    } else{
                        $elem.addClass(self._draggingClass);
                    }
                    
                    self._tempWider = $elem.next();
                    self._tempWider.addClass('wider');

                    self._dragging = {
                        el: el,
                        i: Array.prototype.indexOf.call(self._container.children, el)
                    };
                    
                    try{
                        dataTransfer.setData("text/html", el.outerHTML);
                    } catch(e){ // IEs support
                        dataTransfer.setData("text", el.outerHTML);
                    }

                    dataTransfer.effectAllowed = 'move';
                },

                _ie9fix: function(e){
                    if (this.dragDrop){
                        this.dragDrop();
                    }

                    e.preventDefault();
                },

                _dragEnd: function(e){
                    if (!self._dropped){ // if image was self._dropped outside of the viewport or imageList area
                        self.restoreImage();
                    }

                    e.preventDefault();
                    e.stopPropagation();
                },

                _dragOver: function(e){
                    if (self._dragging){
                        var el = e.currentTarget,
                            $elem = $(el),
                            width = el.offsetWidth,
                            halfWidth = width / 2,
                            offsetX = self._getOffsetX(e),
                            isWider,
                            wider;

                        if (!$elem.hasClass('dragging')){
                            isWider = $elem.hasClass('wider');

                            if (self._isOnRightSide(el, offsetX)){
                                self._restoreTempWider();
                                wider = $elem.next();

                                if (wider.hasClass('dragging')){
                                    wider = wider.next();
                                }

                                wider.addClass('wider');
                                self._tempWider = wider;
                            } else if (!isWider && offsetX < halfWidth){
                                $elem.addClass('wider');
                                self._restoreTempWider();
                                self._tempWider = $elem;
                            }
                        }
                        
                        e.originalEvent.dataTransfer.dropEffect = 'move';
                        e.preventDefault(); // this results to a bug with hover, but without it drop doesn't work
                        e.stopPropagation();
                    }
                },

                _getOffsetX: function(e){
                    var el = e.currentTarget,
                        eve = e.originalEvent,
                        offsetX = eve.offsetX || eve.layerX;

                    return el === e.target ? offsetX : offsetX + el.offsetWidth - e.target.offsetWidth;
                },

                _isOnRightSide: function(el, offsetX){
                    var width = el.offsetWidth,
                        halfWidth = width / 2,
                        isWider = $(el).hasClass('wider');

                    return (isWider && offsetX > width * 3/4) || (!isWider && offsetX > halfWidth);
                },

                _dragOverOutside: function(e){
                    if (self._dragging){
                        self._restoreTempWider();

                        e.originalEvent.dataTransfer.dropEffect = 'move';
                        e.preventDefault(); // this results to a bug with hover, but without it drop doesn't work
                        e.stopPropagation();
                    }
                },

                _restoreTempWider: function(){
                    if (self._tempWider.hasClass('wider')){
                        self._tempWider.removeClass('wider');
                    }
                },

                _dragEnter: function(e){
                    e.preventDefault();
                    e.stopPropagation();
                },

                _dragLeave: function(e){
                    e.preventDefault();
                    e.stopPropagation();
                },

                restoreImage: function(){
                    if ($window.requestAnimationFrame){
                        $window.requestAnimationFrame(function(){
                            self._restoreImage();
                        });
                    } else{
                        self._restoreImage();
                    }
                    
                    $el.children().removeClass('animation');
                },

                _restoreImage: function(){
                    $(self._dragging.el).removeClass(self._draggingClass);
                    self._restoreTempWider();
                    self._dragging = null;
                },

                _drop: function(e){
                    if (self._dragging){
                        var target = e.currentTarget,
                            offsetX = self._getOffsetX(e),
                            before = !self._isOnRightSide(target, offsetX),
                            parent = target.parentNode,
                            targetInd = Array.prototype.indexOf.call(parent.children, target);

                        self._dropped = true;

                        if (self._dragging.i < targetInd){
                            targetInd -= 1;
                        }

                        if (!before){
                            targetInd += 1;
                        }

                        self._reorderImages(self._dragging.i, targetInd);
                        self.restoreImage();

                        e.preventDefault();
                        e.stopPropagation();
                    }
                },

                _toEdge: function(e){
                    if (self._dragging){
                        var list = e.currentTarget,
                            eve = e.originalEvent,
                            offsetY = $el[0].scrollTop + (eve.offsetY || eve.layerY),
                            lastIndex = list.children.length - 1,
                            first = list.children[0],
                            last = list.children[lastIndex],
                            to = null;

                        if (offsetY < first.offsetTop){
                            list.insertBefore(self._dragging.el, first);
                            to = 0;
                        } else if (offsetY > last.offsetTop){
                            list.appendChild(self._dragging.el);
                            to = lastIndex;
                        }

                        self._reorderImages(self._dragging.i, to);
                    }
                },

                loadThumb: function(url, imgData, onlyCache){
                    onlyCache = onlyCache || false;
                    
                    var img = new Image();

                    if (!onlyCache){
                        img.onload = this._loadThumb.bind(this, imgData);
                        img.src = url;

                        if (img.complete){
                            this._loadThumb(imgData, {currentTarget: img});
                        }
                    } else{
                        img.src = url;
                    }
                },

                _loadThumb: function(imgData, e){
                    var img = e.currentTarget,
                        figure = $el.find('#'+imgData.id),
                        el = figure.find('.img');

                    imgData._thumb.w = img.naturalWidth;
                    imgData._thumb.h = img.naturalHeight;
                    figure.css('background', 'none'); // removes spinner, needed because when dragging figure became wider
                    el.addClass('loaded');
                },

                _reorderImages: function(from, to){
                    $scope.$apply(function(){
                        var moved = transportService.reorderImgs(self._dragging.i, to);
                        $scope.preview(moved, to);
                    });
                }
            };

            $scope.images = transportService.images;

            $scope.getBGUrl = function(img){
//                var thumb = transportService.getThumb(),
//                    uri = img.data.thumb ? img.data.thumb.uri : null, //TODO: this field should be in the image dataSchema in future.
//                    url;

//                var url = img._thumbUrl = Wix.Utils.Media.getResizedImageUrl(img.data.uri, self._maxThumbSize, self._maxThumbSize);
                var url = Wix.Utils.Media.getImageUrl(img.data.uri)+'_'+self._maxThumbSize; //Wix.Utils.Media.getResizedImageUrl(img.data.uri, self._maxThumbSize, self._maxThumbSize);

                img._thumb = { //TODO: temp object can be change in future if thumb will be added to dataSchema
                    url: url
                };
                self.loadThumb(url, img);

//                if (thumb.mode === 'fit'){ //TODO: this should be finished after what will be with Image thumb will be decided
//                    img._thumbUrl = url;
//                } else{
//                    img._thumbUrl = uri ? Wix.Utils.Media.getImageUrl(uri) : Wix.Utils.Media.getResizedImageUrl(img.data.uri, thumb.w, thumb.h);
//                    self.loadThumb(img._thumbUrl, img.id, true);
//                }

                return 'url('+url+')';
            };

            $scope.removeNode = function(index){
                var el = $el.children().eq(index);

                if ($window.transitionEndEvent){
                    el.one($window.transitionEndEvent, function(){
                        $scope.$apply(function(){
                            $scope.removeImage(index);
                        });
                    });

                    el.addClass('animation');

                    $window.requestAnimationFrame(function(){
                        el.addClass('deleting');
                    });
                } else{
                    $scope.removeImage(index);
                }
            };

            $scope.$watch(function(){ return $scope.images.length; }, function(newLength, oldLength){
                var selectedImg;

                if (oldLength === 0 && newLength !== oldLength){
                    $scope.preview($scope.images[0], 0);
                } else {
                    selectedImg = $scope.selectedImg;
                    $scope.preview(selectedImg, $scope.images.indexOf(selectedImg));
                }
            });

            self.run();
        }
    };
}]);