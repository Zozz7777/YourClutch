# Clutch Partners App Complete Rebuild - ENHANCED PLAN

## 🎯 Missing Features & Enhancements Identified

### Critical Missing Features:
1. **Loyalty & Rewards Program** - Gamification to increase engagement
2. **Rating & Review System** - Partner ratings, customer feedback
3. **Service Appointments** - Booking system for repair/service centers
4. **Customer Vehicle Management** - Track customer vehicles & service history
5. **Quote Generation** - Estimate creation for services
6. **Promotions & Offers** - Special deals, discounts, seasonal offers
7. **Training & Certifications** - Partner onboarding materials, skill upgrades
8. **Performance KPIs** - Advanced analytics dashboard
9. **Product Catalog** - Browse and manage product listings
10. **Social Login** - Google/Facebook/Apple authentication
11. **Biometric Auth** - Fingerprint/Face ID
12. **Service History** - Full maintenance records for customers
13. **Location Services** - GPS tracking, route optimization
14. **Multi-location Support** - For partners with multiple branches
15. **Commission Tracking** - Transparent commission breakdown
16. **Tax Management** - VAT calculations, tax invoicing
17. **Customer Feedback** - Post-service ratings from Clutch app users

---

## Phase 1: Clean Slate & Architecture Setup

### 1.1 Delete Existing Pages (Keep Core Infrastructure)
- Delete all screen files in `clutch-partners-android/app/src/main/java/com/clutch/partners/ui/screens/`
- Delete `CompleteMainActivity.kt` (all UI code in one file)
- Keep: Application class, theme system, utils, data layer, services, hardware integrations

### 1.2 Backend API Assessment & Creation

**✅ Existing Routes (Verified):**
- `/api/v1/partner-auth/*` - Auth, signup, signin, validate-id, forgot password, OTP
- `/api/v1/partners/*` - Partner CRUD, profile management
- `/api/v1/partners/kyc/*` - KYC document upload, status checking
- `/api/v1/partners/pos/*` - POS sales, refunds, shift close
- `/api/v1/partners/inventory/*` - Inventory management, stocktake, transfers
- `/api/v1/partners/purchase-orders/*` - PO creation & receiving
- `/api/v1/partners/reports/*` - Sales & inventory advanced reports
- `/api/v1/partners/warranty/*` - Warranty claims & invoice disputes
- `/api/v1/partners/staff/*` - Staff management, role assignment
- `/api/v1/partners/export/*` - Data export (CSV, Excel)
- `/api/v1/partners/audit-log` - Audit logging
- `/api/v1/partners/support/*` - Support tickets
- `/api/v1/partners/notifications/*` - Push/email/SMS notifications
- `/api/v1/partners/dashboard` - Analytics dashboard
- `/api/v1/partners/orders` - Order management
- `/api/v1/partners/payments/*` - Payment history, payouts

**❌ Missing Routes to Create:**
1. `/api/v1/partners/suppliers/*` - Supplier CRUD (name, contact, payment terms)
2. `/api/v1/partners/contracts/*` - Contract upload, approval, status
3. `/api/v1/partners/loyalty/*` - Points, rewards, tier levels
4. `/api/v1/partners/ratings/*` - Partner ratings, customer reviews
5. `/api/v1/partners/appointments/*` - Service booking (for repair centers)
6. `/api/v1/partners/vehicles/*` - Customer vehicle tracking
7. `/api/v1/partners/promotions/*` - Special offers, discounts, coupons
8. `/api/v1/partners/training/*` - Training materials, certifications, videos
9. `/api/v1/partners/performance/*` - KPI metrics, benchmarks
10. `/api/v1/partners/catalog/*` - Product catalog management
11. `/api/v1/partners/quotes/*` - Quote generation & approval
12. `/api/v1/partners/locations/*` - Multi-location management
13. `/api/v1/partners/commission/*` - Commission breakdowns, history
14. `/api/v1/partners/taxes/*` - Tax calculation, VAT invoicing
15. `/api/v1/partners/feedback/*` - Customer feedback from Clutch app users

### 1.3 Translation System Enhancement
**Existing:** Basic strings in `values/strings.xml` and `values-ar/strings.xml`

