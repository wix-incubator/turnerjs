package it.java.tests;

import com.wixpress.framework.test.webDriver.WebElementProxy;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import static junit.framework.Assert.assertFalse;

/**
 * Created by IntelliJ IDEA.
 * User: jonyh
 * Date: 1/4/12
 * Time: 11:07 AM
 * To change this template use File | Settings | File Templates.
 */
public class AddIT extends WysiwygIntegrationTest{


    @Before
    public void getSite()
    {
//         getSiteInEditMode();
    }


    /**
     * Open Add side panel
     */

    public void openAddSidePanel () {

        WebElementProxy addSidePanel = webDriverProxy.getElement(("#tbAdd"), "Add side panel");
        addSidePanel.actions().click();
    }



    /**
     *    This test pick a component from the add menu and verifies it can be deleted from the "Garbage can " icon
     */
    @Ignore("wait for Push")
    @Test
    public void deleteTextComponentThroughGarbageCan()
    {

       openAddSidePanel();

        //choose "Text"
        WebElementProxy textTab =  webDriverProxy.getElement(("[comp='wysiwyg.editor.components.inputs.SelectionListInput'] [class='inline-component-group'] [id=Button_1]"), "Text Tab");
        textTab.actions().click();

        //catch the property panel
         WebElementProxy propertyPanel=  webDriverProxy.getElement( ("[comp=wysiwyg.editor.components.panels.ComponentPanel] [class=component-properties]") , "Rich text property panel");
        WebElementProxy componentEditorBox =  webDriverProxy.getElement(("[skinpart='componentEditBox']"), "Text box delete with Garbage can");
        componentEditorBox.actions().click();
        //catch and click the garbage can
        WebElementProxy textBoxGarbageCanButton =  webDriverProxy.getElement(("[skinpart='componentEditBox'] [skinpart='deleteButton']"), "Text box delete with Garbage can");
        textBoxGarbageCanButton.actions().click();


        // verify GarbageCan icon is not on the screen after deletion
          assertFalse("GarbageCan is not suppose to be visible", textBoxGarbageCanButton.attributes().isVisible());

        //verify Text Box does appear on the screen after delete
         assertFalse("Text Box is not suppose to be visible", textBoxGarbageCanButton.attributes().isVisible());

         //verify property panel does not appear on the screen
          assertFalse("Text Box is not suppose to be visible", propertyPanel.attributes().isVisible());



    }


}
