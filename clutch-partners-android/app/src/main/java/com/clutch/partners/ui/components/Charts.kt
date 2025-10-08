package com.clutch.partners.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.*

@Composable
fun RevenueChart(
    data: List<ChartDataPoint>,
    modifier: Modifier = Modifier,
    title: String = "Revenue Trend",
    showLegend: Boolean = true
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            LineChart(
                data = data,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
            )
            
            if (showLegend && data.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                
                ChartLegend(
                    items = data.map { ChartLegendItem(it.label, it.color) }
                )
            }
        }
    }
}

@Composable
fun OrdersChart(
    data: List<ChartDataPoint>,
    modifier: Modifier = Modifier,
    title: String = "Orders Trend"
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            BarChart(
                data = data,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
            )
        }
    }
}

@Composable
fun PieChart(
    data: List<PieChartData>,
    modifier: Modifier = Modifier,
    title: String = "Distribution",
    showLegend: Boolean = true
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                PieChartCanvas(
                    data = data,
                    modifier = Modifier
                        .size(150.dp)
                        .weight(1f)
                )
                
                if (showLegend) {
                    Spacer(modifier = Modifier.width(16.dp))
                    
                    PieChartLegend(
                        data = data,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
fun PerformanceChart(
    metrics: List<PerformanceMetric>,
    modifier: Modifier = Modifier,
    title: String = "Performance Metrics"
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            metrics.forEach { metric ->
                PerformanceMetricItem(
                    metric = metric,
                    modifier = Modifier.fillMaxWidth()
                )
                
                if (metric != metrics.last()) {
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
private fun LineChart(
    data: List<ChartDataPoint>,
    modifier: Modifier = Modifier
) {
    if (data.isEmpty()) {
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "No data available",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        return
    }
    
    val maxValue = data.maxOfOrNull { it.value } ?: 0f
    val minValue = data.minOfOrNull { it.value } ?: 0f
    val valueRange = maxValue - minValue
    
    Canvas(modifier = modifier) {
        val canvasWidth = size.width
        val canvasHeight = size.height
        val padding = 40f
        
        val chartWidth = canvasWidth - (padding * 2)
        val chartHeight = canvasHeight - (padding * 2)
        
        // Draw grid lines
        val gridColor = Color.Gray.copy(alpha = 0.3f)
        val strokeWidth = 1.dp.toPx()
        
        // Horizontal grid lines
        for (i in 0..4) {
            val y = padding + (chartHeight / 4) * i
            drawLine(
                color = gridColor,
                start = Offset(padding, y),
                end = Offset(canvasWidth - padding, y),
                strokeWidth = strokeWidth
            )
        }
        
        // Vertical grid lines
        for (i in 0..data.size - 1) {
            val x = padding + (chartWidth / (data.size - 1)) * i
            drawLine(
                color = gridColor,
                start = Offset(x, padding),
                end = Offset(x, canvasHeight - padding),
                strokeWidth = strokeWidth
            )
        }
        
        // Draw line
        if (data.size > 1) {
            val path = Path()
            val firstPoint = data.first()
            val firstX = padding
            val firstY = padding + chartHeight - ((firstPoint.value - minValue) / valueRange) * chartHeight
            
            path.moveTo(firstX, firstY)
            
            for (i in 1 until data.size) {
                val point = data[i]
                val x = padding + (chartWidth / (data.size - 1)) * i
                val y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight
                
                path.lineTo(x, y)
            }
            
            drawPath(
                path = path,
                color = MaterialTheme.colorScheme.primary,
                style = Stroke(width = 3.dp.toPx())
            )
        }
        
        // Draw data points
        data.forEachIndexed { index, point ->
            val x = padding + (chartWidth / (data.size - 1)) * index)
            val y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight
            
            drawCircle(
                color = MaterialTheme.colorScheme.primary,
                radius = 4.dp.toPx(),
                center = Offset(x, y)
            )
        }
    }
}

@Composable
private fun BarChart(
    data: List<ChartDataPoint>,
    modifier: Modifier = Modifier
) {
    if (data.isEmpty()) {
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "No data available",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        return
    }
    
    val maxValue = data.maxOfOrNull { it.value } ?: 0f
    
    Canvas(modifier = modifier) {
        val canvasWidth = size.width
        val canvasHeight = size.height
        val padding = 40f
        
        val chartWidth = canvasWidth - (padding * 2)
        val chartHeight = canvasHeight - (padding * 2)
        val barWidth = chartWidth / data.size * 0.8f
        
        data.forEachIndexed { index, point ->
            val barHeight = (point.value / maxValue) * chartHeight
            val x = padding + (chartWidth / data.size) * index + (chartWidth / data.size - barWidth) / 2
            val y = padding + chartHeight - barHeight
            
            drawRect(
                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.8f),
                topLeft = Offset(x, y),
                size = Size(barWidth, barHeight)
            )
        }
    }
}

@Composable
private fun PieChartCanvas(
    data: List<PieChartData>,
    modifier: Modifier = Modifier
) {
    if (data.isEmpty()) {
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "No data available",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        return
    }
    
    val total = data.sumOf { it.value }
    var startAngle by remember { mutableStateOf(0f) }
    
    LaunchedEffect(data) {
        startAngle = 0f
    }
    
    val animatedStartAngle by animateFloatAsState(
        targetValue = startAngle,
        animationSpec = tween(durationMillis = 1000)
    )
    
    Canvas(modifier = modifier) {
        val center = Offset(size.width / 2, size.height / 2)
        val radius = minOf(size.width, size.height) / 2 - 20f
        
        var currentAngle = animatedStartAngle
        
        data.forEach { segment ->
            val sweepAngle = (segment.value / total) * 360f
            
            drawArc(
                color = segment.color,
                startAngle = currentAngle,
                sweepAngle = sweepAngle,
                useCenter = true,
                topLeft = Offset(center.x - radius, center.y - radius),
                size = Size(radius * 2, radius * 2)
            )
            
            currentAngle += sweepAngle
        }
    }
}

@Composable
private fun PieChartLegend(
    data: List<PieChartData>,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        data.forEach { item ->
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(item.color)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Text(
                    text = item.label,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f)
                )
                
                Text(
                    text = "${(item.value * 100 / data.sumOf { it.value }).toInt()}%",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}

@Composable
private fun ChartLegend(
    items: List<ChartLegendItem>,
    modifier: Modifier = Modifier
) {
    LazyRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(items) { item ->
            Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(item.color)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Text(
                text = item.label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
private fun PerformanceMetricItem(
    metric: PerformanceMetric,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = metric.label,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Text(
                text = metric.value,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.primary
            )
        }
        
        Spacer(modifier = Modifier.height(4.dp))
        
        LinearProgressIndicator(
            progress = metric.progress,
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
            color = metric.color,
            trackColor = metric.color.copy(alpha = 0.2f)
        )
    }
}

// Data classes
data class ChartDataPoint(
    val label: String,
    val value: Float,
    val color: Color = MaterialTheme.colorScheme.primary
)

data class PieChartData(
    val label: String,
    val value: Float,
    val color: Color
)

data class ChartLegendItem(
    val label: String,
    val color: Color
)

data class PerformanceMetric(
    val label: String,
    val value: String,
    val progress: Float,
    val color: Color = MaterialTheme.colorScheme.primary
)
