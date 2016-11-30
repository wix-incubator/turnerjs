package it.java.suites;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import tests.workingTests.SanityEditorGUIAndBasicFunctionalityIT;

@RunWith(Suite.class)
@Suite.SuiteClasses(
{
    SanityEditorGUIAndBasicFunctionalityIT.class
})

public class SanityTestSuite {
}
