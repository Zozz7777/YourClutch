package com.clutch.partners.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.partners.data.model.Permission
import com.clutch.partners.data.model.UserRole
import com.clutch.partners.data.repository.AuthRepository
import com.clutch.partners.viewmodel.MainViewModel

@Composable
fun PermissionGate(
    permission: Permission,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val authRepository = remember { AuthRepository() }
    val hasPermission by remember { 
        mutableStateOf(authRepository.hasPermission(permission)) 
    }
    
    if (hasPermission) {
        content()
    }
}

@Composable
fun PermissionGate(
    permissions: List<Permission>,
    requireAll: Boolean = false,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val authRepository = remember { AuthRepository() }
    val hasPermission by remember {
        mutableStateOf(
            if (requireAll) {
                authRepository.hasAllPermissions(permissions)
            } else {
                authRepository.hasAnyPermission(permissions)
            }
        )
    }
    
    if (hasPermission) {
        content()
    }
}

@Composable
fun RoleGate(
    allowedRoles: List<UserRole>,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val authRepository = remember { AuthRepository() }
    val userRole by remember { mutableStateOf(authRepository.getUserRole()) }
    val hasAccess by remember { mutableStateOf(userRole in allowedRoles) }
    
    if (hasAccess) {
        content()
    }
}
