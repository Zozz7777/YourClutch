package com.clutch.app.ui.screens.loyalty

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.data.model.Reward
import com.clutch.app.data.model.Badge

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoyaltyScreen(
    onRedeemReward: (String) -> Unit = {},
    viewModel: LoyaltyViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Handle redemption success
    LaunchedEffect(uiState.isRedemptionSuccess) {
        if (uiState.isRedemptionSuccess) {
            onRedeemReward("redemption_success")
            viewModel.clearRedemptionSuccess()
        }
    }
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Loyalty & Rewards",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF0F2F5))
                .padding(16.dp)
        ) {
            // Show error message if any
            if (uiState.errorMessage.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Error,
                            contentDescription = "Error",
                            tint = Color.Red
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = uiState.errorMessage,
                            color = Color.Red,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.weight(1f))
                        TextButton(onClick = { viewModel.clearError() }) {
                            Text("Dismiss", color = Color.Red)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = ClutchRed)
                }
            } else {
                // Points Balance Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = ClutchRed),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.EmojiEvents,
                            contentDescription = "Points",
                            tint = Color.White,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Your Points",
                            fontSize = 18.sp,
                            color = Color.White
                        )
                        Text(
                            text = "${uiState.userPoints?.availablePoints ?: 0}",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Available for redemption",
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                            uiState.userPoints?.let { userPoints ->
                                Text(
                                    text = "Total: ${userPoints.totalPoints} | Lifetime: ${userPoints.lifetimePoints}",
                                    fontSize = 12.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                            }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Badges Section
                Text(
                    text = "Your Badges",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.userBadges) { badge ->
                        BadgeCard(
                            badge = badge
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Rewards Section
                Text(
                    text = "Available Rewards",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.availableRewards) { reward ->
                        RewardCard(
                            reward = reward,
                            onRedeemReward = { rewardId ->
                                viewModel.redeemReward(rewardId)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun BadgeCard(
    badge: Badge
) {
    Card(
        modifier = Modifier.width(140.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (badge.isEarned) Color.White else Color.Gray.copy(alpha = 0.3f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.EmojiEvents, // Use default icon for now
                contentDescription = badge.name,
                tint = if (badge.isEarned) ClutchRed else Color.Gray,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = badge.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (badge.isEarned) Color.Black else Color.Gray,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            Text(
                text = badge.description,
                fontSize = 12.sp,
                color = if (badge.isEarned) Color.Gray else Color.Gray.copy(alpha = 0.7f),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            if (badge.isEarned && badge.pointsAwarded > 0) {
                Text(
                    text = "+${badge.pointsAwarded} pts",
                    fontSize = 10.sp,
                    color = ClutchRed,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun RewardCard(
    reward: Reward,
    onRedeemReward: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (reward.isAvailable) Color.White else Color.Gray.copy(alpha = 0.3f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.LocalOffer, // Use default icon for now
                contentDescription = reward.name,
                tint = if (reward.isAvailable) ClutchRed else Color.Gray,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = reward.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (reward.isAvailable) Color.Black else Color.Gray
                )
                Text(
                    text = reward.description,
                    fontSize = 14.sp,
                    color = if (reward.isAvailable) Color.Gray else Color.Gray.copy(alpha = 0.7f)
                )
                if (reward.expiryDate != null) {
                    Text(
                        text = "Expires: ${reward.expiryDate}",
                        fontSize = 12.sp,
                        color = Color.Red
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${reward.pointsRequired} pts",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (reward.isAvailable) ClutchRed else Color.Gray
                )
                Button(
                    onClick = { onRedeemReward(reward.id) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (reward.isAvailable) ClutchRed else Color.Gray
                    ),
                    shape = RoundedCornerShape(8.dp),
                    enabled = reward.isAvailable
                ) {
                    Text(
                        text = if (reward.isAvailable) "Redeem" else "Unavailable",
                        color = Color.White,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoyaltyScreenPreview() {
    ClutchAppTheme {
        LoyaltyScreen()
    }
}
