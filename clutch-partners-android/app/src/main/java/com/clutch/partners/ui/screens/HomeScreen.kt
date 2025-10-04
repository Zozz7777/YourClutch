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
fun HomeScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var selectedTab by remember { mutableStateOf(0) }
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
        ) {
            // Header
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = PartnersBlue
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp)
                ) {
                    Text(
                        text = if (isRTL) "مرحباً، أحمد محمد" else "Welcome, Ahmed Mohamed",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                        text = if (isRTL) "مركز إصلاح السيارات المتقدم" else "Advanced Auto Repair Center",
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.8f)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        StatCard(
                            title = if (isRTL) "الطلبات اليوم" else "Today's Orders",
                            value = "12",
                            color = Color.White
                        )
                        StatCard(
                            title = if (isRTL) "المدفوعات" else "Payments",
                            value = "₪2,450",
                            color = Color.White
                        )
                        StatCard(
                            title = if (isRTL) "التقييم" else "Rating",
                            value = "4.8",
                            color = Color.White
                        )
                    }
                }
            }
            
            // Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                modifier = Modifier.padding(horizontal = 16.dp),
                containerColor = Color.Transparent,
                contentColor = PartnersBlue
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text(if (isRTL) "الطلبات" else "Orders") }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text(if (isRTL) "المواعيد" else "Appointments") }
                )
            }
            
            // Content
            when (selectedTab) {
                0 -> OrdersList()
                1 -> AppointmentsList()
            }
        }
    }
}

@Composable
fun OrdersList() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val orders = listOf(
        Order(
            id = "ORD-001",
            customerName = "محمد أحمد",
            service = "تغيير زيت المحرك",
            status = OrderStatus.PENDING,
            amount = 150.0,
            date = Date(),
            isLocked = true
        ),
        Order(
            id = "ORD-002",
            customerName = "فاطمة علي",
            service = "إصلاح الفرامل",
            status = OrderStatus.PAID,
            amount = 300.0,
            date = Date(),
            isLocked = false
        ),
        Order(
            id = "ORD-003",
            customerName = "أحمد محمود",
            service = "صيانة دورية",
            status = OrderStatus.REJECTED,
            amount = 200.0,
            date = Date(),
            isLocked = true
        )
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(orders) { order ->
                OrderCard(order = order, isRTL = isRTL)
            }
        }
    }
}

@Composable
fun AppointmentsList() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val appointments = listOf(
        Appointment(
            id = "APT-001",
            customerName = "سارة محمد",
            service = "فحص شامل",
            time = "10:00 AM",
            date = Date(),
            status = AppointmentStatus.SCHEDULED
        ),
        Appointment(
            id = "APT-002",
            customerName = "خالد حسن",
            service = "إصلاح محرك",
            time = "2:00 PM",
            date = Date(),
            status = AppointmentStatus.IN_PROGRESS
        )
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(appointments) { appointment ->
                AppointmentCard(appointment = appointment, isRTL = isRTL)
            }
        }
    }
}

@Composable
fun OrderCard(order: Order, isRTL: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Navigate to order details */ },
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = order.id,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                StatusChip(
                    status = order.status,
                    isRTL = isRTL
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = order.customerName,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = order.service,
                fontSize = 14.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "₪${String.format("%.2f", order.amount)}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PartnersBlue
                )
                
                if (order.isLocked) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Filled.Lock,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = LightWarning
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (isRTL) "مقفل" else "Locked",
                            fontSize = 12.sp,
                            color = LightWarning
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AppointmentCard(appointment: Appointment, isRTL: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Navigate to appointment details */ },
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = appointment.id,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                StatusChip(
                    status = appointment.status,
                    isRTL = isRTL
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = appointment.customerName,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = appointment.service,
                fontSize = 14.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = appointment.time,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = PartnersBlue
                )
                
                Icon(
                    Icons.Filled.Schedule,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = PartnersBlue
                )
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = title,
            fontSize = 12.sp,
            color = color.copy(alpha = 0.8f)
        )
    }
}

@Composable
fun StatusChip(
    status: Any,
    isRTL: Boolean
) {
    val (text, color) = when (status) {
        is OrderStatus -> when (status) {
            OrderStatus.PENDING -> Pair(if (isRTL) "معلق" else "Pending", LightWarning)
            OrderStatus.PAID -> Pair(if (isRTL) "مدفوع" else "Paid", LightSuccess)
            OrderStatus.REJECTED -> Pair(if (isRTL) "مرفوض" else "Rejected", LightDestructive)
        }
        is AppointmentStatus -> when (status) {
            AppointmentStatus.SCHEDULED -> Pair(if (isRTL) "مجدول" else "Scheduled", PartnersBlue)
            AppointmentStatus.IN_PROGRESS -> Pair(if (isRTL) "قيد التنفيذ" else "In Progress", LightWarning)
            AppointmentStatus.COMPLETED -> Pair(if (isRTL) "مكتمل" else "Completed", LightSuccess)
        }
        else -> Pair("Unknown", Color.Gray)
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

data class Order(
    val id: String,
    val customerName: String,
    val service: String,
    val status: OrderStatus,
    val amount: Double,
    val date: Date,
    val isLocked: Boolean
)

data class Appointment(
    val id: String,
    val customerName: String,
    val service: String,
    val time: String,
    val date: Date,
    val status: AppointmentStatus
)

enum class OrderStatus {
    PENDING, PAID, REJECTED
}

enum class AppointmentStatus {
    SCHEDULED, IN_PROGRESS, COMPLETED
}
