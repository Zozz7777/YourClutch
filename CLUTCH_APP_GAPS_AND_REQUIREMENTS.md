# Clutch App - Complete Gaps and Requirements Implementation Plan

## Executive Summary

This document outlines all identified gaps and requirements from the comprehensive audit, organized by priority and implementation complexity. Each section includes detailed technical specifications, implementation steps, and acceptance criteria.

---

## 🎯 **HIGH PRIORITY GAPS**

### 1. Typography Refinement Requirements

#### **Gap Description**
Typography implementation needs precise alignment with design.json specifications and missing variants.

#### **Current Issues**
- Font sizes not precisely matching design.json
- Missing typography variants (displayMedium, headlineSmall, etc.)
- Inconsistent spacing implementation

#### **Requirements**

##### **1.1 Complete Typography System**
```kotlin
// Required Typography Variants
val Typography = Typography(
    // Display variants
    displayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 57.sp, // design.json: 3xl
        lineHeight = 64.sp,
        letterSpacing = (-0.25).sp
    ),
    displayMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 45.sp,
        lineHeight = 52.sp,
        letterSpacing = 0.sp
    ),
    displaySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 36.sp,
        lineHeight = 44.sp,
        letterSpacing = 0.sp
    ),
    
    // Headline variants
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp, // design.json: 2xl
        lineHeight = 40.sp,
        letterSpacing = 0.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 0.sp
    ),
    headlineSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 32.sp,
        letterSpacing = 0.sp
    ),
    
    // Title variants
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp
    ),
    titleSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    
    // Body variants
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp, // design.json: base
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp, // design.json: sm
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp, // design.json: xs
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp
    ),
    
    // Label variants
    labelLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
)
```

##### **1.2 Font Weight Implementation**
```kotlin
// Ensure all font weights are available
object FontWeights {
    val Light = FontWeight(300)      // design.json: light
    val Regular = FontWeight(400)    // design.json: regular
    val Medium = FontWeight(500)     // design.json: medium
    val SemiBold = FontWeight(600)   // design.json: semibold
    val Bold = FontWeight(700)       // design.json: bold
}
```

##### **1.3 Line Height Implementation**
```kotlin
object LineHeights {
    val Tight = 1.25f      // design.json: tight
    val Normal = 1.5f      // design.json: normal
    val Relaxed = 1.75f    // design.json: relaxed
}
```

#### **Implementation Steps**
1. Update `Typography.kt` with complete variant set
2. Create typography utility functions
3. Update all screens to use proper typography variants
4. Add typography tests
5. Update design system documentation

#### **Acceptance Criteria**
- [ ] All typography variants match design.json specifications exactly
- [ ] Font sizes use design.json values (xs: 0.75rem, sm: 0.875rem, base: 1rem, lg: 1.125rem, xl: 1.25rem, 2xl: 1.5rem, 3xl: 1.875rem)
- [ ] All font weights (300-700) are properly implemented
- [ ] Line heights match design.json (1.25, 1.5, 1.75)
- [ ] All screens use consistent typography variants
- [ ] Typography tests pass

---

### 2. Spacing and Layout Refinement

#### **Gap Description**
Spacing implementation needs to use design system base unit consistently.

#### **Current Issues**
- Hardcoded spacing values instead of design system
- Inconsistent spacing between components
- Not using design.json base unit (0.25rem)

#### **Requirements**

##### **2.1 Spacing System Implementation**
```kotlin
object Spacing {
    // Base unit from design.json: 0.25rem = 4.dp
    private const val BASE_UNIT = 4.dp
    
    // Spacing scale
    val xs = BASE_UNIT * 1      // 4.dp
    val sm = BASE_UNIT * 2      // 8.dp
    val md = BASE_UNIT * 3      // 12.dp
    val lg = BASE_UNIT * 4      // 16.dp
    val xl = BASE_UNIT * 6      // 24.dp
    val xxl = BASE_UNIT * 8     // 32.dp
    val xxxl = BASE_UNIT * 12   // 48.dp
    
    // Component-specific spacing
    val cardPadding = lg        // 16.dp
    val screenPadding = xl      // 24.dp
    val sectionSpacing = xl     // 24.dp
    val itemSpacing = md        // 12.dp
}
```

