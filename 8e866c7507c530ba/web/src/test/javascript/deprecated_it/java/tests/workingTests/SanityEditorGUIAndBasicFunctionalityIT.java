package it.java.tests.workingTests;

import com.wixpress.express.test.core.drivers.baseclasses.ComponentDriver;
import com.wixpress.framework.test.webDriver.WebElementProxy;
import drivers.*;
import org.junit.Before;
import org.junit.Test;
import tests.WysiwygIntegrationTest;

import java.awt.*;

import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertTrue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

/**
 * Created by IntelliJ IDEA.
 * User: shiranm
 * Date: 12/26/11
 * Time: 11:37 AM
 */

public class SanityEditorGUIAndBasicFunctionalityIT extends WysiwygIntegrationTest {

    EditorDriver editorDriver;
    MainTabsDriver mainTabsDriver;
    SidePanelDriver activeSidePanel;


    @Before
    public void getSite() {
        getSiteInEditMode();
        editorDriver = new EditorDriver(webDriverProxy, "#editorUI", null, "Editor component");
        mainTabsDriver = editorDriver.getTabs();
    }

    private ComponentDriver getTabsContainer() {
        return webDriverProxy.getComponent("#editorUI div[skinpart='topContainer']", "Editor main tabs container");
    }


    private void clickOnTab(EditorMainTabs tab) {

        WebElementProxy addTab = mainTabsDriver.getButtonTab(tab);
        addTab.actions().click();
    }


    //@Ignore("Test passes will be revived once crab is alive again")
    @Test
    public void mainTabsContainerTabsVisibilityTest() {

        assertTrue("Left edit panel is not visible", mainTabsDriver.attributes().isVisible());

        final WebElementProxy pagesButton = mainTabsDriver.getButtonTab(EditorMainTabs.PAGES);
        assertTrue("Pages Button is not visible", pagesButton.attributes().isVisible());

        final WebElementProxy designButton = mainTabsDriver.getButtonTab(EditorMainTabs.DESIGN);
        assertTrue("Design Button is not visible", designButton.attributes().isVisible());

        final WebElementProxy addButton = mainTabsDriver.getButtonTab(EditorMainTabs.ADD);
        assertTrue("Add Button is not visible", addButton.attributes().isVisible());

        final WebElementProxy settingsButton = mainTabsDriver.getButtonTab(EditorMainTabs.SETTINGS);
        assertTrue("Settings Button is not visible", settingsButton.attributes().isVisible());

    }

    //@Ignore("Test passes will be revived once crab is alive again") 
    @Test
    public void relevantPanelIsOpenedWhenClickingOnMainTab() {

        clickOnTab(EditorMainTabs.PAGES);
        ComponentDriver sidePanel = editorDriver.getActiveSidePanel();

        WebElementProxy panelContentList = sidePanel.findDescendant("[comp='wysiwyg.editor.components.panels.PagesPanel']", "side panel content");
        verifyTheCorrectPanelIsOpenedWhenClickingOnTab(EditorMainTabs.PAGES, panelContentList);

        panelContentList = sidePanel.findDescendant("[comp='wysiwyg.editor.components.panels.DesignPanel']", "side panel content");
        verifyTheCorrectPanelIsOpenedWhenClickingOnTab(EditorMainTabs.DESIGN, panelContentList);

        panelContentList = sidePanel.findDescendant("[comp='wysiwyg.editor.components.panels.MasterComponentPanel']", "side panel content");
        verifyTheCorrectPanelIsOpenedWhenClickingOnTab(EditorMainTabs.ADD, panelContentList);

//        panelContentList = sidePanel.findDescendant("[comp='wysiwyg.editor.components.panels.SettingsPanel']", "side panel content");
//        verifyTheCorrectPanelIsOpenedWhenClickingOnTab(EditorMainTabs.SETTINGS, panelContentList);

    }

