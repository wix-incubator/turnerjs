define.dataItem('COMPONENT_TYPES', {
    'type': 'map',
    'items': {
        'addSvgShape': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.svgshape.SvgShape',
                    skin: 'skins.viewer.svgshape.SvgShapeDefaultSkin',
                    layout: {
                        "width": 300,
                        "height": 300
                    },
                    styleData: {
                        "type": "TopLevelStyle",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "style": {
                            "propertiesSource": {
                                "fillcolor": "theme",
                                "stroke": "theme",
                                "strokewidth": "value"
                            },
                            "properties": {
                                "alpha-fillcolor": "1",
                                "alpha-stroke": "1",
                                "fillcolor": "color_11",
                                "stroke": "color_15",
                                "strokewidth": "1px"
                            },
                            "groups": {}
                        },
                        "componentClassName": "wysiwyg.viewer.components.svgshape.SvgShape",
                        "pageId": "",
                        "styleType": "custom",
                        "skin": "skins.viewer.svgshape.SvgShapeDefaultSkin"
                    }
                };
            }
        },
        'area': {
            component: {
                comp: 'core.components.Container',
                skin: 'wysiwyg.viewer.skins.area.LiftedShadowArea',
                layout: {
                    "width": 250,
                    "height": 250
                }
            }

        },
        'horizontalMenu': {
            component: {
                comp: 'wysiwyg.viewer.components.HorizontalMenu',
                skin: 'wysiwyg.viewer.skins.horizontalmenu.AppleHorizontalMenuSkin',
                layout: {
                    "width": 400,
                    "height": 100,
                    "x": 0
                },
                uID: '#SITE_STRUCTURE'
            }
        },
        'dropDownMenu': {
            component: {
                comp: 'wysiwyg.viewer.components.menus.DropDownMenu',
                skin: 'wysiwyg.viewer.skins.dropmenu.TextSeparatorsMenuNSkin',
                layout: {
                    "width": 400,
                    "height": 100,
                    "x": 0
                },
                uID: '#MAIN_MENU'
            }
        },
        'addAdminLoginButton': {
            component: {
                comp: 'wysiwyg.viewer.components.AdminLoginButton',
                skin: 'wysiwyg.viewer.skins.button.AdminLoginButtonSkin',
                data: {
                    'type':'LinkableButton',  //SiteButtonDataSchema -> LinkableButtonDataSchema
                    'label': 'Webmaster Login'
                },
                layout: {
                    "width": 125,
                    "height": 20
                }
            }
        },
        'addHtmlComponent': {
            component: {
                comp: 'wysiwyg.viewer.components.HtmlComponent',
                skin: 'wysiwyg.viewer.skins.HtmlComponentSkin',
                layout: {
                    "width": 200,
                    "height": 200,
                    "x": 0
                },
                data: { 'type': 'HtmlComponent', 'sourceType': 'external'  }
            }
        },
        'fiveGridLine': {
            component: {
                comp: 'wysiwyg.viewer.components.FiveGridLine',
                skin: 'wysiwyg.viewer.skins.line.SolidLine',
                layout: {
                    "width": 400,
                    "height": 1,
                    "x": 0
                }
            }
        },
        'verticalLine': {
            component: {
                comp: 'wysiwyg.viewer.components.VerticalLine',
                skin: 'wysiwyg.viewer.skins.line.VerticalSolidLine',
                layout: {
                    "width": 1,
                    "height": 350,
                    "x": 0
                }
            }
        },

        //Facebook Like button
        'addFacebookLike': {
            component: {
                comp: 'wysiwyg.viewer.components.WFacebookLike',
                skin: 'skins.core.FacebookLikeSkin',
                layout: {
                    "width": 225,
                    "height": 24,
                    "x": 0
                }
            }
        },

        //FacebookComment button
        'addFacebookComment': {
            component: {
                comp: 'wysiwyg.viewer.components.WFacebookComment',
                skin: 'mobile.core.skins.FacebookCommentSkin',
                layout: {
                    "width": 555,
                    "height": 159,
                    "x": 0
                },
                props: {
                    'type': 'WFacebookCommentProperties',
                    'canBeShownOnAllPagesBug': true
                }
            }
        },
        'addMatrixGallery': {
            component: {
                groupType: 'Gallery',
                comp: 'wysiwyg.viewer.components.MatrixGallery',
                skin: 'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryDefaultSkin',
                data: { 'type': 'ImageList'},
                dataRefs: { items: { isList: true, items: [
                    { data: { 'type': 'Image', "title": "Water Droplets", "uri": "cd6a81b7d29d88425609ecc053a00d16.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Budding Tree", "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Fallen Apples", "uri": "8dfce587e3f99f17bba2d3346fea7a8d.jpg", "description": "Describe your image here", "width": 758, "height": 569 } },
                    { data: { 'type': 'Image', "title": "Cherry Blossom", "uri": "3dcc6f56be1f8507181d0197e52d09e8.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Ray of Light", "uri": "8fed9ef13904fb85b6b12092c269a465.jpg", "description": "Describe your image here", "width": 750, "height": 563 } },
                    { data: { 'type': 'Image', "title": "Bloom", "uri": "24bba47f40f8473a534ae0301bf748c9.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Dew", "uri": "8dde68848c4daae3a6905dc6a17d270e.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Tranquil forest", "uri": "568544c06dafc9d2ab6f4f4496e7d7b9.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Water Droplets", "uri": "cd6a81b7d29d88425609ecc053a00d16.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Lily Pond", "uri": "a3ae91861f93fde1b8917291180c5fe0.jpg", "description": "Describe your image here", "width": 700, "height": 525 } },
                    { data: { 'type': 'Image', "title": "Fallen Apples", "uri": "8dfce587e3f99f17bba2d3346fea7a8d.jpg", "description": "Describe your image here", "width": 758, "height": 569 } },
                    { data: { 'type': 'Image', "title": "Budding Tree", "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } }

                ]}},
                layout: {
                    "width": 675,
                    "height": 712
                }
            }
        },
        'addSlideShowGallery': {
            component: {
                groupType: 'Gallery',
                comp: 'wysiwyg.viewer.components.SlideShowGallery',
                skin: 'wysiwyg.viewer.skins.gallery.SlideShowTextOverlay',
                data: { 'type': 'ImageList'},
                dataRefs: { items: { isList: true, items: [
                    { data: { 'type': 'Image', "title": "Water Droplets", "uri": "cd6a81b7d29d88425609ecc053a00d16.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Budding Tree", "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Fallen Apples", "uri": "8dfce587e3f99f17bba2d3346fea7a8d.jpg", "description": "Describe your image here", "width": 758, "height": 569 } },
                    { data: { 'type': 'Image', "title": "Cherry Blossom", "uri": "3dcc6f56be1f8507181d0197e52d09e8.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Ray of Light", "uri": "8fed9ef13904fb85b6b12092c269a465.jpg", "description": "Describe your image here", "width": 750, "height": 563 } },
                    { data: { 'type': 'Image', "title": "Bloom", "uri": "24bba47f40f8473a534ae0301bf748c9.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Dew", "uri": "8dde68848c4daae3a6905dc6a17d270e.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Tranquil forest", "uri": "568544c06dafc9d2ab6f4f4496e7d7b9.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Lily Pond", "uri": "a3ae91861f93fde1b8917291180c5fe0.jpg", "description": "Describe your image here", "width": 700, "height": 525 } }
                ]}},
                layout: {
                    "width": 480,
                    "height": 360
                }
            }
        },
        'addSliderGallery': {
            component: {
                groupType: 'Gallery',
                comp: 'wysiwyg.viewer.components.SliderGallery',
                skin: 'wysiwyg.viewer.skins.galleryslider.SliderGalleryDefaultSkin',
                data: { 'type': 'ImageList'},
                dataRefs: { items: { isList: true, items: [
                    { data: { 'type': 'Image', "title": "Water Droplets", "uri": "cd6a81b7d29d88425609ecc053a00d16.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Budding Tree", "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Fallen Apples", "uri": "8dfce587e3f99f17bba2d3346fea7a8d.jpg", "description": "Describe your image here", "width": 758, "height": 569 } },
                    { data: { 'type': 'Image', "title": "Cherry Blossom", "uri": "3dcc6f56be1f8507181d0197e52d09e8.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Ray of Light", "uri": "8fed9ef13904fb85b6b12092c269a465.jpg", "description": "Describe your image here", "width": 750, "height": 563 } },
                    { data: { 'type': 'Image', "title": "Bloom", "uri": "24bba47f40f8473a534ae0301bf748c9.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Dew", "uri": "8dde68848c4daae3a6905dc6a17d270e.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Tranquil forest", "uri": "568544c06dafc9d2ab6f4f4496e7d7b9.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Lily Pond", "uri": "a3ae91861f93fde1b8917291180c5fe0.jpg", "description": "Describe your image here", "width": 700, "height": 525 } }
                ]}},
                layout: {
                    "width": 480,
                    "height": 160
                }
            }
        },

        'addSocialBar': {
            component: {
                comp: 'wysiwyg.viewer.components.LinkBar',
                skin: 'wysiwyg.viewer.skins.LinkBarNoBGSkin',
                data: { 'type': 'ImageList'},

                dataRefs: { items: {
                    isList: true,
                    items: [
                        { data: { 'type':'Image', "uri": "b1cd13f9d4dfb1450bbb325285106177.png", "width": 32, "height": 32, title:"Wix Facebook page", "metaData":{ "schemaVersion":"2.0"}}, "dataRefs":{ "link": { "isList":false, data: { type: "ExternalLink", metaData: {isHidden: false, isPreset: false, schemaVersion: "1.0"}, target: "_blank", url: "http://www.facebook.com/wix"  }}}  },
                        { data: { 'type':'Image', "uri": "01113281ebb7dfb57a8dc2a02eb1cb92.png", "width": 32, "height": 32, title:"Wix Twitter page", "metaData":{ "schemaVersion":"2.0"}}, "dataRefs":{ "link": { "isList":false, data: { type: "ExternalLink", metaData: {isHidden: false, isPreset: false, schemaVersion: "1.0"}, target: "_blank", url: "http://www.twitter.com/wix" }}}  },
                        { data: { 'type':'Image', "uri": "806f5f56d9a7b8849f2f2ea71ff5c0cc.png", "width": 32, "height": 32, title:"Wix Google+ page", "metaData":{ "schemaVersion":"2.0"}}, "dataRefs":{ "link": { "isList":false, data: { type: "ExternalLink", metaData: {isHidden: false, isPreset: false, schemaVersion: "1.0"}, target: "_blank", url: "https://plus.google.com/117167403531518744294/posts" }}}  }
                    ]}},
                props: {
                    'type': 'LinkBarProperties',
                    'gallery': "social_icons"
                },
                layout: {
                    "width": 50,
                    "height": 50
                }
            }

        },

        'addLinkBar': {
            component: {
                comp: 'wysiwyg.viewer.components.LinkBar',
                skin: 'wysiwyg.viewer.skins.LinkBarNoBGSkin',
                data: { 'type': 'ImageList'},
                dataRefs: { items: {
                    isList: true,
                    items: [
                        { data: { 'type': 'Image', "uri": "cd7dfdbefeea5bfb26ef76b0d6ffb11a.wix_mp", "width": 32, "height": 32, href: "" }
                        },
                        { data: { 'type': 'Image', "uri": "6674736d4a64bcd31d9e63d3ea05475e.wix_mp", "width": 32, "height": 32, href: "" }
                        },
                        { data: { 'type': 'Image', "title": "Google Icon", "uri": "a0bf7821f3c66a185c1cad7a03bb97f4.wix_mp", "width": 32, "height": 32, href: ""  }
                        }
                    ]}},
                layout: {
                    "width": 50,
                    "height": 50
                }
            }
        },

        //GooglePlusOne button
        'addGooglePlusOne': {
            component: {
                comp: 'wysiwyg.viewer.components.WGooglePlusOne',
                skin: 'mobile.core.skins.GooglePlusOneSkin',
                layout: {
                    "width": 225,
                    "height": 70,
                    "x": 0
                }
            }
        },
        //Twitter Tweet button
        'addTwitterTweet': {
            component: {
                comp: 'wysiwyg.viewer.components.WTwitterTweet',
                skin: 'mobile.core.skins.TwitterTweetSkin',
                data: { 'type': 'TwitterTweet'},
                layout: {
                    "width": 110,
                    "height": 41,
                    "x": 0
                }
            }
        },
        //Twitter Follow button
        'addTwitterFollow': {
            component: {
//                         comp:'core.components.TwitterFollow',
                comp: 'wysiwyg.viewer.components.WTwitterFollow',
                skin: 'mobile.core.skins.TwitterFollowSkin',
                data: { 'type': 'TwitterFollow'},
                layout: {
                    "width": 300,
                    "height": 41,
                    "x": 0
                }
            }
        },


        'richText': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.WRichText',
                    skin: 'wysiwyg.viewer.skins.WRichTextNewSkin',
                    data: { 'type': 'StyledText',
                        'text': '<p class="font_8">' + W.Resources.get('EDITOR_LANGUAGE', 'PARAGRAPH_DEFAULT_TEXT') + '</p>',
                        'stylesMapId': 'CK_EDITOR_PARAGRAPH_STYLES' },
                    layout: {
                        "width": 350,
                        "height": 50
                    }
                };
            }
        },

        'mediaRichText': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.MediaRichText',
                    skin: 'wysiwyg.viewer.skins.WRichTextNewSkin',
                    data: {
                        'type': 'MediaRichText',
                        'text': '<p class="font_8">' + W.Resources.get('EDITOR_LANGUAGE', 'PARAGRAPH_DEFAULT_TEXT') + '</p>',
                        'stylesMapId': 'CK_EDITOR_PARAGRAPH_STYLES'
                    },
                    layout: {
                        "width": 350,
                        "height": 50
                    }
                };
            }
        },


        'richTitle': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.WRichText',
                    skin: 'wysiwyg.viewer.skins.WRichTextNewSkin',
                    data: { 'type': 'StyledText',
                        'text': '<h2 class="font_2">' + W.Resources.get('EDITOR_LANGUAGE', 'TITLE_DEFAULT_TEXT') + '</h2>',
                        'stylesMapId': 'CK_EDITOR_PARAGRAPH_STYLES' },
                    layout: {
                        "width": 350,
                        "height": 50
                    }
                };
            }
        },

        'screenWidthContainer': {
            component: {
                comp: 'wysiwyg.viewer.components.ScreenWidthContainer',
                skin: 'wysiwyg.viewer.skins.screenwidthcontainer.SimpleScreenWidthContainerSkin',
                layout: {
                    "width": 30,
                    "height": 200
                }
            }
        },
        'addBgImageStrip': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.BgImageStrip',
                    skin: 'skins.viewer.bgimagestrip.BgImageStripSkin',
                    data: { 'type': 'Image'},
                    layout: {
                        "x": 0,
                        "width": 400,
                        "height": 200
                    }
                };
            }
        },

        'WPhoto': {
            component: {
                comp: 'wysiwyg.viewer.components.WPhoto',
                skin: 'wysiwyg.viewer.skins.photo.RoundPhoto',
                data: {
                    'type': 'Image',
                    'uri': "44dab8ba8e2b5ec71d897466745a1623.jpg",
                    'title': 'Budding Tree',
                    'description': '',
                    "width": 1000,
                    "height": 750,
                    'metaData': {'isPreset': false}
                },
                layout: {
                    "width": 400,
                    "height": 300
                }
            }
        },
        'addFlashComponent': {
            component: {
                comp: 'wysiwyg.viewer.components.FlashComponent',
                skin: 'wysiwyg.viewer.skins.FlashComponentSkin',
                data: { 'type': 'LinkableFlashComponent'},
                dataRefs: {
                    placeHolderImage: {
                        isList: false,
                        data: { 'type': 'Image', "title": "Default Flash", "uri": "7ff659c252dfd1ca5c76533695cb9611.wix_mp", "description": "Some description here", "width": 128, "height": 128 }
                    }
                },
                layout: {
                    "width": 128,
                    "height": 128
                }
            }
        },
        'tpaPlaceholder': {
            component: {
                comp: 'tpa.viewer.components.TPAPlaceholder',
                skin: 'wysiwyg.viewer.skins.TPAPlaceholderSkin',
                data: {
                    'type': 'Image',
                    'uri': "b55f666f960247b3105180f93331282e.wix_mp",
                    'title': '',
                    'description': '',
                    "width": 209,
                    "height": 206,
                    'metaData': {'isPreset': false}
                },
                layout: {
                    "width": 128,
                    "height": 128
                },
                "props": {
                    "type": "WPhotoProperties",
                    "displayMode": "stretch",
                    "metaData": {
                        "isPreset": false
                    }
                }
            }
        },
        'ClipArt': {
            component: {
                comp: 'wysiwyg.viewer.components.ClipArt',
                skin: 'wysiwyg.viewer.skins.photo.NoSkinPhoto',
                data: {
                    'type': 'Image',
                    'uri': "b6ff736f264785ab27afa9416c8d5cab.png",
                    'title': 'Idea',
                    'description': '',
                    "width": 200,
                    "height": 200,
                    'metaData': {'isPreset': false}
                },
                layout: {
                    "width": 128,
                    "height": 128
                },
                "props": {
                    "type": "WPhotoProperties",
                    "displayMode": "full",
                    "metaData": {
                        "isPreset": false
                    }
                }
            }
        },
        'addVideo': {
            component: {
                comp: 'wysiwyg.viewer.components.Video',
                skin: 'wysiwyg.viewer.skins.VideoSkin',
                data: { 'type': 'Video',
                    'videoType': 'YOUTUBE',
                    'videoId': '83nu4yXFcYU'
                },
                layout: {
                    "width": 480,
                    "height": 360
                }
            }
        },
        'addButton': {
            component: {
                comp: 'wysiwyg.viewer.components.SiteButton',
                skin: 'wysiwyg.viewer.skins.button.SiteButtonSkin',
                data: { 'type': 'LinkableButton'},
                layout: {
                    "width": 130,
                    "height": 60
                }
            }
        },
        'addGoogleMap': {
            component: {
                comp: 'wysiwyg.viewer.components.GoogleMap',
                skin: 'wysiwyg.viewer.skins.GoogleMapSkin',
                data: { 'type': 'GeoMap',
                    'metaData': {'isPreset': false}
                },
                layout: {
                    "width": 500,
                    "height": 400
                }
            }
        },
        'addEbayItemsBySeller': {
            component: {
                comp: 'wysiwyg.viewer.components.EbayItemsBySeller',
                skin: 'wysiwyg.viewer.skins.EbayItemsBySellerSkin',
                data: { 'type': 'EbayItemsBySeller'},
                layout: {
                    "width": 570,
                    "height": 310
                }
            }
        },
        'addPayPalButton': {
            component: {
                comp: 'wysiwyg.viewer.components.PayPalButton',
                skin: 'wysiwyg.viewer.skins.PayPalButtonSkin',
                data: { 'type': 'PayPalButton'},
                layout: {
                    "width": 150,
                    "height": 55
                }
            }
        },
        'addContactForm': {
            component: {
                comp: 'wysiwyg.viewer.components.ContactForm',
                skin: 'wysiwyg.viewer.skins.contactform.BasicContactFormSkin',
                data: { 'type': 'ContactForm'},
                layout: {
                    "width": 480,
                    "height": 180
                }
            }
        },
        'addTwitterFeed': {
            component: {
                comp: 'wysiwyg.viewer.components.TwitterFeed',
                skin: 'wysiwyg.viewer.skins.TwitterFeedSkin',
                data: { 'type': 'TwitterFollow'},
                layout: {
                    "width": 250,
                    "height": 300
                }
            }
        },
        'addSoundCloud': {
            component: {
                comp: 'wysiwyg.viewer.components.SoundCloudWidget',
                skin: 'wysiwyg.viewer.skins.SoundCloudWidgetSkin',
                data: { 'type': 'SoundCloudWidget' },
                layout: {
                    "width": 482,
                    "height": 171
                }
            }
        },
        'addDocumentMedia': {
            component: {
                comp: 'wysiwyg.viewer.components.documentmedia.DocumentMedia',
                skin: 'skins.viewer.documentmedia.DocumentMediaSkin',
                data: {
                    'type': 'Image',
                    'title': 'Document Title'

                },
                layout: {
                    "width": 70,
                    "height": 90
                }
            }
        },
        'addFlickrBadge': {
            component: {
                comp: 'wysiwyg.viewer.components.FlickrBadgeWidget',
                skin: 'wysiwyg.viewer.skins.FlickrBadgeWidgetSkin',
                data: { 'type': 'FlickrBadgeWidget' },
                layout: {
                    "width": 155,
                    "height": 288
                }
            }
        },