##### **2.2 Density System Implementation**
```kotlin
object Density {
    object Comfortable {
        val padding = 16.dp     // design.json: 1rem
        val rowHeight = 48.dp   // design.json: 3rem
    }
    
    object Compact {
        val padding = 8.dp      // design.json: 0.5rem
        val rowHeight = 36.dp   // design.json: 2.25rem
    }
}
```

#### **Implementation Steps**
1. Create spacing system constants
2. Replace all hardcoded spacing values
3. Update component padding and margins
4. Implement density system
5. Add spacing tests

#### **Acceptance Criteria**
- [ ] All spacing uses design system base unit (0.25rem)
- [ ] No hardcoded spacing values in UI components
- [ ] Consistent spacing between all components
- [ ] Density system properly implemented
- [ ] Spacing tests pass

---

### 3. Advanced Service Features

#### **Gap Description**
Service booking system needs enhanced features for mechanic selection, ratings, and appointment scheduling.

#### **Current Issues**
- Basic service booking without mechanic selection
- No rating system for mechanics
- No appointment scheduling
- Limited service history tracking

#### **Requirements**

##### **3.1 Mechanic Management System**
```kotlin
// Data Models
data class Mechanic(
    val id: String,
    val name: String,
    val specialization: List<String>,
    val rating: Double,
    val reviewCount: Int,
    val experience: Int, // years
    val location: Location,
    val availability: List<TimeSlot>,
    val services: List<Service>,
    val profileImage: String?,
    val certifications: List<String>,
    val languages: List<String>
)

data class TimeSlot(
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val isAvailable: Boolean,
    val price: Double?
)

data class Service(
    val id: String,
    val name: String,
    val description: String,
    val duration: Int, // minutes
    val basePrice: Double,
    val category: ServiceCategory,
    val requiredParts: List<Part>?
)

enum class ServiceCategory {
    MAINTENANCE, REPAIR, INSPECTION, EMERGENCY, CUSTOM
}
```

##### **3.2 Enhanced Service Booking Screen**
```kotlin
@Composable
fun EnhancedBookServiceScreen(
    onNavigateBack: () -> Unit,
    viewModel: EnhancedServiceBookingViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Spacing.screenPadding)
    ) {
        item {
            // Service Category Selection
            ServiceCategorySection(
                categories = uiState.serviceCategories,
                selectedCategory = uiState.selectedCategory,
                onCategorySelected = viewModel::selectCategory
            )
        }
        
        item {
            // Mechanic Selection
            MechanicSelectionSection(
                mechanics = uiState.availableMechanics,
                selectedMechanic = uiState.selectedMechanic,
                onMechanicSelected = viewModel::selectMechanic
            )
        }
        
        item {
            // Service Selection
            ServiceSelectionSection(
                services = uiState.availableServices,
                selectedServices = uiState.selectedServices,
                onServiceSelected = viewModel::toggleService
            )
        }
        
        item {
            // Appointment Scheduling
            AppointmentSchedulingSection(
                availableSlots = uiState.availableTimeSlots,
                selectedSlot = uiState.selectedTimeSlot,
                onSlotSelected = viewModel::selectTimeSlot
            )
        }
        
        item {
            // Booking Summary
            BookingSummarySection(
                selectedServices = uiState.selectedServices,
                selectedMechanic = uiState.selectedMechanic,
                selectedTimeSlot = uiState.selectedTimeSlot,
                totalPrice = uiState.totalPrice
            )
        }
    }
}
```

##### **3.3 Mechanic Rating and Review System**
```kotlin
@Composable
fun MechanicRatingCard(
    mechanic: Mechanic,
    onViewReviews: () -> Unit,
    onBookService: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(Spacing.cardPadding)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Mechanic Info
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AsyncImage(
                        model = mechanic.profileImage,
                        contentDescription = "Mechanic Photo",
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                    
                    Spacer(modifier = Modifier.width(Spacing.md))
                    
                    Column {
                        Text(
                            text = mechanic.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${mechanic.experience} years experience",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                        Text(
                            text = mechanic.specialization.joinToString(", "),
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                    }
                }
                
                // Rating
                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Rating",
                            tint = Color(0xFFFFD700),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = String.format("%.1f", mechanic.rating),
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "${mechanic.reviewCount} reviews",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(Spacing.md))
            
            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(Spacing.sm)
            ) {
                OutlinedButton(
                    onClick = onViewReviews,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("View Reviews")
                }
                
                Button(
                    onClick = onBookService,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                ) {
                    Text("Book Service", color = Color.White)
                }
            }
        }
    }
}
```

