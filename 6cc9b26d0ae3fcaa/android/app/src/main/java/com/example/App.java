package com.example;

import android.content.Intent;
import android.support.annotation.Nullable;

import com.facebook.react.ReactPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.reactlibrary.image.ImageEditorCallback;
import com.reactlibrary.react.ReactNativeImageEditPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.controllers.ActivityCallbacks;
import com.wix.RNCameraKit.RNCameraKitPackage;

import java.util.Arrays;
import java.util.List;

public class App extends NavigationApplication {
    ImageEditorCallback imageEditorCallback = new ImageEditorCallback();

    @Override
    public void onCreate() {
        super.onCreate();
        setActivityCallbacks(new ActivityCallbacks() {
            @Override
            public void onActivityResult(int requestCode, int resultCode, Intent data) {
                imageEditorCallback.onActivityResult(requestCode, resultCode, data);
            }
        });
    }

    @Override
    public boolean isDebug() {
        return BuildConfig.DEBUG;
    }

    @Nullable
    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return Arrays.asList(
                new RNCameraKitPackage(),
                new RNDeviceInfo(),
                new ReactNativeImageEditPackage(imageEditorCallback)
        );
    }
}
