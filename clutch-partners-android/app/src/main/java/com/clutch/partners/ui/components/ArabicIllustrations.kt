package com.clutch.partners.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.CompositionLocalProvider
import com.clutch.partners.ui.theme.*
import com.clutch.partners.utils.LanguageManager

@Composable
fun ArabicOnboardingIllustration(
    type: OnboardingType,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Card(
            modifier = modifier
                .size(200.dp)
                .clip(RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(
                containerColor = PartnersBlue.copy(alpha = 0.1f)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                when (type) {
                    OnboardingType.STORE_MANAGEMENT -> StoreManagementIllustration()
                    OnboardingType.ORDERS -> OrdersIllustration()
                    OnboardingType.PAYMENTS -> PaymentsIllustration()
                }
            }
        }
    }
}

@Composable
fun StoreManagementIllustration() {
    Canvas(
        modifier = Modifier.size(120.dp)
    ) {
        drawStoreManagementIcon(this)
    }
}

@Composable
fun OrdersIllustration() {
    Canvas(
        modifier = Modifier.size(120.dp)
    ) {
        drawOrdersIcon(this)
    }
}

@Composable
fun PaymentsIllustration() {
    Canvas(
        modifier = Modifier.size(120.dp)
    ) {
        drawPaymentsIcon(this)
    }
}

fun drawStoreManagementIcon(drawScope: DrawScope) {
    val canvas = drawScope.drawContext.canvas
    val width = drawScope.size.width
    val height = drawScope.size.height
    val centerX = width / 2
    val centerY = height / 2
    
    // Store building
    val storePaint = Paint().apply {
        color = PartnersBlue
        style = PaintingStyle.Fill
    }
    
    val storeStrokePaint = Paint().apply {
        color = PartnersBlue.copy(alpha = 0.8f)
        style = PaintingStyle.Stroke
        strokeWidth = 3f
    }
    
    // Draw store building
    val storeRect = androidx.compose.ui.geometry.Rect(
        left = centerX - 40f,
        top = centerY - 20f,
        right = centerX + 40f,
        bottom = centerY + 30f
    )
    canvas.drawRect(storeRect, storePaint)
    canvas.drawRect(storeRect, storeStrokePaint)
    
    // Store door
    val doorPaint = Paint().apply {
        color = Color.White
        style = PaintingStyle.Fill
    }
    val doorRect = androidx.compose.ui.geometry.Rect(
        left = centerX - 8f,
        top = centerY + 5f,
        right = centerX + 8f,
        bottom = centerY + 30f
    )
    canvas.drawRect(doorRect, doorPaint)
    
    // Store windows
    val windowPaint = Paint().apply {
        color = Color.White
        style = PaintingStyle.Fill
    }
    val window1 = androidx.compose.ui.geometry.Rect(
        left = centerX - 25f,
        top = centerY - 15f,
        right = centerX - 10f,
        bottom = centerY - 5f
    )
    val window2 = androidx.compose.ui.geometry.Rect(
        left = centerX + 10f,
        top = centerY - 15f,
        right = centerX + 25f,
        bottom = centerY - 5f
    )
    canvas.drawRect(window1, windowPaint)
    canvas.drawRect(window2, windowPaint)
    
    // Store sign
    val signPaint = Paint().apply {
        color = Orange
        style = PaintingStyle.Fill
    }
    val signRect = androidx.compose.ui.geometry.Rect(
        left = centerX - 30f,
        top = centerY - 35f,
        right = centerX + 30f,
        bottom = centerY - 25f
    )
    canvas.drawRect(signRect, signPaint)
    
    // Inventory boxes
    val boxPaint = Paint().apply {
        color = LightSuccess
        style = PaintingStyle.Fill
    }
    val box1 = androidx.compose.ui.geometry.Rect(
        left = centerX - 50f,
        top = centerY + 10f,
        right = centerX - 35f,
        bottom = centerY + 25f
    )
    val box2 = androidx.compose.ui.geometry.Rect(
        left = centerX + 35f,
        top = centerY + 10f,
        right = centerX + 50f,
        bottom = centerY + 25f
    )
    canvas.drawRect(box1, boxPaint)
    canvas.drawRect(box2, boxPaint)
}