**Enhancement Needed:** Add ~300+ new strings for:
- Loyalty program, rewards, tiers
- Appointment booking, vehicle management
- Quotes, promotions, training
- Performance metrics, KPIs
- Multi-location, commission tracking
- All new features listed above

---

## Phase 2: Core Navigation & Authentication Flow

### 2.1 Navigation Architecture
**Android:** Jetpack Compose Navigation + deep linking
**iOS:** SwiftUI NavigationStack + deep linking

### 2.2 Splash Screen
- Auto-check token validity via `/api/v1/partner-auth/me`
- Animated logo (dark/light mode aware)
- App version display
- Route to: onboarding → login → KYC → main

### 2.3 Onboarding (3 Pages + Tutorial Video)
- Page 1: **Manage Your Store** (Inventory, POS, staff)
- Page 2: **Receive Clutch Orders** (Real-time orders, appointments)
- Page 3: **Track Payouts & Rewards** (Weekly income, loyalty points)
- **Arabic illustrations** (commission custom artwork)
- Tutorial video (YouTube embed)
- Skip button, persist completion flag

### 2.4 Partner Type Selector
- **6 Types:** Repair Center, Auto Parts, Accessories, Importer, Manufacturer, Service Center
- Distinct icons, descriptions
- Affects features (e.g., manufacturers get bulk inventory, repair centers get appointments)

### 2.5 Authentication Screens

**Social Login (NEW):**
- Google, Facebook, Apple Sign In
- OAuth integration
- Auto-fill profile from social account

**Sign In:**
- Email/phone + password
- Remember me checkbox
- **Biometric login** (fingerprint/face ID) after first login
- Forgot password → OTP flow
- `/api/v1/partner-auth/login`

**Sign Up:**
- Partner ID validation first (`/api/v1/partner-auth/validate-id`)
- Email + phone + password
- Password strength indicator
- Terms & conditions checkbox
- Auto-fill business details from backend
- `/api/v1/partner-auth/signup`

**Request to Join:**
- Full form: business name, owner, email, phone, address, partner type
- Upload business license (optional)
- `/api/v1/partner-auth/request-to-join`
- Email/SMS notification when approved

**Forgot Password:**
- Enter email/phone → OTP code → new password
- `/api/v1/partner-auth/forgot-password`, `/api/v1/partner-auth/reset-password`

### 2.6 KYC Verification
- **Documents:** VAT certificate, trade license, owner ID, business registration
- Camera + file picker (PDF, JPG, PNG)
- Multi-file upload, progress indicator
- **Status:** Pending / Under Review / Approved / Rejected / Expired
- Rejection reason display, resubmit button
- Block app until KYC approved
- `/api/v1/partners/kyc/*`

---

## Phase 3: Main App Screens

### 3.1 Home Screen (Orders & Appointments)
**Orders:**
- List with filters (pending, confirmed, in-progress, completed, cancelled, rejected)
- Customer info, service type, amount, status badge
- Quick actions: Accept, Reject, Mark Complete, Contact Customer
- Real-time updates (WebSocket)
- Invoice lock rules: Pending → locked, Paid → unlocked, Rejected → locked + notify
- **Empty state:** Arabic illustration, "No orders yet"
- Connect to `/api/v1/partners/orders`

**Appointments (NEW):**
- Calendar view of booked appointments
- Customer vehicle info, service needed, time slot
- Reschedule, cancel, mark completed
- Send reminders to customers (SMS/push)
- Connect to `/api/v1/partners/appointments/*`

### 3.2 Payments Screen
**Weekly Income Card:**
- Current week earnings (EGP)
- Next payout countdown timer
- Visual progress bar

**Payment History:**
- List of past payouts
- Filter by date range, status
- Download receipt (PDF)

**Commission Breakdown (NEW):**
- Transparent commission structure
- Order-by-order commission display
- Connect to `/api/v1/partners/commission/*`

**Charts:**
- Revenue trends (line/bar graph)
- Top earning services/products
- Connect to `/api/v1/partners/payments/*`

