define(['lodash', 'experiment'], function (_, experiment) {
    'use strict';

    var newCyrillicFontsExp = experiment.isOpen('newCyrillicFonts');

    var fonts = {
        "anton": {
            "displayName": "Anton",
            "fontFamily": "anton",
            "cdnName": "Anton",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 0
        },
        "arial": {
            "displayName": "Arial",
            "fontFamily": "arial",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic",
                "hebrew",
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "ｍｓ ｐゴシック,ms pgothic,돋움,dotum,helvetica",
            "spriteIndex": 2
        },
        "courier new": {
            "displayName": "Courier New",
            "fontFamily": "courier new",
            "cdnName": "",
            "genericFamily": "monospace",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic",
                "hebrew",
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "courier-ps-w01,courier-ps-w02,courier-ps-w10",
            "spriteIndex": 7
        },
        "arial black": {
            "displayName": "Arial Black",
            "fontFamily": "arial black",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "arial-w01-black,arial-w02-black,arial-w10 black",
            "spriteIndex": 12
        },
        "basic": {
            "displayName": "Basic",
            "fontFamily": "basic",
            "cdnName": "Basic",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 15
        },
        "caudex": {
            "displayName": "Caudex",
            "fontFamily": "caudex",
            "cdnName": "Caudex",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 17
        },
        "chelsea market": {
            "displayName": "Chelsea Market",
            "fontFamily": "chelsea market",
            "cdnName": "Chelsea+Market",
            "genericFamily": "fantasy",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 19
        },
        "comic sans ms": {
            "displayName": "Comic Sans MS",
            "fontFamily": "comic sans ms",
            "cdnName": "",
            "genericFamily": "cursive",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "comic-sans-w01-regular,comic-sans-w02-regular,comic-sans-w10-regular",
            "spriteIndex": 20
        },
        "corben": {
            "displayName": "Corben",
            "fontFamily": "corben",
            "cdnName": "Corben",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 23
        },
        "eb garamond": {
            "displayName": "EB Garamond",
            "fontFamily": "eb garamond",
            "cdnName": "EB+Garamond",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 24
        },
        "enriqueta": {
            "displayName": "Enriqueta",
            "fontFamily": "enriqueta",
            "cdnName": "Enriqueta",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 27
        },
        "forum": {
            "displayName": "Forum",
            "fontFamily": "forum",
            "cdnName": "Forum",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 29
        },
        "fredericka the great": {
            "displayName": "Fredericka the Great",
            "fontFamily": "fredericka the great",
            "cdnName": "Fredericka+the+Great",
            "genericFamily": "fantasy",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 32
        },
        "georgia": {
            "displayName": "Georgia",
            "fontFamily": "georgia",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "palatino,book antiqua,palatino linotype",
            "spriteIndex": 33
        },
        "impact": {
            "displayName": "Impact",
            "fontFamily": "impact",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "impact-w01-2010,impact-w02-2010,impact-w10-2010",
            "spriteIndex": 36
        },
        "jockey one": {
            "displayName": "Jockey One",
            "fontFamily": "jockey one",
            "cdnName": "Jockey+One",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 39
        },
        "josefin slab": {
            "displayName": "Josefin Slab",
            "fontFamily": "josefin slab",
            "cdnName": "Josefin+Slab",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 41
        },
        "jura": {
            "displayName": "Jura",
            "fontFamily": "jura",
            "cdnName": "Jura",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 42
        },
        "kelly slab": {
            "displayName": "Kelly Slab",
            "fontFamily": "kelly slab",
            "cdnName": "Kelly+Slab",
            "genericFamily": "fantasy",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 45
        },
        "lucida console": {
            "displayName": "Lucida Console",
            "fontFamily": "lucida console",
            "cdnName": "",
            "genericFamily": "monospace",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "lucida-console-w01",
            "spriteIndex": 48
        },
        "lucida sans unicode": {
            "displayName": "Lucida Sans Unicode",
            "fontFamily": "lucida sans unicode",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "lucida grande",
            "spriteIndex": 50
        },
        "marck script": {
            "displayName": "Marck Script",
            "fontFamily": "marck script",
            "cdnName": "Marck+Script",
            "genericFamily": "cursive",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 51
        },
        "lobster": {
            "displayName": "Lobster",
            "fontFamily": "lobster",
            "cdnName": "Lobster",
            "genericFamily": "cursive",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 54
        },
        "mr de haviland": {
            "displayName": "Mr De Haviland",
            "fontFamily": "mr de haviland",
            "cdnName": "Mr+De+Haviland",
            "genericFamily": "cursive",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 57
        },
        "niconne": {
            "displayName": "Niconne",
            "fontFamily": "niconne",
            "cdnName": "Niconne",
            "genericFamily": "fantasy",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 58
        },
        "noticia text": {
            "displayName": "Noticia Text",
            "fontFamily": "noticia text",
            "cdnName": "Noticia+Text",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 59
        },
        "open sans": {
            "displayName": "Open Sans",
            "fontFamily": "open sans",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 61
        },
        "overlock": {
            "displayName": "Overlock",
            "fontFamily": "overlock",
            "cdnName": "Overlock",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 64
        },
        "palatino linotype": {
            "displayName": "Palatino Linotype",
            "fontFamily": "palatino linotype",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 65
        },
        "patrick hand": {
            "displayName": "Patrick Hand",
            "fontFamily": "patrick hand",
            "cdnName": "Patrick+Hand",
            "genericFamily": "cursive",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 67
        },
        "play": {
            "displayName": "Play",
            "fontFamily": "play",
            "cdnName": "Play",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 69
        },
        "sarina": {
            "displayName": "Sarina",
            "fontFamily": "sarina",
            "cdnName": "Sarina",
            "genericFamily": "cursive",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 72
        },
        "signika": {
            "displayName": "Signika",
            "fontFamily": "signika",
            "cdnName": "Signika",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 74
        },
        "spinnaker": {
            "displayName": "Spinnaker",
            "fontFamily": "spinnaker",
            "cdnName": "Spinnaker",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 76
        },
        "tahoma": {
            "displayName": "Tahoma",
            "fontFamily": "tahoma",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "hebrew",
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "tahoma-w01-regular,tahoma-w02-regular,tahoma-w10-regular,tahoma-w15--regular,tahoma-w99-regular",
            "spriteIndex": 77
        },
        "times new roman": {
            "displayName": "Times New Roman",
            "fontFamily": "times new roman",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic",
                "hebrew",
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "times",
            "spriteIndex": 81
        },
        "verdana": {
            "displayName": "Verdana",
            "fontFamily": "verdana",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "geneva",
            "spriteIndex": 86
        },
        "helveticaneuew01-45ligh": {
            "displayName": "Helvetica 45",
            "fontFamily": "helveticaneuew01-45ligh",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 89
        },
        "helveticaneuew01-65medi": {
            "displayName": "Helvetica 65",
            "fontFamily": "helveticaneuew01-65medi",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 90
        },
        "helveticaneuew01-75bold": {
            "displayName": "Helvetica 75",
            "fontFamily": "helveticaneuew01-75bold",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 91
        },
        "helveticaneuew01-95blac": {
            "displayName": "Helvetica 95",
            "fontFamily": "helveticaneuew01-95blac",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 92
        },
        "helveticaneuew01-thin": {
            "displayName": "Helvetica 35",
            "fontFamily": "helveticaneuew01-thin",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 93
        },
        "helveticaneuew01-ultlt": {
            "displayName": "Helvetica 25",
            "fontFamily": "helveticaneuew01-ultlt",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 94
        },
        "helveticaneuew02-45ligh": {
            "displayName": "Helvetica 45 Latin Ext",
            "fontFamily": "helveticaneuew02-45ligh",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin-ext"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 95
        },
        "helveticaneuew02-65medi": {
            "displayName": "Helvetica 65 Latin Ext",
            "fontFamily": "helveticaneuew02-65medi",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin-ext"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 96
        },
        "helveticaneuew02-75bold": {
            "displayName": "Helvetica 75 Latin Ext",
            "fontFamily": "helveticaneuew02-75bold",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin-ext"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 97
        },
        "helveticaneuew02-95blac": {
            "displayName": "Helvetica 95 Latin Ext",
            "fontFamily": "helveticaneuew02-95blac",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin-ext"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 98
        },
        "helveticaneuew02-thin": {
            "displayName": "Helvetica 35 Latin Ext",
            "fontFamily": "helveticaneuew02-thin",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin-ext"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 99
        },
        "helveticaneuew02-ultlt": {
            "displayName": "Helvetica 25 Latin Ext",
            "fontFamily": "helveticaneuew02-ultlt",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin-ext"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 100
        },
        "helveticaneuew10-45ligh": {
            "displayName": "Helvetica 45 Cyrillic",
            "fontFamily": "helveticaneuew10-45ligh",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "cyrillic"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 101
        },
        "helveticaneuew10-65medi": {
            "displayName": "Helvetica 65 Cyrillic",
            "fontFamily": "helveticaneuew10-65medi",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "cyrillic"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 102
        },
        "helveticaneuew10-75bold": {
            "displayName": "Helvetica 75 Cyrillic",
            "fontFamily": "helveticaneuew10-75bold",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "cyrillic"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 103
        },
        "helveticaneuew10-95blac": {
            "displayName": "Helvetica 95 Cyrillic",
            "fontFamily": "helveticaneuew10-95blac",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "cyrillic"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 104
        },
        "helveticaneuew10-35thin": {
            "displayName": "Helvetica 35 Cyrillic",
            "fontFamily": "helveticaneuew10-35thin",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "cyrillic"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 105
        },
        "helveticaneuew10-25ultl": {
            "displayName": "Helvetica 25 Cyrillic",
            "fontFamily": "helveticaneuew10-25ultl",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "cyrillic"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 106
        },
        "meiryo": {
            "displayName": "Meiryo",
            "fontFamily": "meiryo",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "japanese"
            ],
            "permissions": "legacy",
            "fallbacks": ""
        },
        "segoe_printregular": {
            "displayName": "Segoe Print",
            "fontFamily": "segoe_printregular",
            "cdnName": "",
            "genericFamily": "cursive",
            "provider": "open source",
            "characterSets": [
                "latin"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 107
        },
        "bodoni-w01-poster": {
            "displayName": "Bodoni Poster",
            "fontFamily": "bodoni-w01-poster",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "bodoni-poster-w10",
            "spriteIndex": 108
        },
        "stencil-w01-bold": {
            "displayName": "Stencil",
            "fontFamily": "stencil-w01-bold",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 110
        },
        "itc-arecibo-w01-regular": {
            "displayName": "ITC Arecibo",
            "fontFamily": "itc-arecibo-w01-regular",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 111
        },
        "avenida-w01": {
            "displayName": "Avenida",
            "fontFamily": "avenida-w01",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "avenida-w02",
            "spriteIndex": 112
        },
        "pacifica-w00-condensed": {
            "displayName": "Pacifica Condensed",
            "fontFamily": "pacifica-w00-condensed",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 114
        },
        "geotica-w01-four-open": {
            "displayName": "Geotica Four Open",
            "fontFamily": "geotica-w01-four-open",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 115
        },
        "marzo-w00-regular": {
            "displayName": "Marzo",
            "fontFamily": "marzo-w00-regular",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 116
        },
        "braggadocio-w01": {
            "displayName": "Braggadocio",
            "fontFamily": "braggadocio-w01",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 117
        },
        "reklamescriptw00-medium": {
            "displayName": "Reklame Script",
            "fontFamily": "reklamescriptw00-medium",
            "cdnName": "",
            "genericFamily": "cursive",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 118
        },
        "snellroundhandw01-scrip": {
            "displayName": "Snell Roundhand",
            "fontFamily": "snellroundhandw01-scrip",
            "cdnName": "",
            "genericFamily": "cursive",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 120
        },
        "din-next-w01-light": {
            "displayName": "DIN Next Light",
            "fontFamily": "din-next-w01-light",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "din-next-w02-light,din-next-w10-light",
            "spriteIndex": 121
        },
        "helvetica-w01-roman": {
            "displayName": "Helvetica",
            "fontFamily": "helvetica-w01-roman",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "helvetica-w02-roman,helvetica-lt-w10-roman",
            "spriteIndex": 124
        },
        "helvetica-w01-light": {
            "displayName": "Helvetica Light",
            "fontFamily": "helvetica-w01-light",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "helvetica-w02-light",
            "spriteIndex": 127
        },
        "helvetica-w01-bold": {
            "displayName": "Helvetica Bold",
            "fontFamily": "helvetica-w01-bold",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "helvetica-w02-bold,helvetica-lt-w10-bold",
            "spriteIndex": 129
        },
        "nimbus-sans-tw01con": {
            "displayName": "Nimbus Sans",
            "fontFamily": "nimbus-sans-tw01con",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 132
        },
        "soho-w01-thin-condensed": {
            "displayName": "Soho Condensed",
            "fontFamily": "soho-w01-thin-condensed",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "soho-w02-thin-condensed",
            "spriteIndex": 133
        },
        "droid-serif-w01-regular": {
            "displayName": "Droid Serif",
            "fontFamily": "droid-serif-w01-regular",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "droid-serif-w02-regular,droid-serif-w10-regular",
            "spriteIndex": 135
        },
        "clarendon-w01-medium-692107": {
            "displayName": "Clarendon LT",
            "fontFamily": "clarendon-w01-medium-692107",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "clarendon-w02-medium-693834",
            "spriteIndex": 138
        },
        "museo-w01-700": {
            "displayName": "Museo",
            "fontFamily": "museo-w01-700",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 140
        },
        "museo-slab-w01-100": {
            "displayName": "Museo Slab",
            "fontFamily": "museo-slab-w01-100",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 141
        },
        "americantypwrteritcw01--731025": {
            "displayName": "American Typewriter",
            "fontFamily": "americantypwrteritcw01--731025",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "americantypwrteritcw02--737091",
            "spriteIndex": 142
        },
        "monoton": {
            "displayName": "Monoton",
            "fontFamily": "monoton",
            "cdnName": "Monoton",
            "genericFamily": "fantasy",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 144
        },
        "sacramento": {
            "displayName": "Sacramento",
            "fontFamily": "sacramento",
            "cdnName": "Sacramento",
            "genericFamily": "cursive",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 146
        },
        "cookie": {
            "displayName": "Cookie",
            "fontFamily": "cookie",
            "cdnName": "Cookie",
            "genericFamily": "cursive",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 148
        },
        "raleway": {
            "displayName": "Raleway",
            "fontFamily": "raleway",
            "cdnName": "Raleway",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 150
        },
        "open sans condensed": {
            "displayName": "Open Sans Condensed",
            "fontFamily": "open sans condensed",
            "cdnName": "Open+Sans+Condensed:300",
            "genericFamily": "sans-serif",
            "provider": "google",
            "characterSets": [
                "latin",
                "latin-ext",
                "cyrillic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 151
        },
        "amatic sc": {
            "displayName": "Amatic SC",
            "fontFamily": "amatic sc",
            "cdnName": "Amatic+SC",
            "genericFamily": "cursive",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 154
        },
        "coquette-w00-light": {
            "displayName": "Coquette",
            "fontFamily": "coquette-w00-light",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin",
                "latin-ext"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 155
        },
        "rosewood-w01-regular": {
            "displayName": "Rosewood",
            "fontFamily": "rosewood-w01-regular",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 157
        },
        "helvetica neue": {
            "displayName": "Helvetica Neue",
            "fontFamily": "helvetica neue",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "legacy",
            "fallbacks": ""
        },
        "helvetica neue italic": {
            "displayName": "Helvetica Neue Italic",
            "fontFamily": "helvetica neue italic",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "legacy",
            "fallbacks": ""
        },
        "helvetica neue thin": {
            "displayName": "Helvetica Neue Thin",
            "fontFamily": "helvetica neue thin",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "legacy",
            "fallbacks": ""
        },
        "helvetica neue medium": {
            "displayName": "Helvetica Neue Medium",
            "fontFamily": "helvetica neue medium",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "legacy",
            "fallbacks": ""
        },
        "frank-ruhl-w26-regular": {
            "displayName": "Frank Ruhl",
            "fontFamily": "frank-ruhl-w26-regular",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 158
        },
        "alef-regular": {
            "displayName": "Alef",
            "fontFamily": "alef-regular",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 159
        },
        "miriam-w26-medium": {
            "displayName": "Miriam",
            "fontFamily": "miriam-w26-medium",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 160
        },
        "adler-w26-regular": {
            "displayName": "Adler",
            "fontFamily": "adler-w26-regular",
            "cdnName": "",
            "genericFamily": "cursive",
            "provider": "monotype",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 161
        },
        "haim-arukeem-w26-medium": {
            "displayName": "Longlife",
            "fontFamily": "haim-arukeem-w26-medium",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 162
        },
        "shabazi-w26-bold": {
            "displayName": "Shabazi Bold",
            "fontFamily": "shabazi-w26-bold",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 163
        },
        "gulash-w26-regular": {
            "displayName": "Gulash",
            "fontFamily": "gulash-w26-regular",
            "cdnName": "",
            "genericFamily": "cursive",
            "provider": "monotype",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 164
        },
        "chips-w26-normal": {
            "displayName": "Chips",
            "fontFamily": "chips-w26-normal",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 165
        },
        "nekudot-w26-bold": {
            "displayName": "Nekudot Bold",
            "fontFamily": "nekudot-w26-bold",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 166
        },
        "opensanshebrewcondensed-regular": {
            "displayName": "Open Sans Condensed",
            "fontFamily": "opensanshebrewcondensed-regular",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 167
        },
        "asimon-aaa-400": {
            "displayName": "Asimon",
            "fontFamily": "asimon-aaa-400",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 168
        },
        "atlas-aaa-500": {
            "displayName": "Atlas",
            "fontFamily": "atlas-aaa-500",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 169
        },
        "omes-aaa-400": {
            "displayName": "Omes",
            "fontFamily": "omes-aaa-400",
            "cdnName": "",
            "genericFamily": "cursive",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 170
        },
        "almoni-dl-aaa-300": {
            "displayName": "Almoni DL Light",
            "fontFamily": "almoni-dl-aaa-300",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 171
        },
        "almoni-dl-aaa-400": {
            "displayName": "Almoni DL Regular",
            "fontFamily": "almoni-dl-aaa-400",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 172
        },
        "almoni-dl-aaa-700": {
            "displayName": "Almoni DL Bold",
            "fontFamily": "almoni-dl-aaa-700",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 173
        },
        "mixtape-aaa-400": {
            "displayName": "Mixtape",
            "fontFamily": "mixtape-aaa-400",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 174
        },
        "museum-aaa-400": {
            "displayName": "Museum",
            "fontFamily": "museum-aaa-400",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 175
        },
        "meodedpashut-oeregular": {
            "displayName": "Meoded",
            "fontFamily": "meodedpashut-oeregular",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "hebrew"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 176
        },
        "arabictypesettingw23-re": {
            "displayName": "Arabic Typesetting Regular",
            "fontFamily": "arabictypesettingw23-re",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 177
        },
        "midan-w20": {
            "displayName": "Midan",
            "fontFamily": "midan-w20",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 178
        },
        "arian-lt-w20-light": {
            "displayName": "Arian Light",
            "fontFamily": "arian-lt-w20-light",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 179
        },
        "arian-lt-w20-regular": {
            "displayName": "Arian",
            "fontFamily": "arian-lt-w20-regular",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 180
        },
        "coheadlinew23-arabicbol": {
            "displayName": "Co Headline Arabic Bold",
            "fontFamily": "coheadlinew23-arabicbol",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "legacy",
            "fallbacks": ""
        },
        "janna-lt-w20-regular": {
            "displayName": "Janna",
            "fontFamily": "janna-lt-w20-regular",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 181
        },
        "helveticaneueltw20-ligh": {
            "displayName": "Neue Helvetica Arabic",
            "fontFamily": "helveticaneueltw20-ligh",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 182
        },
        "dinnextltw23-ultralight": {
            "displayName": "DIN Next Arabic",
            "fontFamily": "dinnextltw23-ultralight",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 183
        },
        "tanseekmodernw20-light": {
            "displayName": "Tanseek Modern Light",
            "fontFamily": "tanseekmodernw20-light",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 184
        },
        "ahmedltw20-outlineregul": {
            "displayName": "Ahmed Outline",
            "fontFamily": "ahmedltw20-outlineregul",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 185
        },
        "kufi-lt-w20-regular": {
            "displayName": "Kufi Regular",
            "fontFamily": "kufi-lt-w20-regular",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 186
        },
        "amiri": {
            "displayName": "Amiri",
            "fontFamily": "amiri",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "open source",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 187
        },
        "droid-naskh": {
            "displayName": "Droid Naskh",
            "fontFamily": "droid-naskh",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "open source",
            "characterSets": [
                "arabic"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 188
        },
        "ｍｓ ゴシック": {
            "displayName": "MS Gothic",
            "fontFamily": "ｍｓ ゴシック",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "japanese"
            ],
            "permissions": "all",
            "fallbacks": "ms gothic,ヒラギノ角ゴ pro w3,hiragino kaku gothic pro,osaka",
            "spriteIndex": 189
        },
        "ｍｓ 明朝": {
            "displayName": "MS Mincho",
            "fontFamily": "ｍｓ 明朝",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "system",
            "characterSets": [
                "japanese"
            ],
            "permissions": "all",
            "fallbacks": "ms mincho,ヒラギノ明朝 pro w3,hiragino mincho pro",
            "spriteIndex": 190
        },
        "ｍｓ ｐゴシック": {
            "displayName": "MS PGothic",
            "fontFamily": "ｍｓ ｐゴシック",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "japanese"
            ],
            "permissions": "all",
            "fallbacks": "ms pgothic,ヒラギノ角ゴ pro w3,hiragino kaku gothic pro,osaka",
            "spriteIndex": 191
        },
        "ｍｓ ｐ明朝": {
            "displayName": "MS PMincho",
            "fontFamily": "ｍｓ ｐ明朝",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "system",
            "characterSets": [
                "japanese"
            ],
            "permissions": "all",
            "fallbacks": "ms pmincho,ヒラギノ明朝 pro w3,hiragino mincho pro",
            "spriteIndex": 192
        },
        "メイリオ": {
            "displayName": "Meiryo",
            "fontFamily": "メイリオ",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "japanese"
            ],
            "permissions": "all",
            "fallbacks": "meiryo,ヒラギノ角ゴ pro w3,hiragino kaku gothic pro",
            "spriteIndex": 193
        },
        "맑은 고딕": {
            "displayName": "Malgun Gothic",
            "fontFamily": "맑은 고딕",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "malgun gothic,apple sd gothic neo,applegothic",
            "spriteIndex": 194
        },
        "돋움": {
            "displayName": "Dotum",
            "fontFamily": "돋움",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "dotum,apple sd gothic neo,applegothic",
            "spriteIndex": 195
        },
        "굴림": {
            "displayName": "Gulim",
            "fontFamily": "굴림",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "system",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "gulim,apple sd gothic neo,applegothic",
            "spriteIndex": 196
        },
        "nanumgothic-regular": {
            "displayName": "Nanum Gothic",
            "fontFamily": "nanumgothic-regular",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 197
        },
        "bm-hanna": {
            "displayName": "BM Hanna",
            "fontFamily": "bm-hanna",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "open source",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 198
        },
        "fbneogothic": {
            "displayName": "FB Neo Gothic",
            "fontFamily": "fbneogothic",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 199
        },
        "fbchamblue": {
            "displayName": "FB Cham Blue",
            "fontFamily": "fbchamblue",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 200
        },
        "fbbluegothicl": {
            "displayName": "FB Blue Gothic",
            "fontFamily": "fbbluegothicl",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 201
        },
        "fbplum": {
            "displayName": "FB Plum",
            "fontFamily": "fbplum",
            "cdnName": "",
            "genericFamily": "fantasy",
            "provider": "monotype",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 202
        },
        "fbgreen": {
            "displayName": "FB Green",
            "fontFamily": "fbgreen",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "korean"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 203
        },
        "cinzel": {
            "displayName": "Cinzel",
            "fontFamily": "cinzel",
            "cdnName": "Cinzel",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 204
        },
        "sail": {
            "displayName": "Sail",
            "fontFamily": "sail",
            "cdnName": "Sail",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 205
        },
        "playfair display": {
            "displayName": "Playfair Display",
            "fontFamily": "playfair display",
            "cdnName": "Playfair+Display",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 206
        },
        "libre baskerville": {
            "displayName": "Libre Baskerville",
            "fontFamily": "libre baskerville",
            "cdnName": "Libre+Baskerville",
            "genericFamily": "serif",
            "provider": "google",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 207
        },
        "trend-sans-w00-four": {
            "displayName": "Trend",
            "fontFamily": "trend-sans-w00-four",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 208
        },
        "proxima-n-w01-reg": {
            "displayName": "Proxima Nova",
            "fontFamily": "proxima-n-w01-reg",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 209
        },
        "bree-w01-thin-oblique": {
            "displayName": "Bree",
            "fontFamily": "bree-w01-thin-oblique",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 210
        },
        "lulo-clean-w01-one-bold": {
            "displayName": "Lulo Clean",
            "fontFamily": "lulo-clean-w01-one-bold",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 211
        },
        "futura-lt-w01-book": {
            "displayName": "Futura",
            "fontFamily": "futura-lt-w01-book",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 212
        },
        "futura-lt-w01-light": {
            "displayName": "Futura Light",
            "fontFamily": "futura-lt-w01-light",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 213
        },
        "brandon-grot-w01-light": {
            "displayName": "Brandon Grotesque",
            "fontFamily": "brandon-grot-w01-light",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 214
        },
        "avenir-lt-w01_85-heavy1475544": {
            "displayName": "Avenir",
            "fontFamily": "avenir-lt-w01_85-heavy1475544",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 215
        },
        "avenir-lt-w01_35-light1475496": {
            "displayName": "Avenir Light",
            "fontFamily": "avenir-lt-w01_35-light1475496",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 216
        },
        "didot-w01-italic": {
            "displayName": "Linotype Didot",
            "fontFamily": "didot-w01-italic",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 217
        },
        "adobe-caslon-w01-smbd": {
            "displayName": "Adobe Caslon",
            "fontFamily": "adobe-caslon-w01-smbd",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 218
        },
        "kepler-w03-light-scd-cp": {
            "displayName": "Kepler",
            "fontFamily": "kepler-w03-light-scd-cp",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 219
        },
        "baskervillemtw01-smbdit": {
            "displayName": "Monotype Baskerville",
            "fontFamily": "baskervillemtw01-smbdit",
            "cdnName": "",
            "genericFamily": "serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 220
        },
        "belinda-w00-regular": {
            "displayName": "Belinda",
            "fontFamily": "belinda-w00-regular",
            "cdnName": "",
            "genericFamily": "script",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 221
        },
        "helveticaneuew01-55roma": {
            "displayName": "Helvetica 55",
            "fontFamily": "helveticaneuew01-55roma",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "studio",
            "fallbacks": "",
            "spriteIndex": 222
        },
        "peaches-and-cream-regular-w00": {
            "displayName": "Peaches & Cream",
            "fontFamily": "peaches-and-cream-regular-w00",
            "cdnName": "",
            "genericFamily": "script",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 223
        },
        "dinneuzeitgroteskltw01-_812426": {
            "displayName": "DIN Neuzeit Grotesk",
            "fontFamily": "dinneuzeitgroteskltw01-_812426",
            "cdnName": "",
            "genericFamily": "sans-serif",
            "provider": "monotype",
            "characterSets": [
                "latin"
            ],
            "permissions": "all",
            "fallbacks": "",
            "spriteIndex": 224
        }
    };
    if (newCyrillicFontsExp) {
        _.merge(fonts, {
            "bad script": {
                "displayName": "Bad Script",
                "fontFamily": "bad script",
                "cdnName": "Bad+Script",
                "genericFamily": "cursive",
                "provider": "google",
                "characterSets": [
                    "cyrillic"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 225
            },
            "roboto": {
                "displayName": "Roboto",
                "fontFamily": "roboto",
                "cdnName": "Roboto",
                "genericFamily": "sans-serif",
                "provider": "google",
                "characterSets": [
                    "cyrillic"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 226
            },
            "underdog": {
                "displayName": "Underdog",
                "fontFamily": "underdog",
                "cdnName": "Underdog",
                "genericFamily": "cursive",
                "provider": "google",
                "characterSets": [
                    "cyrillic"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 227
            },
            "poiret one": {
                "displayName": "Poiret One",
                "fontFamily": "poiret one",
                "cdnName": "Poiret+One",
                "genericFamily": "cursive",
                "provider": "google",
                "characterSets": [
                    "cyrillic"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 228
            },
            "playfair display cyrillic": {
                "displayName": "Playfair Display",
                "fontFamily": "playfair display",
                "cdnName": "Playfair+Display",
                "genericFamily": "serif",
                "provider": "google",
                "characterSets": [
                    'cyrillic'
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 229
            }
        });
    }

    return fonts;
});
