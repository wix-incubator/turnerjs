package it.java.Utils;

import com.wixpress.framework.configuration.spring.SpringConfigurationManagerAdapter;
import com.wixpress.framework.test.webDriver.WebDriverInit;

/**
 * User: yishaib
 * Date: 1/1/12
 */
public class BrowserConfigurationHolder extends ConfigurationHolder
{
    private Boolean inSauce;
    private String sauceUserName;
    private String sauceAccessKey;
    private WebDriverInit.BrowserType browserType;

    public BrowserConfigurationHolder(SpringConfigurationManagerAdapter configAdapter, WebDriverInit.BrowserType browserType)
    {
        super(configAdapter);
        this.browserType = browserType;
    }

    public Boolean getInSauce()
    {
        return inSauce;
    }

    public WebDriverInit.BrowserType getBrowserType()
    {
        return browserType;
    }

    public String getSauceUserName()
    {
        return sauceUserName;
    }

    public String getSauceAccessKey()
    {
        return sauceAccessKey;
    }

    private String getBrowserProperty(String prop)
    {
        return getPropertyValue("browser" + "" + prop);
    }

    @Override
    public void loadValuesFromConfigurationFile()
    {
        try
        {
            inSauce                 = Boolean.parseBoolean(getBrowserProperty("inSauce"));
            sauceUserName           = getBrowserProperty("sauce.username");
            sauceAccessKey          = getBrowserProperty("sauce.access-key");
        }

        catch(Exception ex)

        {
            throw(new RuntimeException(ex));
        }
    }
}