### 3.3 Store Settings
**Profile:**
- Business name, address, phone, email
- Working hours (daily schedule)
- Services toggle (enable/disable)
- **Multi-location support (NEW):** Manage multiple branches
- Connect to `/api/v1/partners/me`, `/api/v1/partners/locations/*`

**App Preferences:**
- Dark mode toggle
- Language switcher (Arabic/English)
- Notification preferences (push, email, SMS)
- Biometric auth toggle

**POS Integration:**
- Connection status
- Paired devices list
- Hardware diagnostics

### 3.4 Business Dashboard
**KPIs (Enhanced):**
- Revenue trends (last 7/30/90 days)
- Order statistics (total, completed, cancelled, avg value)
- Customer satisfaction score (from ratings)
- Performance vs. targets
- Connect to `/api/v1/partners/dashboard`, `/api/v1/partners/performance/*`

**Inventory Overview:**
- Total stock value
- Low stock alerts
- Out of stock items
- Top selling products

**Charts:**
- Revenue, orders, customer growth
- Product category breakdown
- Peak hours heatmap

### 3.5 **Loyalty & Rewards (NEW)**
**Partner Rewards:**
- Points balance
- Tier level (Bronze, Silver, Gold, Platinum)
- Earn points for: completed orders, fast response, high ratings
- Redeem for: cashback, premium features, training courses
- Leaderboard (top partners in region)
- Connect to `/api/v1/partners/loyalty/*`

**Benefits by Tier:**
- Bronze: Standard commission
- Silver: -0.5% commission, priority support
- Gold: -1% commission, featured listing, free training
- Platinum: -1.5% commission, dedicated account manager

### 3.6 **Ratings & Reviews (NEW)**
**Partner Rating:**
- Overall rating (1-5 stars)
- Number of reviews
- Rating breakdown (5★, 4★, 3★, 2★, 1★)
- Recent customer reviews from Clutch app
- Connect to `/api/v1/partners/ratings/*`

**Improve Rating:**
- Tips to increase rating
- Respond to customer feedback
- Report inappropriate reviews

### 3.7 Notifications Center
**Features:**
- Push/email/SMS feed
- Filter by type: orders, payments, system, promotions, training
- Mark as read/unread
- Action buttons (view order, open support, etc.)
- **In-app badges** for unread count
- Connect to `/api/v1/partners/notifications/*`

### 3.8 Support Screen
**Features:**
- Submit ticket (title, description, priority, category)
- Screenshot/file attachment
- **Live chat** (WebSocket integration)
- Ticket history with status
- FAQ section
- Connect to `/api/v1/partners/support/*`

### 3.9 Audit Log Viewer
**Features:**
- Read-only log of all staff actions
- Filter by: date, user, action type, entity
- Search functionality
- Export to CSV/Excel
- Connect to `/api/v1/partners/audit-log`

### 3.10 Warranty & Disputes
**Warranty Claims:**
- View submitted claims
- Claim status tracking
- Upload proof (photos, receipts)

**Disputes:**
- Submit dispute for rejected invoice
- Provide evidence, reasoning
- Escalate to Clutch Admin
- Chat with dispute resolution team
- Connect to `/api/v1/partners/warranty/*`, `/api/v1/partners/disputes/*`

### 3.11 Data Export
**Features:**
- Export datasets: orders, invoices, payouts, staff actions, inventory, customers
- Format: CSV, Excel, PDF
- Date range picker
- Email export link
- Schedule recurring exports (daily, weekly, monthly)
- Connect to `/api/v1/partners/export/*`

---

## Phase 4: Advanced Features

### 4.1 POS Integration
**Features:**
- Record sale (barcode scanner, manual entry)
- Refund processing
- **Split payments** (cash + card)
- **Tip handling**
- Shift open/close with cash reconciliation
- **Offline mode** (sync when online)
- Hardware: barcode scanner, receipt printer, cash drawer
- Connect to `/api/v1/partners/pos/*`

### 4.2 Inventory Management
**Features:**
- Product list (search, filter by category)
- Add/edit/delete products (name, SKU, barcode, price, cost, supplier, category, images)
- Stock levels, low stock alerts
- **Bulk import** (CSV template)
- **Stocktake mode** (scan to count)
- Transfer between locations
- **Product variants** (size, color, etc.)
- **Expiry date tracking** (for parts with shelf life)
- Connect to `/api/v1/partners/inventory/*`

