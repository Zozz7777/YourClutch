package com.clutch.partners.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.model.InventoryItem
import com.clutch.partners.data.model.InventoryFilter
import com.clutch.partners.data.model.StockFilter
import com.clutch.partners.data.model.SortBy
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class InventoryManagementUiState(
    val items: List<InventoryItem> = emptyList(),
    val filteredItems: List<InventoryItem> = emptyList(),
    val searchQuery: String = "",
    val currentFilter: InventoryFilter = InventoryFilter.ALL,
    val totalItems: Int = 0,
    val lowStockItems: Int = 0,
    val outOfStockItems: Int = 0,
    val totalValue: Double = 0.0,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val showingAddItemDialog: Boolean = false,
    val showingFilterDialog: Boolean = false,
    val editingItem: InventoryItem? = null
)

@HiltViewModel
class InventoryManagementViewModel @Inject constructor(
    private val apiService: PartnersApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(InventoryManagementUiState())
    val uiState: StateFlow<InventoryManagementUiState> = _uiState.asStateFlow()

    fun loadInventory() {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
        
        viewModelScope.launch {
            try {
                // For now, use mock data since API might not be ready
                val mockItems = createMockInventoryItems()
                updateInventoryStats(mockItems)
                applyFilters(mockItems)
                
                _uiState.value = _uiState.value.copy(
                    items = mockItems,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Failed to load inventory"
                )
            }
        }
    }

    fun addInventoryItem(item: InventoryItem) {
        val currentItems = _uiState.value.items.toMutableList()
        currentItems.add(item)
        updateInventoryStats(currentItems)
        applyFilters(currentItems)
        
        _uiState.value = _uiState.value.copy(
            items = currentItems,
            showingAddItemDialog = false
        )
    }

    fun updateInventoryItem(item: InventoryItem) {
        val currentItems = _uiState.value.items.toMutableList()
        val index = currentItems.indexOfFirst { it.id == item.id }
        if (index != -1) {
            currentItems[index] = item
            updateInventoryStats(currentItems)
            applyFilters(currentItems)
            
            _uiState.value = _uiState.value.copy(
                items = currentItems,
                editingItem = null
            )
        }
    }

    fun deleteInventoryItem(itemId: String) {
        val currentItems = _uiState.value.items.toMutableList()
        currentItems.removeAll { it.id == itemId }
        updateInventoryStats(currentItems)
        applyFilters(currentItems)
        
        _uiState.value = _uiState.value.copy(items = currentItems)
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        applyFilters(_uiState.value.items)
    }

    fun setFilter(filter: InventoryFilter) {
        _uiState.value = _uiState.value.copy(currentFilter = filter)
        applyFilters(_uiState.value.items)
    }

    fun setSortBy(sortBy: SortBy) {
        val sortedItems = when (sortBy) {
            SortBy.NAME -> _uiState.value.filteredItems.sortedBy { it.name }
            SortBy.PRICE -> _uiState.value.filteredItems.sortedBy { it.price }
            SortBy.STOCK -> _uiState.value.filteredItems.sortedBy { it.stock }
            SortBy.CREATED_DATE -> _uiState.value.filteredItems.sortedBy { it.createdAt }
            SortBy.UPDATED_DATE -> _uiState.value.filteredItems.sortedBy { it.updatedAt }
        }
        
        _uiState.value = _uiState.value.copy(filteredItems = sortedItems)
    }

    fun showAddItemDialog() {
        _uiState.value = _uiState.value.copy(showingAddItemDialog = true)
    }

    fun hideAddItemDialog() {
        _uiState.value = _uiState.value.copy(showingAddItemDialog = false)
    }

    fun showFilterDialog() {
        _uiState.value = _uiState.value.copy(showingFilterDialog = true)
    }

    fun hideFilterDialog() {
        _uiState.value = _uiState.value.copy(showingFilterDialog = false)
    }

    fun setEditingItem(item: InventoryItem?) {
        _uiState.value = _uiState.value.copy(editingItem = item)
    }

    private fun updateInventoryStats(items: List<InventoryItem>) {
        val totalItems = items.size
        val lowStockItems = items.count { it.stock <= it.lowStockThreshold && it.stock > 0 }
        val outOfStockItems = items.count { it.stock == 0 }
        val totalValue = items.sumOf { it.price * it.stock }
        
        _uiState.value = _uiState.value.copy(
            totalItems = totalItems,
            lowStockItems = lowStockItems,
            outOfStockItems = outOfStockItems,
            totalValue = totalValue
        )
    }

    private fun applyFilters(items: List<InventoryItem>) {
        val filteredItems = items.filter { item ->
            val matchesSearch = item.name.contains(_uiState.value.searchQuery, ignoreCase = true) ||
                               item.sku.contains(_uiState.value.searchQuery, ignoreCase = true)
            
            val matchesFilter = when (_uiState.value.currentFilter) {
                InventoryFilter.ALL -> true
                InventoryFilter.LOW_STOCK -> item.stock <= item.lowStockThreshold && item.stock > 0
                InventoryFilter.OUT_OF_STOCK -> item.stock == 0
                InventoryFilter.ACTIVE -> item.isActive
                InventoryFilter.INACTIVE -> !item.isActive
            }
            
            matchesSearch && matchesFilter
        }
        
        _uiState.value = _uiState.value.copy(filteredItems = filteredItems)
    }

    private fun createMockInventoryItems(): List<InventoryItem> {
        return listOf(
            InventoryItem(
                id = "1",
                name = "Engine Oil 5W-30",
                sku = "EO-5W30-001",
                price = 25.99,
                stock = 50,
                category = "Engine",
                brand = "Mobil"
            ),
            InventoryItem(
                id = "2",
                name = "Brake Pads Front",
                sku = "BP-F-002",
                price = 45.99,
                stock = 5,
                category = "Brakes",
                brand = "Brembo"
            ),
            InventoryItem(
                id = "3",
                name = "Air Filter",
                sku = "AF-003",
                price = 15.99,
                stock = 0,
                category = "Engine",
                brand = "K&N"
            )
        )
    }
}