package com.clutch.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.clutch.app.ui.theme.*

/**
 * ClutchAvatar.kt - Design system avatar component
 * 
 * Perfect design.json compliance with all avatar variants
 * and proper Material3 integration.
 */

@Composable
fun ClutchAvatar(
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
    imageUrl: String? = null,
    contentDescription: String? = null,
    fallbackIcon: ImageVector = Icons.Default.Person,
    fallbackText: String? = null,
    backgroundColor: Color = MaterialTheme.colorScheme.primaryContainer,
    contentColor: Color = MaterialTheme.colorScheme.onPrimaryContainer,
    borderColor: Color? = null,
    borderWidth: Dp = 0.dp,
    onClick: (() -> Unit)? = null
) {
    val avatarModifier = modifier
        .size(size)
        .clip(CircleShape)
        .then(
            if (onClick != null) {
                Modifier.clickable { onClick() }
            } else {
                Modifier
            }
        )
        .then(
            if (borderColor != null && borderWidth > 0.dp) {
                Modifier.border(
                    width = borderWidth,
                    color = borderColor,
                    shape = CircleShape
                )
            } else {
                Modifier
            }
        )

    Box(
        modifier = avatarModifier,
        contentAlignment = Alignment.Center
    ) {
        when {
            imageUrl != null -> {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = contentDescription,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
            fallbackText != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(backgroundColor),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = fallbackText.take(2).uppercase(),
                        style = MaterialTheme.typography.bodyLarge,
                        color = contentColor,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            else -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(backgroundColor),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = fallbackIcon,
                        contentDescription = contentDescription,
                        modifier = Modifier.size(size * 0.6f),
                        tint = contentColor
                    )
                }
            }
        }
    }
}

// ============================================================================
// AVATAR VARIANTS (design.json compliant)
// ============================================================================

@Composable
fun ClutchAvatarSmall(
    modifier: Modifier = Modifier,
    imageUrl: String? = null,
    contentDescription: String? = null,
    fallbackIcon: ImageVector = Icons.Default.Person,
    fallbackText: String? = null,
    onClick: (() -> Unit)? = null
) {
    ClutchAvatar(
        modifier = modifier,
        size = 24.dp,
        imageUrl = imageUrl,
        contentDescription = contentDescription,
        fallbackIcon = fallbackIcon,
        fallbackText = fallbackText,
        onClick = onClick
    )
}

@Composable
fun ClutchAvatarMedium(
    modifier: Modifier = Modifier,
    imageUrl: String? = null,
    contentDescription: String? = null,
    fallbackIcon: ImageVector = Icons.Default.Person,
    fallbackText: String? = null,
    onClick: (() -> Unit)? = null
) {
    ClutchAvatar(
        modifier = modifier,
        size = 40.dp,
        imageUrl = imageUrl,
        contentDescription = contentDescription,
        fallbackIcon = fallbackIcon,
        fallbackText = fallbackText,
        onClick = onClick
    )
}

@Composable
fun ClutchAvatarLarge(
    modifier: Modifier = Modifier,
    imageUrl: String? = null,
    contentDescription: String? = null,
    fallbackIcon: ImageVector = Icons.Default.Person,
    fallbackText: String? = null,
    onClick: (() -> Unit)? = null
) {
    ClutchAvatar(
        modifier = modifier,
        size = 64.dp,
        imageUrl = imageUrl,
        contentDescription = contentDescription,
        fallbackIcon = fallbackIcon,
        fallbackText = fallbackText,
        onClick = onClick
    )
}

@Composable
fun ClutchAvatarXLarge(
    modifier: Modifier = Modifier,
    imageUrl: String? = null,
    contentDescription: String? = null,
    fallbackIcon: ImageVector = Icons.Default.Person,
    fallbackText: String? = null,
    onClick: (() -> Unit)? = null
) {
    ClutchAvatar(
        modifier = modifier,
        size = 96.dp,
        imageUrl = imageUrl,
        contentDescription = contentDescription,
        fallbackIcon = fallbackIcon,
        fallbackText = fallbackText,
        onClick = onClick
    )
}

