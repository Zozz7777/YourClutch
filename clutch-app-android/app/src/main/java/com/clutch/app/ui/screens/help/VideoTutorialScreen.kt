package com.clutch.app.ui.screens.help

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * VideoTutorialScreen.kt - Video tutorials and learning content
 * 
 * Complete video tutorial system with categorized videos,
 * progress tracking, and interactive learning features.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VideoTutorialScreen(
    onNavigateBack: () -> Unit = {},
    onVideoSelected: (VideoTutorial) -> Unit = {}
) {
    val categories = listOf(
        "Getting Started",
        "Car Management", 
        "Service Booking",
        "Parts & Orders",
        "Loyalty & Rewards",
        "Settings & Profile"
    )
    
    var selectedCategory by remember { mutableStateOf("Getting Started") }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Video Tutorials") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF0F2F5))
        ) {
            // Category Filter
            LazyRow(
                modifier = Modifier.padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(categories) { category ->
                    FilterChip(
                        selected = selectedCategory == category,
                        onClick = { selectedCategory = category },
                        label = { Text(category) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ClutchRed,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            
            // Video Content
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(getVideosForCategory(selectedCategory)) { video ->
                    VideoTutorialCard(
                        video = video,
                        onClick = { onVideoSelected(video) }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VideoTutorialCard(
    video: VideoTutorial,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Video Thumbnail
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .background(Color.Black)
                    .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
            ) {
                // Placeholder for video thumbnail
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Play",
                        tint = Color.White,
                        modifier = Modifier.size(64.dp)
                    )
                }
                
                // Duration badge
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(8.dp)
                        .background(
                            Color.Black.copy(alpha = 0.7f),
                            RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = video.duration,
                        color = Color.White,
                        fontSize = 12.sp
                    )
                }
                
                // Difficulty badge
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .background(
                            when (video.difficulty) {
                                "Beginner" -> Color.Green
                                "Intermediate" -> Color(0xFFFFA726)
                                "Advanced" -> Color.Red
                                else -> Color.Gray
                            },
                            RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = video.difficulty,
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            // Video Info
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = video.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = video.description,
                    fontSize = 14.sp,
                    color = Color.Gray,
                    maxLines = 2
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Visibility,
                            contentDescription = "Views",
                            tint = Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${video.viewCount} views",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                    
                    if (video.isCompleted) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Completed",
                            tint = Color.Green,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VideoPlayerScreen(
    video: VideoTutorial,
    onNavigateBack: () -> Unit = {},
    onMarkCompleted: () -> Unit = {}
) {
    var isPlaying by remember { mutableStateOf(false) }
    var progress by remember { mutableStateOf(0f) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(video.title) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color.Black)
        ) {
            // Video Player Area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp)
                    .background(Color.Black)
            ) {
                // Placeholder for actual video player
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        tint = Color.White,
                        modifier = Modifier
                            .size(64.dp)
                            .clickable { isPlaying = !isPlaying }
                    )
                }
                
                // Progress bar
                LinearProgressIndicator(
                    progress = progress,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .padding(16.dp),
                    color = ClutchRed,
                    trackColor = Color.White.copy(alpha = 0.3f)
                )
            }
            
            // Video Info
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White)
                    .padding(16.dp)
            ) {
                Text(
                    text = video.title,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = video.duration,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    
                    Text(
                        text = video.difficulty,
                        fontSize = 14.sp,
                        color = when (video.difficulty) {
                            "Beginner" -> Color.Green
                            "Intermediate" -> Color(0xFFFFA726)
                            "Advanced" -> Color.Red
                            else -> Color.Gray
                        },
                        fontWeight = FontWeight.Bold
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = video.description,
                    fontSize = 16.sp,
                    color = Color.Black,
                    lineHeight = 24.sp
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Learning Objectives
                Text(
                    text = "What you'll learn:",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                video.learningObjectives.forEach { objective ->
                    Row(
                        modifier = Modifier.padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Check",
                            tint = Color.Green,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = objective,
                            fontSize = 14.sp,
                            color = Color.Black
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ClutchButtonOutlined(
                        onClick = { /* Share video */ },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share",
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Share")
                    }
                    
                    ClutchButtonPrimary(
                        onClick = onMarkCompleted,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Mark Complete",
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Mark Complete")
                    }
                }
            }
        }
    }
}

data class VideoTutorial(
    val id: String,
    val title: String,
    val description: String,
    val duration: String,
    val difficulty: String,
    val category: String,
    val viewCount: Int,
    val isCompleted: Boolean = false,
    val learningObjectives: List<String> = emptyList(),
    val videoUrl: String = "",
    val thumbnailUrl: String = ""
)

private fun getVideosForCategory(category: String): List<VideoTutorial> {
    return when (category) {
        "Getting Started" -> listOf(
            VideoTutorial(
                id = "1",
                title = "Welcome to Clutch",
                description = "Learn the basics of the Clutch app and how to get started with managing your car.",
                duration = "3:45",
                difficulty = "Beginner",
                category = "Getting Started",
                viewCount = 1250,
                learningObjectives = listOf(
                    "Understanding the app interface",
                    "Setting up your profile",
                    "Adding your first car"
                )
            ),
            VideoTutorial(
                id = "2",
                title = "App Navigation",
                description = "Master the navigation system and find all the features quickly.",
                duration = "5:20",
                difficulty = "Beginner",
                category = "Getting Started",
                viewCount = 980,
                learningObjectives = listOf(
                    "Using the bottom navigation",
                    "Accessing different sections",
                    "Understanding the layout"
                )
            )
        )
        "Car Management" -> listOf(
            VideoTutorial(
                id = "3",
                title = "Adding Your Car",
                description = "Step-by-step guide to adding your car details and specifications.",
                duration = "4:15",
                difficulty = "Beginner",
                category = "Car Management",
                viewCount = 2100,
                learningObjectives = listOf(
                    "Entering car information",
                    "Uploading car photos",
                    "Setting maintenance reminders"
                )
            ),
            VideoTutorial(
                id = "4",
                title = "Service History Tracking",
                description = "Learn how to track and manage your car's service history.",
                duration = "6:30",
                difficulty = "Intermediate",
                category = "Car Management",
                viewCount = 1500,
                learningObjectives = listOf(
                    "Recording service history",
                    "Tracking maintenance costs",
                    "Setting service reminders"
                )
            )
        )
        "Service Booking" -> listOf(
            VideoTutorial(
                id = "5",
                title = "Booking a Service",
                description = "Complete guide to booking car services through the app.",
                duration = "7:45",
                difficulty = "Beginner",
                category = "Service Booking",
                viewCount = 3200,
                learningObjectives = listOf(
                    "Finding service providers",
                    "Selecting service types",
                    "Scheduling appointments"
                )
            ),
            VideoTutorial(
                id = "6",
                title = "Managing Appointments",
                description = "How to manage, reschedule, and cancel your service appointments.",
                duration = "5:10",
                difficulty = "Intermediate",
                category = "Service Booking",
                viewCount = 1800,
                learningObjectives = listOf(
                    "Viewing upcoming appointments",
                    "Rescheduling services",
                    "Canceling appointments"
                )
            )
        )
        "Parts & Orders" -> listOf(
            VideoTutorial(
                id = "7",
                title = "Finding Car Parts",
                description = "Learn how to search and find the right parts for your car.",
                duration = "4:50",
                difficulty = "Beginner",
                category = "Parts & Orders",
                viewCount = 2400,
                learningObjectives = listOf(
                    "Searching for parts",
                    "Comparing prices",
                    "Reading part specifications"
                )
            ),
            VideoTutorial(
                id = "8",
                title = "Placing Orders",
                description = "Complete process of ordering car parts and tracking delivery.",
                duration = "6:20",
                difficulty = "Intermediate",
                category = "Parts & Orders",
                viewCount = 1900,
                learningObjectives = listOf(
                    "Adding items to cart",
                    "Processing payments",
                    "Tracking orders"
                )
            )
        )
        "Loyalty & Rewards" -> listOf(
            VideoTutorial(
                id = "9",
                title = "Earning Points",
                description = "Discover all the ways to earn loyalty points in the Clutch app.",
                duration = "3:30",
                difficulty = "Beginner",
                category = "Loyalty & Rewards",
                viewCount = 1600,
                learningObjectives = listOf(
                    "Understanding the points system",
                    "Earning points through activities",
                    "Tracking your points balance"
                )
            ),
            VideoTutorial(
                id = "10",
                title = "Redeeming Rewards",
                description = "Learn how to redeem your loyalty points for rewards and discounts.",
                duration = "4:15",
                difficulty = "Beginner",
                category = "Loyalty & Rewards",
                viewCount = 1200,
                learningObjectives = listOf(
                    "Browsing available rewards",
                    "Redeeming points",
                    "Using reward codes"
                )
            )
        )
        "Settings & Profile" -> listOf(
            VideoTutorial(
                id = "11",
                title = "Profile Management",
                description = "How to manage your profile, preferences, and account settings.",
                duration = "5:45",
                difficulty = "Beginner",
                category = "Settings & Profile",
                viewCount = 1100,
                learningObjectives = listOf(
                    "Updating personal information",
                    "Changing profile picture",
                    "Managing privacy settings"
                )
            ),
            VideoTutorial(
                id = "12",
                title = "Notification Settings",
                description = "Customize your notification preferences for the best experience.",
                duration = "3:20",
                difficulty = "Beginner",
                category = "Settings & Profile",
                viewCount = 800,
                learningObjectives = listOf(
                    "Understanding notification types",
                    "Customizing preferences",
                    "Managing notification frequency"
                )
            )
        )
        else -> emptyList()
    }
}
