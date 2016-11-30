package bootstrap;

import com.wixpress.jsRunnerClient.TesticleClient;
import com.wixpress.jsTestRunnerAPI.meta.TestParameters;
import org.junit.runner.RunWith;
import org.junit.Ignore;

@RunWith(TesticleClient.class)
@TestParameters(
        htmlSpecRunner = "bootstrap-spec-runner.html",
        htmlSpecRunnerFolder = "bootstrap/src/test/html",
        baseTestFolder = "..",
        requiredBrowsers = "chrome",
        scriptsFolders = "bootstrap/src/main,bootstrap/src/test,html-test-framework/src/main",
        projectName = "bootstrap"
        ,numberOfParallelSpecGroups = 3
    )
public class TestEditor {
}
