define.dataSchema('MatrixGalleryProperties', {
    'extends' : "GalleryExpandProperties",
    imageMode: { "type": "string", "default": "clipImage", 'enum': ["clipImage", "flexibleWidthFixed"] },
    numCols:   { "type": "number", "default": 3, "description":"Number of columns", 'minimum': 1, 'maximum': 10 },
    maxRows:   { "type": "number", "default": 3, "description":"Maximum number of rows" , 'minimum': 1, 'maximum': 10 },
    incRows:   { "type": "number", "default": 2, "description":"Row number increase" , 'minimum': 1, 'maximum': 10 },
    margin:    { "type": "number", "default": 15, "description":"Margin around each item" , 'minimum': 0, 'maximum': 250 },
   alignText: { "type": "string",  "default": "left", 'enum': ["left", "center", "right"] },
   showMoreLabel : {'type': 'string','default' : 'Show More','description': 'Show More'}
});
