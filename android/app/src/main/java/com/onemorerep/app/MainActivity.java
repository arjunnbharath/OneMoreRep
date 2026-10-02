package com.onemorerep.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppActionsPlugin.class);
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // Draw behind the status bar. Capacitor otherwise pads the WebView on
        // Android 15+, which leaves a black strip above the page.
        View parent = (View) getBridge().getWebView().getParent();
        parent.setPadding(0, 0, 0, parent.getPaddingBottom());
        parent.addOnLayoutChangeListener(
            (v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
                if (v.getPaddingTop() != 0 || v.getPaddingLeft() != 0 || v.getPaddingRight() != 0) {
                    v.setPadding(0, 0, 0, v.getPaddingBottom());
                }
            }
        );
    }
}
