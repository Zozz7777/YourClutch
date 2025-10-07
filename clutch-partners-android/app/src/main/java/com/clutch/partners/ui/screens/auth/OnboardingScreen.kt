package com.clutch.partners.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.R
import com.clutch.partners.navigation.Screen
import com.clutch.partners.viewmodel.AuthViewModel
import com.clutch.partners.utils.LanguageManager
import androidx.compose.ui.platform.LocalContext

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val pagerState = rememberPagerState(pageCount = { 3 })
    val coroutineScope = rememberCoroutineScope()
    var currentLanguage by remember { mutableStateOf(LanguageManager.getCurrentLanguage(context)) }
    
    val pages = if (currentLanguage == "ar") {
        listOf(
            OnboardingPage(
                title = "إدارة الأعمال",
                description = "قم بتبسيط عمليات أعمالك في السيارات باستخدام أدوات إدارة شاملة وتحليلات في الوقت الفعلي",
                illustrationRes = R.drawable.onboarding_business_plan
            ),
            OnboardingPage(
                title = "التحكم المالي",
                description = "تتبع الإيرادات وإدارة المدفوعات وتحسين أدائك المالي باستخدام ميزات التقارير المتقدمة",
                illustrationRes = R.drawable.onboarding_finance_app
            ),
            OnboardingPage(
                title = "النمو الرقمي",
                description = "قم بتوسيع أعمالك عبر الإنترنت باستخدام الأدوات الرقمية وإدارة العملاء والعمليات الآلية",
                illustrationRes = R.drawable.onboarding_online_world
            )
        )
    } else {
        listOf(
            OnboardingPage(
                title = "Business Management",
                description = "Streamline your automotive business operations with comprehensive management tools and real-time analytics",
                illustrationRes = R.drawable.onboarding_business_plan
            ),
            OnboardingPage(
                title = "Financial Control",
                description = "Track revenue, manage payments, and optimize your financial performance with advanced reporting features",
                illustrationRes = R.drawable.onboarding_finance_app
            ),
            OnboardingPage(
                title = "Digital Growth",
                description = "Expand your business online with digital tools, customer management, and automated processes",
                illustrationRes = R.drawable.onboarding_online_world
            )
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header with Partners logo - moved higher up
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 24.dp, start = 16.dp, end = 16.dp, bottom = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Partners Logo
                Image(
                    painter = painterResource(id = R.drawable.partners_logo_black),
                    contentDescription = "Partners Logo",
                    modifier = Modifier.size(40.dp)
                )
                
                // Language Switch - now functional
                IconButton(
                    onClick = { 
                        currentLanguage = LanguageManager.toggleLanguage(context)
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Language,
                        contentDescription = "Switch Language",
                        tint = Color(0xFF242424), // Dark color for better contrast on white background
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            // Page content with HorizontalPager
            Box(
                modifier = Modifier.weight(1f),
                contentAlignment = Alignment.Center
            ) {
                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier.fillMaxSize()
                ) { page ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // Illustration
                        Image(
                            painter = painterResource(id = pages[page].illustrationRes),
                            contentDescription = "Onboarding Illustration",
                            modifier = Modifier
                                .size(300.dp)
                                .padding(16.dp)
                        )

                        Spacer(modifier = Modifier.height(32.dp))

                        // Title
                        Text(
                            text = pages[page].title,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.DarkGray,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 32.dp)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Description
                        Text(
                            text = buildAnnotatedString {
                                val fullText = pages[page].description
                                val redParts = when (page) {
                                    0 -> listOf("comprehensive management tools", "real-time analytics")
                                    1 -> listOf("advanced reporting features")
                                    2 -> listOf("digital tools", "automated processes")
                                    else -> emptyList()
                                }
                                
                                // Set default color to dark grey for all text
                                withStyle(style = SpanStyle(color = Color.DarkGray)) {
                                    var currentIndex = 0
                                    for (redPart in redParts) {
                                        val startIndex = fullText.indexOf(redPart, currentIndex)
                                        if (startIndex != -1) {
                                            // Add normal text before red part
                                            if (startIndex > currentIndex) {
                                                append(fullText.substring(currentIndex, startIndex))
                                            }
                                            // Add red part
                                            withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)) {
                                                append(redPart)
                                            }
                                            currentIndex = startIndex + redPart.length
                                        }
                                    }
                                    // Add remaining text
                                    if (currentIndex < fullText.length) {
                                        append(fullText.substring(currentIndex))
                                    }
                                }
                            },
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            lineHeight = 20.sp,
                            modifier = Modifier.padding(horizontal = 32.dp)
                        )
                    }
                }
            }

            // Page indicators with RTL support
            val layoutDirection = LocalLayoutDirection.current
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 32.dp)
            ) {
                if (layoutDirection == LayoutDirection.Rtl) {
                    // RTL: Show dots in reverse order
                    pages.forEachIndexed { index, _ ->
                        val actualIndex = pages.size - 1 - index
                        Box(
                            modifier = Modifier
                                .size(if (actualIndex == pagerState.currentPage) 12.dp else 8.dp)
                                .background(
                                    color = if (actualIndex == pagerState.currentPage) 
                                        Color(0xFF242424) // Dark color for active dot
                                    else 
                                        Color(0xFF242424).copy(alpha = 0.3f), // Light color for inactive dots
                                    shape = RoundedCornerShape(50)
                                )
                        )
                        if (index < pages.size - 1) {
                            Spacer(modifier = Modifier.width(8.dp))
                        }
                    }
                } else {
                    // LTR: Show dots in normal order
                    pages.forEachIndexed { index, _ ->
                        Box(
                            modifier = Modifier
                                .size(if (index == pagerState.currentPage) 12.dp else 8.dp)
                                .background(
                                    color = if (index == pagerState.currentPage) 
                                        Color(0xFF242424) // Dark color for active dot
                                    else 
                                        Color(0xFF242424).copy(alpha = 0.3f), // Light color for inactive dots
                                    shape = RoundedCornerShape(50)
                                )
                        )
                        if (index < pages.size - 1) {
                            Spacer(modifier = Modifier.width(8.dp))
                        }
                    }
                }
            }

            // Action buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                      // Skip button (only show on first page)
                      if (pagerState.currentPage == 0) {
                          TextButton(onClick = { navController.navigate(Screen.PartnerTypeSelector.route) }) {
                              Text(
                                  text = if (currentLanguage == "ar") "تخطي" else "Skip",
                                  color = Color(0xFF242424), // Dark color for better contrast on white background
                                  fontSize = 16.sp
                              )
                          }
                      } else {
                          Spacer(modifier = Modifier.width(1.dp))
                      }

                      // Next/Get Started button
                      Button(
                          onClick = {
                              if (pagerState.currentPage < pages.size - 1) {
                                  coroutineScope.launch {
                                      pagerState.animateScrollToPage(pagerState.currentPage + 1)
                                  }
                              } else {
                                  navController.navigate(Screen.PartnerTypeSelector.route)
                              }
                          },
                          modifier = Modifier
                              .width(120.dp)
                              .height(48.dp),
                          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF242424)), // Dark button for better contrast
                          shape = RoundedCornerShape(12.dp)
                      ) {
                          Text(
                              text = if (pagerState.currentPage < pages.size - 1) {
                                  if (currentLanguage == "ar") "التالي" else "Next"
                              } else {
                                  if (currentLanguage == "ar") "ابدأ الآن" else "Get Started"
                              },
                              fontSize = 16.sp,
                              fontWeight = FontWeight.SemiBold,
                              color = Color.White
                          )
                      }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

data class OnboardingPage(
    val title: String,
    val description: String,
    val illustrationRes: Int
)
