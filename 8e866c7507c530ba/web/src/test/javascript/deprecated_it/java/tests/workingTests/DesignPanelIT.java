package it.java.tests.workingTests;

import com.wixpress.framework.test.webDriver.WebElementProxy;
import it.java.drivers.EditorDriver;
import org.junit.Before;
import org.junit.Test;
import tests.WysiwygIntegrationTest;

import static junit.framework.Assert.*;


/**
 * Created by IntelliJ IDEA.
 * User: jonyh
 * Date: 1/2/12
 * Time: 11:34 AM
 * To change this template use File | Settings | File Templates.
 */

public class DesignPanelIT extends WysiwygIntegrationTest {

    private EditorDriver editorDriver;

    @Before
    public void getSite() {
        getSiteInEditMode();
        editorDriver = new EditorDriver(webDriverProxy, "#editorUI", null, "Editor component");
    }

    /**
     * Open Design side panel
     */
    public void openDesignSidePanel() {
        WebElementProxy designSidePanel = webDriverProxy.getElement(("#tbDesign"), "Design side panel");
        designSidePanel.actions().click();
    }

    /**
     * This Test Verifies that the design Title is visible and correct
     */
    @Test
    public void openDesignSidePanelAndVerifyTitleTextAndVisibility() {
        openDesignSidePanel();
        WebElementProxy designSidePanelTitle = webDriverProxy.getElement(("[comp='wysiwyg.editor.components.panels.base.SidePanel'] .panel-header [skinpart=title]"), "Editor Preview Button");
        //verify Title is visible
        assertTrue("DesignPanel Button is not visible", designSidePanelTitle.attributes().isVisible());

        //verify publish button text is correct
        String actual = designSidePanelTitle.attributes().getText();
        String expected = "Design";
        assertEquals("The design Title is incorrect", expected, actual);
    }

    /**
     * This Test Verifies that the design description is correct
     */
    @Test
    public void openDesignSidePanelAndVerifyDescriptionVisibility() {
        openDesignSidePanel();
        WebElementProxy designSidePanelTitle = webDriverProxy.getElement(("[comp='wysiwyg.editor.components.panels.base.SidePanel'] .panel-header [skinpart=description]"), "Editor Preview Button");
        //verify description is visible
        assertTrue("DesignPanel description is not visible", designSidePanelTitle.attributes().isVisible());

        //verify description text is correct
        String actual = designSidePanelTitle.attributes().getText();
        String expected = "Choose what elements to style and whatever other instructions the respectable user may need.";
        assertEquals("Text of description is incorrect", expected, actual);
    }

    /**
     * This test verifies that in the design menu all the text is visible and correct
     */
    @Test
    public void openDesignSidePanelAndVerifyContentTextAndVisibility() {
        openDesignSidePanel();
        WebElementProxy designPanel = editorDriver.getActiveSidePanel().findDescendant("[comp='wysiwyg.editor.components.panels.DesignPanel']", "design panel");
        WebElementProxy designMenuItemsContainer = designPanel.findDescendant("[skinpart='collection']", "menu items container");

        int NumberOfMenuItems = designMenuItemsContainer.getChildren().size();
        String[] designTabs = new String[NumberOfMenuItems];

        designTabs[0] = "Switch Theme";
        designTabs[1] = "Background";
        designTabs[2] = "Colors";
//        designTabs[3] = "Advanced Styles";
        designTabs[3] = "Fonts";

        for (int i = 0; i < NumberOfMenuItems; i++) {
            String actualItemText = designMenuItemsContainer.getChildren().get(i).attributes().getText();
            assertEquals("Text of design Tab is incorrect", designTabs[i], actualItemText);
        }
    }

    /**
     * Open Design panel and verifies that ("X") button is working
     */
    @Test
    public void openDesignSidePanelAndVerifyCloseButtonVisibilityAndUsability() {
        openDesignSidePanel();
        WebElementProxy designSidePanelCloseButton = webDriverProxy.getElement("[comp='wysiwyg.editor.components.panels.base.SidePanel'] [skinpart=topBar] [skinpart=closeButton]", "Editor Preview Button");
        //verify description is visible
        assertTrue("DesignPanel X is visible", designSidePanelCloseButton.attributes().isVisible());

        //verify close button is working
        designSidePanelCloseButton.actions().click();
        WebElementProxy designSidePanel = webDriverProxy.getElement(("[comp='wysiwyg.editor.components.panels.base.SidePanel']"), "Design menu close Button");
        assertFalse("DesignPanel suppose to be closed", designSidePanelCloseButton.attributes().isVisible());
    }

}
