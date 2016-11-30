package web;

import com.wixpress.jsRunnerClient.TesticleClient;
import com.wixpress.jsTestRunnerAPI.meta.TestParameters;
import org.junit.runner.RunWith;
import org.junit.Ignore;

@Ignore
@RunWith(TesticleClient.class)
@TestParameters(
        htmlSpecRunner = "wysiwyg-spec-runner-new.html",
        htmlSpecRunnerFolder = "html-client/web/src/test/html",
        requiredBrowsers = "chrome",
        baseTestFolder = "../..",
        scriptsFolders = "html-client/web/src/main,html-client/web/src/test,html-client/core/src/main,html-client/bootstrap/src/main,html-client/skins/src/main,html-client/html-test-framework/src/main,html-client/langs/src/main,tpa-client/src/main",
        projectName = "web",
        numberOfParallelSpecGroups = 6
)
public class TestEditor {
}
