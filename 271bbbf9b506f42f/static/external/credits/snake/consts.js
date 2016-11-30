var DIRECTIONS = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};
var CANVAS_INFO = {
    w: 800,
    h: 400,
    rows: 10,
    cols: 5,
    cellSize: 80
};

var LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    WIXMODE: 'wixMode'
};

var FRAME_INTERVAL = {
    easy: 400,
    medium: 250,
    hard: 100,
    wixMode: 50
};

var IMAGE_NODES = [];
var IMAGE_URLS = [
    {
        "name": "harelig",
        "id": "1436195"
    },
    {
        "name": "barlevalon",
        "id": "3397911"
    },
    {
        "name": "shiranm",
        "id": "7566929"
    },
    {
        "name": "eranam",
        "id": "8150601"
    },
    {
        "name": "danielagreen",
        "id": "8258044"
    },
    {
        "name": "nirmo-wix",
        "id": "8492376"
    },
    {
        "name": "colinwalt",
        "id": "6296040"
    },
    {
        "name": "Odedgefen",
        "id": "7922810"
    },
    {
        "name": "shaikfir",
        "id": "6294693"
    },
    {
        "name": "DanShappir",
        "id": "8604327"
    },
    {
        "name": "itamari",
        "id": "6460251"
    },
    {
        "name": "cariowix",
        "id": "10267900"
    },
    {
        "name": "kfirg-wix",
        "id": "6460284"
    },
    {
        "name": "xxllexx",
        "id": "163389"
    },
    {
        "name": "alissaVrk",
        "id": "1169753"
    },
    {
        "name": "avi",
        "id": "68385"
    },
    {
        "name": "cooperd",
        "id": "3081030"
    },
    {
        "name": "SivanBrezniak",
        "id": "8168961"
    },
    {
        "name": "nickg-wix",
        "id": "6522423"
    },
    {
        "name": "itayshmool",
        "id": "5469589"
    },
    {
        "name": "noomorph",
        "id": "1962469"
    },
    {
        "name": "naorami",
        "id": "11598950"
    },
    {
        "name": "yevhenpavliuk",
        "id": "1070277"
    },
    {
        "name": "roniba",
        "id": "2240888"
    },
    {
        "name": "alexgoncharwix",
        "id": "8125260"
    },
    {
        "name": "guyius",
        "id": "3826157"
    },
    {
        "name": "tomericco",
        "id": "1524181"
    },
    {
        "name": "eliranhe",
        "id": "6069076"
    },
    {
        "name": "ganimomer",
        "id": "8225721"
    },
    {
        "name": "nirnatan",
        "id": "2612799"
    },
    {
        "name": "kobiza",
        "id": "10695544"
    },
    {
        "name": "yanivzz",
        "id": "8342494"
    },
    {
        "name": "dassir",
        "id": "9673701"
    },
    {
        "name": "ohadl",
        "id": "8081102"
    },
    {
        "name": "tomerlichtash",
        "id": "75531"
    },
    {
        "name": "mayaheim",
        "id": "3159300"
    },
    {
        "name": "ihork",
        "id": "9818763"
    },
    {
        "name": "idok",
        "id": "1866543"
    },
    {
        "name": "dor-itzhaki",
        "id": "4141336"
    },
    {
        "name": "shazur",
        "id": "2265384"
    },
    {
        "name": "WixBuildServer",
        "id": "6102858"
    },
    {
        "name": "danyshaanan",
        "id": "1116738"
    },
    {
        "name": "moranw",
        "id": "5261496"
    },
    {
        "name": "tombigel",
        "id": "227922"
    },
    {
        "name": "amitkaufman",
        "id": "6973218"
    },
    {
        "name": "sagic-wix",
        "id": "8124281"
    },
    {
        "name": "lotemh",
        "id": "6919725"
    },
    {
        "name": "yaarams",
        "id": "1456626"
    },
    {
        "name": "trofima",
        "id": "1436182"
    },
    {
        "name": "EtaiG",
        "id": "4152735"
    },
    {
        "name": "idealamz",
        "id": "2202289"
    },
    {
        "name": "noam-si",
        "id": "6296035"
    },
    {
        "name": "yoel-zeldes",
        "id": "9588852"
    },
    {
        "name": "liors",
        "id": "352053"
    },
    {
        "name": "chenelisha",
        "id": "9864241"
    },
    {
        "name": "akaspi",
        "id": "6525513"
    },
    {
        "name": "tmutzafi",
        "id": "6522214"
    },
    {
        "name": "alexandre-roitman",
        "id": "7836789"
    },
    {
        "name": "ShaiLachmanovich",
        "id": "6511758"
    },
    {
        "name": "evgenyboxer",
        "id": "254095"
    },
    {
        "name": "rousso1",
        "id": "1132878"
    },
    {
        "name": "yotamwix",
        "id": "6996748"
    },
    {
        "name": "shimil",
        "id": "6771197"
    },
    {
        "name": "nirmoav",
        "id": "6985486"
    },
    {
        "name": "rommguy",
        "id": "3725593"
    },
    {
        "name": "nadav-dav",
        "id": "3781299"
    },
    {
        "name": "flyingjamus",
        "id": "3799839"
    },
    {
        "name": "antonpod",
        "id": "7899596"
    },
    {
        "name": "technotronic12",
        "id": "5733013"
    },
    {
        "name": "uridato",
        "id": "2773270"
    },
    {
        "name": "andrew-shustariov",
        "id": "8087286"
    },
    {
        "name": "ohana54",
        "id": "3693735"
    },
    {
        "name": "idanush",
        "id": "806791"
    },
    {
        "name": "LeoniJ",
        "id": "8114124"
    },
    {
        "name": "dimarwix",
        "id": "8168970"
    },
    {
        "name": "leerons",
        "id": "485525"
    },
    {
        "name": "galiak",
        "id": "6522432"
    }
];


/*
 _.unique(_.map(a, function (b) {
    return {
        name: b.author.login,
        id: b.author.avatar.replace(/https:\/\/avatars\d\.githubusercontent\.com\/u\//, '').replace('?v=3&s=60', '')
    }
}), 'id');*/