##### **3.4 Service History Tracking**
```kotlin
@Composable
fun ServiceHistoryScreen(
    viewModel: ServiceHistoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Spacing.screenPadding)
    ) {
        item {
            // Service Statistics
            ServiceStatisticsCard(
                totalServices = uiState.totalServices,
                totalSpent = uiState.totalSpent,
                averageRating = uiState.averageRating,
                lastServiceDate = uiState.lastServiceDate
            )
        }
        
        item {
            // Service History List
            Text(
                text = "Service History",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(vertical = Spacing.md)
            )
        }
        
        items(uiState.serviceHistory) { serviceRecord ->
            ServiceHistoryCard(
                serviceRecord = serviceRecord,
                onViewDetails = { viewModel.viewServiceDetails(serviceRecord.id) }
            )
        }
    }
}
```

#### **Implementation Steps**
1. Create mechanic and service data models
2. Implement mechanic selection UI
3. Add rating and review system
4. Create appointment scheduling
5. Implement service history tracking
6. Add booking confirmation flow
7. Create service analytics

#### **Acceptance Criteria**
- [ ] Users can browse and select mechanics by specialization
- [ ] Mechanic rating and review system fully functional
- [ ] Appointment scheduling with time slot selection
- [ ] Service history tracking and analytics
- [ ] Booking confirmation and payment integration
- [ ] Service cost tracking and reporting

---

## 🎯 **MEDIUM PRIORITY GAPS**

### 4. Maintenance Analytics and Cost Tracking

#### **Gap Description**
Need comprehensive analytics for maintenance costs, predictive alerts, and detailed reporting.

#### **Requirements**

##### **4.1 Maintenance Analytics Dashboard**
```kotlin
@Composable
fun MaintenanceAnalyticsScreen(
    viewModel: MaintenanceAnalyticsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Spacing.screenPadding)
    ) {
        item {
            // Cost Overview
            CostOverviewCard(
                monthlyCost = uiState.monthlyCost,
                yearlyCost = uiState.yearlyCost,
                averageCostPerService = uiState.averageCostPerService,
                costTrend = uiState.costTrend
            )
        }
        
        item {
            // Cost Chart
            MaintenanceCostChart(
                costData = uiState.costHistory,
                timeRange = uiState.selectedTimeRange,
                onTimeRangeChanged = viewModel::changeTimeRange
            )
        }
        
        item {
            // Predictive Maintenance Alerts
            PredictiveAlertsSection(
                alerts = uiState.predictiveAlerts,
                onDismissAlert = viewModel::dismissAlert,
                onScheduleMaintenance = viewModel::scheduleMaintenance
            )
        }
        
        item {
            // Maintenance Schedule
            MaintenanceScheduleCard(
                upcomingMaintenance = uiState.upcomingMaintenance,
                onReschedule = viewModel::rescheduleMaintenance
            )
        }
    }
}
```

##### **4.2 Cost Tracking System**
```kotlin
data class MaintenanceCost(
    val id: String,
    val serviceId: String,
    val serviceName: String,
    val cost: Double,
    val partsCost: Double,
    val laborCost: Double,
    val date: LocalDate,
    val mileage: Int,
    val category: MaintenanceCategory,
    val mechanic: String,
    val notes: String?
)

data class CostAnalytics(
    val totalCost: Double,
    val monthlyAverage: Double,
    val yearlyTotal: Double,
    val costPerMile: Double,
    val costTrend: CostTrend,
    val categoryBreakdown: Map<MaintenanceCategory, Double>
)

enum class CostTrend {
    INCREASING, DECREASING, STABLE
}
```

##### **4.3 Predictive Maintenance Alerts**
```kotlin
data class PredictiveAlert(
    val id: String,
    val type: AlertType,
    val severity: AlertSeverity,
    val title: String,
    val description: String,
    val estimatedCost: Double,
    val recommendedDate: LocalDate,
    val parts: List<Part>,
    val services: List<Service>,
    val isDismissed: Boolean
)

enum class AlertType {
    OIL_CHANGE, BRAKE_SERVICE, TIRE_ROTATION, FILTER_REPLACEMENT,
    BELT_REPLACEMENT, FLUID_SERVICE, INSPECTION
}

enum class AlertSeverity {
    LOW, MEDIUM, HIGH, CRITICAL
}
```

