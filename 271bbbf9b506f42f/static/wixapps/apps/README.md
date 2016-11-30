# descriptor.json
## Introduction
Each wixapps classics application has its own descriptor.json file (e.g. - [blog](https://github.com/wix/santa/blob/master/static/wixapps/apps/blog/descriptor.json), [faq](https://github.com/wix/santa/blob/master/static/wixapps/apps/faq/descriptor.json), [news](https://github.com/wix/santa/blob/master/static/wixapps/apps/news/descriptor.json)).

The descriptor is responsible for telling the wixapps proxies mechanism how to render components of the application.
A good example would be the blog posts feed - how should it be constructed? what's the HTML that should eventually be rendered? What proxies should be used (e.g. - we should use a photo proxy in order to create a photo component)? How can a user customize the look and feel of the component (e.g. - can he alter the text size? And what about the image style)?

There's a whole lot of information pieces residing inside the descriptor, and the purpose of this page is to shed some light on the important parts of this monster.

## The important sections
* `packageName`: the name of the app (e.g. `'blog'`).
* `pages`: info about special pages of the app, e.g. - when the user adds a blog to his site, two pages are created - posts list page, and single post page.
* `parts`: the parts (also known as AppParts in the wixapps related code) available to the user when he creates his site, e.g. - when the user has a blog he can add a posts feed, a recent posts feed, a ticker... All of these are described here.
    * `name`: identifies the type of the part (actually, there’s `id` field for that, but `name` is human-friendly).
    * `views`: when the user wants to customize this part he first chooses a pre-defined layout (e.g. - for posts feed he can choose that the media will be on the left / right). After choosing a layout he can customize it. Each layout has a name. The views array contains the names of these layouts. Later on, we’ll see the info regarding what’s customizable in each view.
* `viewDescriptions`: contains simple descriptions of all of the available views of all available parts.
    * `comps`: this is used inside santa-editor: when the user opens the design panel, he sees a list of sub-components he can customize. This list is generated from the `comps` section.
* `generatedViews`: describe all there’s to know about each view.

    **An important note**: as the name implies, this section is automatically generated, so don't change it manually. It's generated from a `views.xml` file which resides next to the descriptor file (this process is described [here](https://github.com/wix/wix-apps-xml-views)). It may be easier to understand the views.xml file, but I'll describe the generated result, as this is what's accessible from the wixapps code.

    * `name`: the view to which this entry applies. If it applies to multiple views, name will be an array of names of views.
    * `format`: can be `'Mobile'`, non-specified at all (or `''`), or `'*'`. Specifies when this view is applied - only on mobile, only on desktop, or both (`'*'`).
    * `comp`: defines which items compose the AppPart, e.g.- a ticker has a title, a date, and a photo, so all of these will be described here. wixapps uses it in order to create the GUI of the AppPart.
    * `forType`: for which type of data does this view definition apply, e.g. - the posts feed AppPart handles an array of posts. when `forType === 'Array'` it specifies how to handle the array of posts (e.g. - `comp` will contain the components which comprise a repeatable skeleton. Somewhere inside `comp` we'll see that what defines the interior of the skeleton is the view with the same name. When this view will be generated, we'll refer to the item inside `views` with the same `name` but `forType` will be `Post` - this one describes how a single post looks like).
    * `value`: an expression which is used in conjunction with SwitchBoxes (found inside `comp`) - the evaluated value is compared against each `case`.
    * `customizations`: some parts inside `comp` can be customized by the user. All of the customization options are described here. The editor project generates setting inputs out of this section (used inside the AppPart settings panel).
        * `priority`: bigger priority means it’ll appear higher in the editor GUI.
        * `fieldId`: the id of the component to which the customization applies. How is this component found? Just traverse over `comp`'s items until you find the one with this id.
        * `key`: after finding the component using `fieldId`, `key` is used in order to find the component’s field to which the customization applies.
        * `input`: describes the component that the user will use in order to perform the customization inside the editor (e.g. - a slider).
            * `name`: the type of the control (e.g.: `'slider'`).
            * `label`: the label describing what the control does.
            * `defaultVal`: the default value used. This will be used, unless the user changes the control’s value. Once he changes the value, the new value will be saved in document services (in appLogicCustomizations).
* `customizations`: a long array of info about all of the customizations available. The interesting field is `value` - the default value to use (unless the user overrides it - which resides in appLogicCustomizations). What’s the difference between this value and `defaultVal` from above? I have no idea…

    These have the same structure as the structure of appLogicCustomizations entries (except for `type: 'AppPartCustomization'` which only appears inside appLogicCustomizations entries).
* `lang`: all the translations (e.g. - of labels).

## Experiments
Currently the descriptor supports experiments in two section types:
* `generatedViews`: there's a whole expressions mechanism built inside wixapps, which supports running some logics. inside `functionLibrary.js` a support for using experiments inside the expressions has been added.

    `blogVideoThumbnail` is a good example for such experiment. If the experiment is off, we want that posts with a video will generate a `videoThumbProxy`, and if the experiment is on - we want a `videoProxy`. So we used a `switchProxy` with `value` set to an expression containing `experiment('blogVideoThumbnail')`. Nice...
    
    Just keep in mind that in order to support new experiments, you must `require` them inside `functionLibrary.js` and add them to `functions.experiment`.
* `viewDescriptions.comps`: if the user should be able to customize a different list of sub components in the editor's design panel based on an experiment, you should use an experiment in this section. Each entry inside `comps` can have an `experiment` field. This field refers to an object with two fields:
    * `name`: the name of the experiment to use.
    * `value`: the value of the experiment (if the experiment's value is different than `value`, this component will be ignored).

    The code responsible for this experiments support resides inside `classics.js`'s `getInnerComps`. In order to support new experiments, you should `require` them here as well.
