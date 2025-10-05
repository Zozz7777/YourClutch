import SwiftUI

struct DashboardScreen: View {
    @EnvironmentObject var router: AppRouter
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // KPIs Section
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Key Performance Indicators")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .padding(.horizontal)
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 15) {
                            KPICard(title: "Total Revenue", value: "$12,450", change: "+12%", color: .green)
                            KPICard(title: "Orders Today", value: "24", change: "+8%", color: .blue)
                            KPICard(title: "Customer Rating", value: "4.8", change: "+0.2", color: .orange)
                            KPICard(title: "Active Customers", value: "156", change: "+23", color: .purple)
                        }
                        .padding(.horizontal)
                    }
                    
                    // Revenue Chart
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Revenue Trend")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .padding(.horizontal)
                        
                        ChartCard()
                            .padding(.horizontal)
                    }
                    
                    // Recent Activity
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Recent Activity")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .padding(.horizontal)
                        
                        LazyVStack(spacing: 10) {
                            ActivityCard(title: "New Order Received", description: "Order #12349 from John Smith", time: "2 minutes ago", color: .blue)
                            ActivityCard(title: "Payment Received", description: "$275.50 from Sarah Johnson", time: "15 minutes ago", color: .green)
                            ActivityCard(title: "Appointment Scheduled", description: "Oil change for Robert Brown", time: "1 hour ago", color: .orange)
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Dashboard")
        }
    }
}

struct KPICard: View {
    let title: String
    let value: String
    let change: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(change)
                .font(.caption)
                .foregroundColor(.green)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

struct ChartCard: View {
    var body: some View {
        VStack {
            // Placeholder for chart
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.blue.opacity(0.1))
                .frame(height: 200)
                .overlay(
                    VStack {
                        Image(systemName: "chart.line.uptrend.xyaxis")
                            .font(.system(size: 40))
                            .foregroundColor(.blue)
                        Text("Revenue Chart")
                            .font(.headline)
                            .foregroundColor(.blue)
                    }
                )
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct ActivityCard: View {
    let title: String
    let description: String
    let time: String
    let color: Color
    
    var body: some View {
        HStack {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(time)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

#Preview {
    DashboardScreen()
        .environmentObject(AppRouter())
}