#### **Implementation Steps**
1. Create cost tracking data models
2. Implement cost analytics calculations
3. Create predictive maintenance algorithms
4. Build analytics dashboard UI
5. Add cost visualization charts
6. Implement alert system
7. Create maintenance scheduling

#### **Acceptance Criteria**
- [ ] Comprehensive cost tracking and analytics
- [ ] Predictive maintenance alerts based on mileage and time
- [ ] Cost trend analysis and reporting
- [ ] Maintenance schedule optimization
- [ ] Cost per mile calculations
- [ ] Category-based cost breakdown

---

### 5. Enhanced Parts Management

#### **Gap Description**
Parts management needs comparison tools, price tracking, and installation guides.

#### **Requirements**

##### **5.1 Parts Comparison System**
```kotlin
@Composable
fun PartsComparisonScreen(
    selectedParts: List<Part>,
    onAddPart: () -> Unit,
    onRemovePart: (String) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Spacing.screenPadding)
    ) {
        // Comparison Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Compare Parts",
                style = MaterialTheme.typography.headlineSmall
            )
            
            Button(
                onClick = onAddPart,
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
            ) {
                Text("Add Part", color = Color.White)
            }
        }
        
        Spacer(modifier = Modifier.height(Spacing.md))
        
        // Comparison Table
        LazyColumn {
            item {
                ComparisonHeaderRow()
            }
            
            items(selectedParts) { part ->
                ComparisonPartRow(
                    part = part,
                    onRemove = { onRemovePart(part.id) }
                )
            }
        }
    }
}
```

##### **5.2 Price Tracking System**
```kotlin
data class PriceHistory(
    val partId: String,
    val priceHistory: List<PricePoint>,
    val currentPrice: Double,
    val lowestPrice: Double,
    val highestPrice: Double,
    val averagePrice: Double,
    val priceTrend: PriceTrend
)

data class PricePoint(
    val date: LocalDate,
    val price: Double,
    val source: String
)

@Composable
fun PriceTrackingCard(
    part: Part,
    priceHistory: PriceHistory
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.padding(Spacing.cardPadding)
        ) {
            // Part Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = part.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = part.brand,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
                
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "$${String.format("%.2f", priceHistory.currentPrice)}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = ClutchRed
                    )
                    Text(
                        text = "Current Price",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(Spacing.md))
            
            // Price Chart
            PriceChart(
                priceHistory = priceHistory.priceHistory,
                modifier = Modifier.height(200.dp)
            )
            
            Spacer(modifier = Modifier.height(Spacing.md))
            
            // Price Statistics
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                PriceStatItem(
                    label = "Lowest",
                    value = "$${String.format("%.2f", priceHistory.lowestPrice)}"
                )
                PriceStatItem(
                    label = "Average",
                    value = "$${String.format("%.2f", priceHistory.averagePrice)}"
                )
                PriceStatItem(
                    label = "Highest",
                    value = "$${String.format("%.2f", priceHistory.highestPrice)}"
                )
            }
        }
    }
}
```

##### **5.3 Installation Guides**
```kotlin
@Composable
fun InstallationGuideScreen(
    part: Part,
    viewModel: InstallationGuideViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Spacing.screenPadding)
    ) {
        item {
            // Part Header
            PartHeaderCard(part = part)
        }
        
        item {
            // Installation Overview
            InstallationOverviewCard(
                difficulty = uiState.installationDifficulty,
                estimatedTime = uiState.estimatedTime,
                toolsRequired = uiState.toolsRequired,
                safetyWarnings = uiState.safetyWarnings
            )
        }
        
        item {
            // Step-by-Step Instructions
            Text(
                text = "Installation Steps",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(vertical = Spacing.md)
            )
        }
        
        items(uiState.installationSteps) { step ->
            InstallationStepCard(
                step = step,
                isCompleted = uiState.completedSteps.contains(step.id),
                onStepCompleted = { viewModel.completeStep(step.id) }
            )
        }
        
        item {
            // Tools and Materials
            ToolsAndMaterialsCard(
                tools = uiState.toolsRequired,
                materials = uiState.materialsRequired
            )
        }
    }
}
```

#### **Implementation Steps**
1. Create parts comparison data models
2. Implement comparison UI components
3. Build price tracking system
4. Create price history visualization
5. Develop installation guide system
6. Add step-by-step instructions
7. Implement tools and materials tracking