### 4.3 Purchase Orders
**Features:**
- Create PO to suppliers
- Add line items (product, quantity, cost)
- Receive PO (mark items received, handle partial receives)
- PO history with status
- **PO approval workflow** (for staff)
- Connect to `/api/v1/partners/purchase-orders/*`

### 4.4 **Supplier Management (NEW)**
**Features:**
- Supplier list
- Add/edit supplier (name, contact, email, phone, address, payment terms, lead time)
- Supplier performance (on-time delivery rate, quality issues)
- Supplier catalog integration
- Connect to `/api/v1/partners/suppliers/*` (NEED TO CREATE)

### 4.5 Device Management
**Features:**
- Register device (POS terminal, tablet, kiosk)
- Pair device with partner account
- Device status, last sync time
- Remote lock/unlock
- Connect to `/api/v1/partners/devices/*`

### 4.6 Staff Management (HR)
**Features:**
- Add/edit/delete staff
- Assign roles: Owner, Manager, Staff, Accountant, HR
- **RBAC enforcement** (frontend + backend)
- Staff activity log
- **Staff performance** (orders completed, revenue generated)
- **Shift scheduling** (coming soon)
- Connect to `/api/v1/partners/staff/*`

### 4.7 **Contracts (NEW)**
**Features:**
- Upload contract documents (PDF)
- View contract status (pending, under review, approved, rejected, expired)
- **E-signature** (draw signature on screen)
- Download signed contract
- Renewal reminders
- Connect to `/api/v1/partners/contracts/*` (NEED TO CREATE)

### 4.8 Reports
**Features:**
- Sales report (daily, weekly, monthly, custom date range)
- Inventory report (stock levels, movements, valuation)
- **Customer report** (top customers, repeat rate)
- **Staff performance report**
- **Tax report** (VAT breakdown)
- Schedule report (email delivery)
- Connect to `/api/v1/partners/reports/*`

### 4.9 **Product Catalog (NEW)**
**Features:**
- Browse Clutch marketplace catalog
- Add products to own inventory
- Sync prices, descriptions, images
- **Request new products** to be added to marketplace
- Connect to `/api/v1/partners/catalog/*` (NEED TO CREATE)

### 4.10 **Quote Generation (NEW)**
**Features:**
- Create quote for customer (line items, labor, parts, taxes, discounts)
- Send quote via SMS/email/WhatsApp
- Customer can approve/reject quote
- Convert approved quote to order
- Quote templates (common services)
- Connect to `/api/v1/partners/quotes/*` (NEED TO CREATE)

### 4.11 **Service Appointments (NEW - For Repair/Service Centers)**
**Features:**
- Calendar view (day, week, month)
- Book appointment (customer, vehicle, service needed, duration, time slot)
- **Customer vehicle database** (VIN, make, model, year, license plate, service history)
- Send appointment reminders
- **Check-in/check-out** workflow
- Service checklists (pre-inspection, post-inspection)
- Connect to `/api/v1/partners/appointments/*`, `/api/v1/partners/vehicles/*` (NEED TO CREATE)

### 4.12 **Promotions & Offers (NEW)**
**Features:**
- Create promotion (discount %, free item, BOGO, minimum purchase)
- Set validity period
- Apply to specific products/categories
- **Promo codes** for customers
- Track redemptions
- Connect to `/api/v1/partners/promotions/*` (NEED TO CREATE)

### 4.13 **Training & Certifications (NEW)**
**Features:**
- Video tutorials (product training, app usage, best practices)
- **Certification courses** (earn badges)
- Quiz/assessment
- Download certificates
- Clutch partner academy
- Connect to `/api/v1/partners/training/*` (NEED TO CREATE)

### 4.14 **Customer Feedback (NEW)**
**Features:**
- View ratings & reviews from Clutch app customers
- Respond to feedback
- Flag inappropriate reviews
- Request feedback from customers (post-service SMS)
- Connect to `/api/v1/partners/feedback/*` (NEED TO CREATE)

---

## Phase 5: Infrastructure & Polish

