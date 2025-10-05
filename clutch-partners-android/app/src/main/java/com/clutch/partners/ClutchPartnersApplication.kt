package com.clutch.partners

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ClutchPartnersApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize any global app configurations here
        // Firebase, Analytics, etc. will be initialized automatically by Hilt
    }
}