fun drawOrdersIcon(drawScope: DrawScope) {
    val canvas = drawScope.drawContext.canvas
    val width = drawScope.size.width
    val height = drawScope.size.height
    val centerX = width / 2
    val centerY = height / 2
    
    // Order document
    val documentPaint = Paint().apply {
        color = Color.White
        style = PaintingStyle.Fill
    }
    val documentStrokePaint = Paint().apply {
        color = PartnersBlue
        style = PaintingStyle.Stroke
        strokeWidth = 2f
    }
    
    val documentRect = androidx.compose.ui.geometry.Rect(
        left = centerX - 30f,
        top = centerY - 40f,
        right = centerX + 30f,
        bottom = centerY + 40f
    )
    canvas.drawRect(documentRect, documentPaint)
    canvas.drawRect(documentRect, documentStrokePaint)
    
    // Document lines
    val linePaint = Paint().apply {
        color = PartnersBlue.copy(alpha = 0.6f)
        style = PaintingStyle.Stroke
        strokeWidth = 1.5f
    }
    
    for (i in 0..4) {
        val y = centerY - 30f + (i * 12f)
    canvas.drawLine(
      p1 = Offset(centerX - 25f, y),
      p2 = Offset(centerX + 25f, y),
      paint = linePaint
    )
    }
    
    // Order number badge
    val badgePaint = Paint().apply {
        color = Orange
        style = PaintingStyle.Fill
    }
    val badgeRect = androidx.compose.ui.geometry.Rect(
        left = centerX - 15f,
        top = centerY - 50f,
        right = centerX + 15f,
        bottom = centerY - 35f
    )
    canvas.drawRect(badgeRect, badgePaint)
    
    // Customer icon
    val customerPaint = Paint().apply {
        color = LightSuccess
        style = PaintingStyle.Fill
    }
    canvas.drawCircle(
        center = Offset(centerX - 45f, centerY),
        radius = 12f,
        paint = customerPaint
    )
    
    // Clock icon
    val clockPaint = Paint().apply {
        color = LightWarning
        style = PaintingStyle.Fill
    }
    canvas.drawCircle(
        center = Offset(centerX + 45f, centerY),
        radius = 12f,
        paint = clockPaint
    )
}

fun drawPaymentsIcon(drawScope: DrawScope) {
    val canvas = drawScope.drawContext.canvas
    val width = drawScope.size.width
    val height = drawScope.size.height
    val centerX = width / 2
    val centerY = height / 2
    
    // Money bag
    val bagPaint = Paint().apply {
        color = LightSuccess
        style = PaintingStyle.Fill
    }
    val bagStrokePaint = Paint().apply {
        color = LightSuccess.copy(alpha = 0.8f)
        style = PaintingStyle.Stroke
        strokeWidth = 2f
    }
    
    // Draw money bag shape
    val bagPath = Path().apply {
        moveTo(centerX - 20f, centerY - 20f)
        lineTo(centerX + 20f, centerY - 20f)
        lineTo(centerX + 25f, centerY + 20f)
        lineTo(centerX - 25f, centerY + 20f)
        close()
    }
    canvas.drawPath(bagPath, bagPaint)
    canvas.drawPath(bagPath, bagStrokePaint)
    
    // Money symbol - using a circle instead of text
    val moneyPaint = Paint().apply {
        color = Color.White
        style = PaintingStyle.Fill
    }
    canvas.drawCircle(
        center = Offset(centerX, centerY),
        radius = 8f,
        paint = moneyPaint
    )
    
    // Coins around the bag
    val coinPaint = Paint().apply {
        color = Orange
        style = PaintingStyle.Fill
    }
    
    val coinPositions = listOf(
        Offset(centerX - 40f, centerY - 10f),
        Offset(centerX + 40f, centerY - 10f),
        Offset(centerX - 35f, centerY + 30f),
        Offset(centerX + 35f, centerY + 30f)
    )
    
    coinPositions.forEach { position ->
        canvas.drawCircle(
            center = position,
            radius = 8f,
            paint = coinPaint
        )
    }
    
    // Growth arrow
    val arrowPaint = Paint().apply {
        color = LightSuccess
        style = PaintingStyle.Stroke
        strokeWidth = 3f
    }
    
    canvas.drawLine(
      p1 = Offset(centerX, centerY - 40f),
      p2 = Offset(centerX, centerY - 60f),
      paint = arrowPaint
    )
    
    // Arrow head
    val arrowHeadPath = Path().apply {
        moveTo(centerX, centerY - 60f)
        lineTo(centerX - 5f, centerY - 55f)
        lineTo(centerX + 5f, centerY - 55f)
        close()
    }
    canvas.drawPath(arrowHeadPath, arrowPaint.apply { style = PaintingStyle.Fill })
}

enum class OnboardingType {
    STORE_MANAGEMENT, ORDERS, PAYMENTS
}
