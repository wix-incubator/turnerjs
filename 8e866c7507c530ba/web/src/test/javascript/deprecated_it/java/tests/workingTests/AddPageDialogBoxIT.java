package it.java.tests.workingTests;

import com.wixpress.express.test.core.drivers.baseclasses.ComponentDriver;
import com.wixpress.framework.test.webDriver.WebElementProxy;
import drivers.*;
import org.hamcrest.Matchers;
import org.junit.Before;
import org.junit.Test;
import tests.WysiwygIntegrationTest;

import java.awt.*;
import java.util.List;

import static junit.framework.Assert.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

/**
 * Created by IntelliJ IDEA.
 * User: shiranm
 * Date: 1/2/12
 * Time: 5:24 PM
 */
public class AddPageDialogBoxIT extends WysiwygIntegrationTest {

    EditorDriver editorDriver;
    MainTabsDriver mainTabsDriver;
    SidePanelDriver activeSidePanel;

    @Before
    public void newSiteWithEmptyPage() {

        // Creating a new site with an empty main page
        getSiteInEditMode();
        editorDriver = new EditorDriver(webDriverProxy, "#editorUI", null, "Editor component");
        mainTabsDriver = editorDriver.getTabs();
        clickOnTab(EditorMainTabs.PAGES);
        clickAddPage();
        getAddPageDialogBox().waitForElement().toBeDisplayed();
    }

    private void clickOnTab(EditorMainTabs tab) {

        WebElementProxy addTab = mainTabsDriver.getButtonTab(tab);
        addTab.actions().click();
    }

    protected void clickAddPage() {

        final WebElementProxy addPageButton = getAddPageButton();
        addPageButton.actions().click();
    }

    private WebElementProxy getAddPageButton() {

        activeSidePanel = editorDriver.getActiveSidePanel();
        return activeSidePanel.getSkinPart("content").findDescendant("[skinpart='addPage']", "Add page button");
    }

    private WebElementProxy getAddPageDialogBox() {

        final ComponentDriver dialogBoxComponent = webDriverProxy.getComponent("#dialogLayer [comp='mobile.editor.components.dialogs.DialogWindow']", "Add Page dialog box");
        return dialogBoxComponent.getSkinPart("dialogBox");
    }

    private ComponentDriver dialogCancelButton() {

        return webDriverProxy.getComponent("[skinpart='cancelContainer'] [comp='mobile.editor.components.EditorButton']", "dialog ok button");// getDialogBoxButtonsContainer().getChildren().get(0);
    }

    private ComponentDriver dialogOkButton() {

        return webDriverProxy.getComponent("[skinpart='okContainer'] [comp='mobile.editor.components.EditorButton']", "dialog ok button");
    }

    private WebElementProxy dialogXButton() {

        return webDriverProxy.getComponent("[skinpart='xButton']", "dialog X Button");
    }

    private void selectPage(AddPageDialogOptions option) {

        final List<WebElementProxy> addPageDialogContentList = getAddPageDialogBox().findDescendant("[skinpart='content']", "dialog content list").getChildren("[comp='core.components.MenuButton']");
        addPageDialogContentList.get(option.getIndex()).actions().click();
    }

    private List<WebElementProxy> getAddPageDialogOptionsList() {

        return getAddPageDialogBox().findDescendant("[skinpart='content']", "dialog content list").getChildren("[comp='core.components.MenuButton']");
    }

    /*----------------------Add Page - GUI - Test Case #7----------------------*/

    //@Ignore("")
    @Test
    public void addPageDialogOpensWhenClickingAddPage() {

        final WebElementProxy addPageDialogBox = getAddPageDialogBox();
        addPageDialogBox.waitForElement().toExist();
        assertTrue("Add page dialog is not showing after clicking add page", addPageDialogBox.attributes().isVisible());
    }

    //@Ignore("")
    @Test
    public void addPageButtonExists() {

        dialogXButton().actions().click();
        assertTrue("Add page button is not visible", getAddPageButton().attributes().isVisible());
    }

    //@Ignore("")
    @Test
    public void addPageDialogClosesWhenClickingCancel() {

        final WebElementProxy addPageDialogBox = getAddPageDialogBox();
        dialogCancelButton().actions().click();
        addPageDialogBox.waitForElement().notToBeDisplayed();
        assertFalse("Add page dialog box is visible after clicking on the cancel button", addPageDialogBox.attributes().isVisible());
    }

    //@Ignore("")
    @Test
    public void addPageDialogClosesWhenClickingXButton() {

        final WebElementProxy addPageDialogBox = getAddPageDialogBox();
        addPageDialogBox.waitForElement().toBeDisplayed();
        dialogXButton().actions().click();
        addPageDialogBox.waitForElement().notToBeDisplayed();
        assertFalse("Add page dialog box is visible after clicking on the X button", addPageDialogBox.attributes().isVisible());
    }


