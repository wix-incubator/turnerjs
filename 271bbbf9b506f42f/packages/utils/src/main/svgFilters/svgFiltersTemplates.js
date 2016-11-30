define(['lodash'], function (_) {
    'use strict';


    function sepia(amount) {
        return (0.393 + 0.607 * (1 - amount)) + ' ' + (0.769 - 0.769 * (1 - amount)) + ' ' + (0.189 - 0.189 * (1 - amount)) + ' 0 0 ' +
            (0.349 - 0.349 * (1 - amount)) + ' ' + (0.686 + 0.314 * (1 - amount)) + ' ' + (0.168 - 0.168 * (1 - amount)) + ' 0 0 ' +
            (0.272 - 0.272 * (1 - amount)) + ' ' + (0.534 - 0.534 * (1 - amount)) + ' ' + (0.131 + 0.869 * (1 - amount)) + ' 0 0 ' +
            '0 0 0 1 0';
    }

    function contrast(amount) {
        return '<feFuncR type="linear" slope="' + amount + '" intercept="' + Math.round(((-0.5 * amount) + 0.5) * 100) / 100 + '"/>' +
            '<feFuncG type="linear" slope="' + amount + '" intercept="' + Math.round(((-0.5 * amount) + 0.5) * 100) / 100 + '"/>' +
            '<feFuncB type="linear" slope="' + amount + '" intercept="' + Math.round(((-0.5 * amount) + 0.5) * 100) / 100 + '"/>';
    }

    function brightness(amount) {
        return '<feFuncR type="linear" slope="' + amount + '" />' +
            '<feFuncG type="linear" slope="' + amount + '" />' +
            '<feFuncB type="linear" slope="' + amount + '" />';
    }

    function tint(r, g, b) {
        return 1 - r + ' 0 0 0 ' + r + ' ' +
            (1 - g) + ' 0 0 0 ' + g + ' ' +
            (1 - b) + ' 0 0 0 ' + b + ' ' +
            '0 0 0 1 0';
    }

    function color(r, g, b) {
        return '0 0 0 0 ' + (r / 255) + ' ' +
               '0 0 0 0 ' + (g / 255) + ' ' +
               '0 0 0 0 ' + (b / 255) + ' ' +
               '0 0 0 1 0';
    }

    /**
     * colors the source to 2 colors , input should be gray scale
     * @param rw red in source whites
     * @param gw green in source whites
     * @param bw blu in source whites
     * @param rb red in source blacks
     * @param gb green in source blacks
     * @param bb blue in source blacks
     * @returns {string} color matrix
     */
    function doutone(rw, gw, bw, rb, gb, bb) {
        return rw + ' 0 0 0 ' + rb + ' ' +
            gw + ' 0 0 0 ' + gb + ' ' +
            bw + ' 0 0 0 ' + bb + ' ' +
            '0 0 0 1 0';
    }

    function alpha(amount) {
        return '<feFuncA type="linear" slope="' + amount + '" />';
    }


    /**
     * https://docs.webplatform.org/wiki/svg/tutorials/smarter_svg_filters
     * @type {{masterTemplate:function, templates:[]}}}
     */
    return {
        masterTemplate: _.template('<filter id="${id}" color-interpolation="sRGB" color-interpolation-filters="sRGB"> \
            <feComponentTransfer result="srcRGB"/>${content}<feComponentTransfer/></filter>'),
        templates: [
            {
                name: 'normal',
                template: _.template('<feColorMatrix in="SourceGraphic" />') //does nothing, but we have to have content for nothing to happen...
            },
            {
                name: 'ink',
                defaults: {
                    contrast: contrast(1.5),
                    brightness: brightness(1.1),
                    sepia: sepia(0.3),
                    saturate: 0
                },
                template: _.template('<feColorMatrix type="matrix" values="${sepia}"/><feComponentTransfer>${contrast}</feComponentTransfer><feComponentTransfer>${brightness}</feComponentTransfer><feColorMatrix type="saturate" values=${saturate} />')
            },
            {
                name: 'kennedy',
                defaults: {
                    //noise
                    //uri: '0da768_2d3632f7c0204fee9b44b57ce6a42554.jpg',
                    //noise alpha
                    //alpha: alpha(0.20),
                    saturate: 0,
                    contrast: contrast(1.1),
                    brightness: brightness(0.9)
                },
                /*eslint no-multi-str:0*/
                template: _.template('<feColorMatrix type="saturate" values=${saturate} /> \
                <feComponentTransfer >${contrast}</feComponentTransfer> \
                <feComponentTransfer >${brightness}</feComponentTransfer>')
            },

            /*
             template: _.template('<feImage result="noise" xlink:href="${staticMediaUrl}/${uri}" preserveAspectRatio="xMidYMid slice" width="256" height="256"/> \
             <feTile result="noisetile" /> \
             <feComponentTransfer in="noisetile" result="noiseopacity" >${alpha}</feComponentTransfer> \
             <feComposite operator="over" in2="SourceGraphic" in="noiseopacity" /> \
             <feColorMatrix type="saturate" values=${saturate} /> \
             <feComponentTransfer >${contrast}</feComponentTransfer>')
             */
            {
                name: 'feathered',
                defaults: {
                    contrast: contrast(0.85),
                    brightness: brightness(0.9),
                    tint: tint(0.09, 0.07, 0.07),
                    saturate: 0.2
                },
                template: _.template('<feColorMatrix type="saturate" values=${saturate} /><feComponentTransfer>${contrast}</feComponentTransfer><feComponentTransfer>${brightness}</feComponentTransfer><feColorMatrix type="matrix" values="${tint}"/>')
            },
            {
                name: 'blur',
                defaults: {
                    blur: 2
                },
                template: _.template('<feGaussianBlur in="SourceGraphic" stdDeviation=${blur} />')
            },
            {
                name: 'whistler',
                defaults: {
                    blur: 1.8,
                    alpha1: alpha(0.6),
                    alpha2: alpha(0.4),
                    color: color(255, 255, 255),
                    contrast: contrast(0.9),
                    brightness: brightness(1.1),
                    saturate: 0.6
                },
                /*eslint no-multi-str:0*/
                template: _.template('<feColorMatrix in="SourceGraphic" type="matrix" values="${color}" result="color" /> \
                <feComponentTransfer  in="color" result="flood_alpha">${alpha2}</feComponentTransfer> \
                <feGaussianBlur in="srcRGB" stdDeviation=${blur} /> \
                <feComponentTransfer  result="blur_alpha">${alpha1}</feComponentTransfer> \
                <feBlend  in="blur_alpha" in2="srcRGB" mode="normal" result="source_blur" /> \
                <feBlend  in2="source_blur" in="flood_alpha" mode="overlay" /> \
                <feComponentTransfer >${brightness}</feComponentTransfer> \
                <feComponentTransfer  result="contrast">${contrast}</feComponentTransfer> \
                <feColorMatrix  type="saturate" values=${saturate} />')
            },
            {
                name: '3d',
                defaults: {
                    color1: color(0, 255, 255),
                    color2: color(255, 0, 0),
                    offset_x: '3',
                    offset_y: '0'
                },
                /*eslint no-multi-str:0*/
                template: _.template('<feColorMatrix in="srcRGB" type="matrix" values="${color1}" result="color1" /> \
                <feBlend  in="color1" in2="srcRGB" mode="lighten" result="image_color1"/> \
                <feOffset dx=${-offset_x} dy=${offset_y} in="image_color1" result="image_color1_offset"/> \
                <feColorMatrix in="srcRGB" type="matrix" values="${color2}" result="color2" /> \
                <feBlend  in="color2" in2="srcRGB" mode="lighten" result="image_color2"/> \
                <feOffset dx=${offset_x} dy=${offset_y} in="image_color2" result="image_color2_offset"/> \
                <feBlend  in2="image_color2_offset" in="image_color1_offset" mode="darken" />')
            },
            {
                name: 'vignette',
                defaults: {
                    color: color(0, 0, 0)
                },
                /*eslint no-multi-str:0*/
                template: _.template('<feComponentTransfer in=SourceGraphic result="new-source-alpha"> \
                <feFuncA type="table" tableValues="1 0" /> \
                </feComponentTransfer> \
                <feGaussianBlur in="new-source-alpha" result="blur1" stdDeviation="35"/> \
                <feGaussianBlur in="new-source-alpha" result="blur2" stdDeviation="25"/> \
                <feGaussianBlur in="new-source-alpha" result="blur3" stdDeviation="15"/> \
                <feMerge result="blur"> \
                <feMergeNode in="blur1" mode="normal"/> \
                <feMergeNode in="blur2" mode="normal"/> \
                <feMergeNode in="blur3" mode="normal"/> \
                </feMerge> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color}" result="color" /> \
                <feComposite in="SourceGraphic" in2="blur" operator="in" result="radial"/> \
                <feComposite in2="SourceGraphic" in="radial" operator="over" />')
            },
            {
                name: 'lensflare',
                defaults: {
                    color: color(180, 0, 0)
                },
                /*eslint no-multi-str:0*/
                template: _.template('<feComponentTransfer in=SourceGraphic result="new-source-alpha"> \
                <feFuncA type="table" tableValues="1 0" /> \
                </feComponentTransfer> \
                <feGaussianBlur in="new-source-alpha" result="blur1" stdDeviation="35"/> \
                <feMerge result="blur"> \
                <feMergeNode in="blur1" mode="normal"/> \
                </feMerge> \
                <feComposite in="SourceGraphic" in2="blur" operator="in" result="radial"/> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color}" result="color" /> \
                <feComposite in2="radial" in="color" operator="in" result="radial_color"/> \
                <feBlend  in="SourceGraphic" in2="radial_color" mode="difference" />')
            },
            {
                name: 'vintage',
                defaults: {
                    color: color(0, 0, 0),
                    saturate: 0.7,
                    contrast: contrast(1.1)
                },
                /*eslint no-multi-str:0*/
                template: _.template('<feComponentTransfer in=SourceGraphic result="new-source-alpha"> \
                <feFuncA type="table" tableValues="1 0" /> \
                </feComponentTransfer> \
                <feGaussianBlur in="new-source-alpha" result="blur1" stdDeviation="35"/> \
                <feMerge result="blur"> \
                <feMergeNode in="blur1" mode="normal"/> \
                </feMerge> \
                <feComposite in="SourceGraphic" in2="blur" operator="in" result="radial"/> \
                <feComposite in2="SourceGraphic" in="radial" operator="over" /> \
                <feColorMatrix type="saturate" values=${saturate} /> \
                <feComponentTransfer>${contrast}</feComponentTransfer>')
            },
            {
                name: 'sunkissed',

                /*eslint no-multi-str:0*/
                template: _.template('<feColorMatrix in = "SourceGraphic" type = "luminanceToAlpha" result= "highlights"/> \
                <feGaussianBlur in="highlights" stdDeviation="4" result="blur"/> \
                <feSpecularLighting in="blur" surfaceScale="15" specularConstant=".8" specularExponent="5" lighting-color="red" result="lightmap"> \
                <feDistantLight azimuth="45" elevation="10"/> \
                </feSpecularLighting> \
                <feComponentTransfer in="lightmap" result="highlights"> \
                <feFuncA type="table" tableValues="0 0 .5 1 1"/> \
                </feComponentTransfer> \
                <feComposite in="SourceGraphic" in2="highlights" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>')
            },
            {
                name: 'blueray',
                defaults: {
                    color: color(27, 0, 255),
                    saturate: 0
                },
                template: _.template('<feColorMatrix type="saturate" values=${saturate} result="grayscale"/> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color}" result="color1" /> \
                <feBlend  in="color1" in2="grayscale" mode="multiply" />')
            },
            {
                name: 'lighten',
                defaults: {
                    brightness: brightness(1),
                    color: color(255, 255, 255),
                    alpha: alpha(0.46)

                },
                template: _.template('<feColorMatrix in="srcRGB" type="matrix" values="${color}" result="color" /> \
                <feComponentTransfer in="color" result="color_alpha" >${alpha}</feComponentTransfer> \
                <feComposite in2="srcRGB" in="color_alpha" operator="over"/>')
            },
            {
                name: 'darken',
                defaults: {
                    brightness: brightness(0.4)
                },
                template: _.template('<feComponentTransfer result="brightness">${brightness}</feComponentTransfer> \
                <feBlend  in="brightness" in2="SourceGraphic" mode="darken" />')
            },
            {
                name: 'pinkrinse',
                defaults: {
                    saturate: 0,
                    color: color(154, 26, 119)
                },
                template: _.template('<feColorMatrix type="saturate" values=${saturate} result="grayscale"/> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color}" result="color" /> \
                <feBlend  in="grayscale" in2="color" mode="multiply" />')
            },
            {
                name: 'redrum',
                defaults: {
                    saturate: 0,
                    contrast: contrast(0.75),
                    brightness: brightness(1.2),
                    color: color(242, 101, 82)
                },
                template: _.template('<feComponentTransfer>${contrast}</feComponentTransfer> \
                <feComponentTransfer>${brightness}</feComponentTransfer> \
                <feColorMatrix type="saturate" values=${saturate} result="grayscale"/> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color}" result="color" /> \
                <feBlend  in="grayscale" in2="color" mode="multiply" />')
            },
            {
                name: 'greenwash',
                defaults: {
                    saturate: 0,
                    color1: color(28, 151, 132)
                },
                template: _.template('<feColorMatrix type="saturate" values=${saturate} result="grayscale"/> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color1}" result="color1" /> \
                <feBlend  in="grayscale" in2="color1" mode="multiply" />')
            },
            {
                name: 'yellowstreak',
                defaults: {
                    saturate: 0,
                    color1: color(255, 210, 0),
                    contrast: contrast(2),
                    brightness: brightness(1.1)
                },
                template: _.template('<feComponentTransfer>${contrast}</feComponentTransfer> \
                <feComponentTransfer>${brightness}</feComponentTransfer> \
                <feColorMatrix type="saturate" values=${saturate} result="grayscale"/> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color1}" result="color1" /> \
                <feBlend  in="grayscale" in2="color1" mode="multiply" />')
            },
            {
                name: 'neonsky',
                defaults: {
                    saturate: 0,
                    doutone: doutone(0.90, 0.95, -0.20, 0.50, -0.10, 0.20),
                    contrast: contrast(0.8)
                },
                template: _.template('<feComponentTransfer>${contrast}</feComponentTransfer> \
                <feColorMatrix type="saturate" values=${saturate} result="grayscale"/> \
                <feColorMatrix type="matrix" values="${doutone}" />')
            },
            {
                name: 'seaweed',
                defaults: {
                    saturate: 0,
                    doutone: doutone(-0.10, 0.95, -0.45, 0.05, -0.10, 0.95)
                },
                template: _.template('<feColorMatrix type="saturate" values=${saturate} result="grayscale"/> \
                <feColorMatrix type="matrix" values="${doutone}" />')
            },
            {
                name: 'soledad',
                defaults: {
                    brightness: brightness(1.1),
                    contrast: contrast(0.9),
                    saturate: 0.8,
                    color1: color(252, 232, 211),
                    color2: color(252, 159, 26),
                    alpha1: alpha(0.15),
                    alpha2: alpha(0.23)
                },
                template: _.template('<feComponentTransfer  result="brightness">${brightness}</feComponentTransfer> \
                <feComponentTransfer  in="brightness" result="contrast">${contrast}</feComponentTransfer> \
                <feColorMatrix  type="saturate" in="contrast" values=${saturate} result="saturate"/> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color1}" result="color1" /> \
                <feComponentTransfer  in="color1" result="color_alpha" >${alpha1}</feComponentTransfer> \
                <feBlend  in="color_alpha" in2="saturate" mode="multiply" result="source" /> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color2}" result="color2" /> \
                <feComponentTransfer  in="color2" result="color_alpha2" >${alpha2}</feComponentTransfer> \
                <feBlend  in="color_alpha2" in2="source" mode="multiply" />')
            },
            {
                name: 'sangria',
                defaults: {
                    brightness: brightness(0.95),
                    contrast: contrast(1.35),
                    saturate: 0.5,
                    color1: color(199, 18, 226),
                    alpha: alpha(0.08)
                },
                template: _.template('<feComponentTransfer>${brightness}</feComponentTransfer> \
                <feComponentTransfer>${contrast}</feComponentTransfer> \
                <feColorMatrix type="saturate" values=${saturate} result="saturate"/> \
                <feColorMatrix in="SourceGraphic" type="matrix" values="${color1}" result="color1" /> \
                <feComponentTransfer in="color1" result="color_alpha" >${alpha}</feComponentTransfer> \
                <feBlend  in="color_alpha" in2="saturate" mode="multiply" result="source" />')

            }

            /*
             {
             name: 'whiteout',
             template: _.template('<feComponentTransfer><feFuncR type="table" tableValues="1 0"/><feFuncG type="table" tableValues="1 0"/><feFuncB type="table" tableValues="1 0"/></feComponentTransfer>')
             },
             {
             name: 'speckled',
             defaults: {
             values: 10
             },
             template: _.template('<feColorMatrix type="saturate" values="${values}"/>')
             },
             {
             name: 'halftone',
             template: _.template('<feColorMatrix type="saturate" values="0"/>')
             },
             {
             name: 'pixelate',
             template: _.template('<feComponentTransfer><feFuncR type="table" tableValues="1 0"/><feFuncG type="table" tableValues="1 0"/><feFuncB type="table" tableValues="1 0"/></feComponentTransfer>')
             },



             */


        ]
    };
});
