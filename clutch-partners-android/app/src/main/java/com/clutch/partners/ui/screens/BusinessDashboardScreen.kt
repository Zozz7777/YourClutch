package com.clutch.partners.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
fun BusinessDashboardScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var selectedPeriod by remember { mutableStateOf(0) }
    val periods = listOf("Today", "Week", "Month", "Year")
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = if (isRTL) "لوحة الأعمال" else "Business Dashboard",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Period Selector
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(periods.size) { index ->
                    FilterChip(
                        onClick = { selectedPeriod = index },
                        label = { Text(periods[index]) },
                        selected = selectedPeriod == index,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PartnersBlue,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Revenue Overview
            RevenueOverviewCard(isRTL = isRTL)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Analytics Charts
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    RevenueChartCard(isRTL = isRTL)
                }
                Column(modifier = Modifier.weight(1f)) {
                    OrdersChartCard(isRTL = isRTL)
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Inventory Overview
            InventoryOverviewCard(isRTL = isRTL)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Recent Orders
            RecentOrdersCard(isRTL = isRTL)
        }
    }
}

@Composable
fun RevenueOverviewCard(isRTL: Boolean) {
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
            Text(
                text = if (isRTL) "نظرة عامة على الإيرادات" else "Revenue Overview",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                RevenueStat(
                    title = if (isRTL) "الإيرادات اليوم" else "Today's Revenue",
                    amount = "₪1,250",
                    color = Color.White
                )
                RevenueStat(
                    title = if (isRTL) "الإيرادات الأسبوعية" else "Weekly Revenue",
                    amount = "₪8,750",
                    color = Color.White.copy(alpha = 0.8f)
                )
                RevenueStat(
                    title = if (isRTL) "الإيرادات الشهرية" else "Monthly Revenue",
                    amount = "₪35,000",
                    color = Color.White.copy(alpha = 0.8f)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Growth indicator
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Filled.TrendingUp,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Color.White
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isRTL) "+12.5% من الأسبوع الماضي" else "+12.5% from last week",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.8f)
                )
            }
        }
    }
}

@Composable
fun RevenueChartCard(isRTL: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = if (isRTL) "اتجاه الإيرادات" else "Revenue Trend",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Simple chart representation
            RevenueChart()
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRTL) "آخر 7 أيام" else "Last 7 days",
                fontSize = 12.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground
            )
        }
    }
}

@Composable
fun OrdersChartCard(isRTL: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = if (isRTL) "الطلبات" else "Orders",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Orders stats
            Column {
                OrderStat(
                    label = if (isRTL) "مكتملة" else "Completed",
                    count = 45,
                    color = LightSuccess,
                    isRTL = isRTL
                )
                Spacer(modifier = Modifier.height(8.dp))
                OrderStat(
                    label = if (isRTL) "قيد التنفيذ" else "In Progress",
                    count = 12,
                    color = LightWarning,
                    isRTL = isRTL
                )
                Spacer(modifier = Modifier.height(8.dp))
                OrderStat(
                    label = if (isRTL) "معلقة" else "Pending",
                    count = 8,
                    color = PartnersBlue,
                    isRTL = isRTL
                )
            }
        }
    }
}

@Composable
fun InventoryOverviewCard(isRTL: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = if (isRTL) "نظرة عامة على المخزون" else "Inventory Overview",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                InventoryStat(
                    title = if (isRTL) "إجمالي المنتجات" else "Total Products",
                    value = "156",
                    color = PartnersBlue,
                    isRTL = isRTL
                )
                InventoryStat(
                    title = if (isRTL) "منخفض المخزون" else "Low Stock",
                    value = "12",
                    color = LightWarning,
                    isRTL = isRTL
                )
                InventoryStat(
                    title = if (isRTL) "نفد المخزون" else "Out of Stock",
                    value = "3",
                    color = LightDestructive,
                    isRTL = isRTL
                )
            }
        }
    }
}

@Composable
fun RecentOrdersCard(isRTL: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
                    text = if (isRTL) "الطلبات الأخيرة" else "Recent Orders",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                TextButton(onClick = { /* TODO: Navigate to all orders */ }) {
                    Text(
                        text = if (isRTL) "عرض الكل" else "View All",
                        color = PartnersBlue
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            val recentOrders = listOf(
                RecentOrder(
                    id = "ORD-001",
                    customer = if (isRTL) "محمد أحمد" else "Mohamed Ahmed",
                    amount = 250.0,
                    status = OrderStatus.PAID
                ),
                RecentOrder(
                    id = "ORD-002",
                    customer = if (isRTL) "فاطمة علي" else "Fatima Ali",
                    amount = 180.0,
                    status = OrderStatus.PENDING
                ),
                RecentOrder(
                    id = "ORD-003",
                    customer = if (isRTL) "أحمد محمود" else "Ahmed Mahmoud",
                    amount = 320.0,
                    status = OrderStatus.PAID
                )
            )
            
            recentOrders.forEach { order ->
                RecentOrderItem(order = order, isRTL = isRTL)
                if (order != recentOrders.last()) {
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun RevenueChart() {
    // Simple bar chart representation
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.Bottom
    ) {
        repeat(7) { index ->
            Box(
                modifier = Modifier
                    .width(8.dp)
                    .height((20 + index * 5).dp)
                    .background(
                        PartnersBlue,
                        RoundedCornerShape(4.dp)
                    )
            )
        }
    }
}

@Composable
fun RevenueStat(
    title: String,
    amount: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = amount,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = title,
            fontSize = 10.sp,
            color = color.copy(alpha = 0.8f),
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun OrderStat(
    label: String,
    count: Int,
    color: Color,
    isRTL: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            fontSize = 14.sp,
            color = if (isRTL) DarkMutedForeground else LightMutedForeground
        )
        
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = count.toString(),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Spacer(modifier = Modifier.width(4.dp))
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(color, RoundedCornerShape(4.dp))
            )
        }
    }
}

@Composable
fun InventoryStat(
    title: String,
    value: String,
    color: Color,
    isRTL: Boolean
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = title,
            fontSize = 12.sp,
            color = if (isRTL) DarkMutedForeground else LightMutedForeground,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun RecentOrderItem(
    order: RecentOrder,
    isRTL: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Navigate to order details */ },
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = order.id,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            Text(
                text = order.customer,
                fontSize = 12.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground
            )
        }
        
        Column(
            horizontalAlignment = Alignment.End
        ) {
            Text(
                text = "₪${String.format("%.2f", order.amount)}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = PartnersBlue
            )
            
            StatusChip(
                status = order.status,
                isRTL = isRTL
            )
        }
    }
}

@Composable
fun StatusChip(
    status: OrderStatus,
    isRTL: Boolean
) {
    val (text, color) = when (status) {
        OrderStatus.PENDING -> Pair(if (isRTL) "معلق" else "Pending", LightWarning)
        OrderStatus.PAID -> Pair(if (isRTL) "مدفوع" else "Paid", LightSuccess)
        OrderStatus.REJECTED -> Pair(if (isRTL) "مرفوض" else "Rejected", LightDestructive)
    }
    
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            fontSize = 10.sp,
            fontWeight = FontWeight.Medium,
            color = color
        )
    }
}

data class RecentOrder(
    val id: String,
    val customer: String,
    val amount: Double,
    val status: OrderStatus
)

// OrderStatus enum moved to shared location
