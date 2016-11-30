/*global window, app*/

app.directive('zoom', ['transportService', function(transportService){
    return {
        restrict: 'A',
        templateUrl: 'partials/zoomTpl.html',
        scope: {
            zoomImg: '=',
            zoomVisible: '='
        },
        link: function($scope, $el, $attr){
            var _self = {
                    _peekImage: null,
                    _peekTitle: null,
                    _peekSizeText: null,
                    _parent: null,
                    _visible: false,
                    maxSize: 512,

                    run: function(){
                        _self._peekImage = $el.find('img');
                        _self._parent = $el.parent();

                        $el.on(window.transitionEndEvent, function(e){
                            $scope.$apply(function(){
                                _self._removePeek(e);
                            });
                        });

                        _self._peekImage.on('load', this._peekLoad.bind(this));
                    },

                    _showPeek: function(){
                        $el.addClass('show');
                    },

                    _hidePeek: function(){
                        if (window.requestAnimationFrame){
                            window.requestAnimationFrame(function(){
                                window.requestAnimationFrame(function(){ // for the situation when mouseenter and mouseleave events dispatched during one frame
                                    $el.removeClass('show show-img');
                                });
                            });
                        } else{
                            $el.removeClass('show show-img');
                        }

                        if (!window.transitionEndEvent){
                            _self._removePeek({target: $el[0]});
                        }
                    },

                    _positionPeek: function(){
                        var el = $el[0],
                            lens = $scope.zoomImg.el,
                            offset = lens.getBoundingClientRect(),
                            left = offset.left + lens.offsetWidth + 5,
                            top = offset.top + lens.offsetHeight + 5,
                            diff = {
                                h: _self._parent.height() + _self._parent[0].offsetTop - top - el.offsetHeight - 10,
                                w: _self._parent.width() + _self._parent[0].offsetLeft - left - el.offsetWidth - 10
                            };

                        if (diff.h < 0){
                            top += diff.h;
                        }

                        if (diff.w < 0){
                            left -= el.offsetWidth + lens.offsetLeft + lens.offsetWidth + 5;
                        }

                        $el.css({
                            left: left,
                            top: top
                        });
                    },

                    _removePeek: function(e){
                        if (e.target === $el[0] && !_self._visible){
                            $el.removeClass('display');
                            $scope.zoomImg = null;
                        }
                    },

                    _peekLoad: function(){
                        if (_self._visible){
                            this._positionPeek();
                            $el.addClass('show-img');
                        }
                    }
                };

            $scope.getSrc = function(){
                return $scope.zoomImg ? transportService.topology.staticMediaUrl + '/' + $scope.zoomImg.data.uri + '_' + _self.maxSize : '//:0';
            };

            $scope.$watch('zoomVisible', function(newVal){
                if (newVal){
                    $el.addClass('display');
                    _self._visible = true;
                    _self._positionPeek();

                    if (window.requestAnimationFrame){
                        window.requestAnimationFrame(_self._showPeek);
                    } else{
                        _self._showPeek();
                    }

                    if (_self._peekImage[0].complete){
                        _self._peekLoad();
                    }
                } else{
                    _self._visible = false;
                    _self._hidePeek();
                }
            });

            _self.run();
        }
    };
}]);