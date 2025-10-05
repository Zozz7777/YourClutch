package com.clutch.partners.data.local

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class Converters {
    
    @TypeConverter
    fun fromStringList(value: List<String>?): String? {
        return value?.let { Gson().toJson(it) }
    }
    
    @TypeConverter
    fun toStringList(value: String?): List<String>? {
        return value?.let {
            val listType = object : TypeToken<List<String>>() {}.type
            Gson().fromJson(it, listType)
        }
    }
    
    @TypeConverter
    fun fromLong(value: Long?): String? {
        return value?.toString()
    }
    
    @TypeConverter
    fun toLong(value: String?): Long? {
        return value?.toLongOrNull()
    }
}
