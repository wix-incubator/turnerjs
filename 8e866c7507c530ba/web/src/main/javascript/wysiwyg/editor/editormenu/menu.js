define.deployment('wysiwyg.menu.SetMenuData', function (deploymentDef) {

    deploymentDef.atPhase(PHASES.MANAGERS, function (deploy) {
        var EditorMenuJson = {
            "items": [
                {
                    "name": "text",
                    "label": "TEXT",
                    "iconSrc": "richtext.png",
                    "items": [
                        {
                            "name": "title",
                            "label": "ADD_TITLE",
                            "iconSrc": "add_text_01.png",
                            "preset": {
                                "compType": "richTitle",
                                "styleId": "txtNew"
                            },
                            "labelText": "Title",
                            "$$hashKey": "01Q"
                        },
                        {
                            "name": "paragraph",
                            "label": "ADD_PARAGRAPH",
                            "iconSrc": "add_text_03.png",
                            "preset": {
                                "compType": "richText",
                                "styleId": "txtNew"
                            },
                            "labelText": "Paragraph",
                            "$$hashKey": "01S"
                        },
                        {
                            "name": "richText",
                            "label": "ADD_RICH_TEXT",
                            "iconSrc": "add_text_03.png",
                            "preset": {
                                "compType": "mediaRichText",
                                "styleId": "txtNew"
                            },
                            "labelText": "Rich Text",
                            "experimentInclude": "SuperRichTextMenuToggle"
                        }

                    ],
                    "labelText": "Text",
                    "$$hashKey": "00B"
                },
                {
                    "name": "image",
                    "label": "IMAGE",
                    "iconSrc": "add_media_01.png",
                    "items": [
                        {
                            "name": "image",
                            "label": "ADD_IMAGE",
                            "iconSrc": "add_media_02.png",
                            "preset": {
                                "compType": "WPhoto",
                                "styleId": "wp1"
                            },
                            "labelText": "Image"
                        },
                        {
                            "name": "imageNoFrame",
                            "label": "ADD_IMAGE_WITHOUT_FRAME",
                            "iconSrc": "add_media_01.png",
                            "preset": {
                                "compType": "WPhoto",
                                "styleId": "wp2"
                            },
                            "labelText": "Image without Frame"
                        },
                        {
                            "name": "clipArt",
                            "label": "ADD_CLIP_ART",
                            "iconSrc": "add_box_shape_05.png",
                            "preset": {
                                "compType": "ClipArt",
                                "styleId": ""
                            },
                            "labelText": "Clip Art"
                        }
                    ],
                    "labelText": "Image",
                    "$$hashKey": "00D"
                },
                {
                    "name": "gallery",
                    "label": "GALLERY_COMP",
                    "iconSrc": "gallery_group.png",
                    "items": [
                        {
                            "name": "grid",
                            "label": "ADD_GRID_GALLERY",
                            "iconSrc": "add_gallery_01.png",
                            "preset": {
                                "compType": "addMatrixGallery",
                                "styleId": ""
                            },
                            "labelText": "Grid"
                        },
                        {
                            "name": "masonry",
                            "label": "ADD_MASONRY_GALLERY",
                            "iconSrc": "masonry_b.png",
                            "preset": {
                                "compType": "addMasonry",
                                "styleId": ""
                            },
                            "labelText": "Masonry"
                        },
                        {
                            "name": "slideShow",
                            "label": "ADD_SLIDESHOW_GALLERY",
                            "iconSrc": "add_gallery_02.png",
                            "preset": {
                                "compType": "addSlideShowGallery",
                                "styleId": ""
                            },
                            "labelText": "Slideshow"
                        },
                        {
                            "name": "boxSlideShow",
                            "label": "BOXSLIDESHOW_TITLE",
                            "iconSrc": "boxSlideShowIcon.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.boxslideshow.viewer.BoxSlideShow",
                                "layout": {
                                    "width": 980,
                                    "height": 350
                                }
                            },
                            "experimentInclude": "BoxSlideShowMT",
                            "labelText": "box Slidshow"
                        },
                        {
                            "name": "thumbnails",
                            "label": "ADD_THUMBNAILS_GALLERY",
                            "iconSrc": "thumb_gallery.png",
                            "preset": {
                                "compType": "addThumbnails",
                                "styleId": ""
                            },
                            "labelText": "Thumbnails"
                        },
                        {
                            "name": "stripSlideshow",
                            "label": "ADD_STRIP_SLIDESHOW_GALLERY",
                            "iconSrc": "strip_gallery_wide.png",
                            "preset": {
                                "compType": "addStripSlideshow",
                                "styleId": ""
                            },
                            "labelText": "Strip Slideshow"
                        },
                        {
                            "name": "stripShowcase",
                            "label": "ADD_STRIP_SHOWCASE_GALLERY",
                            "iconSrc": "strip_showcase.png",
                            "preset": {
                                "compType": "addStripShowcase",
                                "styleId": ""
                            },
                            "labelText": "Strip Showcase"
                        },
                        {
                            "name": "accordion",
                            "label": "ADD_ACCORDION_GALLERY",
                            "iconSrc": "Acordion_gallery.png",
                            "preset": {
                                "compType": "addAccordion",
                                "styleId": ""
                            },
                            "labelText": "Accordion"
                        },
                        {
                            "name": "freestyle",
                            "label": "ADD_FREESTYLE_GALLERY",
                            "iconSrc": "gallery_freestyle.png",
                            "preset": {
                                "compType": "addFreestyle",
                                "styleId": ""
                            },
                            "labelText": "Freestyle"
                        },
                        {
                            "name": "collage",
                            "label": "ADD_COLLAGE_GALLERY",
                            "iconSrc": "Gallery_collage.png",
                            "preset": {
                                "compType": "addCollage",
                                "styleId": ""
                            },
                            "labelText": "Collage"
                        },
                        {
                            "name": "ecomgallery",
                            "label": "ADD_ECOM_GALLERY",
                            "iconSrc": "masonry_b.png",
                            "experimentInclude": "EcomGalleryBtn",
                            "preset": {
                                "compType": "addEcomGallery",
                                "styleId": ""
                            },
                            "labelText": "EcomGallery"
                        },
                        {
                            "name": "honeycomb",
                            "label": "ADD_HONEYCOMB_GALLERY",
                            "iconSrc": "gallery_honeycomb.png",
                            "preset": {
                                "compType": "addHoneycomb",
                                "styleId": ""
                            },
                            "labelText": "Honeycomb"
                        },
                        {
                            "name": "impress",
                            "label": "ADD_IMPRESS_GALLERY",
                            "iconSrc": "gallery_impress.png",
                            "preset": {
                                "compType": "addImpress",
                                "styleId": ""
                            },
                            "labelText": "Impress"
                        },
                        {
                            "name": "slider",
                            "label": "ADD_SLIDER_GALLERY",
                            "iconSrc": "add_gallery_03.png",
                            "preset": {
                                "compType": "addSliderGallery",
                                "styleId": ""
                            },
                            "labelText": "Slider"
                        },
                        {
                            "name": "TPA3DGallery",
                            "label": "ADD_TPA3DSLIDESHOW_GALLERY",
                            "iconSrc": "3d_gallery.png",
                            "preset": {
                                "compType": "addTPA3DGallery",
                                "styleId": ""
                            },
                            "labelText": "3D Slideshow"
                        },
                        {
                            "name": "TPA3DCarousel",
                            "label": "ADD_TPACAROUSEL_GALLERY",
                            "iconSrc": "carousel_gallery.png",
                            "preset": {
                                "compType": "addTPA3DCarousel",
                                "styleId": ""
                            },
                            "labelText": "3D Carousel"
                        },
                        {
                            "name": "animatedGrid",
                            "label": "ADD_ANIMATED_GRID_GALLERY",
                            "iconSrc": "add_gallery_04.png",
                            "preset": {
                                "compType": "addPaginatedGridGallery",
                                "styleId": ""
                            },
                            "labelText": "Animated Grid"
                        }
                    ],
                    "labelText": "Gallery",
                    "$$hashKey": "00F"
                },
                {
                    "name": "media",
                    "label": "MEDIA",
                    "iconSrc": "media_group.png",
                    "items": [
                        {
                            "name": "video",
                            "label": "ADD_VIDEO",
                            "iconSrc": "add_media_04.png",
                            "preset": {
                                "compType": "addVideo",
                                "styleId": "v1"
                            },
                            "labelText": "Video"
                        },
                        {
                            "name": "soundCloud",
                            "label": "ADD_SOUNDCLOUD_AUDIO",
                            "iconSrc": "add_media_05.png",
                            "preset": {
                                "compType": "addSoundCloud",
                                "styleId": ""
                            },
                            "labelText": "SoundCloud Audio"
                        },
                        {
                            "name": "documentMedia",
                            "label": "ADD_DOCUMENT",
                            "iconSrc": "add_media_06.png",
                            "preset": {
                                "compType": "addDocumentMedia",
                                "styleId": ""
                            },
                            "labelText": "Document"
                        },
                        {
                            "name": "audioPlayer",
                            "label": "FPP_AudioPlayer",
                            "iconSrc": "audioPlayeButton.png",
                            "experimentExclude": "Audioplayer",
                            "preset": {
                                "compType": "addAudioPlayer",
                                "styleId": ""
                            },
                            "labelText": "[audioPlayer]"
                        },
                        {
                            "name": "audioPlayerNew",
                            "label": "FPP_AudioPlayer",
                            "iconSrc": "add_media_audioplayer.png",
                            "experimentInclude": "Audioplayer",
                            "preset": {
                                "compType": "wysiwyg.viewer.components.AudioPlayer",
                                "styleId": 1,
                                "layout": {
                                    "width": 312,
                                    "height": 100
                                }
                            },
                            "labelText": "[audioPlayer]"
                        },
                        {
                            "name": "singleAudioPlayer",
                            "label": "COMP_SingleAudioPlayer",
                            "iconSrc": "add_media_audioplayer.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer",
                                "styleId": 1,
                                "layout": {
                                    "width": 280,
                                    "height": 68
                                }
                            },
                            "labelText": "[musicPlayer]"
                        },
                        {
                            "name": "itunesButton",
                            "label": "ADD_ITUNES_BUTTON",
                            "iconSrc": "itunesbutton.png",
                            "preset": {
                                "compType": "addItunesButton",
                                "styleId": ""
                            },
                            "labelText": "iTunes Button"
                        },
                        {
                            "name": "spotifyPlayer",
                            "label": "COMP_SpotifyPlayer",
                            "iconSrc": "add_media_spotify.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer",
                                "layout": {
                                    "width": 250,
                                    "height": 80
                                },
                                "styleId": "1"
                            },
                            "labelText": "[spotifyPlayer]"
                        },
                        {
                            "name": "playlist",
                            "label": "PLAYLIST",
                            "iconSrc": "add_blog_custom_feed.png",
                            "experimentInclude": "Playlist",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "64f3d173-b4e2-408d-967d-c9ed2bd28125"
                            },
                            "labelText": "Playlist"
                        }
                    ],
                    "labelText": "Media",
                    "$$hashKey": "00H"
                },
                {
                    "name": "areas",
                    "label": "AREAS",
                    "iconSrc": "shapes_group.png",
                    "items": [
                        {
                            "name": "bgImageStrip",
                            "label": "BG_STRIP_TITLE",
                            "iconSrc": "add_box_shape_02.png",
                            "preset": {
                                "compType": "addBgImageStrip",
                                "styleId": "bgis1"
                            },
                            "labelText": "Strip"
                        },
                        {
                            "name": "box",
                            "label": "ADD_BOX",
                            "iconSrc": "add_box_shape_01.png",
                            "preset": {
                                "compType": "area",
                                "styleId": ""
                            },
                            "labelText": "Box"
                        },
                        {
                            "name": "verticalLine",
                            "label": "ADD_VERTICAL_LINE",
                            "iconSrc": "add_box_shape_03.png",
                            "preset": {
                                "compType": "verticalLine",
                                "styleId": ""
                            },
                            "labelText": "Vertical Line"
                        },
                        {
                            "name": "horizontalLine",
                            "label": "ADD_HORIZONTAL_LINE",
                            "iconSrc": "add_box_shape_04.png",
                            "preset": {
                                "compType": "fiveGridLine",
                                "styleId": ""
                            },
                            "labelText": "Horizontal Line"
                        },
                        {
                            "name": "fullhorizontalLine",
                            "label": "ADD_FULL_HORIZONTAL_LINE",
                            "iconSrc": "horizontalFullScreen.png",
                            "preset": {
                                "compType": "addFullHorizontalLine",
                                "styleId": ""
                            },
                            "labelText": "Horizontal Line"
                        },
                        {
                            "name": "svgShape",
                            "label": "ADD_SVG_SHAPE",
                            "iconSrc": "svg-shape.png",
                            "preset": {
                                "compType": "addSvgShape",
                                "styleId": "assh"
                            },
                            "labelText": "Shape"
                        }
                    ],
                    "labelText": "Shapes & Lines",
                    "$$hashKey": "00J"
                },
                {
                    "name": "buttons",
                    "label": "BUTTONS_AND_MENUS",
                    "iconSrc": "buttons_menus_group.png",
                    "items": [
                        {
                            "name": "defButton",
                            "label": "ADD_BUTTON",
                            "iconSrc": "add_btns_03.png",
                            "preset": {
                                "compType": "addButton",
                                "layout": {
                                    "width": "130",
                                    "height": "60"
                                },
                                "styleId": "b1"
                            },
                            "labelText": "Button"
                        },
                        {
                            "name": "newMenu",
                            "label": "ADD_MENU",
                            "iconSrc": "add_btns_05.png",
                            "experimentInclude": "Dropdownmenu",
                            "preset": {
                                "compType": "wysiwyg.viewer.components.menus.DropDownMenu",
                                "layout": {
                                    "width": 490,
                                    "height": 40
                                },
                                "styleId": "1"
                            },
                            "labelText": "[newMenu]"
                        },
                        {
                            "name": "buttonsMenu",
                            "label": "ADD_MENU",
                            "iconSrc": "add_btns_05.png",
                            "experimentExclude": "Dropdownmenu",
                            "preset": {
                                "compType": "dropDownMenu",
                                "layout": {
                                    "width": "400",
                                    "height": "100",
                                    "x": "0"
                                },
                                "uID": "#MAIN_MENU",
                                "styleId": "ddm2"
                            },
                            "labelText": "Menu"
                        },
                        {
                            "name": "imageButton",
                            "label": "ADD_IMAGE_BUTTON",
                            "iconSrc": "add_btns_10.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.imagebutton.viewer.ImageButton",
                                "compData": {
                                    "comp": "wysiwyg.common.components.imagebutton.viewer.ImageButton",
                                    "skin": "wysiwyg.common.components.imagebutton.viewer.skins.ImageButtonSkin",
                                    "data": {
                                        "type": "ImageButton"
                                    },
                                    "dataRefs": {
                                        "defaultImage": {
                                            "data": {
                                                "type": "Image",
                                                "uri": "1731b3_c1cd1ba960b34dada2faae0a6625dd42.png",
                                                "width": 98,
                                                "height": 98,
                                                "metaData": {
                                                    "isPreset": true
                                                }
                                            }
                                        },
                                        "hoverImage": {
                                            "data": {
                                                "type": "Image",
                                                "uri": "1731b3_d294fe832cf944d69eb663cd981089fb.png",
                                                "width": 98,
                                                "height": 98,
                                                "metaData": {
                                                    "isPreset": true
                                                }
                                            }
                                        },
                                        "activeImage": {
                                            "data": {
                                                "type": "Image",
                                                "uri": "1731b3_d576a3da470d41cc8251b841b3e851fa.png",
                                                "width": 98,
                                                "height": 98,
                                                "metaData": {
                                                    "isPreset": true
                                                }
                                            }
                                        }
                                    },
                                    "layout": {
                                        "width": 98,
                                        "height": 98
                                    },
                                    "props": {
                                        "type": "ImageButtonProperties"
                                    }
                                }
                            },
                            "labelText": "Image Button"
                        },
                        {
                            "name": "payPal",
                            "label": "ADD_PAYPAL_BUTTON",
                            "iconSrc": "add_widgets_06.png",
                            "preset": {
                                "compType": "addPayPalButton",
                                "layout": {
                                    "width": "130",
                                    "height": "60"
                                },
                                "styleId": ""
                            },
                            "labelText": "PayPal"
                        },
                        {
                            "name": "itunesButtonButtons",
                            "label": "ADD_ITUNES_BUTTON",
                            "iconSrc": "itunesbutton.png",
                            "preset": {
                                "compType": "addItunesButton",
                                "styleId": ""
                            },
                            "labelText": "iTunes Button"
                        },
                        {
                            "name": "VerticalMenu",
                            "label": "VerticalMenu_MENU_ENTRY",
                            "iconSrc": "vertical-menu-icon.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.verticalmenu.viewer.VerticalMenu",
                                "layout": {
                                    "width": 100,
                                    "height": 400
                                },
                                "styleId": "1"
                            },
                            "labelText": "[VerticalMenu]"
                        },
                        {
                            "name": "quick",
                            "label": "ADD_QUICK_COMPONENT",
                            "iconSrc": "add_btns_02.png",
                            "experimentInclude": "QuickComponent",
                            "preset": {
                                "compType": "wysiwyg.common.components.quickcomponent.viewer.QuickComponent",
                                "layout": {
                                    "width": 130,
                                    "height": 60
                                },
                                "styleId": "1"
                            },
                            "labelText": "[quick]"
                        },
                        {
                            "name": "presentationButton",
                            "label": "ADD_PRESENTATION_BUTTON",
                            "iconSrc": "add_gallery_02.png",
                            "experimentInclude": "WixPresent",
                            "preset": {
                                "compType": "addPresentationButton",
                                "showOnAllPagesByDefault": true,
                                "styleId": "pb1"
                            },
                            "labelText": "[presentationButton]"
                        },
                        {
                            "name": "Anchor",
                            "label": "Anchor_COMP_TITLE",
                            "iconSrc": "add_scroll_anchor.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.anchor.viewer.Anchor",
                                "layout": {
                                    "width": 100,
                                    "height": 20
                                },
                                "styleId": 1
                            },
                            "labelText": "Anchor"
                        }
                    ],
                    "labelText": "Buttons & Menus",
                    "$$hashKey": "00L"
                },
                {
                    "name": "blog",
                    "label": "BLOG_PANEL_SECTIONS",
                    "iconSrc": "add_blog.png",
                    "items": [
                        {
                            "name": "blogRecentPosts",
                            "label": "BLOG_RECENT_POSTS_PART",
                            "iconSrc": "add_blog_recent_posts.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "f72fe377-8abc-40f2-8656-89cfe00f3a22"
                            },
                            "labelText": "Posts List"
                        },
                        {
                            "name": "blogFeaturedPosts",
                            "label": "BLOG_FEATURED_POSTS_PART",
                            "iconSrc": "add_blog_featured_posts.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "c7f57b50-8940-4ff1-83c6-6756d6f0a1f4"
                            },
                            "labelText": "Featured Posts"
                        },
                        {
                            "name": "rssButton",
                            "label": "blog_ADD_RSS_BUTTON",
                            "iconSrc": "add_blog_rss.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.rssbutton.viewer.RSSButton",
                                "compData": {
                                    "comp": "wysiwyg.common.components.rssbutton.viewer.RSSButton",
                                    "skin": "wysiwyg.common.components.rssbutton.viewer.skins.RSSButtonSkin",
                                    "data": {
                                        "type": "RssButton"
                                    },
                                    "dataRefs": {
                                        "image": {
                                            "data": {
                                                "type": "Image",
                                                "uri": "183752c7fa475ba63557b0762fe81b8c.png",
                                                "width": 32,
                                                "height": 32,
                                                "alt": "RSS Feed",
                                                "metaData": {
                                                    "isPreset": true
                                                }
                                            }
                                        },
                                        "link" : {
                                            "data": {
                                                "type": "ExternalLink",
                                                "target": "_blank",
                                                "url": "",
                                                "metaData": {
                                                    "isPreset": true
                                                }
                                            }
                                        }
                                    },
                                    "layout": {
                                        "width": 32,
                                        "height": 32
                                    },
                                    "props": {
                                        "type": "RssButtonProperties"
                                    }
                                }
                            },
                            "labelText": "RSS Button"
                        },
                        {
                            "name": "blogArchive",
                            "label": "BLOG_ARCHIVE_PART",
                            "iconSrc": "add_blog_archive.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "56ab6fa4-95ac-4391-9337-6702b8a77011"
                            },
                            "labelText": "Archive"
                        },
                        {
                            "name": "blogTagCloud",
                            "label": "BLOG_TAG_CLOUD_PART",
                            "iconSrc": "add_blog_tag_cloud.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "e000b4bf-9ff1-4e66-a0d3-d4b365ba3af5"
                            },
                            "labelText": "Tag Cloud"
                        },
                        {
                            "name": "blogCustomFeed",
                            "label": "BLOG_CUSTOM_FEED_PART",
                            "iconSrc": "add_blog_custom_feed.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "31c0cede-09db-4ec7-b760-d375d62101e6"
                            },
                            "labelText": "Custom Feed"
                        },
                        {
                            "name": "blogTicker",
                            "label": "BLOG_TICKER_PART",
                            "iconSrc": "add_blog_ticker.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "33a9f5e0-b083-4ccc-b55d-3ca5d241a6eb"
                            },
                            "labelText": "Ticker"
                        },
                        {
                            "name": "blogFeaturedGallery",
                            "label": "BLOG_FEATURED_GALLERY_PART",
                            "iconSrc": "add_blog_featured_gallery.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "1b8c501f-ccc2-47e7-952a-47e264752614"
                            },
                            "labelText": "Posts Gallery"
                        },
                        {
                            "name": "blogFeaturedList",
                            "label": "BLOG_FEATURED_LIST_PART",
                            "iconSrc": "add_blog_featured_list.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "f72fe377-8abc-40f2-8656-89cfe00f3a22"
                            },
                            "labelText": "Posts List"
                        },
                        {
                            "name": "disqusComments",
                            "label": "ADD_DISQUS_COMMENTS",
                            "iconSrc": "disqus_comments.png",
                            "experimentInclude": "DisqusMenuToggle",
                            "preset": {
                                "compType": "wysiwyg.common.components.disquscomments.viewer.DisqusComments",
                                "layout": {
                                    "width": 550,
                                    "height": 300
                                }
                            },
                            "labelText": "Disqus Comments"
                        }

                    ],
                    "labelText": "Blog",
                    "$$hashKey": "00N"
                },
                {
                    "name": "ecom",
                    "label": "ECOM_PANELS_SECTION",
                    "iconSrc": "add_ecom.png",
                    "items": [
                        {
                            "name": "ecomGallery",
                            "label": "ECOM_PRODUCTS_LIST_COMP",
                            "iconSrc": "add_product.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "30b4a102-7649-47d9-a60b-bfd89dcca135"
                            },
                            "labelText": "Product Gallery"
                        },
                        {
                            "name": "ecomCart",
                            "label": "ECOM_CART_COMP",
                            "iconSrc": "add_shoppingcart.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a"
                            },
                            "labelText": "Shopping Cart"
                        },
                        {
                            "name": "ecomViewCart",
                            "label": "ECOM_VIEW_CART_COMP",
                            "iconSrc": "add_viewcart.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "c029b3fd-e8e4-44f1-b1f0-1f83e437d45c"
                            },
                            "labelText": "View Cart"
                        },
                        {
                            "name": "ecomAddToCart",
                            "label": "ECOM_ADD_TO_CART_COMP",
                            "iconSrc": "add_add2cart.png",
                            "preset": {
                                "compType": "wixappsPart",
                                "widgetId": "c614fb79-dbec-4ac7-b9b0-419669fadecc"
                            },
                            "labelText": "Add to Cart Button"
                        }
                    ],
                    "labelText": "Online Store",
                    "$$hashKey": "00P"
                },
                {
                    "name": "social",
                    "label": "SOCIAL",
                    "iconSrc": "add_socialbar_icon.png",
                    "items": [
                        {
                            "name": "fbLike",
                            "label": "ADD_FACEBOOK_LIKE",
                            "iconSrc": "add_social_01.png",
                            "preset": {
                                "compType": "addFacebookLike",
                                "styleId": ""
                            },
                            "labelText": "Facebook Like"
                        },
                        {
                            "name": "facebookLikeBox",
                            "label": "ADD_FACEBOOK_LIKE_BOX",
                            "iconSrc": "add_fblikebox.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.facebooklikebox.viewer.FacebookLikeBox",
                                "layout": {
                                    "width": 300,
                                    "height": 556
                                },
                                "styleId": "1"
                            },
                            "labelText": "Facebook Like Box"
                        },
                        {
                            "name": "facebookShare",
                            "label": "ADD_FACEBOOK_SHARE",
                            "iconSrc": "add_social_02.png",
                            "preset": {
                                "compType": "addFacebookShare",
                                "styleId": ""
                            },
                            "labelText": "Facebook Share"
                        },
                        {
                            "name": "fbComments",
                            "label": "ADD_FACEBOOK_COMMENTS",
                            "iconSrc": "add_social_02.png",
                            "preset": {
                                "compType": "addFacebookComment",
                                "styleId": ""
                            },
                            "labelText": "Facebook Comments"
                        },
                        {
                            "name": "twitterFollow",
                            "label": "ADD_TWITTER_FOLLOW",
                            "iconSrc": "add_twitter_icon.png",
                            "preset": {
                                "compType": "addTwitterFollow",
                                "styleId": ""
                            },
                            "labelText": "Twitter Follow"
                        },
                        {
                            "name": "twitterTimline",
                            "label": "ADD_TWITTER_TIMELINE",
                            "iconSrc": "icon_twitter_timeline.png",
                            "experimentInclude": "TwitterTimelineMenuToggle",
                            "preset": {
                                "compType": "wysiwyg.common.components.twittertimeline.viewer.TwitterTimeline",
                                "layout": {
                                    "width": 300,
                                    "height": 300
                                },
                                "styleId": "1"
                            },
                            "labelText": "Twitter Timeline"
                        },
                        {
                            "name": "twitterTweet",
                            "label": "ADD_TWITTER_TWEET",
                            "iconSrc": "add_twitter_icon.png",
                            "preset": {
                                "compType": "addTwitterTweet",
                                "styleId": ""
                            },
                            "labelText": "Twitter Tweet"
                        },
                        {
                            "name": "gglPlus",
                            "label": "ADD_GOOGLE_PLUS_ONE",
                            "iconSrc": "add_social_06.png",
                            "preset": {
                                "compType": "addGooglePlusOne",
                                "styleId": ""
                            },
                            "labelText": "Google +1"
                        },
                        {
                            "name": "socialBar",
                            "label": "ADD_SOCIAL_BAR",
                            "iconSrc": "add_socialbar_icon.png",
                            "preset": {
                                "compType": "addSocialBar",
                                "styleId": ""
                            },
                            "labelText": "Social Bar"
                        },
                        {
                            "name": "VKShare",
                            "label": "COMP_VKShareButton",
                            "iconSrc": "add_social_09.png",
                            "preset": {
                                "compType": "addVKShare",
                                "styleId": ""
                            },
                            "labelText": "[VKShare]"
                        },
                        {
                            "name": "linkedinFollow",
                            "label": "ADD_LINKEDIN_FOLLOW",
                            "iconSrc": "add_social_06.png",
                            "experimentInclude": "LinkedinFollow",
                            "preset": {
                                "compType": "addLinkedinFollow",
                                "styleId": ""
                            },
                            "labelText": "LinkedIn Follow"
                        },
                        {
                            "name": "pinterestPinItPinWidget",
                            "label": "ADD_PINTEREST_WIDGET",
                            "iconSrc": "pinwidgetIcon.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget",
                                "styleId": 1,
                                "layout": {
                                    "width": 40,
                                    "height": 20
                                }
                            },
                            "labelText": "pintrest Widget"
                        },
                        {
                            "name": "pinterestPinIt",
                            "label": "ADD_PINTEREST_PIN",
                            "iconSrc": "pinterest_pin_it.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt",
                                "styleId": 1,
                                "layout": {
                                    "width": 40,
                                    "height": 20
                                }
                            },
                            "labelText": "[PinterestPinItButton]"
                        },
                        {
                            "name": "pinterestFollow",
                            "label": "ADD_PINTEREST_FOLLOW",
                            "iconSrc": "pinterest-follow.png",
                            "preset": {
                                "compType": "addPinterestFollow",
                                "styleId": ""
                            },
                            "labelText": "Pinterest Follow"
                        },
                        {
                            "name": "youTubeSubscribeButton",
                            "label": "MENU_youTubeSubscribeButton",
                            "labelText": "YouTube Subscribe",
                            "iconSrc": "icon_youTubeSubscribeButton.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton",
                                "layout": {
                                    "width": 200,
                                    "height": 66
                                },
                                "defaultStyleIndex": "1"
                            },
                            "$$hashKey": "03P"
                        },
                        {
                            "name": "spotifyfollow",
                            "label": "SpotifyFollow_COMP_TITLE",
                            "iconSrc": "add_spotify_follow.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow",
                                "layout": {
                                    "width": 300,
                                    "height": 56
                                },
                                "styleId": 1
                            },
                            "labelText": "Spotify follow"
                        }
                    ],
                    "labelText": "Social",
                    "$$hashKey": "00R"
                },
                {
                    "name": "widgets",
                    "label": "WIDGETS",
                    "iconSrc": "add_apps_icon.png",
                    "items": [
                        {
                            "name": "contactForm",
                            "label": "ADD_CONTACT_FORM",
                            "iconSrc": "add_social_07.png",
                            "preset": {
                                "compType": "addContactForm",
                                "styleId": ""
                            },
                            "labelText": "Contact Form"
                        },
                        {
                            "name": "subscribeFormWidget",
                            "label": "ADD_SUBSCRIBE_FORM_LABEL",
                            "iconSrc": "add_social_10.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.subscribeform.viewer.SubscribeForm",
                                "layout": {
                                    "width": 400,
                                    "height": 120
                                },
                                "styleId": 1
                            },
                            "labelText": "Subscribe Form"
                        },
                        {
                            "name": "gglMaps",
                            "label": "ADD_GOOGLE_MAP",
                            "iconSrc": "google_maps_icon.png",
                            "preset": {
                                "compType": "addGoogleMap",
                                "styleId": ""
                            },
                            "labelText": "Google Maps"
                        },
                        {
                            "name": "onlineClock",
                            "label": "ADD_OnlineClock",
                            "iconSrc": "icon_online_clock.png",
                            "experimentInclude": "OnlineClockMenuToggle",
                            "preset": {
                                "compType": "wysiwyg.common.components.onlineclock.viewer.OnlineClock",
                                "layout": {
                                    "width": 100,
                                    "height": 50
                                },
                                "styleId": ""
                            },
                            "labelText": "Online Clock"
                        },
                        {
                            "name": "htmlComp",
                            "label": "ADD_HTML",
                            "iconSrc": "add_widgets_02.png",
                            "preset": {
                                "compType": "addHtmlComponent",
                                "styleId": ""
                            },
                            "labelText": "HTML"
                        },
                        {
                            "name": "weatherComp",
                            "label": "ADD_WEATHER",
                            "iconSrc": "add_weather.png",
                            "experimentInclude": "WeatherMenuToggle",
                            "preset": {
                                "compType": "wysiwyg.common.components.weather.viewer.Weather",
                                "styleId": "",
                                "layout": {
                                    "width": 60,
                                    "height": 50
                                }
                            },
                            "labelText": "Weather"
                        },
                        {
                            "name": "flashComp",
                            "label": "ADD_FLASH",
                            "iconSrc": "add_widgets_05.png",
                            "preset": {
                                "compType": "addFlashComponent",
                                "styleId": ""
                            },
                            "labelText": "Flash"
                        },
                        {
                            "name": "payPalWidget",
                            "label": "ADD_PAYPAL_BUTTON",
                            "iconSrc": "add_widgets_06.png",
                            "preset": {
                                "compType": "addPayPalButton",
                                "styleId": ""
                            },
                            "labelText": "PayPal"
                        },
                        {
                            "name": "skypeButtonWidget",
                            "label": "ADD_SKYPE_BUTTON",
                            "iconSrc": "add_widgets_07.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton",
                                "layout": {
                                    "width": 56,
                                    "height": 24
                                },
                                "styleId": 1
                            },
                            "labelText": "Skype Button"
                        },
                        {
                            "name": "addFlickrBadge",
                            "label": "ADD_FLICKR_GALLERY",
                            "iconSrc": "add_widgets_03.png",
                            "preset": {
                                "compType": "addFlickrBadge",
                                "styleId": ""
                            },
                            "labelText": "Flickr Gallery"
                        },
                        {
                            "name": "adminLogin",
                            "label": "ADD_ADMIN_LOGIN",
                            "iconSrc": "add_btns_08.png",
                            "preset": {
                                "compType": "addAdminLoginButton",
                                "styleId": ""
                            },
                            "labelText": "Admin/Webmaster Login"
                        },
                        {
                            "name": "memberLogin",
                            "label": "ADD_LOGIN",
                            "iconSrc": "add_btns_09.png",
                            "preset": {
                                "compType": "addLoginButton",
                                "styleId": ""
                            },
                            "labelText": "Member Login Button"
                        },
                        {
                            "name": "appMarketLink",
                            "label": "APP_MARKET_LINK_TITLE",
                            "iconSrc": "app-market-icon.png",
                            "labelText": "See more in the App Market",
                            "preset": {
                                "origin": "add-panel",
                                "compType": "openAppMarket"
                            }
                        }
                    ],
                    "labelText": "Apps",
                    "$$hashKey": "00T"
                },
                {
                    "name": "AppBuilderMenu",
                    "label": "WIX_APPS_APP_BUILDER_MENU",
                    "iconSrc": "appbuilder_list.png",
                    "items": [
                        {
                            "name": "listBuilder",
                            "label": "WIX_APPS_BUILDER_ADD_LIST",
                            "iconSrc": "appbuilder_list.png",
                            "labelText": "List Builder",
                            "preset": {
                                "compType": "ListBuilder",
                                "commandParameter": {
                                    "type": "list"
                                }
                            }
                        },
                        {
                            "name": "formBuilder",
                            "label": "WIX_APPS_BUILDER_ADD_FORM",
                            "iconSrc": "add_social_10.png",
                            "labelText": "Form Builder",
                            "preset": {
                                "compType": "FormBuilder"
                            }
                        }
                    ],
                    "labelText": "List Builder",
                    "experimentInclude": "BlinkyFormContainerEditor",
                    "$$hashKey": "00V"
                },
                {
                    "name": "listBuilder",
                    "label": "WIX_APPS_BUILDER_LIST",
                    "iconSrc": "appbuilder_list.png",
                    "labelText": "List Builder",
                    "experimentExclude": "BlinkyFormContainerEditor",
                    "$$hashKey": "00V"
                },
                {
                    "name": "appMarketLink",
                    "label": "APP_MARKET_LINK_TITLE",
                    "iconSrc": "app-market-icon.png",
                    "labelText": "See more in the App Market",
                    "experimentInclude": "AppMarketInAddMenu",
                    "preset": {
                        "origin": "add-panel-main",
                        "compType": "openAppMarket"
                    }
                },
                {
                    "name": "wixhomepage",
                    "label": "WIN_HOMEPAGE",
                    "iconSrc": "wix_components.png",
                    "experimentInclude": "WixStaff",
                    "items": [
                        {
                            "name": "languageDD",
                            "label": "LANGUAGES_DROPDOWN",
                            "iconSrc": "language_selection.png",
                            "preset": {
                                "compType": "languagesDropDown",
                                "styleId": "wix_lang1"
                            },
                            "labelText": "Languages Dropdown"
                        },
                        {
                            "name": "homepageLogin",
                            "label": "HOMEPAGE_LOGIN",
                            "iconSrc": "add_btns_08.png",
                            "preset": {
                                "compType": "homePageLogin",
                                "styleId": "wix_login1"
                            },
                            "labelText": "Site pages Login"
                        },
                        {
                            "name": "homepageMenu",
                            "label": "HOMEPAGE_MENU",
                            "iconSrc": "top_menu.png",
                            "preset": {
                                "compType": "wixHomePageMenu",
                                "styleId": "wix_homepage_menu1"
                            },
                            "labelText": "Menu"
                        },
                        {
                            "name": "wixOfTheDay",
                            "label": "WIXOFTHEDAY",
                            "iconSrc": "wix_of_the_day.png",
                            "preset": {
                                "compType": "wixOfTheDay",
                                "styleId": "wix_of_the_day1"
                            },
                            "labelText": "Wix of the day"
                        },
                        {
                            "name": "tpaPlaceholder",
                            "label": "COMP_TPAPlaceholder",
                            "iconSrc": "place_holder.png",
                            "preset": {
                                "compType": "tpaPlaceholder",
                                "styleId": "tpaPlaceholder1"
                            },
                            "labelText": "App Placeholder"
                        },
                        {
                            "name": "backOfficeText.numberOfUsers",
                            "label": "COMP_BackOfficeNumberUsers",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                "styleId": "1",
                                "compData": {
                                    "comp": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                    "skin": "wysiwyg.common.components.backofficetext.viewer.skins.BackOfficeTextSkin",
                                    "data": {
                                        "type": "BackOfficeText",
                                        "key": "numberOfUsers"
                                    },
                                    "layout": {
                                        "width": 200,
                                        "height": 50
                                    },
                                    "componentType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText"
                                }
                            },
                            "labelText": "Back Office - Number of Users"
                        },
                        {
                            "name": "backOfficeText.roundedNumOfUsers",
                            "label": "Back Office - Rounded Number of Users",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                "styleId": "1",
                                "compData": {
                                    "comp": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                    "skin": "wysiwyg.common.components.backofficetext.viewer.skins.BackOfficeTextSkin",
                                    "data": {
                                        "type": "BackOfficeText",
                                        "key": "roundedNumOfUsers"
                                    },
                                    "layout": {
                                        "width": 200,
                                        "height": 50
                                    },
                                    "componentType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText"
                                }
                            },
                            "labelText": "Back Office - Rounded Number of Users"
                        },
                        {
                            "name": "backOfficeText.numOfCountries",
                            "label": "Back Office - Number of Countries",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                "styleId": "1",
                                "compData": {
                                    "comp": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                    "skin": "wysiwyg.common.components.backofficetext.viewer.skins.BackOfficeTextSkin",
                                    "data": {
                                        "type": "BackOfficeText",
                                        "key": "numOfCountries"
                                    },
                                    "layout": {
                                        "width": 200,
                                        "height": 50
                                    },
                                    "componentType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText"
                                }
                            },
                            "labelText": "Back Office - Number of Countries"
                        },
                        {
                            "name": "backOfficeText.dailySignUps",
                            "label": "Back Office - Daily Signups",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                "styleId": "1",
                                "compData": {
                                    "comp": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                    "skin": "wysiwyg.common.components.backofficetext.viewer.skins.BackOfficeTextSkin",
                                    "data": {
                                        "type": "BackOfficeText",
                                        "key": "dailySignUps"
                                    },
                                    "layout": {
                                        "width": 200,
                                        "height": 50
                                    },
                                    "componentType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText"
                                }
                            },
                            "labelText": "Back Office - Daily Signups"
                        },
                        {
                            "name": "backOfficeText.dailyApps",
                            "label": "Back Office - Daily Apps",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                "styleId": "1",
                                "compData": {
                                    "comp": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                    "skin": "wysiwyg.common.components.backofficetext.viewer.skins.BackOfficeTextSkin",
                                    "data": {
                                        "type": "BackOfficeText",
                                        "key": "dailyApps"
                                    },
                                    "layout": {
                                        "width": 200,
                                        "height": 50
                                    },
                                    "componentType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText"
                                }
                            },
                            "labelText": "Back Office - Daily Apps"
                        },
                        {
                            "name": "backOfficeText.numOfTemplates",
                            "label": "Back Office - Number of Templates",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                "styleId": "1",
                                "compData": {
                                    "comp": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                    "skin": "wysiwyg.common.components.backofficetext.viewer.skins.BackOfficeTextSkin",
                                    "data": {
                                        "type": "BackOfficeText",
                                        "key": "numOfTemplates"
                                    },
                                    "layout": {
                                        "width": 200,
                                        "height": 50
                                    },
                                    "componentType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText"
                                }
                            },
                            "labelText": "Back Office - Number of Templates"
                        },
                        {
                            "name": "backOfficeText.numOfEmp",
                            "label": "Back Office - Number of Employees",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                "styleId": "1",
                                "compData": {
                                    "comp": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText",
                                    "skin": "wysiwyg.common.components.backofficetext.viewer.skins.BackOfficeTextSkin",
                                    "data": {
                                        "type": "BackOfficeText",
                                        "key": "numOfEmp"
                                    },
                                    "layout": {
                                        "width": 200,
                                        "height": 50
                                    },
                                    "componentType": "wysiwyg.common.components.backofficetext.viewer.BackOfficeText"
                                }
                            },
                            "labelText": "Back Office - Number of Employees"
                        },
                        {
                            "name": "PackagePickerComponent",
                            "label": "Package Picker",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.packagepicker.viewer.PackagePicker",
                                "layout": {
                                    "width": 80,
                                    "height": 80
                                }
                            },
                            "labelText": "Package Picker"
                        },
                        {
                            "name": "AreaTooltipComponent",
                            "label": "Area Tooltip",
                            "iconSrc": "wix_components.png",
                            "preset": {
                                "compType": "wysiwyg.common.components.areatooltip.viewer.AreaTooltip",
                                "layout": {
                                    "width": 80,
                                    "height": 80
                                }
                            },
                            "labelText": "Area Tooltip"
                        }
                    ],
                    "labelText": "Wix Staff",
                    "$$hashKey": "00X"
                }
            ]
        };

        resource.getResources(["topology"], function (res) {
            var topology = res.topology;
            var webAddress = topology.wysiwyg;

            //this should be in the code area - don't know how to do this
            if(W.Experiments.isExperimentOpen('wixstoreslaunch') && _.where(EditorMenuJson.items, {name:'ecom'}).length === 1){
                var ecomMenu = _.where(EditorMenuJson.items, {name:'ecom'})[0];

               //change icon to the new wixStores
                ecomMenu.iconSrc = 'bag-icon.png';

                //remove items from quick fined
                delete ecomMenu.items;
            }

            (function recurse(obj) {
                if (obj.iconSrc) {
                    obj.iconSrc = webAddress + '/images/wysiwyg/editor/editormenu/' + obj.iconSrc;
                }
                _.each(obj["items"], recurse);
            })(EditorMenuJson);

            define.resource("EditorMenu", EditorMenuJson);
        });
    });
});





