package com.clutch.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyGridScope
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.theme.*

/**
 * ClutchCard.kt - Design system card component
 * 
 * Perfect design.json compliance with all card variants
 * and proper Material3 integration.
 */

@Composable
fun ClutchCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true,
    shape: Shape = MaterialTheme.shapes.medium,
    colors: CardColors = CardDefaults.cardColors(),
    elevation: CardElevation = CardDefaults.cardElevation(),
    border: BorderStroke? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier
            .then(
                if (onClick != null) {
                    Modifier.clickable(enabled = enabled) { onClick() }
                } else {
                    Modifier
                }
            ),
        onClick = onClick ?: {},
        enabled = enabled,
        shape = shape,
        colors = colors,
        elevation = elevation,
        border = border,
        content = content
    )
}

// ============================================================================
// CARD VARIANTS (design.json compliant)
// ============================================================================

@Composable
fun ClutchCardBasic(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    ClutchCard(
        modifier = modifier,
        onClick = onClick,
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = ClutchElevation.sm
        ),
        content = content
    )
}

@Composable
fun ClutchCardElevated(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    ClutchCard(
        modifier = modifier,
        onClick = onClick,
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = ClutchElevation.md
        ),
        content = content
    )
}

@Composable
fun ClutchCardOutlined(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    ClutchCard(
        modifier = modifier,
        onClick = onClick,
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.onSurface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = ClutchElevation.none
        ),
        border = BorderStroke(
            width = 1.dp,
            color = MaterialTheme.colorScheme.outline
        ),
        content = content
    )
}

@Composable
fun ClutchCardFilled(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    ClutchCard(
        modifier = modifier,
        onClick = onClick,
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            contentColor = MaterialTheme.colorScheme.onSurfaceVariant
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = ClutchElevation.none
        ),
        content = content
    )
}

// ============================================================================
// SPECIALIZED CARDS
// ============================================================================

@Composable
fun ClutchCardPrimary(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    ClutchCard(
        modifier = modifier,
        onClick = onClick,
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = ClutchElevation.sm
        ),
        content = content
    )
}

@Composable
fun ClutchCardSecondary(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    ClutchCard(
        modifier = modifier,
        onClick = onClick,
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondary,
            contentColor = MaterialTheme.colorScheme.onSecondary
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = ClutchElevation.sm
        ),
        content = content
    )
}

@Composable
fun ClutchCardDestructive(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    ClutchCard(
        modifier = modifier,
        onClick = onClick,
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.error,
            contentColor = MaterialTheme.colorScheme.onError
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = ClutchElevation.sm
        ),
        content = content
    )
}

// ============================================================================
// CARD CONTENT HELPERS
// ============================================================================

@Composable
fun ClutchCardContent(
    modifier: Modifier = Modifier,
    padding: PaddingValues = PaddingValues(ClutchComponentSpacing.cardPadding),
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = modifier.padding(padding),
        content = content
    )
}

@Composable
fun ClutchCardHeader(
    modifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(
                horizontal = ClutchComponentSpacing.cardPadding,
                vertical = ClutchComponentSpacing.cardPadding / 2
            ),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
        content = content
    )
}

@Composable
fun ClutchCardFooter(
    modifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(
                horizontal = ClutchComponentSpacing.cardPadding,
                vertical = ClutchComponentSpacing.cardPadding / 2
            ),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
        content = content
    )
}

// ============================================================================
// CARD LAYOUTS
// ============================================================================

@Composable
fun ClutchCardGrid(
    modifier: Modifier = Modifier,
    columns: Int = 2,
    spacing: Dp = ClutchComponentSpacing.cardSpacing,
    content: LazyGridScope.() -> Unit
) {
    LazyVerticalGrid(
        modifier = modifier,
        columns = GridCells.Fixed(columns),
        contentPadding = PaddingValues(ClutchComponentSpacing.cardMargin),
        horizontalArrangement = Arrangement.spacedBy(spacing),
        verticalArrangement = Arrangement.spacedBy(spacing),
        content = content
    )
}

@Composable
fun ClutchCardList(
    modifier: Modifier = Modifier,
    spacing: Dp = ClutchComponentSpacing.cardSpacing,
    content: LazyListScope.() -> Unit
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(ClutchComponentSpacing.cardMargin),
        verticalArrangement = Arrangement.spacedBy(spacing),
        content = content
    )
}
