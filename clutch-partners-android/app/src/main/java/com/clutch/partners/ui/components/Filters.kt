package com.clutch.partners.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun FilterChip(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    FilterChip(
        onClick = onClick,
        label = { Text(label) },
        selected = isSelected,
        modifier = modifier
    )
}

@Composable
fun FilterChipsRow(
    filters: List<FilterOption>,
    selectedFilters: Set<String>,
    onFilterSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        items(filters) { filter ->
            FilterChip(
                label = filter.label,
                isSelected = selectedFilters.contains(filter.value),
                onClick = { onFilterSelected(filter.value) }
            )
        }
    }
}

@Composable
fun DateRangeFilter(
    startDate: String?,
    endDate: String?,
    onStartDateClick: () -> Unit,
    onEndDateClick: () -> Unit,
    onClearClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Date Range",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                DatePickerChip(
                    label = "From",
                    date = startDate,
                    onClick = onStartDateClick,
                    modifier = Modifier.weight(1f)
                )
                
                DatePickerChip(
                    label = "To",
                    date = endDate,
                    onClick = onEndDateClick,
                    modifier = Modifier.weight(1f)
                )
            }
            
            if (startDate != null || endDate != null) {
                Spacer(modifier = Modifier.height(8.dp))
                
                TextButton(
                    onClick = onClearClick,
                    modifier = Modifier.align(Alignment.End)
                ) {
                    Text("Clear")
                }
            }
        }
    }
}

@Composable
private fun DatePickerChip(
    label: String,
    date: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = date ?: "Select",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (date != null) FontWeight.Medium else FontWeight.Normal,
                color = if (date != null) MaterialTheme.colorScheme.onSurface 
                       else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun StatusFilter(
    statuses: List<StatusOption>,
    selectedStatuses: Set<String>,
    onStatusSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Status",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(statuses) { status ->
                    StatusFilterChip(
                        status = status,
                        isSelected = selectedStatuses.contains(status.value),
                        onClick = { onStatusSelected(status.value) }
                    )
                }
            }
        }
    }
}

@Composable
private fun StatusFilterChip(
    status: StatusOption,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) status.color.copy(alpha = 0.2f)
                           else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 2.dp else 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(status.color)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Text(
                text = status.label,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (isSelected) FontWeight.Medium else FontWeight.Normal,
                color = if (isSelected) status.color else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun SearchFilter(
    query: String,
    onQueryChange: (String) -> Unit,
    placeholder: String = "Search...",
    onSearchClick: () -> Unit = {},
    onClearClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                placeholder = { Text(placeholder) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search"
                    )
                },
                trailingIcon = {
                    if (query.isNotEmpty()) {
                        IconButton(onClick = onClearClick) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Clear"
                            )
                        }
                    }
                },
                singleLine = true,
                modifier = Modifier.weight(1f),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )
            
            if (query.isNotEmpty()) {
                Spacer(modifier = Modifier.width(8.dp))
                
                IconButton(
                    onClick = onSearchClick,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.primary)
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = MaterialTheme.colorScheme.onPrimary
                    )
                }
            }
        }
    }
}

@Composable
fun CategoryFilter(
    categories: List<CategoryOption>,
    selectedCategories: Set<String>,
    onCategorySelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Category",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { category ->
                    CategoryFilterChip(
                        category = category,
                        isSelected = selectedCategories.contains(category.value),
                        onClick = { onCategorySelected(category.value) }
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryFilterChip(
    category: CategoryOption,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                           else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 2.dp else 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = category.icon,
                contentDescription = null,
                tint = if (isSelected) MaterialTheme.colorScheme.primary 
                      else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(16.dp)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Text(
                text = category.label,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (isSelected) FontWeight.Medium else FontWeight.Normal,
                color = if (isSelected) MaterialTheme.colorScheme.primary 
                       else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun FilterBottomSheet(
    isVisible: Boolean,
    onDismiss: () -> Unit,
    onApplyFilters: () -> Unit,
    onClearFilters: () -> Unit,
    content: @Composable () -> Unit,
    modifier: Modifier = Modifier
) {
    if (isVisible) {
        ModalBottomSheet(
            onDismissRequest = onDismiss,
            modifier = modifier
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Filters",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    
                    TextButton(onClick = onClearFilters) {
                        Text("Clear All")
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                content()
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }
                    
                    Button(
                        onClick = onApplyFilters,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Apply Filters")
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

// Data classes
data class FilterOption(
    val value: String,
    val label: String
)

data class StatusOption(
    val value: String,
    val label: String,
    val color: Color
)

data class CategoryOption(
    val value: String,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
)
