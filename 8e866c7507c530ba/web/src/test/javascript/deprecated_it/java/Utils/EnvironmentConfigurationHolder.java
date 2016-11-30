package it.java.Utils;

import com.wixpress.framework.configuration.spring.SpringConfigurationManagerAdapter;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * User: yishaib
 * Date: 12/28/11
 */
public class EnvironmentConfigurationHolder extends ConfigurationHolder
{

    private String subdomain;
    private String domain;
    private String port;
    private String userGuid;
    private String userName;
    private String applicationRoot;
    private String siteGuid;


    @Autowired
    public EnvironmentConfigurationHolder(SpringConfigurationManagerAdapter configAdapter)
    {
        super(configAdapter);
    }

    public String getSiteGuid()
    {
        return siteGuid;
    }

    public String getApplicationRoot()
    {
        return applicationRoot;
    }

    public String getSubdomain()
    {
        return subdomain;
    }

    public String getDomain()
    {
        return domain;
    }

    public String getPort()
    {
        return port;
    }

    public String getUserGuid()
    {
        return userGuid;
    }

    public String getUserName()
    {
        return userName;
    }

    @Override
    public void loadValuesFromConfigurationFile()
    {
        try
        {
            subdomain               = getServerProperty("subdomain");
            domain                  = getServerProperty("domain");
            port                    = getServerProperty("port");
            userGuid                = getServerProperty("userGuid");
            userName                = getServerProperty("userName");
            applicationRoot         = getServerProperty("applicationRoot");
            siteGuid                = getServerProperty("siteGuid");
        }
        catch(Exception ex)
        {
            throw(new RuntimeException(ex));
        }
    }

    private String getServerProperty(String prop)
    {
        String serverNode = getPropertyValue("tested-server.active_server");
        return getPropertyValue("tested-server" + "" + serverNode + "." + prop);
    }

}
