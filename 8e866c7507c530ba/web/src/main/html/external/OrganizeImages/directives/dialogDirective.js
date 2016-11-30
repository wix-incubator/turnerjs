/*global app*/

app.directive('dialog', ['$document', '$timeout', 'transportService', 'mediaGalleryService', 'translationService', 'helpId', function($document, $timeout, transportService, mediaGalleryService, translationService, helpId){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/dialogTpl.html',
        controller: function($scope){
            var defaultImg = {thumb:{}},
                style = $document[0].createElement('style');

            $scope.preloader = false;
            $scope.confirm = null;
            $scope.selectedImg = defaultImg;
            $scope.images = transportService.images;
            $scope.zoomImg = null;
            $scope.zoomVisible = false;
            $scope.method = 'close';

            $scope.close = function(){
                transportService.close();
                $scope.clearPreview();
                $scope.hidePeek();
            };

            $scope.confirmSets = {
                message: 'ORGANIZE_IMAGES_DIALOG_CONFIRM_MSG',
                callback: $scope.close,
                afterChange: true
            };
            
            $scope.showConfirm = function(sets){
                if (sets.afterChange && transportService.isChanged || !sets.afterChange){
                    var confirmCallback = function(){
                        if (sets.args){
                            sets.callback.apply($scope, sets.args);
                        } else{
                            sets.callback();
                        }
                        
                        $scope.hideConfirm();
                    };
                    
                    $scope.confirm = {
                        message: translationService.translate(sets.message),
                        callback: confirmCallback
                    };
                } else{
                    $scope.close();
                }
            };

            $scope.hideConfirm = function(){
                $scope.confirm = null;
            };

            $scope.save = function(){
                transportService.save();
                $scope.close();
            };

            $scope.openMediaGallery = function(){
                mediaGalleryService.openMediaGallery('add', 'multiple');
            };

            $scope.showPeek = function(data, e){
                $scope.zoomImg = {
                    data: data,
                    el: e.currentTarget
                };
                $scope.zoomVisible = true;
            };

            $scope.hidePeek = function(){
                $scope.zoomVisible = false;
            };

            $scope.removeImage = function(index){
                var newLength = $scope.images.length - 1,
                    newPreviewIndex = index < newLength ? index : index - 1;
                
                transportService.removeImg(index);

                if (newLength > 0){
                    $scope.preview($scope.images[newPreviewIndex], newPreviewIndex);
                } else{
                    $scope.clearPreview();
                }
            };

            $scope.preview = function(image, key){
                if (!image.thumb){
                    image.thumb = {};
                }

                image.position = key;
                $scope.selectedImg = image;
            };

            $scope.clearPreview = function(){
                $scope.selectedImg = defaultImg;
            };

            $scope.openHelpDialog = function(){
                transportService.openHelpDialog({helpId: helpId});
            };

            transportService.pms.on('close', function(){
                // this is called if ESC event occurs outside the dialog
                // and it forces it to trigger in the dialog's iFrame
                window.focus();
            });

            mediaGalleryService.pms.on('load', function(){
                $timeout(function(){
                    $scope.preloader = true;
                }, 0);
            });

            mediaGalleryService.pms.on('loaded, closed', function(){
                $timeout(function(){
                    $scope.preloader = false;
                }, 0);
            });
        },

        link: function($scope){
            $document.on('keyup', function(e){
                var keyCode = e.keyCode;

                if (keyCode === 27){ // esc
                    if (mediaGalleryService.opening){
                        mediaGalleryService.reset();
                    } else if (mediaGalleryService.visible){ //ie fix
                        mediaGalleryService.pms.send('close');
                    } else if ($scope.confirm){
                        $scope.$apply($scope.hideConfirm);
                    } else if (transportService.isChanged){
                        $scope.$apply(function(){
                            $scope.showConfirm($scope.confirmSets);
                        });
                    } else if (!transportService.isLinkDialogOpened){
                        $scope.$apply(function(){
                            $scope.showConfirm($scope.confirmSets);
                        });
                    } 
                }
                
                if (keyCode === 13 && $scope.confirm){
                    $scope.$apply(function(){
                        $scope.confirm.callback();
                    });
                }
            });
        }
    };
}]);