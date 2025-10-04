package com.clutch.app.features.analytics

import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.junit.MockitoJUnitRunner
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*

@RunWith(MockitoJUnitRunner::class)
class AnalyticsManagerTest {

    private lateinit var analyticsManager: AnalyticsManager

    @Before
    fun setUp() {
        analyticsManager = AnalyticsManager()
    }

    @Test
    fun `trackUserEvent should update analytics`() = runTest {
        // Given
        val event = UserEvent.ScreenView("TestScreen")

        // When
        analyticsManager.trackUserEvent(event)

        // Then
        val analytics = analyticsManager.getUserAnalytics()
        assertEquals(1, analytics.totalEvents)
        assertTrue(analytics.events.contains(event))
    }

    @Test
    fun `trackScreenView should track screen view event`() = runTest {
        // Given
        val screenName = "TestScreen"

        // When
        analyticsManager.trackScreenView(screenName)

        // Then
        val analytics = analyticsManager.getUserAnalytics()
        assertEquals(1, analytics.totalEvents)
        assertTrue(analytics.events.any { it is UserEvent.ScreenView && it.screenName == screenName })
    }

    @Test
    fun `trackButtonClick should track button click event`() = runTest {
        // Given
        val buttonName = "TestButton"

        // When
        analyticsManager.trackButtonClick(buttonName)

        // Then
        val analytics = analyticsManager.getUserAnalytics()
        assertEquals(1, analytics.totalEvents)
        assertTrue(analytics.events.any { it is UserEvent.ButtonClick && it.buttonName == buttonName })
    }

    @Test
    fun `trackServiceBooked should track service booked event`() = runTest {
        // Given
        val serviceName = "TestService"

        // When
        analyticsManager.trackServiceBooked(serviceName)

        // Then
        val analytics = analyticsManager.getUserAnalytics()
        assertEquals(1, analytics.totalEvents)
        assertTrue(analytics.events.any { it is UserEvent.ServiceBooked && it.serviceName == serviceName })
    }

    @Test
    fun `trackPartsOrdered should track parts ordered event`() = runTest {
        // Given
        val partsCount = 5

        // When
        analyticsManager.trackPartsOrdered(partsCount)

        // Then
        val analytics = analyticsManager.getUserAnalytics()
        assertEquals(1, analytics.totalEvents)
        assertTrue(analytics.events.any { it is UserEvent.PartsOrdered && it.partsCount == partsCount })
    }

    @Test
    fun `trackPaymentCompleted should track payment completed event`() = runTest {
        // Given
        val amount = 100.0

        // When
        analyticsManager.trackPaymentCompleted(amount)

        // Then
        val analytics = analyticsManager.getUserAnalytics()
        assertEquals(1, analytics.totalEvents)
        assertTrue(analytics.events.any { it is UserEvent.PaymentCompleted && it.amount == amount })
    }

    @Test
    fun `trackPerformanceMetric should update performance metrics`() = runTest {
        // Given
        val metric = PerformanceMetric.AppStartup(1000L)

        // When
        analyticsManager.trackPerformanceMetric(metric)

        // Then
        val metrics = analyticsManager.getPerformanceMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.contains(metric))
    }

    @Test
    fun `trackAppStartup should track app startup time`() = runTest {
        // Given
        val time = 1000L

        // When
        analyticsManager.trackAppStartup(time)

        // Then
        val metrics = analyticsManager.getPerformanceMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.any { it is PerformanceMetric.AppStartup && it.time == time })
    }

    @Test
    fun `trackScreenLoad should track screen load time`() = runTest {
        // Given
        val screenName = "TestScreen"
        val time = 500L

        // When
        analyticsManager.trackScreenLoad(screenName, time)

        // Then
        val metrics = analyticsManager.getPerformanceMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.any { it is PerformanceMetric.ScreenLoad && it.screenName == screenName && it.time == time })
    }

    @Test
    fun `trackApiCall should track API call metrics`() = runTest {
        // Given
        val endpoint = "test-endpoint"
        val responseTime = 200L
        val success = true

        // When
        analyticsManager.trackApiCall(endpoint, responseTime, success)

        // Then
        val metrics = analyticsManager.getPerformanceMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.any { it is PerformanceMetric.ApiCall && it.endpoint == endpoint && it.responseTime == responseTime && it.success == success })
    }

    @Test
    fun `trackMemoryUsage should track memory usage`() = runTest {
        // Given
        val usage = 50L

        // When
        analyticsManager.trackMemoryUsage(usage)

        // Then
        val metrics = analyticsManager.getPerformanceMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.any { it is PerformanceMetric.MemoryUsage && it.usage == usage })
    }

    @Test
    fun `trackBusinessMetric should update business metrics`() = runTest {
        // Given
        val metric = BusinessMetric.ServiceRevenue(100.0)

        // When
        analyticsManager.trackBusinessMetric(metric)

        // Then
        val metrics = analyticsManager.getBusinessMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.contains(metric))
    }

    @Test
    fun `trackServiceRevenue should track service revenue`() = runTest {
        // Given
        val amount = 100.0

        // When
        analyticsManager.trackServiceRevenue(amount)

        // Then
        val metrics = analyticsManager.getBusinessMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.any { it is BusinessMetric.ServiceRevenue && it.amount == amount })
    }

    @Test
    fun `trackPartsRevenue should track parts revenue`() = runTest {
        // Given
        val amount = 50.0

        // When
        analyticsManager.trackPartsRevenue(amount)

        // Then
        val metrics = analyticsManager.getBusinessMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.any { it is BusinessMetric.PartsRevenue && it.amount == amount })
    }

    @Test
    fun `trackUserRetention should track user retention`() = runTest {
        // Given
        val days = 30

        // When
        analyticsManager.trackUserRetention(days)

        // Then
        val metrics = analyticsManager.getBusinessMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.any { it is BusinessMetric.UserRetention && it.days == days })
    }

    @Test
    fun `trackConversionRate should track conversion rate`() = runTest {
        // Given
        val rate = 0.75

        // When
        analyticsManager.trackConversionRate(rate)

        // Then
        val metrics = analyticsManager.getBusinessMetrics()
        assertEquals(1, metrics.totalMetrics)
        assertTrue(metrics.metrics.any { it is BusinessMetric.ConversionRate && it.rate == rate })
    }

    @Test
    fun `resetAnalytics should reset all analytics`() = runTest {
        // Given
        analyticsManager.trackUserEvent(UserEvent.ScreenView("TestScreen"))
        analyticsManager.trackPerformanceMetric(PerformanceMetric.AppStartup(1000L))
        analyticsManager.trackBusinessMetric(BusinessMetric.ServiceRevenue(100.0))

        // When
        analyticsManager.resetAnalytics()

        // Then
        val userAnalytics = analyticsManager.getUserAnalytics()
        val performanceMetrics = analyticsManager.getPerformanceMetrics()
        val businessMetrics = analyticsManager.getBusinessMetrics()

        assertEquals(0, userAnalytics.totalEvents)
        assertEquals(0, performanceMetrics.totalMetrics)
        assertEquals(0, businessMetrics.totalMetrics)
    }
}
