package com.clutch.partners.data.model

data class Payment(
    val id: String,
    val orderId: String,
    val amount: Double,
    val method: String,
    val status: String,
    val createdAt: Long
) : com.clutch.partners.offline.SyncableData