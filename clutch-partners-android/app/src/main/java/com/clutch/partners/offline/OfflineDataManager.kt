package com.clutch.partners.offline

import android.content.Context
import androidx.room.*
import com.clutch.partners.data.model.*
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OfflineDataManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    private val database = OfflineDatabase.getDatabase(context)
    private val orderDao = database.orderDao()
    private val paymentDao = database.paymentDao()
    private val productDao = database.productDao()
    
    // Order operations
    suspend fun saveOrderOffline(order: Order) {
        val offlineOrder = OfflineOrder(
            id = order.id,
            customerName = order.customerName,
            customerPhone = order.customerPhone,
            totalAmount = order.totalAmount,
            status = order.status,
            createdAt = order.createdAt
        )
        orderDao.insertOrder(offlineOrder)
    }
    
    suspend fun getOfflineOrders(): Flow<List<OfflineOrder>> {
        return orderDao.getAllOrders()
    }
    
    suspend fun getPendingSyncOrders(): Flow<List<OfflineOrder>> {
        return orderDao.getPendingSyncOrders()
    }
    
    suspend fun markOrderAsSynced(orderId: String) {
        orderDao.markAsSynced(orderId)
    }
    
    // Payment operations
    suspend fun savePaymentOffline(payment: Payment) {
        val offlinePayment = OfflinePayment(
            id = payment.id,
            orderId = payment.orderId,
            amount = payment.amount,
            method = payment.method,
            status = payment.status,
            createdAt = payment.createdAt
        )
        paymentDao.insertPayment(offlinePayment)
    }
    
    suspend fun getOfflinePayments(): Flow<List<OfflinePayment>> {
        return paymentDao.getAllPayments()
    }
    
    suspend fun getPendingSyncPayments(): Flow<List<OfflinePayment>> {
        return paymentDao.getPendingSyncPayments()
    }
    
    suspend fun markPaymentAsSynced(paymentId: String) {
        paymentDao.markAsSynced(paymentId)
    }
    
    // Product operations
    suspend fun saveProductOffline(product: Product) {
        val offlineProduct = OfflineProduct(
            id = product.id,
            name = product.name,
            price = product.price,
            stock = product.stock,
            category = product.category,
            lastUpdated = System.currentTimeMillis()
        )
        productDao.insertProduct(offlineProduct)
    }
    
    suspend fun getOfflineProducts(): Flow<List<OfflineProduct>> {
        return productDao.getAllProducts()
    }
    
    suspend fun updateProductStock(productId: String, newStock: Int) {
        productDao.updateStock(productId, newStock)
    }
    
    // Sync operations
    suspend fun getPendingSyncCount(): Int {
        return orderDao.getPendingSyncCount() + paymentDao.getPendingSyncCount()
    }
    
    suspend fun clearSyncedData() {
        orderDao.deleteSyncedOrders()
        paymentDao.deleteSyncedPayments()
    }
}

@Entity(tableName = "offline_orders")
data class OfflineOrder(
    @PrimaryKey val id: String,
    val customerName: String,
    val customerPhone: String,
    val totalAmount: Double,
    val status: String,
    val createdAt: Long,
    val isSynced: Boolean = false,
    val syncAttempts: Int = 0
)

@Entity(tableName = "offline_payments")
data class OfflinePayment(
    @PrimaryKey val id: String,
    val orderId: String,
    val amount: Double,
    val method: String,
    val status: String,
    val createdAt: Long,
    val isSynced: Boolean = false,
    val syncAttempts: Int = 0
)

@Entity(tableName = "offline_products")
data class OfflineProduct(
    @PrimaryKey val id: String,
    val name: String,
    val price: Double,
    val stock: Int,
    val category: String,
    val lastUpdated: Long
)

@Dao
interface OfflineOrderDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: OfflineOrder)
    
    @Query("SELECT * FROM offline_orders ORDER BY createdAt DESC")
    fun getAllOrders(): Flow<List<OfflineOrder>>
    
    @Query("SELECT * FROM offline_orders WHERE isSynced = 0 ORDER BY createdAt ASC")
    fun getPendingSyncOrders(): Flow<List<OfflineOrder>>
    
    @Query("SELECT COUNT(*) FROM offline_orders WHERE isSynced = 0")
    suspend fun getPendingSyncCount(): Int
    
    @Query("UPDATE offline_orders SET isSynced = 1 WHERE id = :orderId")
    suspend fun markAsSynced(orderId: String)
    
    @Query("DELETE FROM offline_orders WHERE isSynced = 1")
    suspend fun deleteSyncedOrders()
}

@Dao
interface OfflinePaymentDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayment(payment: OfflinePayment)
    
    @Query("SELECT * FROM offline_payments ORDER BY createdAt DESC")
    fun getAllPayments(): Flow<List<OfflinePayment>>
    
    @Query("SELECT * FROM offline_payments WHERE isSynced = 0 ORDER BY createdAt ASC")
    fun getPendingSyncPayments(): Flow<List<OfflinePayment>>
    
    @Query("SELECT COUNT(*) FROM offline_payments WHERE isSynced = 0")
    suspend fun getPendingSyncCount(): Int
    
    @Query("UPDATE offline_payments SET isSynced = 1 WHERE id = :paymentId")
    suspend fun markAsSynced(paymentId: String)
    
    @Query("DELETE FROM offline_payments WHERE isSynced = 1")
    suspend fun deleteSyncedPayments()
}

@Dao
interface OfflineProductDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: OfflineProduct)
    
    @Query("SELECT * FROM offline_products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<OfflineProduct>>
    
    @Query("UPDATE offline_products SET stock = :newStock WHERE id = :productId")
    suspend fun updateStock(productId: String, newStock: Int)
}

@Database(
    entities = [OfflineOrder::class, OfflinePayment::class, OfflineProduct::class],
    version = 1,
    exportSchema = false
)
abstract class OfflineDatabase : RoomDatabase() {
    abstract fun orderDao(): OfflineOrderDao
    abstract fun paymentDao(): OfflinePaymentDao
    abstract fun productDao(): OfflineProductDao
    
    companion object {
        @Volatile
        private var INSTANCE: OfflineDatabase? = null
        
        fun getDatabase(context: Context): OfflineDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    OfflineDatabase::class.java,
                    "offline_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
