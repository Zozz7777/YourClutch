package com.clutch.partners.ui.screens

import androidx.compose.foundation.background
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
import java.util.Date

@Composable
fun PaymentsScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = if (isRTL) "المدفوعات" else "Payments",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Weekly Income Card
            WeeklyIncomeCard(isRTL = isRTL)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Payout Countdown Card
            PayoutCountdownCard(isRTL = isRTL)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Payment History
            Text(
                text = if (isRTL) "تاريخ المدفوعات" else "Payment History",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            PaymentHistoryList(isRTL = isRTL)
        }
    }
}

@Composable
fun WeeklyIncomeCard(isRTL: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isRTL) "الدخل الأسبوعي" else "Weekly Income",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                Icon(
                    Icons.Filled.TrendingUp,
                    contentDescription = null,
                    modifier = Modifier.size(24.dp),
                    tint = LightSuccess
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IncomeStat(
                    title = if (isRTL) "هذا الأسبوع" else "This Week",
                    amount = "₪3,250",
                    color = PartnersBlue
                )
                IncomeStat(
                    title = if (isRTL) "الأسبوع الماضي" else "Last Week",
                    amount = "₪2,890",
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Progress bar
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = if (isRTL) "التقدم نحو الهدف" else "Progress to Goal",
                        fontSize = 14.sp,
                        color = if (isRTL) DarkMutedForeground else LightMutedForeground
                    )
                    Text(
                        text = "65%",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PartnersBlue
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                LinearProgressIndicator(
                    progress = 0.65f,
                    modifier = Modifier.fillMaxWidth(),
                    color = PartnersBlue,
                    trackColor = if (isRTL) DarkMuted else LightMuted
                )
            }
        }
    }
}

@Composable
fun PayoutCountdownCard(isRTL: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = PartnersBlue
        ),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isRTL) "الدفعة القادمة" else "Next Payout",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                
                Icon(
                    Icons.Filled.Schedule,
                    contentDescription = null,
                    modifier = Modifier.size(24.dp),
                    tint = Color.White
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "₪3,250",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRTL) "الدفعة في 3 أيام" else "Payout in 3 days",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.8f)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Countdown progress
            LinearProgressIndicator(
                progress = 0.7f,
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                trackColor = Color.White.copy(alpha = 0.3f)
            )
        }
    }
}

@Composable
fun PaymentHistoryList(isRTL: Boolean) {
    val payments = listOf(
        Payment(
            id = "PAY-001",
            amount = 1250.0,
            date = Date(),
            status = PaymentStatus.COMPLETED,
            description = if (isRTL) "دفعة أسبوعية" else "Weekly payout"
        ),
        Payment(
            id = "PAY-002",
            amount = 980.0,
            date = Date(),
            status = PaymentStatus.PENDING,
            description = if (isRTL) "دفعة أسبوعية" else "Weekly payout"
        ),
        Payment(
            id = "PAY-003",
            amount = 2100.0,
            date = Date(),
            status = PaymentStatus.COMPLETED,
            description = if (isRTL) "دفعة أسبوعية" else "Weekly payout"
        )
    )
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(payments) { payment ->
            PaymentCard(payment = payment, isRTL = isRTL)
        }
    }
}

@Composable
fun PaymentCard(payment: Payment, isRTL: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Navigate to payment details */ },
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = payment.id,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = payment.description,
                    fontSize = 12.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
            }
            
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "₪${String.format("%.2f", payment.amount)}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PartnersBlue
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                StatusChip(
                    status = payment.status,
                    isRTL = isRTL
                )
            }
        }
    }
}

@Composable
fun IncomeStat(
    title: String,
    amount: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = amount,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = title,
            fontSize = 12.sp,
            color = color.copy(alpha = 0.7f)
        )
    }
}

@Composable
fun StatusChip(
    status: PaymentStatus,
    isRTL: Boolean
) {
    val (text, color) = when (status) {
        PaymentStatus.COMPLETED -> Pair(if (isRTL) "مكتمل" else "Completed", LightSuccess)
        PaymentStatus.PENDING -> Pair(if (isRTL) "معلق" else "Pending", LightWarning)
        PaymentStatus.FAILED -> Pair(if (isRTL) "فشل" else "Failed", LightDestructive)
    }
    
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = color
        )
    }
}

data class Payment(
    val id: String,
    val amount: Double,
    val date: Date,
    val status: PaymentStatus,
    val description: String
)

enum class PaymentStatus {
    COMPLETED, PENDING, FAILED
}