//Experiment PaginatedGrid.New was promoted to feature on Mon Jul 30 14:07:11 IDT 2012
        'addPaginatedGridGallery': {
            component: {
                groupType: 'Gallery',
                comp: 'wysiwyg.viewer.components.PaginatedGridGallery',
                skin: 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridOverlay',
                data: { 'type': 'ImageList'},
                dataRefs: { items: { isList: true, items: [
                    { data: { 'type': 'Image', "title": "Water Droplets", "uri": "cd6a81b7d29d88425609ecc053a00d16.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Budding Tree", "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Fallen Apples", "uri": "8dfce587e3f99f17bba2d3346fea7a8d.jpg", "description": "Describe your image here", "width": 758, "height": 569 } },
                    { data: { 'type': 'Image', "title": "Cherry Blossom", "uri": "3dcc6f56be1f8507181d0197e52d09e8.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Ray of Light", "uri": "8fed9ef13904fb85b6b12092c269a465.jpg", "description": "Describe your image here", "width": 750, "height": 563 } },
                    { data: { 'type': 'Image', "title": "Bloom", "uri": "24bba47f40f8473a534ae0301bf748c9.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Dew", "uri": "8dde68848c4daae3a6905dc6a17d270e.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Tranquil Forest", "uri": "568544c06dafc9d2ab6f4f4496e7d7b9.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Lily Pond", "uri": "a3ae91861f93fde1b8917291180c5fe0.jpg", "description": "Describe your image here", "width": 700, "height": 525 } },
                    { data: { 'type': 'Image', "title": "Dew", "uri": "8dde68848c4daae3a6905dc6a17d270e.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Budding Tree", "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Lily Pond", "uri": "a3ae91861f93fde1b8917291180c5fe0.jpg", "description": "Describe your image here", "width": 700, "height": 525 } },
                    { data: { 'type': 'Image', "title": "Bloom", "uri": "24bba47f40f8473a534ae0301bf748c9.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Water Droplets", "uri": "cd6a81b7d29d88425609ecc053a00d16.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Tranquil Forest", "uri": "568544c06dafc9d2ab6f4f4496e7d7b9.jpg", "description": "Describe your image here", "width": 800, "height": 600 } },
                    { data: { 'type': 'Image', "title": "Cherry Blossom", "uri": "3dcc6f56be1f8507181d0197e52d09e8.jpg", "description": "Describe your image here", "width": 1000, "height": 750 } },
                    { data: { 'type': 'Image', "title": "Ray of Light", "uri": "8fed9ef13904fb85b6b12092c269a465.jpg", "description": "Describe your image here", "width": 750, "height": 563 } }
                ]}},
                layout: {
                    "width": 480,
                    "height": 360
                }
            }
        },
        'wixHomePageMenu': {
            component: {
                comp: 'wysiwyg.viewer.components.wixhomepage.WixHomepageMenu',
                skin: 'wysiwyg.viewer.skins.wixhomepage.WixHomepageMenuSkin',
                data: { 'type': 'WixHomepageMenu'},
                layout: {
                    "width": 300,
                    "height": 30
                }
            }
        },
        'languagesDropDown': {
            component: {
                comp: 'wysiwyg.viewer.components.wixhomepage.LanguagesDropDown',
                skin: 'wysiwyg.viewer.skins.wixhomepage.LanguagesDropDownSkin',
                layout: {
                    "width": 300,
                    "height": 30
                }
            }
        },
        'wixOfTheDay': {
            component: {
                comp: 'wysiwyg.viewer.components.wixhomepage.WixOfTheDay',
                skin: 'wysiwyg.viewer.skins.wixhomepage.WixOfTheDaySkin',
                data: {
                    'type': 'Image',
                    'uri': "6c90a0673862c3ba34f0cd12a004aa6f.wix_mp",
                    'title': '',
                    'description': '',
                    "width": 344,
                    "height": 274,
                    'metaData': {'isPreset': false}
                },
                layout: {
                    "width": 920,
                    "height": 275
                }
            }
        },
        'homePageLogin': {
            component: {
                comp: 'wysiwyg.viewer.components.wixhomepage.HomePageLogin',
                skin: 'wysiwyg.viewer.skins.wixhomepage.HomePageLoginSkin',
                data: { 'type': 'HomePageLogin'},
                layout: {
                    "width": 200,
                    "height": 50
                }
            }
        },

        //Experiment Login.New was promoted to feature on Thu Oct 18 10:24:03 IST 2012

        'addLoginButton': {
            component: {
                comp: 'wysiwyg.viewer.components.LoginButton',
                skin: 'wysiwyg.viewer.skins.button.LoginButtonSkin',
                data: { 'type': 'LoginButton'},
                layout: {
                    "width": 190,
                    "height": 40
                }
            }
        },

        'addAudioPlayer': {
            component: {
                comp: 'wysiwyg.viewer.components.AudioPlayer',
                skin: 'wysiwyg.viewer.skins.audioplayer.SimplePlayer',
                data: { 'type': 'AudioPlayer' },
                layout: {
                    "width": 40,
                    "height": 40
                }
            }
        },

        'addTPAComponent': {
            component: function () {
                return {
                    comp: 'tpa.viewer.components.TPAComponent',
                    skin: 'tpa.viewer.skins.TPAWidgetSkin',
                    layout: {
                        "width": 300,
                        "height": 300
                    }
                };
            }
        },
        'tinyMenu': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.mobile.TinyMenu',
                    skin: 'wysiwyg.viewer.skins.mobile.TinyMenuSkin',
                    layout: {
                        "width": 50,
                        "height": 50
                    },
                    uID: '#MAIN_MENU'
                };
            }
        },

        'addItunesButton': {
            component: {
                comp: 'wysiwyg.viewer.components.ItunesButton',
                skin: 'skins.viewer.itunesbutton.ItunesButtonSkin',
                data: { 'type': 'ItunesButton'},
                layout: {
                    "width": 110,
                    "height": 40
                }
            }
        },

        'addPinterestFollow': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.PinterestFollow',
                    skin: 'skins.viewer.pinterestfollow.PinterestFollowSkin',
                    data: { 'type': 'PinterestFollow'},
                    layout: {
                        "width": 40,
                        "height": 20
                    }
                };
            }
        },

        'addVKShare': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.VKShareButton',
                    skin: 'skins.viewer.vkshare.VKShareSkin',
                    data: { 'type': 'VKShareButton' },
                    layout: {
                        "width": 100,
                        "height": 21
                    }
                };
            }
        },
        'addFacebookShare': {
            component: function () {
                return {
                    comp: 'wysiwyg.viewer.components.FacebookShare',
                    skin: 'skins.viewer.facebookshare.FacebookShareSkin',
                    data: { 'type': 'FacebookShareButton'},
                    layout: {
                        "width": 24,
                        "height": 30
                    }
                };
            }
        },
        'addFullHorizontalLine': {
            component:function() {
                return {
                    comp: 'wysiwyg.viewer.components.FiveGridLine',
                    skin: 'wysiwyg.viewer.skins.line.SolidLine',
                    layout: {
                        "width": 400,
                        "height": 1,
                        "x": 0
                    },
                    "props": {
                        "type": "FiveGridLineProperties",
                        "fullScreenModeOn":true
                    }
                };
            }
        },
        'addRSSButton': {
            component:function() {
                return {
                    comp: 'wysiwyg.common.components.rssbutton.viewer.RSSButton',
                    skin: 'wysiwyg.common.components.rssbutton.viewer.skins.RSSButtonSkin',
                    layout: {
                        "width": 32,
                        "height": 32
                    }
                };
            }
        }
    }
});
