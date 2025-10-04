package com.clutch.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.theme.*

/**
 * ClutchBadge.kt - Design system badge component
 * 
 * Perfect design.json compliance with all badge variants
 * and proper Material3 integration.
 */

@Composable
fun ClutchBadge(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.primary,
    contentColor: Color = MaterialTheme.colorScheme.onPrimary,
    size: BadgeSize = BadgeSize.Medium,
    variant: BadgeVariant = BadgeVariant.Filled,
    shape: RoundedCornerShape = RoundedCornerShape(ClutchBorderRadius.full)
) {
    val badgeModifier = modifier
        .clip(shape)
        .background(
            color = when (variant) {
                BadgeVariant.Filled -> color
                BadgeVariant.Outlined -> Color.Transparent
                BadgeVariant.Soft -> color.copy(alpha = 0.1f)
            }
        )
        .then(
            if (variant == BadgeVariant.Outlined) {
                Modifier.border(
                    width = 1.dp,
                    color = color,
                    shape = shape
                )
            } else {
                Modifier
            }
        )

    Box(
        modifier = badgeModifier,
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            style = when (size) {
                BadgeSize.Small -> MaterialTheme.typography.labelSmall
                BadgeSize.Medium -> MaterialTheme.typography.labelMedium
                BadgeSize.Large -> MaterialTheme.typography.labelLarge
            },
            color = when (variant) {
                BadgeVariant.Filled -> contentColor
                BadgeVariant.Outlined -> color
                BadgeVariant.Soft -> color
            },
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(
                horizontal = when (size) {
                    BadgeSize.Small -> ClutchSpacing.xs
                    BadgeSize.Medium -> ClutchSpacing.sm
                    BadgeSize.Large -> ClutchSpacing.md
                },
                vertical = when (size) {
                    BadgeSize.Small -> ClutchSpacing.xs / 2
                    BadgeSize.Medium -> ClutchSpacing.xs
                    BadgeSize.Large -> ClutchSpacing.sm
                }
            )
        )
    }
}

// ============================================================================
// BADGE VARIANTS (design.json compliant)
// ============================================================================

@Composable
fun ClutchBadgePrimary(
    text: String,
    modifier: Modifier = Modifier,
    size: BadgeSize = BadgeSize.Medium,
    variant: BadgeVariant = BadgeVariant.Filled
) {
    ClutchBadge(
        text = text,
        modifier = modifier,
        color = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary,
        size = size,
        variant = variant
    )
}

@Composable
fun ClutchBadgeSecondary(
    text: String,
    modifier: Modifier = Modifier,
    size: BadgeSize = BadgeSize.Medium,
    variant: BadgeVariant = BadgeVariant.Filled
) {
    ClutchBadge(
        text = text,
        modifier = modifier,
        color = MaterialTheme.colorScheme.secondary,
        contentColor = MaterialTheme.colorScheme.onSecondary,
        size = size,
        variant = variant
    )
}

@Composable
fun ClutchBadgeSuccess(
    text: String,
    modifier: Modifier = Modifier,
    size: BadgeSize = BadgeSize.Medium,
    variant: BadgeVariant = BadgeVariant.Filled
) {
    ClutchBadge(
        text = text,
        modifier = modifier,
        color = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary,
        size = size,
        variant = variant
    )
}

@Composable
fun ClutchBadgeWarning(
    text: String,
    modifier: Modifier = Modifier,
    size: BadgeSize = BadgeSize.Medium,
    variant: BadgeVariant = BadgeVariant.Filled
) {
    ClutchBadge(
        text = text,
        modifier = modifier,
        color = MaterialTheme.colorScheme.tertiary,
        contentColor = MaterialTheme.colorScheme.onTertiary,
        size = size,
        variant = variant
    )
}

@Composable
fun ClutchBadgeError(
    text: String,
    modifier: Modifier = Modifier,
    size: BadgeSize = BadgeSize.Medium,
    variant: BadgeVariant = BadgeVariant.Filled
) {
    ClutchBadge(
        text = text,
        modifier = modifier,
        color = MaterialTheme.colorScheme.error,
        contentColor = MaterialTheme.colorScheme.onError,
        size = size,
        variant = variant
    )
}

@Composable
fun ClutchBadgeInfo(
    text: String,
    modifier: Modifier = Modifier,
    size: BadgeSize = BadgeSize.Medium,
    variant: BadgeVariant = BadgeVariant.Filled
) {
    ClutchBadge(
        text = text,
        modifier = modifier,
        color = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary,
        size = size,
        variant = variant
    )
}

// ============================================================================
// STATUS BADGES
// ============================================================================

@Composable
fun ClutchStatusBadge(
    status: StatusType,
    modifier: Modifier = Modifier,
    size: BadgeSize = BadgeSize.Medium,
    variant: BadgeVariant = BadgeVariant.Filled
) {
    ClutchBadge(
        text = status.displayName,
        modifier = modifier,
        color = status.color,
        contentColor = status.contentColor,
        size = size,
        variant = variant
    )
}

// ============================================================================
// NOTIFICATION BADGE
// ============================================================================

@Composable
fun ClutchNotificationBadge(
    count: Int,
    modifier: Modifier = Modifier,
    maxCount: Int = 99,
    size: BadgeSize = BadgeSize.Small,
    color: Color = MaterialTheme.colorScheme.error,
    contentColor: Color = MaterialTheme.colorScheme.onError
) {
    if (count > 0) {
        ClutchBadge(
            text = if (count > maxCount) "$maxCount+" else count.toString(),
            modifier = modifier,
            color = color,
            contentColor = contentColor,
            size = size,
            variant = BadgeVariant.Filled,
            shape = RoundedCornerShape(ClutchBorderRadius.full)
        )
    }
}

// ============================================================================
// DOT BADGE
// ============================================================================

@Composable
fun ClutchDotBadge(
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.error,
    size: Dp = 8.dp
) {
    Box(
        modifier = modifier
            .size(size)
            .background(
                color = color,
                shape = CircleShape
            )
    )
}

// ============================================================================
// ENUMS
// ============================================================================

enum class BadgeSize {
    Small, Medium, Large
}

enum class BadgeVariant {
    Filled, Outlined, Soft
}

enum class StatusType(
    val displayName: String,
    val color: Color,
    val contentColor: Color
) {
    Active(
        displayName = "Active",
        color = Color(0xFF6750A4),
        contentColor = Color(0xFFFFFFFF)
    ),
    Inactive(
        displayName = "Inactive",
        color = Color(0xFF79747E),
        contentColor = Color(0xFF1C1B1F)
    ),
    Pending(
        displayName = "Pending",
        color = Color(0xFF7D5260),
        contentColor = Color(0xFFFFFFFF)
    ),
    Completed(
        displayName = "Completed",
        color = Color(0xFF6750A4),
        contentColor = Color(0xFFFFFFFF)
    ),
    Failed(
        displayName = "Failed",
        color = Color(0xFFBA1A1A),
        contentColor = Color(0xFFFFFFFF)
    ),
    Online(
        displayName = "Online",
        color = Color(0xFF6750A4),
        contentColor = Color(0xFFFFFFFF)
    ),
    Offline(
        displayName = "Offline",
        color = Color(0xFF79747E),
        contentColor = Color(0xFF1C1B1F)
    )
}
