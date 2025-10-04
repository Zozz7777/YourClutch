package com.clutch.app.features.auth

import android.content.Context
import android.content.pm.PackageManager
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * BiometricAuthManager.kt - Biometric authentication manager
 * 
 * Handles fingerprint and face authentication for secure app access.
 */

@Singleton
class BiometricAuthManager @Inject constructor(
    private val context: Context
) {
    private val _biometricState = MutableStateFlow<BiometricState>(BiometricState.NotAvailable)
    val biometricState: StateFlow<BiometricState> = _biometricState.asStateFlow()

    private val biometricManager = BiometricManager.from(context)

    init {
        checkBiometricAvailability()
    }

    fun checkBiometricAvailability(): BiometricState {
        val state = when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)) {
            BiometricManager.BIOMETRIC_SUCCESS -> BiometricState.Available
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> BiometricState.NotAvailable
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> BiometricState.NotAvailable
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> BiometricState.NotEnrolled
            else -> BiometricState.NotAvailable
        }
        _biometricState.value = state
        return state
    }

    fun authenticate(
        activity: FragmentActivity,
        onSuccess: () -> Unit,
        onError: (String) -> Unit,
        onCancel: () -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(context)
        val biometricPrompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess()
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                when (errorCode) {
                    BiometricPrompt.ERROR_LOCKOUT -> onError("Too many failed attempts. Please try again later.")
                    BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> onError("Biometric authentication is permanently locked.")
                    BiometricPrompt.ERROR_NO_BIOMETRICS -> onError("No biometrics enrolled.")
                    BiometricPrompt.ERROR_HW_UNAVAILABLE -> onError("Biometric hardware is unavailable.")
                    BiometricPrompt.ERROR_CANCELED -> onCancel()
                    else -> onError(errString.toString())
                }
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onError("Authentication failed. Please try again.")
            }
        })

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Biometric Authentication")
            .setSubtitle("Use your fingerprint or face to authenticate")
            .setDescription("Place your finger on the sensor or look at the camera")
            .setNegativeButtonText("Cancel")
            .setConfirmationRequired(true)
            .build()

        biometricPrompt.authenticate(promptInfo)
    }

    fun authenticateForSensitiveAction(
        activity: FragmentActivity,
        actionName: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit,
        onCancel: () -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(context)
        val biometricPrompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess()
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                when (errorCode) {
                    BiometricPrompt.ERROR_LOCKOUT -> onError("Too many failed attempts. Please try again later.")
                    BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> onError("Biometric authentication is permanently locked.")
                    BiometricPrompt.ERROR_NO_BIOMETRICS -> onError("No biometrics enrolled.")
                    BiometricPrompt.ERROR_HW_UNAVAILABLE -> onError("Biometric hardware is unavailable.")
                    BiometricPrompt.ERROR_CANCELED -> onCancel()
                    else -> onError(errString.toString())
                }
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onError("Authentication failed. Please try again.")
            }
        })

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Secure Authentication Required")
            .setSubtitle("Confirm your identity to $actionName")
            .setDescription("Use your fingerprint or face to confirm this sensitive action")
            .setNegativeButtonText("Cancel")
            .setConfirmationRequired(true)
            .build()

        biometricPrompt.authenticate(promptInfo)
    }

    fun isBiometricAvailable(): Boolean {
        return biometricState.value == BiometricState.Available
    }

    fun isBiometricEnrolled(): Boolean {
        return biometricState.value == BiometricState.Available
    }
}

sealed class BiometricState {
    object Available : BiometricState()
    object NotAvailable : BiometricState()
    object NotEnrolled : BiometricState()
    object Error : BiometricState()
}
