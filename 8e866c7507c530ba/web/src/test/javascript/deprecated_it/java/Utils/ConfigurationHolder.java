package it.java.Utils;

import com.wixpress.framework.configuration.spring.SpringConfigurationManagerAdapter;

/**
 * User: yishaib
 * Date: 1/1/12
 */
public abstract class ConfigurationHolder
{
    SpringConfigurationManagerAdapter configAdapter;

    public ConfigurationHolder(SpringConfigurationManagerAdapter configAdapter)
    {
        this.configAdapter = configAdapter;
        loadValuesFromConfigurationFile();
    }

    public abstract void loadValuesFromConfigurationFile();

    protected String getPropertyValue(String nodePath)
    {

        if (!configAdapter.getAsProperties().containsKey(nodePath))
        {
             return "";
        }

        // value is returned in the format "value,value:
        String[] values = configAdapter.getAsProperties().get(nodePath).toString().split(",");
        if (values.length > 0) {
            return values[0];
        }
        else {
            return "";
        }
    }
}
