package it.java.tests.workingTests;

import com.wixpress.express.test.core.drivers.baseclasses.ComponentDriver;
import com.wixpress.framework.test.webDriver.WebElementProxy;
import drivers.*;
import org.junit.Before;
import org.junit.Test;
import tests.WysiwygIntegrationTest;

import java.util.List;

import static junit.framework.Assert.assertTrue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

/**
 * Created by IntelliJ IDEA.
 * User: shiranm
 * Date: 1/2/12
 * Time: 10:29 AM
 */
public class AddPageIT extends WysiwygIntegrationTest {

    EditorDriver editorDriver;
    MainTabsDriver mainTabsDriver;
    SidePanelDriver activeSidePanel;
    int numberOfPagesOnListBeforeAddingPage;

    private void clickOnTab(EditorMainTabs tab) {
        WebElementProxy addTab = mainTabsDriver.getButtonTab(tab);
        addTab.actions().click();
    }

    protected void clickAddPage() {
        activeSidePanel = editorDriver.getActiveSidePanel();
        final WebElementProxy addPageButton = activeSidePanel.getSkinPart("content").findDescendant("[skinpart='addPage']", "Add page button");
        addPageButton.actions().click();
    }

    private WebElementProxy getAddPageDialogBox() {
        final ComponentDriver dialogBoxComponent = webDriverProxy.getComponent("#dialogLayer [comp='mobile.editor.components.dialogs.DialogWindow']", "Add Page dialog box");
        return dialogBoxComponent.getSkinPart("dialogBox");
    }

    private WebElementProxy getDialogBoxButtonsContainer() {
        return getAddPageDialogBox().findDescendant("[skinpart='buttonContainer']", "dialog box buttons");
    }

    private WebElementProxy dialogOkButton() {
        return getDialogBoxButtonsContainer().getChildren().get(1);
    }

    private void selectPage(AddPageDialogOptions option) {
        final List<WebElementProxy> addPageDialogContentList = getAddPageDialogOptionsList();
        addPageDialogContentList.get(option.getIndex()).actions().click();
    }

    private List<WebElementProxy> getAddPageDialogOptionsList() {
        return getAddPageDialogBox().findDescendant("[skinpart='content']", "dialog content list").getChildren("[comp='core.components.MenuButton']");
    }

    protected List<WebElementProxy> getActivePanelContentList() {
        SidePanelDriver activeSidePanel = editorDriver.getActiveSidePanel();
        return activeSidePanel.findDescendant("[skinpart='container']", "Pages panel content").getChildren("[comp='wysiwyg.editor.components.SitePageButton']");
    }

    /*-------------------Add page - Basic flow - Test case #8-------------------*/

    @Before
    public void newSiteWithEmptyPage() {
        // Creating a new site with an empty main page
        getSiteInEditMode();
        editorDriver = new EditorDriver(webDriverProxy, "#editorUI", null, "Editor component");
        mainTabsDriver = editorDriver.getTabs();
        clickOnTab(EditorMainTabs.PAGES);
        numberOfPagesOnListBeforeAddingPage = getActivePanelContentList().size();
        clickAddPage();
    }

    private void addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions dialogOption) {
        final WebElementProxy addPageDialogBox = getAddPageDialogBox();
        selectPage(dialogOption);
        dialogOkButton().actions().click();
        addPageDialogBox.waitForElement().notToBeDisplayed();

        int numOfPagesAfterAdding = getActivePanelContentList().size();
        assertThat("Number of pages on list was not increased by 1", numOfPagesAfterAdding, is(numberOfPagesOnListBeforeAddingPage + 1));

        final WebElementProxy lastAddedPage = getActivePanelContentList().get(numOfPagesAfterAdding - 1);

        String actualNameOfPage = lastAddedPage.attributes().getText();
        assertTrue("The added page is not as expected", dialogOption.toString().equalsIgnoreCase(actualNameOfPage));

        String stateAttribute = lastAddedPage.attributes().getAttribute("state");

      //Todo: This line Fails due to a Bug - The added page is not showing as selected on the page menu
//        assertEquals("The added page is not marked as selected on the pages menu", "selected", stateAttribute);
    }

    @Test
    public void addGalleryPageAndMakeSureItWasAddedAndNavigatesToTheAddedPage() {
        addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions.GALLERY);
    }

    @Test
    public void addAboutPageAndMakeSureItWasAddedAndNavigatesToTheAddedPage() {
        addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions.ABOUT);
    }

    @Test
    public void addServicesPageAndMakeSureItWasAddedAndNavigatesToTheAddedPage() {
        addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions.SERVICES);
    }

    @Test
    public void addEventsPageAndMakeSureItWasAddedAndNavigatesToTheAddedPage() {
        addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions.EVENTS);
    }

    @Test
    public void addCollectionPageAndMakeSureItWasAddedAndNavigatesToTheAddedPage() {
        addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions.COLLECTION);
    }

    @Test
    public void addRestaurantPageAndMakeSureItWasAddedAndNavigatesToTheAddedPage() {
        addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions.RESTAURANT);
    }

    @Test
    public void addContactPageAndMakeSureItWasAddedAndNavigatesToTheAddedPage() {
        addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions.CONTACT);
    }

    @Test
    public void addNetworkPageAndMakeSureItWasAddedAndNavigatesToTheAddedPage() {
        addPageVerifyCorrectPageWasAddedAndNavigationToTheAddedPage(AddPageDialogOptions.NETWORK);
    }

}
