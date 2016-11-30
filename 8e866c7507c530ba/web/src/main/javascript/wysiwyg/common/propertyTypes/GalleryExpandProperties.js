define.dataSchema('GalleryExpandProperties', {
    'expandEnabled': {
        "type": "boolean",
        "default": true
    },
    //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:35 IST 2012
    goToLinkText: { "type": "string", "default": "Go to link"},
    galleryImageOnClickAction: { "type": "string", "default": "unset", 'enum': ["disabled", "zoomMode", "goToLink"] }
});