### 5.1 Dark Mode
- Read theme from Partners Design.json
- Apply dynamically
- Persist setting
- System default option (auto)

### 5.2 Real Notifications
**Push:** FCM (Android), APNs (iOS)
**Email:** Sendgrid integration
**SMS:** Twilio integration
**In-app:** Real-time via WebSocket

### 5.3 Offline Support
- Sync queue for orders, inventory, POS sales
- Use `OfflineManager.kt`, `OfflineDataManager.kt`
- Sync status indicator (banner at top)
- Retry failed syncs

### 5.4 RBAC Enforcement
**Backend:** Middleware checks role for each endpoint
**Frontend:** Hide/show features by role
- **Owner:** Full access
- **Manager:** Orders, invoices, settings, inventory, reports
- **Staff:** Orders only (read-only)
- **Accountant:** Payments & invoices (read-only)
- **HR:** Staff management only

### 5.5 Hardware Integrations (Android)
- Barcode scanner: `BarcodeScanner.kt`
- Receipt printer: `ReceiptPrinter.kt`
- Cash drawer: `CashDrawer.kt`
- Test with real hardware

### 5.6 WebSocket Integration
- Real-time order updates
- Live chat for support
- Notification delivery
- Use `WebSocketManager.kt`, backend `PartnerWebSocketService`

### 5.7 Analytics
- Track screen views, button clicks, errors, session duration
- Use `AnalyticsManager.kt`
- Firebase Analytics integration

### 5.8 **Location Services (NEW)**
- GPS tracking (opt-in)
- Route optimization for deliveries
- Find nearby partners (for referrals)
- Store location on map

### 5.9 **Security Enhancements**
- Data encryption at rest & in transit (TLS 1.3)
- Secure storage for tokens (Keystore/Keychain)
- Certificate pinning
- Regular security audits
- GDPR/CCPA compliance

### 5.10 **Performance Optimization**
- Image caching (Coil/Kingfisher)
- Lazy loading for lists
- Pagination (infinite scroll)
- Database indexing
- Network request batching
- Battery optimization (background tasks)

---

## Phase 6: Testing & Deployment

### 6.1 End-to-End Tests
- Auth flow (social login, biometric, sign in, sign up, request to join, forgot password)
- Order flow (view, accept, reject, complete)
- Appointment flow (book, reschedule, cancel, check-in/out)
- Payment flow (view history, request payout, commission breakdown)
- POS flow (sale, refund, offline sync, shift close)
- Inventory flow (add product, stocktake, transfer, low stock alert)
- Loyalty flow (earn points, redeem rewards, tier upgrade)
- Quote flow (create, send, approve, convert to order)
- RBAC (test all 5 roles)
- Translations (switch language, verify all strings)
- Dark mode (switch theme, verify all screens)
- KYC (upload docs, rejection, resubmit)
- HR (add staff, assign role, view activity log)
- Warranty & disputes (submit, escalate, chat)
- Data export (export all datasets, CSV/Excel/PDF)
- Training (watch video, complete quiz, earn certification)

### 6.2 Design Validation
- Pixel-perfect comparison to Partners Design.json
- Verify all colors, typography, spacing, shadows, borders, motion timing
- Test on multiple screen sizes (phone, tablet)
- Accessibility audit (color contrast, font sizes, touch targets)

### 6.3 Backend Validation
- Test all 15 new endpoints
- Verify RBAC middleware on all routes
- Load testing (100 concurrent users)
- Error handling (network failures, timeouts)
- Database query optimization

### 6.4 Build & Deploy
**Android:**
- Generate signed APK/AAB
- Upload to Google Play Console (internal testing)
- Configure Firebase (FCM, Analytics, Crashlytics)

**iOS:**
- Generate IPA
- Upload to TestFlight
- Configure APNs, Firebase

**Deep Links:**
- Configure for notifications (order detail, payment, etc.)
- Test on both platforms

---

## Implementation Order (Parallel: Android + iOS)

1. **Backend First** (3-4 days)
   - Create 15 missing endpoints
   - Verify/enhance existing 20+ endpoints
   - Add models: PartnerSupplier, PartnerContract, PartnerLoyalty, PartnerRating, PartnerAppointment, CustomerVehicle, PartnerPromotion, PartnerTraining, PartnerQuote, PartnerLocation

