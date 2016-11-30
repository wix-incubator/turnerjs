define([
    "wixappsCore/core/proxyFactory",
    "wixappsCore/proxies/zoomLinkProxy",
    "wixappsCore/proxies/appLinkProxy",
    "wixappsCore/proxies/nativeAppLinkProxy",
    "wixappsCore/proxies/areaProxy",
    "wixappsCore/proxies/buttonProxy",
    "wixappsCore/proxies/button2Proxy",
    "wixappsCore/proxies/clippedParagraphProxy",
    "wixappsCore/proxies/comboBoxProxy",
    "wixappsCore/proxies/cssProxy",
    "wixappsCore/proxies/dateProxy",
    "wixappsCore/proxies/erasableTextInputProxy",
    "wixappsCore/proxies/fixedRatioProxy",
    "wixappsCore/proxies/galleryProxy",
    "wixappsCore/proxies/hBoxProxy",
    "wixappsCore/proxies/horizontalLineProxy",
    "wixappsCore/proxies/iconProxy",
    "wixappsCore/proxies/imageButtonProxy",
    "wixappsCore/proxies/imageButtonWithTextProxy",
    "wixappsCore/proxies/imageProxy",
    "wixappsCore/proxies/inlineSpacerProxy",
    "wixappsCore/proxies/inlineTextProxy",
    "wixappsCore/proxies/labelProxy",
    "wixappsCore/proxies/linkProxy",
    "wixappsCore/proxies/listProxy",
    "wixappsCore/proxies/mediaLabelProxy",
    "wixappsCore/proxies/paginatedColumnGalleryProxy",
    "wixappsCore/proxies/paginationProxy",
    "wixappsCore/proxies/sliderGalleryProxy",
    "wixappsCore/proxies/stackProxy",
    "wixappsCore/proxies/switchBoxProxy",
    "wixappsCore/proxies/textAreaProxy",
    "wixappsCore/proxies/textInputProxy",
    "wixappsCore/proxies/toggleProxy",
    "wixappsCore/proxies/vBoxProxy",
    "wixappsCore/proxies/flowListProxy",
    "wixappsCore/proxies/videoProxy",
    "wixappsCore/proxies/videoThumbProxy",
    "wixappsCore/proxies/viewProxy",
    "wixappsCore/proxies/verticalLineProxy"
], function (proxyFactory, zoomLink, appLink, nativeAppLink, area, button, button2, clippedParagraph, comboBox, css, date, erasableTextInput, fixedRatio, gallery, hBox,
             horizontalLine, icon, imageButton, imageButtonWithText, image, inlineSpacer, inlineText, label, link, list, mediaLabel, paginatedColumnGallery, paginationProxy,
             sliderGallery, stack, switchBox, textArea, textInput, toggle, vBox, flowList, video, videoThumb, view, verticalLine) {
    'use strict';
    proxyFactory.register("ZoomLink", zoomLink);
    proxyFactory.register("AppLink", appLink);
    proxyFactory.register("NativeAppLink", nativeAppLink);
    proxyFactory.register("Area", area);
    proxyFactory.register("Container", area);
    proxyFactory.register("Button2", button2);
    proxyFactory.register("Button", button);
    proxyFactory.register("ClippedParagraph", clippedParagraph);
    proxyFactory.register("ClippedParagraph2", clippedParagraph);
    proxyFactory.register("ComboBox", comboBox);
    proxyFactory.register("Css", css);
    proxyFactory.register("Date", date);
    proxyFactory.register("ErasableTextInput", erasableTextInput);
    proxyFactory.register("FixedRatioLayout", fixedRatio);
    proxyFactory.register("Gallery", gallery);
    proxyFactory.register("HBox", hBox);
    proxyFactory.register("HorizontalLine", horizontalLine);
    proxyFactory.register("Icon", icon);
    proxyFactory.register("ImageButton", imageButton);
    proxyFactory.register("ImageButtonWithText", imageButtonWithText);
    proxyFactory.register("Image", image);
    proxyFactory.register("InlineSpacer", inlineSpacer);
    proxyFactory.register("InlineText", inlineText);
    proxyFactory.register("Label", label);
    proxyFactory.register("Link", link);
    proxyFactory.register("MediaLabel", mediaLabel);
    proxyFactory.register("ColumnGallery", paginatedColumnGallery);
    proxyFactory.register("PaginatedColumnGallery", paginatedColumnGallery);
    proxyFactory.register("Pagination", paginationProxy);
    proxyFactory.register("SliderGallery", sliderGallery);
    proxyFactory.register("Stack", stack);
    proxyFactory.register("SwitchBox", switchBox);
    proxyFactory.register("TextArea", textArea);
    proxyFactory.register("TextInput", textInput);
    proxyFactory.register("Toggle", toggle);
    proxyFactory.register("VBox", vBox);
    proxyFactory.register("VerticalList", list);
    proxyFactory.register("List2", list);
    proxyFactory.register("PaginatedList", list);
    proxyFactory.register("FlowList", flowList);
    proxyFactory.register("Video", video);
    proxyFactory.register("VideoThumb", videoThumb);
    proxyFactory.register("View", view);
    proxyFactory.register("VerticalLine", verticalLine);
});
