package com.example;

import android.support.annotation.NonNull;

import com.reactnativenavigation.NavigationApplication;
import com.facebook.react.ReactPackage;
import com.xebia.reactnative.TabLayoutPackage;
import com.wix.RNCameraKit.RNCameraKitPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;

import java.util.Arrays;
import java.util.List;

public class Application extends NavigationApplication {
    @Override
    public boolean isDebug() {
        // Make sure you are using BuildConfig from your own application
        return BuildConfig.DEBUG;
    }

    @NonNull
    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return Arrays.asList(
                new RNDeviceInfo(),
                new TabLayoutPackage(),
                new RNCameraKitPackage()
        );
    }
}
