/**
 * Created by IntelliJ IDEA.
 * User: amit.kaspi
 * Date: 3/24/14
 */
define.utils('ComponentIcon', function(){

    return ({
        getIconProperties: function(comp) {
            var spriteOffset = { x: 0, y: 0 },
                iconSrc,
                iconSize = { width: 22, height: 22, x: 22, y: 22 };

            var componentCommands = W.Editor.getComponentMetaData(comp) || { };
            if (componentCommands.mobile && componentCommands.mobile.previewImageDataRefField) {
                iconSrc = this._getImageSrc(componentCommands.mobile.previewImageDataRefField, comp, iconSize);
            } else {
                iconSrc = this._iconsMapData['src'];
                spriteOffset = this._getSpriteOffsetFromMap(comp.$className);
            }

            return {
                iconSrc: iconSrc,
                iconSize: iconSize,
                spriteOffset: spriteOffset
            };
        },
        _getSpriteOffsetFromMap: function(compClassName) {
            var offsets = this._iconsMapData['spriteOffsets'];
            return (compClassName in offsets) ? offsets[compClassName] : offsets['default'];
        },
        _getImageSrc: function(ref, comp, iconSize){
            var originalSize, uri, imageData, imageRef, src;
            var viewerDataManager = W.Preview.getPreviewManagers().Data;
            var imageSrcBuilder = new (W.Classes.getClass('core.components.image.ImageUrlNew'))();

            if (ref === '*'){
                imageData = comp.getDataItem();
            } else {
                imageRef = comp.getDataItem().get(ref);
                imageData = viewerDataManager.getDataByQuery(imageRef);
            }

            if (imageData && imageData.get('type') === 'ImageList'){
                imageRef = imageData.get('items')[0];
                imageData = viewerDataManager.getDataByQuery(imageRef);

            } else if (!imageData || imageData.get('type') !== 'Image'){
                throw new Error('item is not of type Image');
            }

            uri = imageData.get('uri');
            originalSize = {x: imageData.get('width'), y: imageData.get('height')};
            src = imageSrcBuilder.getImageUrlExactSize(iconSize, uri, originalSize);

            return src;
        },
        _iconsMapData: {
            src: 'mobile/hidden_elements_icons_sprite.png',
            spriteOffsets: {
                'default'                                       : {x: 0, y: 0},
                'wysiwyg.viewer.components.WRichText'           : {x: 0, y: -23},
                'wysiwyg.viewer.components.WPhoto'              : {x: -30, y: 0},
                'wysiwyg.viewer.components.MatrixGallery'       : {x: -60, y: 0},
                'wysiwyg.viewer.components.SlideShowGallery'    : {x: -60, y: 0},
                'wysiwyg.viewer.components.SliderGallery'       : {x: -60, y: 0},
                'wysiwyg.viewer.components.PaginatedGridGallery': {x: -60, y: 0},
                'wysiwyg.viewer.components.Video'               : {x: -90, y: 0},
                'wysiwyg.viewer.components.SoundCloudWidget'    : {x: -90, y: -23},
                'wysiwyg.viewer.components.AudioPlayer'         : {x: -90, y: -23},
                'wysiwyg.viewer.components.ClipArt'             : {x: -120, y: 0},
                'core.components.Container'                     : {x: -120, y: -23},
                'wysiwyg.viewer.components.ScreenWidthContainer': {x: -120, y: -46},
                'wysiwyg.viewer.components.BgImageStrip'        : {x: -120, y: -46},
                'wysiwyg.viewer.components.VerticalLine'        : {x: -120, y: -69},
                'wysiwyg.viewer.components.FiveGridLine'        : {x: -120, y: -92},
                'wysiwyg.viewer.components.svgshape.SvgShape'   : {x: -120, y: -115},
                'wysiwyg.viewer.components.SiteButton'          : {x: -150, y: 0},
                'wysiwyg.viewer.components.menus.DropDownMenu'  : {x: -150, y: -23},
                'wysiwyg.viewer.components.HorizontalMenu'      : {x: -150, y: -23},
                'wysiwyg.viewer.components.mobile.TinyMenu'     : {x: -150, y: -23},
                'wysiwyg.viewer.components.WFacebookLike'       : {x: -240, y: 0},
                'wysiwyg.common.components.facebooklikebox.viewer.FacebookLikeBox'       : {x: -240, y: 0},
                'wysiwyg.viewer.components.WFacebookComment'    : {x: -240, y: -23},
                'wysiwyg.viewer.components.FacebookShare'       : {x: -240, y: -23},
                'wysiwyg.viewer.components.WTwitterFollow'      : {x: -240, y: -46},
                'wysiwyg.viewer.components.WTwitterTweet'       : {x: -240, y: -46},
                'wysiwyg.viewer.components.TwitterFeed'         : {x: -240, y: -46},
                'wysiwyg.viewer.components.WGooglePlusOne'      : {x: -240, y: -69},
                'wysiwyg.viewer.components.LinkBar'             : {x: -240, y: -92},
                'tpa.viewer.components.TPASection'              : {x: -270, y: 0},
                'tpa.viewer.components.TPAWidget'               : {x: -270, y: 0},
                'tpa.viewer.components.TPAFixedWidget'          : {x: -270, y: 0},
                'tpa.viewer.components.TPAGallery'              : {x: -270, y: 0},
                'tpa.viewer.components.TPAComponent'            : {x: -270, y: 0},
                'wysiwyg.viewer.components.ContactForm'         : {x: -270, y: -23},
                'wysiwyg.viewer.components.GoogleMap'           : {x: -270, y: -46},
                'wysiwyg.viewer.components.HtmlComponent'       : {x: -270, y: -69},
                'wysiwyg.viewer.components.FlashComponent'      : {x: -270, y: -92},
                'wysiwyg.viewer.components.PayPalButton'        : {x: -270, y: 0},
                'wysiwyg.viewer.components.FlickrBadgeWidget'   : {x: -270, y: 0},
                'wysiwyg.viewer.components.EbayItemsBySeller'   : {x: -270, y: 0},
                'wysiwyg.viewer.components.EbayItemBadge'       : {x: -270, y: 0},
                'wysiwyg.viewer.components.AdminLogin'          : {x: -270, y: -115},
                'wysiwyg.viewer.components.AdminLoginButton'    : {x: -270, y: -115},
                'wysiwyg.viewer.components.LoginButton'         : {x: -270, y: -138},
                'wixapps.integration.components.AppPart'        : {x: -300, y: 0},
                'wixapps.integration.components.AppPart2'       : {x: -300, y: 0},
                'wysiwyg.viewer.components.HeaderContainer'     : {x: -330, y: 0},
                'wysiwyg.viewer.components.FooterContainer'     : {x: -330, y: -23},
                'wysiwyg.viewer.components.PagesContainer'       : {x: -330, y: -46}
            }
        }
    });

});
