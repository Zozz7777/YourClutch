package com.clutch.app.ui.screens.loyalty

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.*
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoyaltyUiState(
    val isLoading: Boolean = false,
    val userPoints: LoyaltyPoints? = null,
    val availableRewards: List<Reward> = emptyList(),
    val userBadges: List<Badge> = emptyList(),
    val redemptionHistory: List<RewardRedemption> = emptyList(),
    val isRedemptionSuccess: Boolean = false,
    val errorMessage: String = ""
)

@HiltViewModel
class LoyaltyViewModel @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoyaltyUiState())
    val uiState: StateFlow<LoyaltyUiState> = _uiState.asStateFlow()

    init {
        loadLoyaltyData()
    }

    fun loadLoyaltyData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
            try {
                // Load user points
                val pointsResult = repository.getUserPoints()
                val userPoints = if (pointsResult.isSuccess) pointsResult.getOrNull() else null

                // Load available rewards
                val rewardsResult = repository.getAvailableRewards()
                val availableRewards = if (rewardsResult.isSuccess) rewardsResult.getOrNull() ?: emptyList() else emptyList()

                // Load user badges
                val badgesResult = repository.getUserBadges()
                val userBadges = if (badgesResult.isSuccess) badgesResult.getOrNull() ?: emptyList() else emptyList()

                // Load redemption history
                val historyResult = repository.getRedemptionHistory()
                val redemptionHistory = if (historyResult.isSuccess) historyResult.getOrNull() ?: emptyList() else emptyList()

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    userPoints = userPoints,
                    availableRewards = availableRewards,
                    userBadges = userBadges,
                    redemptionHistory = redemptionHistory
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Failed to load loyalty data: ${e.message}"
                )
            }
        }
    }

    fun redeemReward(rewardId: String) {
        val currentState = _uiState.value
        val userPoints = currentState.userPoints
        val reward = currentState.availableRewards.find { it.id == rewardId }

        if (userPoints == null || reward == null) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Unable to redeem reward"
            )
            return
        }

        if (userPoints.availablePoints < reward.pointsRequired) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Insufficient points. You need ${reward.pointsRequired} points but have ${userPoints.availablePoints}"
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
            try {
                val result = repository.redeemReward(rewardId, reward.pointsRequired)
                if (result.isSuccess) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRedemptionSuccess = true
                    )
                    // Reload data to reflect the changes
                    loadLoyaltyData()
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.exceptionOrNull()?.message ?: "Redemption failed"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Redemption failed: ${e.message}"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }

    fun clearRedemptionSuccess() {
        _uiState.value = _uiState.value.copy(isRedemptionSuccess = false)
    }
}