// ============================================================================
// AVATAR WITH STATUS
// ============================================================================

@Composable
fun ClutchAvatarWithStatus(
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
    imageUrl: String? = null,
    contentDescription: String? = null,
    fallbackIcon: ImageVector = Icons.Default.Person,
    fallbackText: String? = null,
    status: AvatarStatus = AvatarStatus.Offline,
    onClick: (() -> Unit)? = null
) {
    Box(
        modifier = modifier
    ) {
        ClutchAvatar(
            modifier = Modifier,
            size = size,
            imageUrl = imageUrl,
            contentDescription = contentDescription,
            fallbackIcon = fallbackIcon,
            fallbackText = fallbackText,
            onClick = onClick
        )
        
        // Status indicator
        Box(
            modifier = Modifier
                .size(size * 0.25f)
                .background(
                    color = status.color,
                    shape = CircleShape
                )
                .border(
                    width = 2.dp,
                    color = MaterialTheme.colorScheme.surface,
                    shape = CircleShape
                )
                .align(Alignment.BottomEnd)
        )
    }
}

// ============================================================================
// AVATAR GROUP
// ============================================================================

@Composable
fun ClutchAvatarGroup(
    modifier: Modifier = Modifier,
    avatars: List<AvatarData>,
    maxVisible: Int = 3,
    size: Dp = 32.dp,
    spacing: Dp = (-8).dp
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(spacing)
    ) {
        val visibleAvatars = avatars.take(maxVisible)
        val remainingCount = avatars.size - maxVisible
        
        visibleAvatars.forEach { avatar ->
            ClutchAvatar(
                modifier = Modifier.border(
                    width = 2.dp,
                    color = MaterialTheme.colorScheme.surface,
                    shape = CircleShape
                ),
                size = size,
                imageUrl = avatar.imageUrl,
                contentDescription = avatar.contentDescription,
                fallbackIcon = avatar.fallbackIcon,
                fallbackText = avatar.fallbackText
            )
        }
        
        if (remainingCount > 0) {
            ClutchAvatar(
                modifier = Modifier.border(
                    width = 2.dp,
                    color = MaterialTheme.colorScheme.surface,
                    shape = CircleShape
                ),
                size = size,
                fallbackText = "+$remainingCount",
                backgroundColor = MaterialTheme.colorScheme.surfaceVariant,
                contentColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// ============================================================================
// AVATAR WITH BADGE
// ============================================================================

@Composable
fun ClutchAvatarWithBadge(
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
    imageUrl: String? = null,
    contentDescription: String? = null,
    fallbackIcon: ImageVector = Icons.Default.Person,
    fallbackText: String? = null,
    badgeCount: Int? = null,
    badgeColor: Color = MaterialTheme.colorScheme.error,
    badgeTextColor: Color = MaterialTheme.colorScheme.onError,
    onClick: (() -> Unit)? = null
) {
    Box(
        modifier = modifier
    ) {
        ClutchAvatar(
            modifier = Modifier,
            size = size,
            imageUrl = imageUrl,
            contentDescription = contentDescription,
            fallbackIcon = fallbackIcon,
            fallbackText = fallbackText,
            onClick = onClick
        )
        
        // Badge
        if (badgeCount != null && badgeCount > 0) {
            Box(
                modifier = Modifier
                    .size(size * 0.4f)
                    .background(
                        color = badgeColor,
                        shape = CircleShape
                    )
                    .align(Alignment.TopEnd),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (badgeCount > 99) "99+" else badgeCount.toString(),
                    style = MaterialTheme.typography.bodySmall,
                    color = badgeTextColor,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

// ============================================================================
// DATA CLASSES
// ============================================================================

data class AvatarData(
    val imageUrl: String? = null,
    val contentDescription: String? = null,
    val fallbackIcon: ImageVector = Icons.Default.Person,
    val fallbackText: String? = null
)

enum class AvatarStatus(
    val color: Color
) {
    Online(Color(0xFF6750A4)),
    Offline(Color(0xFF79747E)),
    Away(Color(0xFF7D5260)),
    Busy(Color(0xFFBA1A1A))
}
