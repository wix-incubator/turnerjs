define(['mediaContainer/utils/cssItem/property', 'mediaContainer/utils/cssItem/stringify', 'mediaContainer/utils/cssItem/cssToken'],
    function (Property, Stringify, CSSToken) {
        'use strict';

        return {
            cssBoxShadow:
                Property.keyvalue('boxShadow',
                    Stringify.list(
                        Stringify.value({
                            inset:        CSSToken.KEYWORD,
                            offsetX:      CSSToken.LENGTH_OR_PERCENTAGE,
                            offsetY:      CSSToken.LENGTH_OR_PERCENTAGE,
                            blurRadius:   CSSToken.LENGTH_OR_PERCENTAGE,
                            spreadRadius: CSSToken.LENGTH_OR_PERCENTAGE,
                            color:        CSSToken.COLOR_RGBA
                        }))),

            cssBorderRadius:
                Property.keyvalue('borderRadius',
                    Stringify.value({
                        topLeft:     CSSToken.LENGTH_OR_PERCENTAGE,
                        topRight:    CSSToken.LENGTH_OR_PERCENTAGE,
                        bottomRight: CSSToken.LENGTH_OR_PERCENTAGE,
                        bottomLeft:  CSSToken.LENGTH_OR_PERCENTAGE
                    })
                ),

            cssBorder:
                Property.map({
                    borderWidth: Stringify.value({
                        width: CSSToken.BORDER_WIDTH
                    }),

                    borderStyle: Stringify.value({
                        style: CSSToken.BORDER_STYLE
                    }),

                    borderColor: Stringify.value({
                        color: CSSToken.BORDER_COLOR
                    })
                })
        };
    }

);
