package it.java.drivers;


//page options
public enum AddPageDialogOptions {
    GALLERY(0, "gallery.jpg"),
    ABOUT(1, "about.jpg"),
    SERVICES(2, "services.jpg"),
    EVENTS(3, "events.jpg"),
    COLLECTION(4, "collection.jpg"),
    RESTAURANT(5, "restaurant.jpg"),
    CONTACT(6, "contact.jpg"),
    NETWORK(7, "network.jpg");

    private String locator;
    private int index;
    private String relatedPreviewImageName;

    AddPageDialogOptions(int index, String relatedImageName)
    {
        this.index = index;
        this.relatedPreviewImageName = relatedImageName;
        locator = "#MenuButton_" + index;
    }

    public String getLocator()
    {
        return locator;
    }

    public int getIndex()
    {
        return index;
    }

    public String getRelatedPreviewImageName()
    {
        return relatedPreviewImageName;
    }

}
