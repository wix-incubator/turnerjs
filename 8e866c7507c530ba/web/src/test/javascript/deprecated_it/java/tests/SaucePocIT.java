package it.java.tests;

import Utils.BrowserConfigurationHolder;
import Utils.EnvironmentConfigurationHolder;
import com.wixpress.framework.test.LoggingSpringJUnit4ClassRunner;
import com.wixpress.framework.test.webDriver.WebDriverInit;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.By;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;

import javax.annotation.Resource;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 * User: Yishaib
 * Date: 12/29/11
 * Time: 2:40 PM
 * To change this template use File | Settings | File Templates.
 */
@RunWith(LoggingSpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:html-wysiwyg-it-spring-config.xml")
public class SaucePocIT
{
    private WebDriver driver;

    @Autowired
    private WebDriverInit webDriverInit;

    @Resource
    public BrowserConfigurationHolder browserConfig;

    @Resource
    public EnvironmentConfigurationHolder environmentConfig;

    @Before
    public void setUp(){
        setUpWebDriver();
    }

    private void setUpWebDriver() {

        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability("platform", Platform.XP);
        capabilities.setCapability("name", "Testing Selenium 2 with Java on Sauce on firefox mac");

        WebDriverInit.RemoteWebDriverSetup webDriverSetUp = webDriverInit.initRemoteDriver("crab.wixpress.com", "/");

        if (browserConfig.getInSauce())
            webDriverSetUp = webDriverSetUp.inSauce(browserConfig.getSauceUserName(),
                    browserConfig.getSauceAccessKey(),
                    capabilities);

        webDriverSetUp.asBrowser(browserConfig.getBrowserType());
//                .withSessionCookie(1, userGuid, userName)

        driver = webDriverSetUp.start();

        /*this.driver = new RemoteWebDriver(
                new URL("http://" +
                        browserConfig.getSauceUserName() +
                        ":" +
                        browserConfig.getSauceAccessKey() +
                        "@ondemand.saucelabs.com:80/wd/hub"),
                capabilities);*/
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);

    }

    @Ignore
    @Test
    public void basicSauce() throws Exception {
        this.driver.get("http://saucelabs.com/test/guinea-pig");
        driver.findElement(By.id("comments")).sendKeys("This is Wix's first chrome Sauce test. YAY!");
        Thread.sleep(5000);
    }

    @Ignore("No point in wasting our Sauce minutes in vain")
    @Test
    public void openSiteOnInternalServer() throws Exception {
        this.driver.get("http://www.crab.wixpress.com/");
        System.out.println(this.driver.getTitle());
        Thread.sleep(5000);
    }

    @After
    public void tearDown() throws Exception {
        if (this.driver != null)
            this.driver.quit();
    }
}
