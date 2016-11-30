package it.java.drivers;

public enum AddComponentOptions {

    RICHTEXT(AddComponentCategories.TEXT, 0),

    GALLERY(AddComponentCategories.MEDIA, 0),
    PHOTO(AddComponentCategories.MEDIA, 1),
    SOUND_CLOUD(AddComponentCategories.MEDIA, 2),
    VIDEO(AddComponentCategories.MEDIA, 3),

    FB_LIKE(AddComponentCategories.SOCIAL, 0),
    FB_COMMENT(AddComponentCategories.SOCIAL, 1),
    GOOGLE_PLUS(AddComponentCategories.SOCIAL, 2),
    TW_TWEET(AddComponentCategories.SOCIAL, 3),
    TW_FOLLOW(AddComponentCategories.SOCIAL, 4),
    TW_FEED(AddComponentCategories.SOCIAL, 5),

    GOOGLE_MAP(AddComponentCategories.WIDGETS, 0),
    HTML_COMP(AddComponentCategories.WIDGETS, 1),

    AREA(AddComponentCategories.OTHER, 0),
    HORIZ_MENU(AddComponentCategories.OTHER, 1),
    FIVE_GRID(AddComponentCategories.OTHER, 2),
    VERTICAL_LINE(AddComponentCategories.OTHER, 3),
    SCREEN_WIDTH_CONT(AddComponentCategories.OTHER, 4);

    AddComponentCategories componentCategory;

    int subMenuIndex;

    AddComponentOptions(AddComponentCategories componentCategory, int subMenuIndex){
        this.subMenuIndex = subMenuIndex;
        this.componentCategory = componentCategory;
    }

    public AddComponentCategories getComponentCategory() {
        return componentCategory;
    }

    public int getSubMenuItemIndex() {
        return subMenuIndex;
    }

}
