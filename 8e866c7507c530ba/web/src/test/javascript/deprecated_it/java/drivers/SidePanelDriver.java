package it.java.drivers;

import com.wixpress.express.test.core.drivers.baseclasses.ComponentDriver;
import com.wixpress.express.test.core.drivers.baseclasses.EditorComponentDriver;
import com.wixpress.express.test.core.drivers.baseclasses.WebDriverProxyWithComponents;
import com.wixpress.framework.test.webDriver.WebDriverProxy;

/**
 * Created by IntelliJ IDEA.
 * User: shaharz
 * Date: 12/28/11
 * Time: 1:52 PM
 * To change this template use File | Settings | File Templates.
 */
public class SidePanelDriver extends EditorComponentDriver{

    public SidePanelDriver(WebDriverProxyWithComponents webdriver, String locator) {
        super(webdriver, locator);
    }

    public Object getSidePanelContent(Class contentClass){
        return contentClass.cast(getSkinPartAsComponent("content", contentClass));


    }


}
