define.dataSchema('BasicMenuItem', {
    link: "ref",
    items: "list",
    label: "string"
});

define.dataSchema('MenuDataRef', {
    menuRef: {
        type: "ref",
        'default': "#MAIN_MENU"
    }
});