2. **Translation System** (1 day)
   - Add 300+ new strings to `strings.xml` (EN + AR)
   - Create iOS localization files

3. **Clean Slate** (0.5 day)
   - Delete old UI code
   - Keep infrastructure

4. **Navigation** (1 day)
   - Setup routing architecture (Android + iOS)
   - Deep linking configuration

5. **Auth Flow** (3 days)
   - Splash → Onboarding (Arabic illustrations) → Partner Type → Social Login → Sign In/Up/Request → Biometric → Forgot Password → KYC

6. **Main Screens** (5 days)
   - Home (Orders + Appointments) → Payments (Commission) → Settings (Multi-location) → Dashboard (Enhanced KPIs) → Loyalty & Rewards → Ratings & Reviews → Notifications → Support → Audit Log → Warranty & Disputes → Data Export

7. **Advanced Features** (7 days)
   - POS (Offline, Split Payment) → Inventory (Variants, Expiry) → Purchase Orders (Approval) → Suppliers → Devices → Staff (Performance) → Contracts (E-sign) → Reports (Tax) → Product Catalog → Quotes → Service Appointments (Vehicle DB) → Promotions → Training (Courses) → Customer Feedback

8. **Infrastructure** (3 days)
   - Dark Mode → Notifications (Push/Email/SMS) → Offline Sync → RBAC → Hardware → WebSocket → Analytics → Location Services → Security → Performance

9. **Testing** (4 days)
   - E2E tests for all flows (25+ test suites)
   - Manual testing on real devices

10. **Polish** (2 days)
    - Design validation
    - Bug fixes
    - Performance optimization

**Total: ~30 days (parallel development)**

---

## Key Files to Create/Modify

### Backend (NEW)
- `routes/partners-suppliers.js` - Supplier CRUD
- `routes/partners-contracts.js` - Contract management, e-signature
- `routes/partners-loyalty.js` - Points, rewards, tiers
- `routes/partners-ratings.js` - Ratings, reviews, feedback
- `routes/partners-appointments.js` - Service booking
- `routes/partners-vehicles.js` - Customer vehicle database
- `routes/partners-promotions.js` - Offers, discounts, promo codes
- `routes/partners-training.js` - Training materials, certifications
- `routes/partners-performance.js` - KPI metrics, benchmarks
- `routes/partners-catalog.js` - Product catalog
- `routes/partners-quotes.js` - Quote generation
- `routes/partners-locations.js` - Multi-location management
- `routes/partners-commission.js` - Commission breakdown
- `routes/partners-taxes.js` - Tax calculation, VAT
- `routes/partners-feedback.js` - Customer feedback from Clutch app

### Backend Models (NEW)
- `models/PartnerSupplier.js`
- `models/PartnerContract.js`
- `models/PartnerLoyalty.js`
- `models/PartnerRating.js`
- `models/PartnerAppointment.js`
- `models/CustomerVehicle.js`
- `models/PartnerPromotion.js`
- `models/PartnerTraining.js`
- `models/PartnerQuote.js`
- `models/PartnerLocation.js`

### Android (NEW Screens)
- `screens/loyalty/LoyaltyScreen.kt`
- `screens/loyalty/RewardsScreen.kt`
- `screens/loyalty/LeaderboardScreen.kt`
- `screens/ratings/RatingsScreen.kt`
- `screens/ratings/ReviewDetailsScreen.kt`
- `screens/appointments/AppointmentsScreen.kt`
- `screens/appointments/BookAppointmentScreen.kt`
- `screens/appointments/VehicleDetailsScreen.kt`
- `screens/vehicles/VehiclesListScreen.kt`
- `screens/vehicles/VehicleHistoryScreen.kt`
- `screens/quotes/QuotesListScreen.kt`
- `screens/quotes/CreateQuoteScreen.kt`
- `screens/quotes/QuoteTemplatesScreen.kt`
- `screens/promotions/PromotionsScreen.kt`
- `screens/promotions/CreatePromotionScreen.kt`
- `screens/training/TrainingScreen.kt`
- `screens/training/CourseDetailScreen.kt`
- `screens/training/QuizScreen.kt`
- `screens/training/CertificatesScreen.kt`
- `screens/catalog/CatalogScreen.kt`
- `screens/catalog/ProductDetailScreen.kt`
- `screens/suppliers/SuppliersScreen.kt`
- `screens/suppliers/SupplierDetailScreen.kt`
- `screens/contracts/ContractsScreen.kt`
- `screens/contracts/ContractDetailScreen.kt`
- `screens/contracts/ESignatureScreen.kt`
- `screens/locations/LocationsScreen.kt`
- `screens/feedback/FeedbackScreen.kt`
- `screens/auth/SocialLoginScreen.kt`
- `screens/auth/BiometricSetupScreen.kt`