#### **Acceptance Criteria**
- [ ] Parts comparison with side-by-side feature comparison
- [ ] Price tracking with historical data and trends
- [ ] Installation guides with step-by-step instructions
- [ ] Tools and materials requirement lists
- [ ] Difficulty rating and time estimation
- [ ] Safety warnings and precautions

---

## 🎯 **LOW PRIORITY GAPS**

### 6. Enhanced Social and Community Features

#### **Gap Description**
Community features need user profiles, direct messaging, and photo sharing capabilities.

#### **Requirements**

##### **6.1 User Profile System**
```kotlin
data class UserProfile(
    val id: String,
    val username: String,
    val displayName: String,
    val bio: String?,
    val profileImage: String?,
    val joinDate: LocalDate,
    val cars: List<Car>,
    val stats: UserStats,
    val badges: List<Badge>,
    val isVerified: Boolean
)

data class UserStats(
    val tipsPosted: Int,
    val reviewsWritten: Int,
    val helpfulVotes: Int,
    val communityPoints: Int,
    val memberSince: LocalDate
)

@Composable
fun UserProfileScreen(
    userId: String,
    viewModel: UserProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Spacing.screenPadding)
    ) {
        item {
            // Profile Header
            ProfileHeaderCard(
                profile = uiState.userProfile,
                onFollow = viewModel::followUser,
                onMessage = viewModel::sendMessage
            )
        }
        
        item {
            // User Stats
            UserStatsCard(stats = uiState.userProfile.stats)
        }
        
        item {
            // User Badges
            UserBadgesSection(badges = uiState.userProfile.badges)
        }
        
        item {
            // User Cars
            UserCarsSection(cars = uiState.userProfile.cars)
        }
        
        item {
            // Recent Activity
            RecentActivitySection(
                tips = uiState.recentTips,
                reviews = uiState.recentReviews
            )
        }
    }
}
```

##### **6.2 Direct Messaging System**
```kotlin
@Composable
fun MessagingScreen(
    conversationId: String,
    viewModel: MessagingViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Messages List
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(Spacing.screenPadding),
            reverseLayout = true
        ) {
            items(uiState.messages.reversed()) { message ->
                MessageBubble(
                    message = message,
                    isFromCurrentUser = message.senderId == uiState.currentUserId
                )
            }
        }
        
        // Message Input
        MessageInputBar(
            onSendMessage = viewModel::sendMessage,
            onSendImage = viewModel::sendImage
        )
    }
}
```

##### **6.3 Photo Sharing for Tips**
```kotlin
@Composable
fun CreateTipScreen(
    viewModel: CreateTipViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Spacing.screenPadding)
    ) {
        item {
            // Tip Title
            OutlinedTextField(
                value = uiState.tipTitle,
                onValueChange = viewModel::updateTitle,
                label = { Text("Tip Title") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        item {
            // Tip Content
            OutlinedTextField(
                value = uiState.tipContent,
                onValueChange = viewModel::updateContent,
                label = { Text("Tip Description") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                maxLines = 5
            )
        }
        
        item {
            // Photo Upload
            PhotoUploadSection(
                images = uiState.uploadedImages,
                onAddPhoto = viewModel::addPhoto,
                onRemovePhoto = viewModel::removePhoto
            )
        }
        
        item {
            // Categories
            TipCategoriesSection(
                categories = uiState.availableCategories,
                selectedCategories = uiState.selectedCategories,
                onCategorySelected = viewModel::toggleCategory
            )
        }
        
        item {
            // Publish Button
            Button(
                onClick = viewModel::publishTip,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                enabled = uiState.canPublish
            ) {
                Text("Publish Tip", color = Color.White)
            }
        }
    }
}
```

#### **Implementation Steps**
1. Create user profile data models
2. Implement profile management system
3. Build direct messaging functionality
4. Add photo sharing capabilities
5. Create enhanced tip creation flow
6. Implement user following system
7. Add community moderation tools

#### **Acceptance Criteria**
- [ ] Complete user profiles with stats and badges
- [ ] Direct messaging between users
- [ ] Photo sharing in tips and reviews
- [ ] User following and follower system
- [ ] Enhanced tip creation with media
- [ ] Community moderation and reporting

---

### 7. Security and Privacy Enhancements

#### **Gap Description**
Need biometric authentication, enhanced data encryption, and privacy controls.

#### **Requirements**

