package com.salman.herbalencyclopedia;

import android.app.Application;
import android.webkit.WebView;

/**
 * موسوعة الأعشاب الطبية - نقطة انطلاق التطبيق
 */
public class HerbalApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }
}
