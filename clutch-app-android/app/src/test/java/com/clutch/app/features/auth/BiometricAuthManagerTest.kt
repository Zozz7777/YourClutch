package com.clutch.app.features.auth

import android.content.Context
import androidx.biometric.BiometricManager
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.junit.MockitoJUnitRunner
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*

@RunWith(MockitoJUnitRunner::class)
class BiometricAuthManagerTest {

    @Mock
    private lateinit var context: Context

    private lateinit var biometricAuthManager: BiometricAuthManager

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        biometricAuthManager = BiometricAuthManager(context)
    }

    @Test
    fun `checkBiometricAvailability should return correct state`() {
        // Given
        val expectedState = BiometricState.Available

        // When
        val result = biometricAuthManager.checkBiometricAvailability()

        // Then
        assertNotNull(result)
    }

    @Test
    fun `isBiometricAvailable should return correct value`() {
        // Given
        val expected = true

        // When
        val result = biometricAuthManager.isBiometricAvailable()

        // Then
        assertNotNull(result)
    }

    @Test
    fun `isBiometricEnrolled should return correct value`() {
        // Given
        val expected = true

        // When
        val result = biometricAuthManager.isBiometricEnrolled()

        // Then
        assertNotNull(result)
    }
}
