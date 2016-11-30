package it.java.drivers;

import java.lang.String; /**
 * Created by IntelliJ IDEA.
 * User: shaharz
 * Date: 12/28/11
 * Time: 1:26 PM
 * To change this template use File | Settings | File Templates.
 */
public enum EditorMainTabs {

    PAGES(0, "tbPages"),
    DESIGN(1, "tbDesign"),
    ADD(2, "tbAdd"),
    SETTINGS(3, "tbSettings");

    private int index;
    private String id;

    EditorMainTabs(int index, String id)
    {
        this.index = index;
        this.id = id;
    }

    public int getIndex()
    {
        return index;
    }

    public String getId()
    {
        return id;
    }

//    public String getId(){
//        switch (index){
//            case 0:
//                return "tbPages";
//            case 1:
//                return "tbDesign";
//            case 2:
//                return "tbAdd";
//            case 3:
//                return "tbSettings";
//        }
//        return null;
//    }
}