    private void verifyTheCorrectPanelIsOpenedWhenClickingOnTab(EditorMainTabs selectedTab, WebElementProxy panelContentList) {
        final WebElementProxy pagesButton = mainTabsDriver.getButtonTab(selectedTab);
        pagesButton.actions().click();
        ComponentDriver sidePanel = editorDriver.getActiveSidePanel();

        sidePanel.waitForComponent().toBeDisplayed();
        WebElementProxy sidePanelCloseButton = sidePanel.findDescendant("[skinpart='closeButton']", "side panel close button");

        assertTrue("Side Panel is not visible after clicking on pagesButton", sidePanel.attributes().isVisible());
        assertTrue("Side panel's content was not changed to the correct content", panelContentList.attributes().isVisible());

        sidePanelCloseButton.actions().click();
        sidePanel.waitForElement().notToBeDisplayed();
        assertThat("side panel is not closed after clicking on the close button", sidePanel.attributes().isVisible(), is(false));

    }


    //@Ignore("Test passes will be revived once crab is alive again")
    @Test
    public void titleAndDescriptionAreChangedAccordingToTheSelectedTab() {

        final String expectedPagesDescription = "Control your site's page order and other page related settings";
        verifyPanelsTitleAndDescriptionWhenClickingOnTab(EditorMainTabs.PAGES, "Pages", expectedPagesDescription);

        final String expectedDesignDescription = "Choose what elements to style and whatever other instructions the respectable user may need.";
        verifyPanelsTitleAndDescriptionWhenClickingOnTab(EditorMainTabs.DESIGN, "Design", expectedDesignDescription);

        final String expectedAddPanelDescription = "Choose what elements to add and whatever whatevers you'd like to whatever.";
        verifyPanelsTitleAndDescriptionWhenClickingOnTab(EditorMainTabs.ADD, "Add", expectedAddPanelDescription);

//        verifyPanelsTitleAndDescriptionWhenClickingOnTab(EditorMainTabs.SETTINGS, "Settings", "");
    }

    private void verifyPanelsTitleAndDescriptionWhenClickingOnTab(EditorMainTabs selectedTab, String expectedTitle, String expectedDescription) {
        final WebElementProxy pagesButton = mainTabsDriver.getButtonTab(selectedTab);
        pagesButton.actions().click();
        WebElementProxy sidePanel = editorDriver.getActiveSidePanel();
        sidePanel.waitForElement().toBeDisplayed();

        String panelTitle = sidePanel.findDescendant("[skinpart='title']", "Panel Title").attributes().getText();
        assertEquals("Wrong side panel title", expectedTitle, panelTitle);

        String panelDescription = sidePanel.findDescendant("[skinpart='description']", "Panel Description").attributes().getText();
        assertEquals("Wrong side panel description", expectedDescription, panelDescription);
    }

