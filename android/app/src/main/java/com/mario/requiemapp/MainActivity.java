package com.mario.requiemapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            SharedPreferences prefs = getSharedPreferences("RequiemPrefs", Context.MODE_PRIVATE);
            int lastVersionCode = prefs.getInt("last_version_code", -1);

            int currentVersionCode;
            PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                currentVersionCode = (int) pInfo.getLongVersionCode();
            } else {
                currentVersionCode = pInfo.versionCode;
            }

            if (currentVersionCode != lastVersionCode) {
                if (this.bridge != null && this.bridge.getWebView() != null) {
                    this.bridge.getWebView().clearCache(true);
                }
                prefs.edit().putInt("last_version_code", currentVersionCode).apply();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
