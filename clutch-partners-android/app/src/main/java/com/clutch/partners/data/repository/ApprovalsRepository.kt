package com.clutch.partners.data.repository

import com.clutch.partners.data.model.ApprovalRequest
import com.clutch.partners.data.service.ApiService
import com.clutch.partners.data.service.AuthService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ApprovalsRepository @Inject constructor(
    private val apiService: ApiService,
    private val authService: AuthService
) {

    suspend fun getPendingApprovals(): List<ApprovalRequest> {
        val token = authService.getAuthToken() ?: ""
        return apiService.getPendingApprovals(token)
    }

    suspend fun getMyApprovalRequests(): List<ApprovalRequest> {
        val token = authService.getAuthToken() ?: ""
        return apiService.getMyApprovalRequests(token)
    }

    suspend fun approveRequest(approvalId: String) {
        val token = authService.getAuthToken() ?: ""
        apiService.approveRequest(approvalId, token)
    }

    suspend fun rejectRequest(approvalId: String, reason: String) {
        val token = authService.getAuthToken() ?: ""
        apiService.rejectRequest(approvalId, reason, token)
    }

    suspend fun getApprovalRequestDetails(approvalId: String): ApprovalRequest {
        val token = authService.getAuthToken() ?: ""
        return apiService.getApprovalRequestDetails(approvalId, token)
    }
}