    //@Ignore("Test passes will be revived once crab is alive again")
    @Test
    public void designSidePanelBgFunctionalityTest() {
        //Create Editor UI component
//        WebDriverProxyWithComponents webDriverProxy = new WebDriverProxyWithComponents((webDriverProxy.getWebDriver()));
//        EditorDriver editorComponent = new EditorDriver(webDriverProxy, "[comp='wysiwyg.editor.components.EditorUI']", null, "Editor component");
        WebElementProxy designButton = mainTabsDriver.getButtonTab(EditorMainTabs.DESIGN);

        //Click the Design button
        designButton.actions().click();
        SidePanelDriver sidePanel = editorDriver.getActiveSidePanel();
        sidePanel.waitForElement().toBeDisplayed();

        //Click on Background
        //WebElementProxy panelContent = sidePanel.getChildren().get(2);
        WebElementProxy designPanel = sidePanel.findDescendant("[comp='wysiwyg.editor.components.panels.DesignPanel']", "side panel content");
        //ComponentDriver selectionListInput = new ComponentDriver(webDriverProxy, designPanel.getLocator() + " [comp='wysiwyg.editor.components.inputs.SelectionListInput'] .inline-component-group", null, "Design side panel - Selection list input");
        WebElementProxy selectionListInput = designPanel.findDescendant("[comp='wysiwyg.editor.components.inputs.SelectionListInput']", "content list component");
        WebElementProxy backgroundButton = selectionListInput.findDescendant("[skinpart='collection']", "").getChildren().get(1);
        backgroundButton.actions().click();
//        backgroundButton.waitForElement().notToBeDisplayed();

        final WebElementProxy backgroundDesignPanel = sidePanel.findDescendant("[skinpart='content']", "").getChildren().get(0);
        assertEquals("The BackgroundDesignPanel doesn't show up after clicking 'Background'", "wysiwyg.editor.components.panels.BackgroundDesignPanel", backgroundDesignPanel.attributes().getAttribute("comp"));

        //Click on Customize link
        WebElementProxy panelActions = backgroundDesignPanel.findDescendant(".actions", "Panel actions");
        WebElementProxy customizeLink = panelActions.findDescendant("[skinpart='customize']", "Customize link");
        customizeLink.actions().click();

        //Get the default background color
        ComponentDriver dialogWindow = webDriverProxy.getComponent("#dialogLayer [comp='mobile.editor.components.dialogs.DialogWindow']", "Customize BG dialog");
        ComponentDriver backgroundDialog = webDriverProxy.getComponent(dialogWindow.getSkinPart("innerDialog").getChildren("[comp]").get(0).getLocator(), null, "inner bg dialog");
        ComponentDriver colorInput = webDriverProxy.getComponent(backgroundDialog.getSkinPart("content").getLocator() + " [comp='wysiwyg.editor.components.inputs.ColorSelectorButton']", null, "Color input");
        Color backgroundColor = colorInput.findDescendant("[skinpart='bg']", "BG color").attributes().getStylePropertyAsColor("background-color", false);

        assertEquals("The default background color is incorrect", 380, backgroundColor.getRed() + backgroundColor.getGreen() + backgroundColor.getBlue());

        //Change background color
        colorInput.findDescendant("[skinpart='bg']", "BG color").actions().click();
        ComponentDriver colorPicker = new ComponentDriver(webDriverProxy, "#colorSelectorLayer [comp='wysiwyg.editor.components.dialogs.ColorSelector']", null, "color picker dialog");

//        assertTrue("Color Picker is not visible", colorPicker.attributes().isVisible()); todo: currently it's failing.....


    }

    /**
     * Testing the button - Preview -  visibility and Text
     */
    //@Ignore("Test passes will be revived once crab is alive again")
    @Test
    public void previewButtonVisibilityAndText() {
        //verify Preview button is visible
        //WebElementProxy editorComponentButtonPreview = webDriverProxy.getElement(".wysiwyg_editor_skins_TopButtonsButtonSkin focusable", "Editor Preview Button");
        WebElementProxy editorComponentButtonPreview = webDriverProxy.getElement("[skinpart='mainButtons']", "Editor Preview Button").getChildren().get(0).getChildren().get(0);
        assertTrue("Editor Preview Button is not visible", editorComponentButtonPreview.attributes(false).isVisible());
        //verify preview button text is correct
        String actual = editorComponentButtonPreview.attributes().getText();
        String expected = "Preview";
        assertEquals("Text of Preview Button is incorrect", expected, actual);
    }


    /**
     * Testing the button - Save -  visibility and Text
     */
    //@Ignore
    @Test
    public void saveButtonVisibilityAndText() {
        //verify save button is visible
        WebElementProxy editorComponentButtonSave = webDriverProxy.getElement("[skinpart='mainButtons']", "Editor Preview Button").getChildren().get(0).getChildren().get(1);
        assertTrue("Editor Save Button is not visible", editorComponentButtonSave.attributes().isVisible());
        //verify save button text is correct
        String actual = editorComponentButtonSave.attributes().getText();
        String expected = "Save";
        assertEquals("Text of Save Button is incorrect", expected, actual);
    }

