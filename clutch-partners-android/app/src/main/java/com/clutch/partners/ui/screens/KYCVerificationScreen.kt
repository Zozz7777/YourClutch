package com.clutch.partners.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.CompositionLocalProvider
import com.clutch.partners.ui.theme.*
import com.clutch.partners.utils.LanguageManager

@Composable
fun KYCVerificationScreen(
    onVerificationComplete: () -> Unit
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var currentStep by remember { mutableStateOf(0) }
    var uploadedDocuments by remember { mutableStateOf(setOf<DocumentType>()) }
    
    val steps = listOf(
        KYCDocument(
            type = DocumentType.VAT_CERTIFICATE,
            title = if (isRTL) "شهادة ضريبة القيمة المضافة" else "VAT Certificate",
            description = if (isRTL) "تحميل شهادة ضريبة القيمة المضافة" else "Upload your VAT certificate",
            icon = Icons.Filled.Receipt,
            isRequired = true
        ),
        KYCDocument(
            type = DocumentType.TRADE_LICENSE,
            title = if (isRTL) "رخصة تجارية" else "Trade License",
            description = if (isRTL) "تحميل الرخصة التجارية" else "Upload your trade license",
            icon = Icons.Filled.Business,
            isRequired = true
        ),
        KYCDocument(
            type = DocumentType.OWNER_ID,
            title = if (isRTL) "هوية المالك" else "Owner ID",
            description = if (isRTL) "تحميل هوية المالك" else "Upload owner's ID",
            icon = Icons.Filled.Person,
            isRequired = true
        )
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(24.dp)
        ) {
            // Header
            Text(
                text = if (isRTL) "التحقق من الهوية" else "Identity Verification",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRTL) "تحميل المستندات المطلوبة للتحقق من هويتك" else "Upload required documents for identity verification",
                fontSize = 16.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Progress indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                steps.forEachIndexed { index, _ ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(4.dp)
                            .background(
                                if (index <= currentStep) PartnersBlue else Color.Gray.copy(alpha = 0.3f),
                                RoundedCornerShape(2.dp)
                            )
                    )
                    if (index < steps.size - 1) {
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Current step
            val currentDocument = steps[currentStep]
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (isRTL) DarkCard else LightCard
                ),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Document icon
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(
                                PartnersBlue.copy(alpha = 0.1f),
                                RoundedCornerShape(16.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = currentDocument.icon,
                            contentDescription = null,
                            modifier = Modifier.size(40.dp),
                            tint = PartnersBlue
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = currentDocument.title,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isRTL) DarkForeground else LightForeground,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = currentDocument.description,
                        fontSize = 14.sp,
                        color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Upload button
                    Button(
                        onClick = {
                            // TODO: Implement document upload
                            uploadedDocuments = uploadedDocuments + currentDocument.type
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PartnersBlue
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(
                            Icons.Filled.Upload,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isRTL) "تحميل المستند" else "Upload Document",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    // Uploaded indicator
                    if (uploadedDocuments.contains(currentDocument.type)) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Filled.CheckCircle,
                                contentDescription = null,
                                tint = LightSuccess,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isRTL) "تم التحميل بنجاح" else "Uploaded Successfully",
                                color = LightSuccess,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Navigation buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (currentStep > 0) {
                    OutlinedButton(
                        onClick = { currentStep-- },
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = if (isRTL) DarkForeground else LightForeground
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(if (isRTL) "السابق" else "Previous")
                    }
                } else {
                    Spacer(modifier = Modifier.width(100.dp))
                }
                
                Button(
                    onClick = {
                        if (currentStep < steps.size - 1) {
                            currentStep++
                        } else {
                            onVerificationComplete()
                        }
                    },
                    enabled = uploadedDocuments.contains(currentDocument.type),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = PartnersBlue
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        if (currentStep < steps.size - 1) {
                            if (isRTL) "التالي" else "Next"
                        } else {
                            if (isRTL) "إرسال للتحقق" else "Submit for Verification"
                        }
                    )
                }
            }
        }
    }
}

data class KYCDocument(
    val type: DocumentType,
    val title: String,
    val description: String,
    val icon: ImageVector,
    val isRequired: Boolean
)

enum class DocumentType {
    VAT_CERTIFICATE,
    TRADE_LICENSE,
    OWNER_ID
}