##### **7.1 Biometric Authentication**
```kotlin
class BiometricAuthManager @Inject constructor(
    private val context: Context
) {
    fun isBiometricAvailable(): Boolean {
        val biometricManager = BiometricManager.from(context)
        return biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK) == BiometricManager.BIOMETRIC_SUCCESS
    }
    
    fun authenticate(
        title: String,
        subtitle: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(context)
        val biometricPrompt = BiometricPrompt(
            context as Activity,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onSuccess()
                }
                
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    onError(errString.toString())
                }
            }
        )
        
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setNegativeButtonText("Cancel")
            .build()
        
        biometricPrompt.authenticate(promptInfo)
    }
}
```

##### **7.2 Enhanced Data Encryption**
```kotlin
class EncryptionManager @Inject constructor() {
    private val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    private val keyStore = KeyStore.getInstance("AndroidKeyStore")
    
    fun encryptData(data: String): String {
        val cipher = Cipher.getInstance(KeyProperties.KEY_ALGORITHM_AES + "/" + KeyProperties.BLOCK_MODE_GCM + "/" + KeyProperties.ENCRYPTION_PADDING_NONE)
        cipher.init(Cipher.ENCRYPT_MODE, getSecretKey())
        val iv = cipher.iv
        val encryptedData = cipher.doFinal(data.toByteArray())
        return Base64.encodeToString(encryptedData, Base64.DEFAULT) + ":" + Base64.encodeToString(iv, Base64.DEFAULT)
    }
    
    fun decryptData(encryptedData: String): String {
        val parts = encryptedData.split(":")
        val encrypted = Base64.decode(parts[0], Base64.DEFAULT)
        val iv = Base64.decode(parts[1], Base64.DEFAULT)
        
        val cipher = Cipher.getInstance(KeyProperties.KEY_ALGORITHM_AES + "/" + KeyProperties.BLOCK_MODE_GCM + "/" + KeyProperties.ENCRYPTION_PADDING_NONE)
        cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), GCMParameterSpec(128, iv))
        return String(cipher.doFinal(encrypted))
    }
}
```

##### **7.3 Privacy Controls**
```kotlin
@Composable
fun PrivacySettingsScreen(
    viewModel: PrivacySettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Spacing.screenPadding)
    ) {
        item {
            // Data Collection
            PrivacySectionCard(
                title = "Data Collection",
                items = listOf(
                    PrivacyItem(
                        title = "Analytics Data",
                        description = "Help improve the app by sharing usage analytics",
                        isEnabled = uiState.analyticsEnabled,
                        onToggle = viewModel::toggleAnalytics
                    ),
                    PrivacyItem(
                        title = "Crash Reports",
                        description = "Automatically send crash reports to help fix issues",
                        isEnabled = uiState.crashReportsEnabled,
                        onToggle = viewModel::toggleCrashReports
                    )
                )
            )
        }
        
        item {
            // Location Services
            PrivacySectionCard(
                title = "Location Services",
                items = listOf(
                    PrivacyItem(
                        title = "Location Tracking",
                        description = "Use location to find nearby mechanics and services",
                        isEnabled = uiState.locationEnabled,
                        onToggle = viewModel::toggleLocation
                    )
                )
            )
        }
        
        item {
            // Data Management
            DataManagementCard(
                onExportData = viewModel::exportData,
                onDeleteAccount = viewModel::deleteAccount,
                onClearCache = viewModel::clearCache
            )
        }
    }
}
```

#### **Implementation Steps**
1. Implement biometric authentication
2. Add enhanced data encryption
3. Create privacy controls UI
4. Implement data export functionality
5. Add account deletion flow
6. Create privacy policy updates
7. Implement security audit logging

#### **Acceptance Criteria**
- [ ] Biometric authentication for sensitive actions
- [ ] Enhanced data encryption for stored data
- [ ] Comprehensive privacy controls
- [ ] Data export and deletion functionality
- [ ] Security audit logging
- [ ] Privacy policy compliance

---

### 8. Performance Optimization

#### **Gap Description**
Need offline support, enhanced caching, and performance monitoring.

#### **Requirements**

