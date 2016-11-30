W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    angular.module('propertyPanel')
        .config(function (propertyPanelNavigationProvider) {
            propertyPanelNavigationProvider.registerPropertyPanel('tpa.viewer.components.Thumbnails', '/propertypanel/panels/thumbnailsgallerypanel/ThumbnailsGalleryPanelView.html');
        }).controller("WThumbnailGalleryController", ThumbnailGalleryController);

    //@ngInject
    function ThumbnailGalleryController(editorResources, editorComponent) {
        // TODO NMO 7/22/14 11:38 AM - When this panel will be merged into the master, the path below should probably change.
        var bgRelativeBase = "/images/wysiwyg/core/themes/editor_web/radiobuttons/";
        var buttonsUrl = editorResources.topology.skins + bgRelativeBase;
        this.thumbnailsProportionsButtonData = _createThumbnailsProportionsButtonGroupData(buttonsUrl);

        this.alignmentButtonsData = _createAlignmentButtonGroupData(buttonsUrl);

        var styleData = editorComponent.getEditedComponent().getStyle();

        this.titleColor = _createColorDirectiveData(styleData, "color1");
        this.descriptionColor = _createColorDirectiveData(styleData, "color2");
        this.bgColor = _createColorDirectiveData(styleData, "color3");

        this.imageScalingOptions = _createImageScalingOptions();
        this.transitionOptions = _createTransitionOptions();

        this.thumbsPositionOptions = _createThumbnailsPositionOptions();

        this.onImageClickedOptions = _createOnImageClickOptions();

        this.fontOptions = _createFontOptions();

        this.textModeOptions = _createTextModeOptions();

        function _createTextModeOptions() {
            return [
                {"label": "System.textMode.titleAndDescription", "value": "titleAndDescription"},
                {"label": "System.textMode.titleOnly", "value": "titleOnly"},
                {"label": "System.textMode.descriptionOnly", "value": "descriptionOnly"},
                {"label": "System.textMode.noText", "value": "noText"}
            ];
        }

        function _createFontOptions() {
            return [
                {"label": "System.font.arial", "value": "arial"},
                {"label": "System.font.arialBlack", "value": "arialBlack"},
                {"label": "System.font.comicSansMS", "value": "comicSansMS"},
                {"label": "System.font.courierNew", "value": "courierNew"},
                {"label": "System.font.georgia", "value": "georgia"},
                {"label": "System.font.impact", "value": "impact"},
                {"label": "System.font.lucidaConsole", "value": "lucidaConsole"},
                {"label": "System.font.lucidaSansConsole", "value": "lucidaSansConsole"},
                {"label": "System.font.palatinoLinotype", "value": "palatinoLinotype"},
                {"label": "System.font.tahoma", "value": "tahoma"},
                {"label": "System.font.timesNewRoman", "value": "timesNewRoman"},
                {"label": "System.font.verdana", "value": "verdana"}
            ];
        }

        function _createOnImageClickOptions() {
            return [
                {"label": "Types.MatrixGalleryProperties.galleryImageOnClickAction.disabled", "value": "disabled"},
                {"label": "Types.MatrixGalleryProperties.galleryImageOnClickAction.goToLink", "value": "goToLink"},
                {"label": "Types.MatrixGalleryProperties.galleryImageOnClickAction.zoomMode", "value": "zoomMode"}
            ];
        }

        function _createImageScalingOptions() {
            return [
                {"value": "crop", "label": "Types.WPhotoProperties.displayMode.fill"},
                {"value": "fit", "label": "Types.WPhotoProperties.displayMode.fitWidth"}
            ];
        }

        function _createTransitionOptions() {
            return [
                {"label": "None", "value": "none"},
                {"label": "Cross Fade", "value": "crossFade"},
                {"label": "Slide horizontal", "value": "slide"},
                {"label": "Slide vertical", "value": "scroll"},
                {"label": "Zoom", "value": "zoom"},
                {"label": "Random", "value": "random"}
            ];
        }

        function _createColorDirectiveData(styleData, propertyName) {
            return {
                "styleData": styleData,
                "propertyName": propertyName
            };
        }

        function _createAlignmentButtonGroupData(buttonsUrl) {
            var radioButtonsBgs = _createBgImagesForRadioButtons(buttonsUrl, "0px", "-66px", "-33px");
            var leftAlign = _.cloneDeep(radioButtonsBgs);
            var centerAlign = _.cloneDeep(radioButtonsBgs);
            var rightAlign = _.cloneDeep(radioButtonsBgs);

            _setImgToBgImages(buttonsUrl, leftAlign, "alignment/left.png");
            _setImgToBgImages(buttonsUrl, centerAlign, "alignment/center.png");
            _setImgToBgImages(buttonsUrl, rightAlign, "alignment/right.png");

            return [
                {"imageCss": leftAlign, "value": "left"},
                {"imageCss": centerAlign, "value": "center"},
                {"imageCss": rightAlign, "value": "right"}
            ];
        }

        function _createThumbnailsProportionsButtonGroupData(buttonsUrl) {
            var imagesCss = _createBgImagesForRadioButtons(buttonsUrl + "aspRatio/", "0px", "-103px", "-50px");
            var images169 = _.cloneDeep(imagesCss);
            _setImgToBgImages(buttonsUrl, images169, "aspRatio/16-9.png");
            var images43 = _.cloneDeep(imagesCss);
            _setImgToBgImages(buttonsUrl, images43, "aspRatio/4-3.png");
            var images11 = _.cloneDeep(imagesCss);
            _setImgToBgImages(buttonsUrl, images11, "aspRatio/1-1.png");

            return [
                {"imageCss": images169, "value": "16:9"},
                {"imageCss": images43, "value": "4:3"},
                {"imageCss": images11, "value": "1:1"}
            ];
        }

        function _createBgImagesForRadioButtons(buttonsUrl, uncheckedYPos, checkedYPos, onHoverYPos) {
            var buttonsBgUrl = buttonsUrl + "radio_button_states.png";
            buttonsBgUrl = "'" + buttonsBgUrl + "'";

            return {
                unchecked: "url(" + buttonsBgUrl + ") 0px " + uncheckedYPos + " no-repeat",
                checked: "url(" + buttonsBgUrl + ") 0px " + checkedYPos + " no-repeat",
                onHover: "url(" + buttonsBgUrl + ") 0px " + onHoverYPos + " no-repeat"
            };
        }

        function _setImgToBgImages(buttonsUrl, images, imgName) {
            var imgPath = "'" + buttonsUrl + imgName + "'";
            images.unchecked = "url(" + imgPath + ")" + "," + images.unchecked;
            images.checked = "url(" + imgPath + ")" + "," + images.checked;
            images.onHover = "url(" + imgPath + ")" + "," + images.onHover;
        }

        function _createThumbnailsPositionOptions() {
            return [
                {"label": "Top", "value": "top"},
                {"label": "Bottom", "value": "bottom"},
                {"label": "Left", "value": "left"},
                {"label": "Right", "value": "right"}
            ];
        }
    }
});
