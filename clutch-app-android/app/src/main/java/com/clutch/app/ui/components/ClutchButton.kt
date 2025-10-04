package com.clutch.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.theme.*

/**
 * ClutchButton.kt - Design system button component
 * 
 * Perfect design.json compliance with all button variants
 * and proper Material3 integration.
 */

@Composable
fun ClutchButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    colors: ButtonColors = ButtonDefaults.buttonColors(),
    contentPadding: PaddingValues = PaddingValues(
        horizontal = ClutchComponentSpacing.buttonPadding,
        vertical = ClutchComponentSpacing.buttonPadding / 2
    ),
    shape: Shape = RoundedCornerShape(ClutchBorderRadius.md),
    content: @Composable RowScope.() -> Unit
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = colors,
        contentPadding = contentPadding,
        shape = shape,
        content = content
    )
}

// ============================================================================
// BUTTON VARIANTS (design.json compliant)
// ============================================================================

@Composable
fun ClutchButtonPrimary(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    ClutchButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary,
            disabledContainerColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f),
            disabledContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
        ),
        content = content
    )
}

@Composable
fun ClutchButtonSecondary(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    ClutchButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.secondary,
            contentColor = MaterialTheme.colorScheme.onSecondary,
            disabledContainerColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f),
            disabledContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
        ),
        content = content
    )
}

@Composable
fun ClutchButtonOutlined(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = MaterialTheme.colorScheme.primary
        ),
        border = BorderStroke(
            width = 1.dp,
            color = MaterialTheme.colorScheme.outline
        ),
        shape = RoundedCornerShape(ClutchBorderRadius.md),
        contentPadding = PaddingValues(
            horizontal = ClutchComponentSpacing.buttonPadding,
            vertical = ClutchComponentSpacing.buttonPadding / 2
        ),
        content = content
    )
}

@Composable
fun ClutchButtonText(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    TextButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = ButtonDefaults.textButtonColors(
            contentColor = MaterialTheme.colorScheme.primary
        ),
        contentPadding = PaddingValues(
            horizontal = ClutchComponentSpacing.buttonPadding,
            vertical = ClutchComponentSpacing.buttonPadding / 2
        ),
        content = content
    )
}

@Composable
fun ClutchButtonDestructive(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    ClutchButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.error,
            contentColor = MaterialTheme.colorScheme.onError,
            disabledContainerColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f),
            disabledContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
        ),
        content = content
    )
}

// ============================================================================
// BUTTON SIZES (design.json compliant)
// ============================================================================

@Composable
fun ClutchButtonSmall(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    ClutchButton(
        onClick = onClick,
        modifier = modifier.height(ClutchComponentSpacing.buttonHeight * 0.75f),
        enabled = enabled,
        contentPadding = PaddingValues(
            horizontal = ClutchComponentSpacing.buttonPadding * 0.75f,
            vertical = ClutchComponentSpacing.buttonPadding * 0.5f
        ),
        content = content
    )
}

@Composable
fun ClutchButtonMedium(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    ClutchButton(
        onClick = onClick,
        modifier = modifier.height(ClutchComponentSpacing.buttonHeight),
        enabled = enabled,
        content = content
    )
}

@Composable
fun ClutchButtonLarge(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
) {
    ClutchButton(
        onClick = onClick,
        modifier = modifier.height(ClutchComponentSpacing.buttonHeight * 1.25f),
        enabled = enabled,
        contentPadding = PaddingValues(
            horizontal = ClutchComponentSpacing.buttonPadding * 1.25f,
            vertical = ClutchComponentSpacing.buttonPadding
        ),
        content = content
    )
}

// ============================================================================
// BUTTON WITH ICONS
// ============================================================================

@Composable
fun ClutchButtonWithIcon(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector,
    text: String,
    iconPosition: IconPosition = IconPosition.Start
) {
    ClutchButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        content = {
            when (iconPosition) {
                IconPosition.Start -> {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                    Text(text)
                }
                IconPosition.End -> {
                    Text(text)
                    Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                }
                IconPosition.Top -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        content = {
                            Icon(
                                imageVector = icon,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.height(ClutchSpacing.xs))
                            Text(text)
                        }
                    )
                }
            }
        }
    )
}

@Composable
fun ClutchButtonIconOnly(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector,
    contentDescription: String
) {
    ClutchButton(
        onClick = onClick,
        modifier = modifier.size(ClutchComponentSpacing.buttonHeight),
        enabled = enabled,
        contentPadding = PaddingValues(ClutchSpacing.sm),
        content = {
            Icon(
                imageVector = icon,
                contentDescription = contentDescription,
                modifier = Modifier.size(18.dp)
            )
        }
    )
}

// ============================================================================
// FLOATING ACTION BUTTON
// ============================================================================

@Composable
fun ClutchFloatingActionButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    containerColor: Color = MaterialTheme.colorScheme.primaryContainer,
    contentColor: Color = MaterialTheme.colorScheme.onPrimaryContainer,
    content: @Composable () -> Unit
) {
    FloatingActionButton(
        onClick = onClick,
        modifier = modifier,
        containerColor = containerColor,
        contentColor = contentColor,
        content = content
    )
}

// ============================================================================
// BUTTON GROUPS
// ============================================================================

@Composable
fun ClutchButtonGroup(
    modifier: Modifier = Modifier,
    spacing: Dp = ClutchComponentSpacing.buttonSpacing,
    content: @Composable RowScope.() -> Unit
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(spacing),
        content = content
    )
}

@Composable
fun ClutchButtonGroupVertical(
    modifier: Modifier = Modifier,
    spacing: Dp = ClutchComponentSpacing.buttonSpacing,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(spacing),
        content = content
    )
}

// ============================================================================
// ENUMS
// ============================================================================

enum class IconPosition {
    Start, End, Top
}
