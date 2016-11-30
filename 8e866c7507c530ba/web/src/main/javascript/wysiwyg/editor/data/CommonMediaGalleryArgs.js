define.Const('CommonMediaGalleryArgs', {
    'wysiwyg.viewer.components.WPhoto': {
        multiple: {
            galleryConfigID: 'photos',
            publicMediaFile: 'photos',
            selectionType: 'multiple',
            i18nPrefix: 'multiple_images',
            mediaType: 'picture'
        }
    },
    'wysiwyg.viewer.components.ClipArt': {
        multiple: {
            galleryConfigID: 'clipart',
            publicMediaFile: 'clipart',
            i18nPrefix: 'addmultiple_clipart',
            selectionType: 'multiple',
            mediaType: 'picture',
            startingTab: 'free'
        }
    },
    'wysiwyg.viewer.components.documentmedia.DocumentMedia': {
        multiple: {
            galleryConfigID: 'documents',
            publicMediaFile: 'file_icons',
            i18nPrefix: 'addmultiple_document',
            selectionType: 'multiple',
            mediaType: 'document'
        }
    },
    'wysiwyg.viewer.components.svgshape.SvgShape': {
        multiple: {
            publicMediaFile: 'shapes',
            i18nPrefix: 'addmultiple_shape',
            selectionType: 'multiple',
            hasPrivateMedia: false
        }
    },
    'wysiwyg.viewer.components.AudioPlayer': {
        multiple: {
            galleryConfigID: 'audio',
            i18nPrefix: 'addmultiple_music',
            selectionType: 'multiple',
            mediaType: 'music'
        }
    },
    'wysiwyg.viewer.components.SingleAudioPlayer': {
        multiple: {
            galleryConfigID: 'audio',
            i18nPrefix: 'addmultiple_music',
            selectionType: 'multiple',
            mediaType: 'music'
        }
    }
});
