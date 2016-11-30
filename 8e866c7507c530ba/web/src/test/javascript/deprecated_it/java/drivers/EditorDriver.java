package it.java.drivers;

import com.wixpress.express.test.core.drivers.baseclasses.ButtonDriver;
import com.wixpress.express.test.core.drivers.baseclasses.ComponentDriver;
import com.wixpress.express.test.core.drivers.baseclasses.WebDriverProxyWithComponents;
import com.wixpress.framework.test.webDriver.WebDriverProxy;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: shaharz
 * Date: 12/28/11
 * Time: 12:49 PM
 * To change this template use File | Settings | File Templates.
 */
public class EditorDriver extends ComponentDriver{

    public EditorDriver(WebDriverProxyWithComponents webdriver, String locator, @javax.annotation.Nullable String iframeLocator, String description) {
        super(webdriver, locator, iframeLocator, description);
    }

    public MainTabsDriver getTabs(){
        return (MainTabsDriver)getSkinPartAsComponent("mainTabs", MainTabsDriver.class);
    }

    public SidePanelDriver getActiveSidePanel(){
        return (SidePanelDriver)getSkinPartAsComponent("sidePanel", SidePanelDriver.class);
    }
}
