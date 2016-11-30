package it.java.tests.workingTests;

import com.wixpress.framework.test.webDriver.WebElementProxy;
import drivers.*;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import tests.WysiwygIntegrationTest;

import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

/**
 * Created by IntelliJ IDEA.
 * User: shiranm
 * Date: 12/29/11
 * Time: 9:41 AM
 */
public class SaveSiteWithComponentIT extends WysiwygIntegrationTest {

    EditorDriver editorDriver;
    MainTabsDriver mainTabsDriver;

    @Before
    public void newSiteWithEmptyPage() {
        // Creating a new site with an empty main page
        createNewSite();
        editorDriver = new EditorDriver(webDriverProxy, "#editorUI", null, "Editor component");
        mainTabsDriver = editorDriver.getTabs();
        deleteItemsFromCurrentPage();
    }

    protected void clickOnTab(EditorMainTabs tab) {
        WebElementProxy addTab = mainTabsDriver.getButtonTab(tab);
        addTab.actions().click();
    }

    private List<WebElementProxy> getActivePanelContentList() {
        SidePanelDriver activeSidePanel = editorDriver.getActiveSidePanel();
        return activeSidePanel.findDescendant("[skinpart='collection']", "add panel content").getChildren();
    }

    private void addComponentToPageAndMakeSureItsSaved(AddComponentOptions componentOption, String expectedComp) {

        int numberOfElementsOnPageBeforeAddingElement = getPage(0).getChildrenCount();

        clickOnTab(EditorMainTabs.ADD);

        List<WebElementProxy> panelContentList = getActivePanelContentList();
        int categoryIndex = componentOption.getComponentCategory().getIndex();
        panelContentList.get(categoryIndex).actions().click();


        panelContentList = getActivePanelContentList();
        panelContentList.get(componentOption.getSubMenuItemIndex()).actions().click();

        WebElementProxy saveButton = getSaveButton();
        saveButton.actions().click();

        refreshBrowserPage();
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        List<WebElementProxy> mainPageContent = getPage(0).getChildren();
        int numberOfElementsOnPageAfterAddingText = getPage(0).getChildrenCount();

        assertThat("Number of elements on page is not as expected - the added component was not saved", numberOfElementsOnPageAfterAddingText, is(numberOfElementsOnPageBeforeAddingElement + 1));

        String actualComponentAttribute = mainPageContent.get(numberOfElementsOnPageAfterAddingText - 1).attributes().getAttribute("comp");

        assertThat(actualComponentAttribute, is(expectedComp));
    }

    @Test
    public void addRichTextAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.RICHTEXT, "wysiwyg.viewer.components.WRichText");
    }

    @Ignore("Fails due to a bug - the area component is not saved")
    @Test
    public void addAreaAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.AREA, "core.components.Container");
    }

    @Test
    public void addGalleryAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.GALLERY, "core.components.PhotoGalleryGrid");
    }

   @Ignore("Fails due to a bug - the component is not saved")
   @Test
    public void addGoogleMapAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.GOOGLE_MAP, "wysiwyg.viewer.components.GoogleMap");
    }

    @Test
    public void addHorizontalMenuAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.HORIZ_MENU, "wysiwyg.viewer.components.HorizontalMenu");
    }

    @Ignore("Fails due to a bug - the component is not saved")
    @Test
    public void addHtmlCompAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.HTML_COMP, "wysiwyg.viewer.components.HtmlComponent");
    }

    @Ignore("Fails due to a bug - the component is not saved")
    @Test
    public void addFiveGridAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.FIVE_GRID, "wysiwyg.viewer.components.FiveGridLine");
    }

    @Test
    public void addPhotoAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.PHOTO, "wysiwyg.viewer.components.WPhoto");
    }

    @Test
    public void addScreenWidthContAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.SCREEN_WIDTH_CONT, "wysiwyg.viewer.components.ScreenWidthContainer");
    }

    @Test
    public void addFacebookLikeAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.FB_LIKE, "wysiwyg.viewer.components.WFacebookLike");
    }

    @Test
    public void addFacebookCommentAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.FB_COMMENT, "wysiwyg.viewer.components.WFacebookComment");
    }

    @Test
    public void addGooglePlusAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.GOOGLE_PLUS, "wysiwyg.viewer.components.WGooglePlusOne");
    }

    @Ignore("Fails due to a bug - the component is not saved")
    @Test
    public void addSoundCloudAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.SOUND_CLOUD, "wysiwyg.viewer.components.SoundCloudWidget");
    }

    @Ignore("Fails due to a bug - the component is not saved")
    @Test
    public void addTweeterTweetAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.TW_TWEET, "wysiwyg.viewer.components.WTwitterTweet");
    }

    @Test
    public void addTweeterFollowAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.TW_FOLLOW, "wysiwyg.viewer.components.WTwitterFollow");
    }

    @Ignore("Fails due to a bug - the component is not saved")
    @Test
    public void addTweeterFeedAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.TW_FEED, "wysiwyg.viewer.components.TwitterFeed");
    }

    @Ignore("Fails due to a bug - the component is not saved")
    @Test
    public void addVideoAndSave() {
        addComponentToPageAndMakeSureItsSaved(AddComponentOptions.VIDEO, "wysiwyg.viewer.components.Video");
    }
}
