/*global app*/

app.directive('dialog', [
    '$window',
    '$document',
    '$timeout',
    'transportService',
    'mediaGalleryService',
    'translationService',
    'biService',
    'helpId',
    function(
        $window,
        $document,
        $timeout,
        transportService,
        mediaGalleryService,
        translationService,
        biService,
        helpId
        ){

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/dialogTpl.html',

        controller: function($scope, $element){
            var dialogPopup = $element.find('.main.popup')[0];
            var defaultImg = {thumb:{}};
            var style = $document[0].createElement('style');
            var $gear = $element.find('i.settings');
            var $setsDialog = $element.find('.settings-dialog');
            var setsDialog = $setsDialog[0];
            var setsDialogWidth = parseInt(window.getComputedStyle(setsDialog).getPropertyValue('width'));
            var setsPointerStyle = window.getComputedStyle(setsDialog, ':after');
            var pointerHalfWidth = parseInt(setsPointerStyle.getPropertyValue('width')) / 2;
            var pointerHeight = parseInt(setsPointerStyle.getPropertyValue('height')) / 2;
            var pointerRight = parseInt(setsPointerStyle.getPropertyValue('right'));
            var currentUserSets = {};

            var userSetsBIParamsMap = {
                addMethod: {
                    unshift: 'start',
                    push: 'end',
                    splice: 'after-the-selected'
                },

                keepTitles: {
                    'true': 'import',
                    'false': 'blank'
                }
            };

            function sendUserSetsChangedBI(){
                var userSets = $scope.userSets;

                if (currentUserSets.addMethod !== userSets.addMethod){
                    currentUserSets.addMethod = userSets.addMethod;
                    biService.sendBiEvent('ORGIMAGES_USER_SETS_ORDER_CHANGED', userSetsBIParamsMap.addMethod[currentUserSets.addMethod]);
                }

                if (currentUserSets.keepTitles !== userSets.keepTitles){
                    currentUserSets.keepTitles = userSets.keepTitles;
                    biService.sendBiEvent('ORGIMAGES_USER_SETS_TITLES_CHANGED', userSetsBIParamsMap.keepTitles[userSets.keepTitles.toString()]);
                }
            }

            $scope.overlay = false;
            $scope.overlayClass = 'spinner';
            $scope.confirm = null;
            $scope.selectedImg = defaultImg;
            $scope.images = transportService.images;
            $scope.zoomImg = null;
            $scope.zoomVisible = false;
            $scope.method = 'close';
            $scope.userSets = transportService.userSets;
            $scope.settingsText = 'Organize_Images_Dialog_Sets_Button_Set';

            $scope.userSetsOptions = {
                addMethod: [
                    {
                        label: 'Organize_Images_Dialog_Sets_Add_Place_Start',
                        value: 'unshift'
                    },
                    {
                        label: 'Organize_Images_Dialog_Sets_Add_Place_End',
                        value: 'push'
                    },
                    {
                        label: 'Organize_Images_Dialog_Sets_Add_Place_After',
                        value: 'splice'
                    }
                ],

                keepTitles: [
                    {
                        label: 'Organize_Images_Dialog_Sets_Add_Title_With',
                        value: true
                    },
                    {
                        label: 'Organize_Images_Dialog_Sets_Add_Title_Without',
                        value: false
                    }
                ]

            };

            $scope.close = function(){
                transportService.close();
                $scope.closeSettings();
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

            $scope.openMediaGallery = function(e){
                if (!transportService.forceUserSettings){
                    mediaGalleryService.openMediaGallery('add', 'multiple');
                } else{
                    $scope.showOverlay('blocker');
                    $scope.settingsText = 'Organize_Images_Dialog_Sets_Button_Continue';
                    $scope.openSettings();
                }

                e.stopPropagation();
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

                transportService.selectedImgIndex = image.position = key;
                $scope.selectedImg = image;
            };

            $scope.clearPreview = function(){
                $scope.selectedImg = defaultImg;
            };

            $scope.openHelpDialog = function(){
                transportService.openHelpDialog({helpId: helpId});
            };

            $scope.toggleSettings = function(){
                if (!$setsDialog.hasClass('show')){
                    $scope.openSettings();
                } else{
                    $scope.closeSettings();
                }

            };

            $scope.openSettings = function(){
                var userSets = $scope.userSets;

                biService.sendBiEvent('ORGIMAGES_USER_SETS_OPEN');
                $scope.locateSettingsPopup();
                $gear.addClass('active');
                $setsDialog.addClass('show');
                currentUserSets = {
                    keepTitles: userSets.keepTitles,
                    addMethod: userSets.addMethod
                };
            };

            $scope.closeSettings = function() {
                if ($setsDialog.hasClass('show')){
                    $setsDialog.removeClass('show');
                    $gear.removeClass('active');
                }
            };

            $scope.locateSettingsPopup = function(e){
                if (!e || e.type === 'resize' && $setsDialog.hasClass('show')){
                    var gearRect = $gear[0].getBoundingClientRect();

                    $setsDialog.css({
                        left: gearRect.left + gearRect.width / 2 - dialogPopup.offsetLeft - setsDialogWidth + pointerRight + pointerHalfWidth,
                        top: gearRect.top + gearRect.height + pointerHeight + - dialogPopup.offsetTop + 5
                    });
                }
            };

            $scope.sendSettings = function(buttonType){
                biService.sendBiEvent('ORGIMAGES_USER_SETS_' + buttonType);
                sendUserSetsChangedBI();
                transportService.sendUserSets();
                $scope.closeSettings();

                if (transportService.forceUserSettings){
                    transportService.forceUserSettings = false;
                    $scope.settingsText = 'Organize_Images_Dialog_Sets_Button_Set';
                    mediaGalleryService.openMediaGallery('add', 'multiple');
                }
            };

            $scope.showOverlay = function(overlayClass){
                $scope.overlayClass = overlayClass;
                $scope.overlay = true;
            };

            $scope.hideOverlay = function(){
                $scope.overlay = false;
            };

            transportService.pms.on('close', function(){
                // this is called if ESC event occurs outside the dialog
                // and it forces it to trigger in the dialog's iFrame
                window.focus();
            });

            transportService.pms.on('setup', function(){
                var p;
                var userSetsOptions = $scope.userSetsOptions;

                for (p in userSetsOptions){
                    if (userSetsOptions.hasOwnProperty(p)){
                        var optList = userSetsOptions[p];

                        optList.forEach(function(option){
                            option.label = translationService.translate(option.label);
                        });
                    }
                }
            });

            mediaGalleryService.pms.on('load', function(){
                $timeout(function(){
                    $scope.showOverlay('spinner');
                }, 0);
            });

            mediaGalleryService.pms.on('loaded, closed', function(){
                $timeout($scope.hideOverlay, 0);
            });
        },

        link: function($scope, $element){
            var $gear = $element.find('i.settings');
            var $setsDialog = $element.find('.settings-dialog');
            var $overlay = $element.find('.overlay');

            function stopPropagation(e){
                e.stopPropagation();
            }

            $window.$win.on('resize', $scope.locateSettingsPopup);
            $overlay.on('click', stopPropagation);
            $gear.on('click', stopPropagation);
            $setsDialog.on('click', stopPropagation);

            $document.on('click', function(){
                $scope.closeSettings();
            });

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
                
                if (keyCode === 13 && $scope.confirm){ // enter
                    $scope.$apply(function(){
                        $scope.confirm.callback();
                    });
                }
            });
        }
    };
}]);