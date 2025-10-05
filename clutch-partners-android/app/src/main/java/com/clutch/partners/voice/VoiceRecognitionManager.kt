package com.clutch.partners.voice

import android.content.Context
import android.content.Intent
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import com.clutch.partners.data.model.Order
import com.clutch.partners.data.model.Product
import android.os.Bundle
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VoiceRecognitionManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    private var speechRecognizer: SpeechRecognizer? = null
    private val scope = CoroutineScope(Dispatchers.Main)
    
    private val _isListening = MutableStateFlow(false)
    val isListening: StateFlow<Boolean> = _isListening.asStateFlow()
    
    private val _recognitionResult = MutableStateFlow<String?>(null)
    val recognitionResult: StateFlow<String?> = _recognitionResult.asStateFlow()
    
    private val _voiceCommands = MutableStateFlow<List<VoiceCommand>>(emptyList())
    val voiceCommands: StateFlow<List<VoiceCommand>> = _voiceCommands.asStateFlow()
    
    fun startListening() {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            Log.e("VoiceRecognition", "Speech recognition not available")
            return
        }
        
        try {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
            speechRecognizer?.setRecognitionListener(createRecognitionListener())
            
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-EG") // Arabic (Egypt) as default
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            }
            
            speechRecognizer?.startListening(intent)
            _isListening.value = true
            
        } catch (e: Exception) {
            Log.e("VoiceRecognition", "Failed to start listening", e)
            _isListening.value = false
        }
    }
    
    fun stopListening() {
        speechRecognizer?.stopListening()
        _isListening.value = false
    }
    
    fun cancelListening() {
        speechRecognizer?.cancel()
        _isListening.value = false
    }
    
    fun processVoiceCommand(command: String): VoiceCommandResult {
        val normalizedCommand = command.lowercase().trim()
        
        return when {
            normalizedCommand.contains("طلب جديد") || normalizedCommand.contains("new order") -> {
                VoiceCommandResult.NewOrder
            }
            normalizedCommand.contains("دفع") || normalizedCommand.contains("payment") -> {
                VoiceCommandResult.Payment
            }
            normalizedCommand.contains("مخزون") || normalizedCommand.contains("inventory") -> {
                VoiceCommandResult.Inventory
            }
            normalizedCommand.contains("تقرير") || normalizedCommand.contains("report") -> {
                VoiceCommandResult.Report
            }
            normalizedCommand.contains("إعدادات") || normalizedCommand.contains("settings") -> {
                VoiceCommandResult.Settings
            }
            normalizedCommand.contains("مساعدة") || normalizedCommand.contains("help") -> {
                VoiceCommandResult.Help
            }
            else -> {
                VoiceCommandResult.Unknown
            }
        }
    }
    
    fun createOrderFromVoice(orderDetails: String): Order? {
        return try {
            // Parse order details from voice input
            // This would use NLP to extract order information
            val parts = orderDetails.split(" ")
            val customerName = extractCustomerName(orderDetails)
            val customerPhone = extractPhoneNumber(orderDetails)
            val amount = extractAmount(orderDetails)
            
            Order(
                id = generateOrderId(),
                customerName = customerName,
                customerPhone = customerPhone,
                totalAmount = amount,
                status = "pending",
                createdAt = System.currentTimeMillis()
            )
        } catch (e: Exception) {
            Log.e("VoiceRecognition", "Failed to create order from voice", e)
            null
        }
    }
    
    fun searchProductByVoice(productName: String): List<Product> {
        // Search products by voice input
        return emptyList() // This would search the product database
    }
    
    private fun createRecognitionListener(): RecognitionListener {
        return object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                Log.d("VoiceRecognition", "Ready for speech")
            }
            
            override fun onBeginningOfSpeech() {
                Log.d("VoiceRecognition", "Beginning of speech")
            }
            
            override fun onRmsChanged(rmsdB: Float) {
                // Handle volume changes
            }
            
            override fun onBufferReceived(buffer: ByteArray?) {
                // Handle audio buffer
            }
            
            override fun onEndOfSpeech() {
                Log.d("VoiceRecognition", "End of speech")
                _isListening.value = false
            }
            
            override fun onError(error: Int) {
                Log.e("VoiceRecognition", "Recognition error: $error")
                _isListening.value = false
                
                when (error) {
                    SpeechRecognizer.ERROR_AUDIO -> Log.e("VoiceRecognition", "Audio recording error")
                    SpeechRecognizer.ERROR_CLIENT -> Log.e("VoiceRecognition", "Client error")
                    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> Log.e("VoiceRecognition", "Insufficient permissions")
                    SpeechRecognizer.ERROR_NETWORK -> Log.e("VoiceRecognition", "Network error")
                    SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> Log.e("VoiceRecognition", "Network timeout")
                    SpeechRecognizer.ERROR_NO_MATCH -> Log.e("VoiceRecognition", "No match found")
                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> Log.e("VoiceRecognition", "Recognizer busy")
                    SpeechRecognizer.ERROR_SERVER -> Log.e("VoiceRecognition", "Server error")
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> Log.e("VoiceRecognition", "Speech timeout")
                }
            }
            
            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val bestMatch = matches[0]
                    _recognitionResult.value = bestMatch
                    Log.d("VoiceRecognition", "Recognition result: $bestMatch")
                    
                    // Process the voice command
                    val commandResult = processVoiceCommand(bestMatch)
                    handleVoiceCommand(commandResult, bestMatch)
                }
            }
            
            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val partialMatch = matches[0]
                    Log.d("VoiceRecognition", "Partial result: $partialMatch")
                }
            }
            
            override fun onEvent(eventType: Int, params: Bundle?) {
                Log.d("VoiceRecognition", "Event: $eventType")
            }
        }
    }
    
    private fun handleVoiceCommand(commandResult: VoiceCommandResult, originalText: String) {
        scope.launch {
            try {
                when (commandResult) {
                    VoiceCommandResult.NewOrder -> {
                        // Handle new order command
                        val order = createOrderFromVoice(originalText)
                        if (order != null) {
                            // Save order to database
                            Log.d("VoiceRecognition", "Created order: ${order.id}")
                        }
                    }
                    VoiceCommandResult.Payment -> {
                        // Handle payment command
                        Log.d("VoiceRecognition", "Payment command received")
                    }
                    VoiceCommandResult.Inventory -> {
                        // Handle inventory command
                        Log.d("VoiceRecognition", "Inventory command received")
                    }
                    VoiceCommandResult.Report -> {
                        // Handle report command
                        Log.d("VoiceRecognition", "Report command received")
                    }
                    VoiceCommandResult.Settings -> {
                        // Handle settings command
                        Log.d("VoiceRecognition", "Settings command received")
                    }
                    VoiceCommandResult.Help -> {
                        // Handle help command
                        Log.d("VoiceRecognition", "Help command received")
                    }
                    VoiceCommandResult.Unknown -> {
                        // Handle unknown command
                        Log.d("VoiceRecognition", "Unknown command: $originalText")
                    }
                }
            } catch (e: Exception) {
                Log.e("VoiceRecognition", "Failed to handle voice command", e)
            }
        }
    }
    
    private fun extractCustomerName(text: String): String {
        // Extract customer name from voice text
        // This would use NLP to identify names
        return "Customer"
    }
    
    private fun extractPhoneNumber(text: String): String {
        // Extract phone number from voice text
        // This would use regex to find phone numbers
        return "01234567890"
    }
    
    private fun extractAmount(text: String): Double {
        // Extract amount from voice text
        // This would use NLP to identify numbers and amounts
        return 0.0
    }
    
    private fun generateOrderId(): String {
        return "ORD-${System.currentTimeMillis()}"
    }
    
    fun getAvailableCommands(): List<VoiceCommand> {
        return listOf(
            VoiceCommand("طلب جديد", "Create new order"),
            VoiceCommand("دفع", "Process payment"),
            VoiceCommand("مخزون", "Check inventory"),
            VoiceCommand("تقرير", "Generate report"),
            VoiceCommand("إعدادات", "Open settings"),
            VoiceCommand("مساعدة", "Show help")
        )
    }
    
    fun destroy() {
        speechRecognizer?.destroy()
        speechRecognizer = null
    }
}

enum class VoiceCommandResult {
    NewOrder,
    Payment,
    Inventory,
    Report,
    Settings,
    Help,
    Unknown
}

data class VoiceCommand(
    val arabicText: String,
    val englishText: String
)
