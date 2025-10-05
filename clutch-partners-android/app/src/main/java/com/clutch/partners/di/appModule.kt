package com.clutch.partners.di

import android.content.Context
import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.local.NotificationDao
import com.clutch.partners.data.local.NotificationDatabase
import com.clutch.partners.repository.NotificationRepository
import com.clutch.partners.utils.SessionManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideSessionManager(@ApplicationContext context: Context): SessionManager {
        return SessionManager(context)
    }
    
    @Provides
    @Singleton
    fun provideNotificationDatabase(@ApplicationContext context: Context): NotificationDatabase {
        return NotificationDatabase.getDatabase(context)
    }
    
    @Provides
    @Singleton
    fun provideNotificationDao(database: NotificationDatabase): NotificationDao {
        return database.notificationDao()
    }
    
    @Provides
    @Singleton
    fun provideNotificationRepository(
        notificationDao: NotificationDao,
        apiService: PartnersApiService
    ): NotificationRepository {
        return NotificationRepository(notificationDao, apiService)
    }
}