package it.java.drivers;

/**
 * Created by IntelliJ IDEA.
 * User: shiranm
 * Date: 1/9/12
 * Time: 11:26 AM
 */
public enum AddComponentCategories {
    TEXT(0),
    MEDIA(1),
    SOCIAL(2),
    GALLERY(3),
    WIDGETS(4),
    OTHER(5);

    int categoryIndex;

    AddComponentCategories(int index) {
        categoryIndex = index;
    }

    public int getIndex() {
        return categoryIndex;
    }
}

