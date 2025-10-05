package com.clutch.partners.hardware

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import com.google.zxing.integration.android.IntentIntegrator
import com.google.zxing.integration.android.IntentResult
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BarcodeScanner @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    fun startScan(activity: ComponentActivity, onResult: (String) -> Unit) {
        val integrator = IntentIntegrator(activity)
        integrator.setDesiredBarcodeFormats(IntentIntegrator.ALL_CODE_TYPES)
        integrator.setPrompt("Scan a barcode or QR code")
        integrator.setCameraId(0)
        integrator.setBeepEnabled(true)
        integrator.setBarcodeImageEnabled(true)
        integrator.initiateScan()
        
        // Store callback for result handling
        scanCallback = onResult
    }
    
    fun handleScanResult(requestCode: Int, resultCode: Int, data: Intent?): Boolean {
        val result: IntentResult = IntentIntegrator.parseActivityResult(requestCode, resultCode, data)
        if (result != null) {
            if (result.contents == null) {
                Log.d("BarcodeScanner", "Cancelled scan")
            } else {
                Log.d("BarcodeScanner", "Scanned: ${result.contents}")
                scanCallback?.invoke(result.contents)
                scanCallback = null
                return true
            }
        }
        return false
    }
    
    companion object {
        private var scanCallback: ((String) -> Unit)? = null
    }
}

@Composable
fun rememberBarcodeScanner(): BarcodeScanner {
    val context = LocalContext.current
    return remember { BarcodeScanner(context) }
}

@Composable
fun BarcodeScannerLauncher(
    onScanResult: (String) -> Unit
) {
    val scanner = rememberBarcodeScanner()
    val context = LocalContext.current
    
    LaunchedEffect(Unit) {
        if (context is ComponentActivity) {
            scanner.startScan(context) { result ->
                onScanResult(result)
            }
        }
    }
}