### iOS (Mirror Android structure)
- All screens above in SwiftUI

### Translations
- Add 300+ new strings to `values/strings.xml` and `values-ar/strings.xml`
- Create `Localizable.strings` (en) and `Localizable.strings` (ar) for iOS

---

## Design.json Compliance Checklist

### Colors
- ✅ Light mode: background `#F5F5F5`, foreground `#242424`, card `#FFFFFF`
- ✅ Dark mode: background `#0F0D0F`, foreground `#F5F5F5`, card `#242424`
- ✅ Success `#27AE60`, Warning `#F39C12`, Info `#3498DB`, Destructive `#C0392B`

### Typography
- ✅ Font: Roboto (sans), weights: 300-700
- ✅ Sizes: xs(12sp), sm(14sp), base(16sp), lg(18sp), xl(20sp), 2xl(24sp), 3xl(30sp)
- ✅ Line heights: tight(1.25), normal(1.5), relaxed(1.75)

### Spacing
- ✅ Base: 4dp (0.25rem)
- ✅ Multiples: 8dp, 12dp, 16dp, 24dp, 32dp, 48dp

### Borders
- ✅ Radius: 10dp (0.625rem) for all cards, buttons, inputs

### Shadows
- ✅ 2xs, sm, md elevations for cards, modals
- ✅ Subtle, no harsh shadows

### Motion
- ✅ Fast: 150ms, Normal: 300ms, Slow: 500ms
- ✅ Easing: in, out, in-out

### Layout
- ✅ Card-based, rounded corners
- ✅ Single-handed use optimized
- ✅ Clear visual hierarchy
- ✅ Bottom navigation (5 tabs max)

---

## Success Criteria (Enhanced)

✅ All screens match Partners Design.json pixel-perfectly
✅ No hardcoded strings (all translated, 300+ strings)
✅ Dark mode works everywhere
✅ All 35+ backend endpoints exist and tested
✅ 15 new endpoints created
✅ RBAC enforced (backend + frontend, 5 roles)
✅ Real notifications (push, email, SMS) working
✅ Offline sync functional
✅ Hardware integrations working (barcode, printer, cash drawer)
✅ End-to-end tests passing (25+ test suites)
✅ Both Android and iOS apps functional
✅ Currency fixed to EGP everywhere
✅ Arabic onboarding illustrations present
✅ **Loyalty program fully functional**
✅ **Rating & review system integrated**
✅ **Service appointments working**
✅ **Quote generation functional**
✅ **Training courses accessible**
✅ **Social login working**
✅ **Biometric auth enabled**
✅ **Multi-location support**
✅ **Commission tracking transparent**
✅ **Product catalog accessible**
✅ **Performance KPIs accurate**
✅ **Security audit passed**
✅ **Accessibility audit passed**

---

## Budget & Timeline

**Development Time:** 30 days (parallel Android + iOS)
**Team:** 2 developers (1 mobile, 1 backend), 1 QA, 1 designer (for Arabic illustrations)
**Testing:** 4 days comprehensive E2E + manual testing
**Total Timeline:** ~35 days to production-ready app

**Key Milestones:**
- Day 5: Backend endpoints complete
- Day 10: Auth flow + main screens complete
- Day 20: All advanced features complete
- Day 25: Infrastructure & polish complete
- Day 30: Testing complete
- Day 35: Deployed to stores (internal testing)

