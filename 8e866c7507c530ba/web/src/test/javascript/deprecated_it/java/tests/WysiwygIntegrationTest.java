package it.java.tests;

import Utils.BrowserConfigurationHolder;
import Utils.EnvironmentConfigurationHolder;
import Utils.Utils;
import com.wixpress.express.test.core.drivers.baseclasses.ComponentDriver;
import com.wixpress.express.test.core.drivers.baseclasses.WebDriverProxyWithComponents;
import com.wixpress.framework.domain.UserGuid;
import com.wixpress.framework.test.LoggingSpringJUnit4ClassRunner;
import com.wixpress.framework.test.webDriver.WebDriverInit;
import com.wixpress.framework.test.webDriver.WebDriverProxy;
import com.wixpress.framework.test.webDriver.WebElementProxy;
import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;

import javax.annotation.Resource;

/**
 * Created by IntelliJ IDEA.
 * User: shaharz
 * Date: 12/28/11
 * Time: 4:26 PM
 * To change this template use File | Settings | File Templates.
 */
@RunWith(LoggingSpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:html-wysiwyg-it-spring-config.xml")
public abstract class WysiwygIntegrationTest {

    @Autowired
    private WebDriverInit webDriverInit;

    @Resource
    public EnvironmentConfigurationHolder environmentConfig;

    @Resource
    public BrowserConfigurationHolder browserConfig;

    public WebDriverProxyWithComponents webDriverProxy;
    private UserGuid userGuid;
    private String subDomain;
    private String domain;
    private String userName;
    private String applicationRoot;
    private String baseUrl;
    private String siteGuid;

    @BeforeClass
    public static void initJsMap(){
        Utils.InitComponentsMap();

    }

    @Before
    public void loadEnvironmentConfiguration()
    {
        initConfigurationValues();
    }

    public void getSiteInEditMode(){
        String startUrl = "web/site/edit/"+siteGuid+"?mode=debug";

        WebDriverProxy webDriver = new WebDriverProxy(createWebDriver(domain, userGuid, userName).start());
        webDriverProxy = new WebDriverProxyWithComponents(webDriver.getWebDriver());

        webDriverProxy.manage().setWebDriverRetryPolicy(true, 1000, 50);
        webDriverProxy.navigation().gotoURL(baseUrl + startUrl);

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }
    }

    @After
    public void stopWebDriver(){
        webDriverInit.cleanup();
    }

    private WebDriverInit.GenericWebDriverSetUp createWebDriver(String domain, UserGuid userGuid, String userName) {
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability("platform", Platform.XP);
        capabilities.setCapability("name", "WYSIWYG IT test");

        WebDriverInit.RemoteWebDriverSetup webDriverSetUp = webDriverInit.initRemoteDriver(domain, "/")
                .inMaximizedWindow();

        if (false)
            // TODO (yishai): Once the Sauce Labs legal issue sare cleared, uncomment this line
//        if (browserConfig.getInSauce())
            webDriverSetUp = webDriverSetUp.inSauce(browserConfig.getSauceUserName(),
                    browserConfig.getSauceAccessKey(),
                    capabilities);

        return webDriverSetUp.asBrowser(browserConfig.getBrowserType())
                .withSessionCookie(1, userGuid, userName);
    }

    private void initConfigurationValues(){
        userGuid = new UserGuid(environmentConfig.getUserGuid());
        subDomain = environmentConfig.getSubdomain();
        domain = environmentConfig.getDomain();
        userName = environmentConfig.getUserName();
        applicationRoot = environmentConfig.getApplicationRoot();
        baseUrl = "http://" + subDomain + "" + domain + "/" + applicationRoot + "/";
        siteGuid = environmentConfig.getSiteGuid();
    }

    public void createNewSite(){

        String startUrl = "web/site/new";
        String siteName = "test_" + (new java.util.Date().getTime());

        WebDriverProxy webDriver = new WebDriverProxy(createWebDriver(domain, userGuid, userName).start());
        webDriverProxy = new WebDriverProxyWithComponents(webDriver.getWebDriver());
        webDriverProxy.manage().setWebDriverRetryPolicy(true, 1000, 50);
        webDriverProxy.navigation().gotoURL(baseUrl + startUrl);


        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }



        WebElementProxy siteNameInputField = webDriverProxy.getElement("#input", "site Name Input Field");
        siteNameInputField.actions().click();
        siteNameInputField.actions().setText(siteName);

        webDriverProxy.getElement("#submit", "Create new site button").actions().click();

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }

        webDriverProxy.getElement("a", "Start Editing link").actions().click();

        try {
            Thread.sleep(7000);
        } catch (InterruptedException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }
    }

    /**
     * Used in cases that the mouseEventCatcher gets in the way of grabbing an element on the screen
     * @param currentItem: WebElementProxy
     */
    protected void clickOnPreviewElement(WebElementProxy currentItem) {
        final WebElement webElement = webDriverProxy.getWebDriver().findElement(By.cssSelector(currentItem.getLocator()));
        Actions actionBuilder = new Actions(webDriverProxy.getWebDriver());
        actionBuilder.click(webElement).build().perform();
    }


    /*------------------------- Utility Methods --------------------------*/
    protected void deleteItemsFromCurrentPage() {
        WebElementProxy mainPage = getPage(0);

        // Counting the elements on the current page (Main page)
        int numberOfComponentsOnPage = mainPage.getChildrenCount();

        // Deleting all the components starting from the second one - the first one is PageTitle
        for (int i=0; i<numberOfComponentsOnPage; i++)
        {
            // Clicking on the first item from the children list
            WebElementProxy currentItem = mainPage.getChildren().get(1);
            clickOnPreviewElement(currentItem);

            ComponentDriver componentEditBox = webDriverProxy.getComponent("[comp='wysiwyg.editor.components.ComponentEditBox']", "component edit box");
            componentEditBox.waitForComponent().toBeDisplayed();
            componentEditBox.getSkinPart("deleteButton").actions().click();
        }
    }

    protected WebElementProxy getPage(int index) {
        // The pages container inside the component
        final ComponentDriver sitePageGroup = webDriverProxy.getComponent("[comp='wysiwyg.viewer.components.PageGroup']", "live-preview-iframe", "site pages group");
        WebElementProxy pageGroup = sitePageGroup.getSkinPart("inlineContent");
        return pageGroup.getChildren().get(index);
    }

    protected void refreshBrowserPage() {
        webDriverProxy.getWebDriver().navigate().refresh();
    }

    protected WebElementProxy getSaveButton() {
        WebElementProxy mainButtonsContainer = webDriverProxy.getComponent("[skinpart='topContainer'] [skinpart='mainButtons']", "").getSkinPart("itemsContainer");
        return mainButtonsContainer.getChildren().get(1);
    }

}
