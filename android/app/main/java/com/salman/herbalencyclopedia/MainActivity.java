package com.salman.herbalencyclopedia;

import android.Manifest;
import android.app.DownloadManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;
import androidx.webkit.WebViewFeature;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.salman.herbalencyclopedia.databinding.ActivityMainBinding;

/**
 * النشاط الرئيسي - يعرض موسوعة الأعشاب الطبية داخل WebView حديث
 * يستخدم WebViewAssetLoader لتقديم الملفات المحلية عبر أصل آمن (https)
 * بدلاً من file:// حتى يعمل Service Worker وبقية واجهات PWA بشكل طبيعي.
 */
public class MainActivity extends AppCompatActivity {

    private static final String TAG = "HerbalEncyclopedia";
    private static final String APP_DOMAIN = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + APP_DOMAIN + "/assets/index.html";
    private static final String OFFLINE_URL = "https://" + APP_DOMAIN + "/assets/offline.html";

    private ActivityMainBinding binding;
    private WebViewAssetLoader assetLoader;
    private boolean isOfflinePageShown = false;
    private long lastBackPressTime = 0L;

    private ValueCallback<Uri[]> filePathCallback;
    private ActivityResultLauncher<Intent> fileChooserLauncher;
    private ActivityResultLauncher<String> cameraPermissionLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // إبقاء شاشة البداية حتى يبدأ تحميل الصفحة فعلياً
        splashScreen.setKeepOnScreenCondition(() -> binding.progressBar.getProgress() < 15);

        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain(APP_DOMAIN)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        registerActivityResultLaunchers();
        setupEdgeToEdge();
        setupWebView();
        setupSwipeRefresh();
        setupBackNavigation();