##### **8.1 Offline Support**
```kotlin
class OfflineManager @Inject constructor(
    private val database: AppDatabase,
    private val networkManager: NetworkManager
) {
    suspend fun syncData() {
        if (networkManager.isConnected()) {
            // Sync local changes to server
            syncLocalChanges()
            
            // Download latest data from server
            downloadLatestData()
        }
    }
    
    suspend fun getCachedData(): List<Car> {
        return database.carDao().getAllCars()
    }
    
    suspend fun saveOfflineData(data: Any) {
        // Save data locally for offline access
        when (data) {
            is Car -> database.carDao().insertCar(data)
            is MaintenanceRecord -> database.maintenanceDao().insertMaintenance(data)
            // Add other data types
        }
    }
}
```

##### **8.2 Enhanced Caching**
```kotlin
class CacheManager @Inject constructor() {
    private val memoryCache = LruCache<String, Any>(50)
    private val diskCache = DiskLruCache.open(cacheDir, 1, 1, 50 * 1024 * 1024)
    
    suspend fun get(key: String): Any? {
        // Try memory cache first
        memoryCache.get(key)?.let { return it }
        
        // Try disk cache
        diskCache.get(key)?.let { 
            val data = it.getString(0)
            memoryCache.put(key, data)
            return data
        }
        
        return null
    }
    
    suspend fun put(key: String, data: Any) {
        // Store in memory cache
        memoryCache.put(key, data)
        
        // Store in disk cache
        diskCache.edit(key)?.apply {
            set(0, data.toString())
            commit()
        }
    }
}
```

##### **8.3 Performance Monitoring**
```kotlin
class PerformanceMonitor @Inject constructor() {
    fun trackScreenLoad(screenName: String, loadTime: Long) {
        // Track screen load performance
        Analytics.track("screen_load", mapOf(
            "screen" to screenName,
            "load_time" to loadTime
        ))
    }
    
    fun trackApiCall(endpoint: String, responseTime: Long, success: Boolean) {
        // Track API performance
        Analytics.track("api_call", mapOf(
            "endpoint" to endpoint,
            "response_time" to responseTime,
            "success" to success
        ))
    }
    
    fun trackMemoryUsage() {
        val runtime = Runtime.getRuntime()
        val usedMemory = runtime.totalMemory() - runtime.freeMemory()
        val maxMemory = runtime.maxMemory()
        
        Analytics.track("memory_usage", mapOf(
            "used_memory" to usedMemory,
            "max_memory" to maxMemory,
            "usage_percentage" to (usedMemory.toFloat() / maxMemory.toFloat() * 100)
        ))
    }
}
```

#### **Implementation Steps**
1. Implement offline data storage
2. Add data synchronization system
3. Create enhanced caching layer
4. Implement performance monitoring
5. Add memory usage tracking
6. Create performance analytics
7. Optimize image loading and caching

#### **Acceptance Criteria**
- [ ] Full offline functionality for core features
- [ ] Automatic data synchronization when online
- [ ] Enhanced caching for improved performance
- [ ] Performance monitoring and analytics
- [ ] Memory usage optimization
- [ ] Image loading optimization

---

## 📋 **IMPLEMENTATION ROADMAP**

### **Phase 1: High Priority (Weeks 1-4)**
1. Typography Refinement
2. Spacing and Layout Refinement
3. Advanced Service Features (Basic)

### **Phase 2: Medium Priority (Weeks 5-8)**
4. Maintenance Analytics and Cost Tracking
5. Enhanced Parts Management
6. Advanced Service Features (Complete)

### **Phase 3: Low Priority (Weeks 9-12)**
7. Enhanced Social and Community Features
8. Security and Privacy Enhancements
9. Performance Optimization

### **Phase 4: Polish and Testing (Weeks 13-16)**
10. Comprehensive testing
11. Performance optimization
12. Bug fixes and refinements

---

## 🎯 **SUCCESS METRICS**

### **Design System Compliance**
- [ ] 100% typography compliance with design.json
- [ ] 100% spacing compliance with design system
- [ ] 100% color compliance with OKLCH specifications

### **Feature Completeness**
- [ ] All high-priority features implemented
- [ ] All medium-priority features implemented
- [ ] 80% of low-priority features implemented

### **Performance**
- [ ] App startup time < 2 seconds
- [ ] Screen load time < 1 second
- [ ] Memory usage < 100MB average
- [ ] Offline functionality for core features

### **User Experience**
- [ ] 95% user satisfaction rating
- [ ] < 1% crash rate
- [ ] 100% accessibility compliance
- [ ] Full internationalization support

---

This comprehensive implementation plan addresses all identified gaps and requirements from the audit, providing a clear roadmap for enhancing the Clutch app to achieve 100% compliance and feature completeness.
