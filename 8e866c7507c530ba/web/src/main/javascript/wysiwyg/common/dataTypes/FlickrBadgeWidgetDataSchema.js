define.dataSchema('FlickrBadgeWidget', {
    userId: {'type':'string', 'default':'74009459@N07'},
    userName: "string",
    tag: "string",
    imageCount: {'type':'number', 'default':3},
    whichImages: {'type':'string', 'default':'latest'},
    imageSize: {'type':'string', 'default':'t'},
    layoutOrientation: {'type':'string', 'default':'v'}
});