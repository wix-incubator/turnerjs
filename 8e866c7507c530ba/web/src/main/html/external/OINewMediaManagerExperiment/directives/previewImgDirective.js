/*global window, app*/

app.directive('previewImg', ['transportService', 'mediaGalleryService', function(transportService, mediaGalleryService){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/previewImgTpl.html',
        scope: {
            preview: '=',
            selectedImg: '='
        },

        controller: function($scope, $element){
            var _style = window.getComputedStyle($element.find('.preview figure')[0]),
                self = {
                    height: parseInt(_style.getPropertyValue('height'), 10),
                    width: parseInt(_style.getPropertyValue('width'), 10),
                    min: 100,

                    calculateDimensions: function(){
                        var thumb = $scope.selectedImg._thumb,
                            w, h, dimm;
                        if (thumb){
                            w = thumb.w;
                            h = thumb.h;

                            if (w > self.width || h > self.height){
                                dimm = w / h;

                                if (dimm > 1){
                                    w = self.width;
                                    h = Math.floor(w / dimm);
                                } else{
                                    h = self.height;
                                    w = Math.floor(h * dimm);
                                }
                            }
                        } else{
                            w = self.width;
                            h = self.height;
                        }

                        $scope.height = h+'px';
                        $scope.width = w+'px';
                    },

                    openLinkDialog: function(e, selectedImg){
                        var el = e.currentTarget,
                            offset;

                        if (el.type !== 'input'){
                            el = el.previousElementSibling;
                        }

                        offset = $(el).offset();

                        transportService.openLinkDialog({
                            id: '#' + selectedImg.id,
                            data: selectedImg.data,
                            position: selectedImg.position,
                            left: offset.left - 370,
                            top: offset.top - 120
                        });
                    }
                };

            $scope.height = self.height+'px';
            $scope.width = self.width+'px';
            $scope.images = transportService.images;

            $scope.getUrl = function(){
                var url = $scope.selectedImg._thumb && $scope.selectedImg._thumb.url;

                return url ? 'url('+url+')' : 'none';
            };

            $scope.getPos = function(){
                var pos = $scope.selectedImg.position;

                return pos !== undefined ? pos+1 : 0;
            };

            $scope.selectImg = function(direction){
                var key = $scope.selectedImg.position,
                    images;

                if (key !== undefined){
                    key += direction;
                    images = transportService.images;

                    if (key > -1 && key < images.length){
                        $scope.preview(images[key], key);
                    }
                }
            };

            $scope.openMediaGallery = function(){
                mediaGalleryService.openMediaGallery('change', 'single', $scope.selectedImg.position);
            };

            $scope.openLinkDialog = function(e){
                var selectedImg = $scope.selectedImg;

                if (selectedImg.id){
                    self.openLinkDialog(e, selectedImg);
                }
            };
            
            $scope.change = function(){
                if (!transportService.isChanged){
                    transportService.pms.trigger('changed');
                }
            };
            
            $scope.keyDown = function(e){
                if (e.keyCode === 27){ // prevent IE from UNDO on input by ESC press
                    e.preventDefault();
                }
                
                e.stopPropagation(); 
            };

            $scope.$watch('selectedImg', function(img){
                self.calculateDimensions();
            });
        },

        link: function($scope, $el, $attr){
            $el.on('selectstart', '.switcher', function(e){e.preventDefault();});
        }
    };
}]);