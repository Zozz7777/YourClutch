package com.clutch.partners.data.service

import com.clutch.partners.data.model.Product
import com.clutch.partners.data.model.POSSale
import com.clutch.partners.data.model.POSItem
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class POSService @Inject constructor(
    private val apiService: ApiService
) {
    
    suspend fun createSale(
        items: List<POSItem>,
        customerName: String?,
        customerPhone: String?,
        customerEmail: String?,
        paymentMethod: String,
        discount: Double,
        notes: String?
    ): Result<String> {
        val sale = POSSale(
            items = items,
            customerName = customerName,
            customerPhone = customerPhone,
            customerEmail = customerEmail,
            paymentMethod = paymentMethod,
            discount = discount,
            notes = notes
        )
        
        return apiService.createSale(sale)
    }
    
    suspend fun addProduct(product: Product): Result<String> {
        return apiService.addProduct(product)
    }
}