        if (savedInstanceState != null) {
            binding.webView.restoreState(savedInstanceState);
        } else {
            binding.webView.loadUrl(START_URL);
        }
    }

    private void registerActivityResultLaunchers() {
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (filePathCallback == null) return;
                    Uri[] results = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        String dataString = result.getData().getDataString();
                        if (dataString != null) {
                            results = new Uri[]{Uri.parse(dataString)};
                        } else if (result.getData().getClipData() != null) {
                            int count = result.getData().getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = result.getData().getClipData().getItemAt(i).getUri();
                            }
                        }
                    }
                    filePathCallback.onReceiveValue(results);
                    filePathCallback = null;
                });

        cameraPermissionLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestPermission(),
                granted -> Log.d(TAG, "Camera permission granted=" + granted));
    }

    @SuppressWarnings("SetJavaScriptEnabled")
    private void setupWebView() {
        WebView webView = binding.webView;
        WebSettings settings = webView.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportMultipleWindows(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setGeolocationEnabled(false);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);

        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            boolean nightMode = (getResources().getConfiguration().uiMode
                    & android.content.res.Configuration.UI_MODE_NIGHT_MASK)
                    == android.content.res.Configuration.UI_MODE_NIGHT_YES;
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(settings, nightMode);
        }

        webView.setWebViewClient(new AppWebViewClient());
        webView.setWebChromeClient(new AppWebChromeClient());

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            try {
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                String fileName = URLUtil.guessFileName(url, contentDisposition, mimeType);
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, fileName);
                DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    Toast.makeText(this, fileName, Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Log.e(TAG, "Download failed", e);
            }
        });
    }

    /**
     * يضبط ارتفاع الخلفيات الصلبة خلف شريط الحالة وشريط التنقل بحسب
     * WindowInsets الفعلية، بدلاً من ترك المحتوى يُرسم خلف الأشرطة الشفافة
     * (سلوك edge-to-edge الإجباري على Android 15+ لتطبيقات targetSdk 35).
     */
    private void setupEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        ViewCompat.setOnApplyWindowInsetsListener(binding.rootLayout, (view, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());

            binding.statusBarScrim.getLayoutParams().height = systemBars.top;
            binding.statusBarScrim.requestLayout();
            binding.navBarScrim.getLayoutParams().height = systemBars.bottom;
            binding.navBarScrim.requestLayout();

            return insets;
        });
    }

    private void setupSwipeRefresh() {
        binding.swipeRefresh.setColorSchemeResources(R.color.brand_primary);
        binding.swipeRefresh.setOnRefreshListener(() -> {
            if (isOfflinePageShown) {
                showContent();
                binding.webView.loadUrl(START_URL);
            } else {
                binding.webView.reload();
            }
        });
        // هذا تطبيق وليس صفحة ويب تُحدَّث بالسحب: تعطيل إيماءة السحب-للتحديث
        // نهائياً حتى لا يُعاد تحميل كل شيء عن طريق الخطأ أثناء التمرير داخل
        // المحتوى (كان يحدث عند الوصول لأعلى قائمة والاستمرار بالتمرير).
        // تبقى إعادة المحاولة يدوية عبر retryButton في شاشة عدم الاتصال فقط.
        binding.swipeRefresh.setEnabled(false);
        binding.retryButton.setOnClickListener(v -> {
            showContent();
            binding.webView.loadUrl(START_URL);
        });
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (!isOfflinePageShown && binding.webView.canGoBack()) {
                    binding.webView.goBack();
                    return;
                }
                long now = System.currentTimeMillis();
                if (now - lastBackPressTime < 2000) {
                    finish();
                } else {
                    lastBackPressTime = now;
                    Toast.makeText(MainActivity.this, R.string.exit_confirm, Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void showOffline() {
        isOfflinePageShown = true;
        binding.offlineLayout.setVisibility(View.VISIBLE);
        binding.webView.setVisibility(View.GONE);
        binding.swipeRefresh.setRefreshing(false);
    }

    private void showContent() {
        isOfflinePageShown = false;
        binding.offlineLayout.setVisibility(View.GONE);
        binding.webView.setVisibility(View.VISIBLE);
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        binding.webView.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        binding.webView.destroy();
        super.onDestroy();
    }

    /**
     * عميل WebView الذي يوجّه الطلبات المحلية عبر WebViewAssetLoader
     * ويفتح الروابط الخارجية في المتصفح، ويعرض شاشة عدم الاتصال عند الفشل.
     */
    private class AppWebViewClient extends WebViewClientCompat {

        @Nullable
        @Override
        public android.webkit.WebResourceResponse shouldInterceptRequest(@NonNull WebView view, @NonNull android.webkit.WebResourceRequest request) {
            return assetLoader.shouldInterceptRequest(request.getUrl());
        }

        @Override
        public boolean shouldOverrideUrlLoading(@NonNull WebView view, @NonNull android.webkit.WebResourceRequest request) {
            Uri uri = request.getUrl();
            String host = uri.getHost();

            if (APP_DOMAIN.equals(host)) {
                return false; // navigation inside the app - let WebView handle it
            }

            String scheme = uri.getScheme();
            if ("tel".equals(scheme) || "mailto".equals(scheme) || "sms".equals(scheme)) {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception e) {
                    Log.e(TAG, "No handler for " + uri, e);
                }
                return true;
            }

            if ("http".equals(scheme) || "https".equals(scheme)) {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception e) {
                    Log.e(TAG, "No browser found", e);
                }
                return true;
            }

            return false;
        }

        @Override
        public void onPageFinished(@NonNull WebView view, String url) {
            super.onPageFinished(view, url);
            binding.swipeRefresh.setRefreshing(false);
            if (url != null && !url.contains("offline.html")) {
                showContent();
            }
        }

        @Override
        public void onReceivedError(@NonNull WebView view, @NonNull android.webkit.WebResourceRequest request, @NonNull androidx.webkit.WebResourceErrorCompat error) {
            super.onReceivedError(view, request, error);
            if (request.isForMainFrame()) {
                Log.w(TAG, "Main frame load error: " + error.getDescription());
                view.loadUrl(OFFLINE_URL);
                showOffline();
            }
        }
    }

    private class AppWebChromeClient extends WebChromeClient {

        @Override
        public void onProgressChanged(@NonNull WebView view, int newProgress) {
            super.onProgressChanged(view, newProgress);
            binding.progressBar.setProgress(newProgress);
            binding.progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
        }

        @Override
        public void onPermissionRequest(@NonNull PermissionRequest request) {
            runOnUiThread(() -> {
                for (String resource : request.getResources()) {
                    if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA)
                                != PackageManager.PERMISSION_GRANTED) {
                            cameraPermissionLauncher.launch(Manifest.permission.CAMERA);
                        }
                    }
                }
                request.grant(request.getResources());
            });
        }

        @Override
        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams fileChooserParams) {
            filePathCallback = callback;
            try {
                Intent intent = fileChooserParams.createIntent();
                fileChooserLauncher.launch(intent);
            } catch (Exception e) {
                filePathCallback = null;
                return false;
            }
            return true;
        }

        // الدوال الثلاث التالية تستبدل مربعات حوار JS الافتراضية (alert/confirm/prompt)
        // - التي تظهر بشكل مربع Android قديم يذكر رابط الصفحة "appassets.androidplatform.net says" -
        // بمربعات Material مصممة بألوان التطبيق، لتبدو كجزء طبيعي منه.

        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            if (isFinishing() || isDestroyed()) {
                result.cancel();
                return true;
            }
            new MaterialAlertDialogBuilder(MainActivity.this, R.style.HerbalAlertDialog)
                    .setMessage(message)
                    .setCancelable(true)
                    .setPositiveButton(android.R.string.ok, (dialog, which) -> result.confirm())
                    .setOnCancelListener(dialog -> result.confirm())
                    .show();
            return true;
        }

        @Override
        public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
            if (isFinishing() || isDestroyed()) {
                result.cancel();
                return true;
            }
            new MaterialAlertDialogBuilder(MainActivity.this, R.style.HerbalAlertDialog)
                    .setMessage(message)
                    .setCancelable(true)
                    .setPositiveButton(R.string.dialog_ok, (dialog, which) -> result.confirm())
                    .setNegativeButton(R.string.dialog_cancel, (dialog, which) -> result.cancel())
                    .setOnCancelListener(dialog -> result.cancel())
                    .show();
            return true;
        }

        @Override
        public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
            if (isFinishing() || isDestroyed()) {
                result.cancel();
                return true;
            }
            EditText input = new EditText(MainActivity.this);
            input.setText(defaultValue);
            int pad = (int) (20 * getResources().getDisplayMetrics().density);
            input.setPadding(pad, pad / 2, pad, pad / 2);
            new MaterialAlertDialogBuilder(MainActivity.this, R.style.HerbalAlertDialog)
                    .setTitle(message)
                    .setView(input)
                    .setCancelable(true)
                    .setPositiveButton(R.string.dialog_ok, (dialog, which) -> result.confirm(input.getText().toString()))
                    .setNegativeButton(R.string.dialog_cancel, (dialog, which) -> result.cancel())
                    .setOnCancelListener(dialog -> result.cancel())
                    .show();
            return true;
        }
    }
}
