package com.onemorerep.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.util.Locale;

public class MainActivity extends BridgeActivity {

    private Insets lastSafeArea = Insets.NONE;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppActionsPlugin.class);
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        // Draw the page behind the status and navigation bars on every Android version.
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);
        window.getDecorView().setBackgroundColor(Color.BLACK);

        WebView webView = getBridge().getWebView();
        View parent = (View) webView.getParent();

        // CSS scrollbar rules don't reach the WebView's native scroll indicator.
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);

        // Capacitor's SystemBars plugin is set to insetsHandling=disable in
        // capacitor.config.ts, so we publish the safe-area as CSS variables
        // ourselves and only pad for the keyboard.
        ViewCompat.setOnApplyWindowInsetsListener(parent, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

            v.setPadding(0, 0, 0, keyboardVisible ? Math.max(0, ime.bottom - bars.bottom) : 0);

            Insets safeArea = Insets.of(bars.left, bars.top, bars.right, keyboardVisible ? 0 : bars.bottom);
            if (!safeArea.equals(lastSafeArea)) {
                lastSafeArea = safeArea;
                injectSafeArea(webView, safeArea);
            }
            return WindowInsetsCompat.CONSUMED;
        });

        // Re-apply after each page load so the variables survive reloads.
        getBridge().addWebViewListener(
            new WebViewListener() {
                @Override
                public void onPageCommitVisible(WebView view, String url) {
                    super.onPageCommitVisible(view, url);
                    if (!lastSafeArea.equals(Insets.NONE)) {
                        injectSafeArea(view, lastSafeArea);
                    }
                    ViewCompat.requestApplyInsets(parent);
                }
            }
        );
        ViewCompat.requestApplyInsets(parent);
    }

    @Override
    public void onResume() {
        super.onResume();
        View parent = (View) getBridge().getWebView().getParent();
        ViewCompat.requestApplyInsets(parent);
        if (!lastSafeArea.equals(Insets.NONE)) {
            injectSafeArea(getBridge().getWebView(), lastSafeArea);
        }
    }

    private void injectSafeArea(WebView webView, Insets insets) {
        float density = getResources().getDisplayMetrics().density;
        String script = String.format(
            Locale.US,
            "(function(){var s=document.documentElement.style;" +
                "s.setProperty('--safe-area-inset-top','%dpx');" +
                "s.setProperty('--safe-area-inset-right','%dpx');" +
                "s.setProperty('--safe-area-inset-bottom','%dpx');" +
                "s.setProperty('--safe-area-inset-left','%dpx');})();",
            Math.round(insets.top / density),
            Math.round(insets.right / density),
            Math.round(insets.bottom / density),
            Math.round(insets.left / density)
        );
        webView.post(() -> webView.evaluateJavascript(script, null));
    }
}
