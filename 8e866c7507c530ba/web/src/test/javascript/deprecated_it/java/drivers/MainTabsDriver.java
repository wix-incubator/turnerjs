package it.java.drivers;

import com.wixpress.express.test.core.drivers.baseclasses.EditorComponentDriver;
import com.wixpress.express.test.core.drivers.baseclasses.WebDriverProxyWithComponents;
import com.wixpress.framework.test.webDriver.WebElementProxy;

/**
 * Created by IntelliJ IDEA.
 * User: shaharz
 * Date: 12/28/11
 * Time: 1:15 PM
 * To change this template use File | Settings | File Templates.
 */
public class MainTabsDriver extends EditorComponentDriver{

    public MainTabsDriver(WebDriverProxyWithComponents webdriver, String locator) {
        super(webdriver, locator);
    }

        public WebElementProxy getButtonTab(EditorMainTabs tab){
            return getSkinPart("itemsContainer").getChildren().get(tab.getIndex());
    }


}
