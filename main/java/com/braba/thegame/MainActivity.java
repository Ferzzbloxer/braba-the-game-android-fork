package com.braba.thegame;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView webView = findViewById(R.id.myWebView);
        WebSettings settings = webView.getSettings();

        // Essential settings for offline apps
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setDomStorageEnabled(true); // Needed for LocalStorage/IndexedDB

        // Load the local file
        webView.loadUrl("file:///android_asset/www/index.html");

        // Prevent links from opening in an external browser
        webView.setWebViewClient(new WebViewClient());
    }
}