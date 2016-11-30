package it.java.Utils;

import com.wixpress.express.test.core.drivers.baseclasses.ButtonDriver;
import com.wixpress.express.test.core.drivers.baseclasses.ColorPickerDriver;
import com.wixpress.express.test.core.drivers.baseclasses.ComponentDriver;
import com.wixpress.express.test.core.drivers.baseclasses.DialogWindowDriver;
import it.java.drivers.DesignPanelDriver;
import it.java.drivers.EditorDriver;
import it.java.drivers.PanelSelectionListDriver;
import it.java.drivers.SidePanelDriver;


import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: shaharz
 * Date: 12/28/11
 * Time: 12:10 PM
 * To change this template use File | Settings | File Templates.
 */
public class Utils {


    static boolean wasInitialized = false;
    // populateClassMap with components
    public static void InitComponentsMap() {

        if(wasInitialized) return;
        wasInitialized=true;
        // EditorImageDriver
        ComponentDriver.javaClassToJsClassMap.put(ColorPickerDriver.class,              "mobile.editor.components.ColorPicker");
        ComponentDriver.javaClassToJsClassMap.put(DialogWindowDriver.class,             "mobile.editor.components.dialogs.DialogWindow");
        ComponentDriver.javaClassToJsClassMap.put(EditorDriver.class,                   "wysiwyg.editor.components.EditorUI");
        ComponentDriver.javaClassToJsClassMap.put(ButtonDriver.class,                   "mobile.editor.components.Button");
        ComponentDriver.javaClassToJsClassMap.put(SidePanelDriver.class,                "wysiwyg.editor.components.panels.base.SidePanel");
        ComponentDriver.javaClassToJsClassMap.put(DesignPanelDriver.class,              "wysiwyg.editor.components.panels.DesignPanel");
        ComponentDriver.javaClassToJsClassMap.put(PanelSelectionListDriver.class,       "wysiwyg.editor.components.inputs.SelectionListInput");


        // we save the reverse mapping
        for(Map.Entry<Class, String> javaToJsEntry: ComponentDriver.javaClassToJsClassMap.entrySet()) {
            if(ComponentDriver.jsClassToJavaClassMap.containsKey(javaToJsEntry.getValue())){
                continue;
            }
            ComponentDriver.jsClassToJavaClassMap.put(javaToJsEntry.getValue(), javaToJsEntry.getKey());
        }
    }

}
