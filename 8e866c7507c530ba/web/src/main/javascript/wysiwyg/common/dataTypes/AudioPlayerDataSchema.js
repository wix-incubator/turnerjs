define.dataSchema("AudioPlayer", {
    'uri':{'type':"string", 'default':""},
    'autoPlay':{'type':"Boolean", 'default':false },
    'loop':{'type':"Boolean", 'default':false },
    'visible':{'type':"Boolean", 'default':true },
    'volume':{'type':"number", 'default':100 },
    'title':{'type':"string", 'default':"" },
    'description':{'type':"string", 'default':"" },
    'icon_uri':{'type':"string", 'default':"" },
    'originalFileName':{'type':"string", 'default':"" }
});