    //@Ignore("")//Todo: check if the location is fixed and not changed......
    @Test
    public void addPageDialogOpensInTheCorrectLocation() {

        Point location = new Point(581, 247);
        assertEquals("Dialog Box is not opened in the correct location", location, getAddPageDialogBox().attributes().getLocation());
    }

    //@Ignore("")
    @Test
    public void allButtonsAppearsAndEnabledOrDisabled() {

        assertTrue("Cancel Button is not visible", dialogCancelButton().attributes().isVisible());
        assertTrue("Cancel Button is not enabled", dialogCancelButton().attributes().isEnabled());

        assertTrue("Ok Button is not visible", dialogOkButton().attributes().isVisible());
        assertFalse("Ok Button is enabled before selecting a page", dialogOkButton().attributes().isEnabled());

        selectPage(AddPageDialogOptions.GALLERY);
        assertTrue("Ok Button is not enabled after selecting a page", dialogOkButton().attributes().isEnabled());

        assertTrue("X Button is not visible", dialogXButton().attributes().isVisible());
        assertTrue("X Button is not enabled", dialogXButton().attributes().isEnabled());
    }

    //@Ignore("")
    @Test
    public void allTextsAppears() {

        String pageDialogTitle = getAddPageDialogBox().findDescendant("[skinpart='dialogTitle']", "Dialog Title").attributes().getText();
        assertEquals("", "Choose the page you want to add", pageDialogTitle);

        String nameYourPageTitle = getAddPageDialogBox().findDescendant("[skinpart='nameYourPageTitle']", "Name Your Page Title").attributes().getText();
        assertEquals("", "Name your page:", nameYourPageTitle);
    }

    //@Ignore("")
    @Test
    public void noDefaultPageIsSelected() {

        final List<WebElementProxy> addPageDialogOptionsList = getAddPageDialogOptionsList();
        String expectedState = "idle";
        boolean anyDefaultPageSelected = false;
        for (WebElementProxy pageOption : addPageDialogOptionsList) {
            String actualState = pageOption.attributes().getState();

            if (actualState != null)/*!expectedState.equals(actualState)*/ {
                anyDefaultPageSelected = true;
            }
        }
        assertThat("a default page is selected", anyDefaultPageSelected, is(false));
    }

    //@Ignore("")
    @Test
    public void correctPageMarkedAsSelectedWhenSelectingPage() {

        verifyCorrectPageMarkedAsSelected(AddPageDialogOptions.ABOUT);
        verifyCorrectPageMarkedAsSelected(AddPageDialogOptions.GALLERY);
        verifyCorrectPageMarkedAsSelected(AddPageDialogOptions.NETWORK);
    }

    private void verifyCorrectPageMarkedAsSelected(AddPageDialogOptions selectedPage) {
        selectPage(selectedPage);
        final List<WebElementProxy> addPageDialogOptionsList = getAddPageDialogOptionsList();
        final String expectedState = "selected";
        final String actualItemState = addPageDialogOptionsList.get(selectedPage.getIndex()).attributes().getState();

        assertThat("The clicked menu item is not marked as selected (" + selectedPage.toString() + ")", actualItemState, is(expectedState));
    }

    //@Ignore("")
    @Test
    public void nameYourPageDefaultValuesWhenSelectingPages() {

        for (AddPageDialogOptions addPageOption : AddPageDialogOptions.values()) {
            verifyDefaultPageNameWhenSelectingPage(addPageOption);
        }
    }

    private void verifyDefaultPageNameWhenSelectingPage(AddPageDialogOptions addPageDialogOption) {
        String expectedPageName = addPageDialogOption.toString();

        selectPage(addPageDialogOption);
        WebElementProxy pageNameInputBox = getAddPageDialogBox().findDescendant("[skinpart='nameYourPageInput']", "nameYourPage input box");

        assertThat("The name of page was not changed to the selected page name (" + expectedPageName + ")", pageNameInputBox.attributes().getValue(), is(Matchers.equalToIgnoringCase(expectedPageName)));
    }

    //    //@Ignore("")
    @Test
    public void pagePreviewAndDescriptionAreChangedAccordingToTheSelectedPage() {
        for (AddPageDialogOptions addPageOption : AddPageDialogOptions.values()) {
            verifyPagePreviewAndDescriptionChangeAccordingToThePage(addPageOption);
        }
    }

    private void verifyPagePreviewAndDescriptionChangeAccordingToThePage(AddPageDialogOptions pageOption) {
        selectPage(pageOption);

        final WebElementProxy previewImage = getAddPageDialogBox().findDescendant("[skinpart='preview']", "iPhone preview image");
        final String imageSource = previewImage.attributes().getSrc();

        assertThat("Add page dialog box - Page preview image is not as expected", imageSource, is(Matchers.endsWith(pageOption.getRelatedPreviewImageName())));

        final WebElementProxy pageDescription = getAddPageDialogBox().findDescendant("[skinpart='pageDescription']", "page description");
        final String pageDescriptionText = pageDescription.attributes().getText();

//        assertThat("Add page dialog box - Page description is not as expected" ,pageDescriptionText, is("")); // Todo: Add the real page description 
    }

}