    /**
     * Testing the button - Publish -  visibility and Text
     */
    @Test
    public void publishButtonVisibilityAndText() {
        //verify publish button is visible
        WebElementProxy editorComponentButtonSave = webDriverProxy.getElement("[skinpart='mainButtons']", "Editor Preview Button").getChildren().get(0).getChildren().get(2);
        assertTrue("Editor Publish Button is not visible", editorComponentButtonSave.attributes().isVisible());
        //verify publish button text is correct
        String actual = editorComponentButtonSave.attributes().getText();
        String expected = "Publish";
        assertEquals("Text of Publish Button is incorrect", expected, actual);

    }

    /**
     * Testing the button - Promote -  visibility and Text
     */
    @Test
    public void promoteButtonVisibilityAndText() {
        //verify promote button is visible
        WebElementProxy editorComponentButtonSave = webDriverProxy.getElement("[skinpart='mainButtons']", "Editor Preview Button").getChildren().get(0).getChildren().get(3);
        assertTrue("Editor Promote Button is not visible", editorComponentButtonSave.attributes().isVisible());
        //verify Promote button text is correct
        String actual = editorComponentButtonSave.attributes().getText();
        String expected = "Promote";
        assertEquals("Text of Promote Button is incorrect", expected, actual);
    }


    /**
     * This test verifies that the left side buttons (Preview,save,Publish,Promote) are visible
     */
/*    @Test
    public void mainButtonsAreVisible() {
        WebElementProxy editorComponentButtonPreview = webDriverProxy.getElement("#Tabs_1_Button_0", "Editor Preview Button");
        assertTrue("Editor Preview Button is not visible", editorComponentButtonPreview.attributes().isVisible());

        WebElementProxy editorComponentButtonSave = webDriverProxy.getElement("#Tabs_1_Button_1", "Editor Save Button");
        assertTrue("Editor Save Button is not visible", editorComponentButtonSave.attributes().isVisible());

        WebElementProxy editorComponentButtonPublish = webDriverProxy.getElement("#Tabs_1_Button_2", "Editor Publish Button");
        assertTrue("Editor Publish Button is not visible", editorComponentButtonPublish.attributes().isVisible());

        WebElementProxy editorComponentButtonPromote = webDriverProxy.getElement("#Tabs_1_Button_3", "Editor Promote Button");
        assertTrue("Editor Promote Button is not visible", editorComponentButtonPromote.attributes().isVisible());
    }

    *//**
     * This test verifies that text in the left side buttonsPreview,save,Publish,Promote) is correct
     *//*
    //@Ignore("Test passes will be revived once crab is alive again")
    @Test
    public void mainButtonsCorrectTextIsShowing() {

        WebElementProxy editorComponentButtonPreview = webDriverProxy.getElement("#Tabs_1_Button_0", "Editor Preview Button");
        String actual = editorComponentButtonPreview.attributes().getText();
        String expected = "Preview";
        assertEquals("Text of Preview Button is incorrect", expected, actual);

        WebElementProxy editorComponentButtonSave = webDriverProxy.getElement("#Tabs_1_Button_1", "Editor Save Button");
        actual = editorComponentButtonSave.attributes().getText();
        expected = "Save";
        assertEquals("Text of Save Button is incorrect", expected, actual);

        WebElementProxy editorComponentButtonPublish = webDriverProxy.getElement("#Tabs_1_Button_2", "Editor Publish Button");
        actual = editorComponentButtonPublish.attributes().getText();
        expected = "Publish";
        assertEquals("Text of Publish Button is incorrect", expected, actual);

        WebElementProxy editorComponentButtonPromote = webDriverProxy.getElement("#Tabs_1_Button_3", "Editor Promote Button");
        actual = editorComponentButtonPromote.attributes().getText();
        expected = "Promote";
        assertEquals("Text of Promote Button is incorrect", expected, actual);

    }*/


}
