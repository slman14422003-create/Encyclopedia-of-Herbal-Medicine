# Keep WebView JavaScript interface methods
-keepclassmembers class com.salman.herbalencyclopedia.* {
   public *;
}
-keepattributes JavascriptInterface
-keepattributes *Annotation*

# Standard AndroidX / Material keep rules are provided by consumer proguard files
-dontwarn org.chromium.**
