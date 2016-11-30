package it.java.tests;

import com.wixpress.express.test.core.drivers.baseclasses.ComponentDriver;
import com.wixpress.framework.test.webDriver.WebDriverInit;
import com.wixpress.framework.test.webDriver.WebDriverProxy;
import com.wixpress.framework.test.webDriver.WebElementProxy;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static junit.framework.Assert.assertTrue;

/**
 * Created by IntelliJ IDEA.
 * User: Gadyk
 * Date: 12/28/11
 * Time: 1:37 PM
 * To change this template use File | Settings | File Templates.
 */

public class saveDocumentIT {
    @Autowired
    public WebDriverInit webDriverInit;
    public WebDriverProxy webDriverProxy;

    @Before
    public void start() {

       /* //Step into an existing site
        UserGuid userGuid = new UserGuid("8912aa0e-6e8d-4674-902a-26923b03eeef");
        final String domain = "meditor.crab.wixpress.com";
        final String userName = "tester";
        final String url = "http://meditor.crab.wixpress.com/site/wysiwyg/edit/9e46276b-a489-4f27-b349-96de5149fe05?mode=debug";

        webDriverProxy = new WebDriverProxy(webDriverInit.initRemoteDriver(domain, "/")
                .inMaximizedWindow()
                .asChrome()
                .withSessionCookie(1, userGuid, userName).start());

        webDriverProxy.manage().setWebDriverRetryPolicy(true, 1000, 50);
        webDriverProxy.navigation().gotoURL(url);

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }*/
    }

    @Ignore ("Fails due to a bug in the save")
    @Test
    public void saveDocumentAfterEnteringTheEditor(){

        String currentURL = webDriverProxy.getWebDriver().getCurrentUrl();

        //TODO make a change

        //Create Editor UI component
        final WebElementProxy addButton = webDriverProxy.getElement("#editorUI div#tbAdd", "Editor left edit buttons - Design button");
        ComponentDriver editorComponent = new ComponentDriver(webDriverProxy, "[comp='wysiwyg.editor.components.EditorUI']", null, "Editor component");

        //Click the Design button
        addButton.actions().click();
        WebElementProxy sidePanel = webDriverProxy.getElement(editorComponent.getLocator() + " div[skinpart='sidePanel']", "Pages side panel");
        sidePanel.waitForElement().toBeDisplayed();

        //Click on Text
        WebElementProxy panelContent = sidePanel.getChildren().get(2);
        ComponentDriver selectionListInput = new ComponentDriver(webDriverProxy, panelContent.getLocator() + " [comp='wysiwyg.editor.components.inputs.SelectionListInput'] .inline-component-group", null, "Design side panel - Selection list input");
        selectionListInput.getChildren().get(0).actions().click();
        WebElementProxy richTextComponent = webDriverProxy.getElement(editorComponent.getLocator() + " div[comp='core.components.RichText']", "RichText component");
        richTextComponent.locateById();

        //TODO: edit teh text box

         //Make sure that the save button exists
        final WebElementProxy saveButton = webDriverProxy.getElement("#Tabs_1_Button_1", "Editor Save Button");
        assertTrue("Editor Save Button exists", saveButton.attributes(false).isVisible());

        //Save the document
        saveButton.actions().click();

        //Reload the page
        webDriverProxy.getWebDriver().navigate().refresh();

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }

        //Verify the change exists
        assertTrue("Saved Rich Text component is not visible", richTextComponent.attributes().isVisible());
    }

    //Get site in edit Mode
}
