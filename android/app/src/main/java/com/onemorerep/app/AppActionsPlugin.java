package com.onemorerep.app;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "AppActions")
public class AppActionsPlugin extends Plugin {

    private static final String APK_FILE_NAME = "OneMoreRep-update.apk";

    private BroadcastReceiver downloadReceiver;
    private long downloadId = -1;
    private PluginCall pendingInstallCall;

    @PluginMethod
    public void getVersion(PluginCall call) {
        try {
            PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            JSObject result = new JSObject();
            result.put("versionName", info.versionName);
            long code = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? info.getLongVersionCode() : info.versionCode;
            result.put("versionCode", code);
            call.resolve(result);
        } catch (PackageManager.NameNotFoundException e) {
            call.reject("Could not read app version");
        }
    }

    @PluginMethod
    public void uninstall(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_DELETE);
        intent.setData(Uri.parse("package:" + getContext().getPackageName()));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    /**
     * Downloads an APK and opens the system package installer when the download
     * finishes. Resolves once the installer has been launched.
     */
    @PluginMethod
    public void installUpdate(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("url is required");
            return;
        }

        Context context = getContext();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !context.getPackageManager().canRequestPackageInstalls()) {
            // Ask the user to allow this app to install updates, then let JS retry.
            Intent settings = new Intent(
                android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + context.getPackageName())
            );
            settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(settings);
            call.reject("permission-required");
            return;
        }

        File target = new File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), APK_FILE_NAME);
        if (target.exists()) {
            //noinspection ResultOfMethodCallIgnored
            target.delete();
        }

        DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url))
            .setTitle("OneMoreRep update")
            .setDescription("Downloading the latest version")
            .setMimeType("application/vnd.android.package-archive")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
            .setDestinationInExternalFilesDir(context, Environment.DIRECTORY_DOWNLOADS, APK_FILE_NAME);

        unregisterReceiver();
        pendingInstallCall = call;
        call.setKeepAlive(true);

        downloadReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context ctx, Intent intent) {
                long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                if (id != downloadId) return;
                unregisterReceiver();
                PluginCall saved = pendingInstallCall;
                pendingInstallCall = null;
                if (saved == null) return;

                if (!target.exists()) {
                    saved.reject("download-failed");
                    return;
                }

                try {
                    Uri apkUri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", target);
                    Intent install = new Intent(Intent.ACTION_VIEW)
                        .setDataAndType(apkUri, "application/vnd.android.package-archive")
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    ctx.startActivity(install);
                    saved.resolve();
                } catch (Exception e) {
                    saved.reject("install-failed: " + e.getMessage());
                }
            }
        };

        ContextCompat.registerReceiver(
            context,
            downloadReceiver,
            new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
            ContextCompat.RECEIVER_EXPORTED
        );
        downloadId = manager.enqueue(request);
    }

    private void unregisterReceiver() {
        if (downloadReceiver != null) {
            try {
                getContext().unregisterReceiver(downloadReceiver);
            } catch (IllegalArgumentException ignored) {
                // already unregistered
            }
            downloadReceiver = null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        unregisterReceiver();
        super.handleOnDestroy();
    }
}
