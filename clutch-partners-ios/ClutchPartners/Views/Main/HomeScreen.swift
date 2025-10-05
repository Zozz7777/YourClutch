import SwiftUI

struct HomeScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var orders: [Order] = sampleOrders
    @State private var appointments: [Appointment] = sampleAppointments
    @State private var selectedFilter = "All"
    
    private let filters = ["All", "Pending", "In Progress", "Completed"]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Quick Stats
                    HStack(spacing: 15) {
                        StatCard(title: "Today's Orders", value: "12", color: .blue)
                        StatCard(title: "Pending", value: "3", color: .orange)
                        StatCard(title: "Revenue", value: "$2,450", color: .green)
                    }
                    .padding(.horizontal)
                    
                    // Orders Section
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text("Recent Orders")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Spacer()
                            
                            Menu {
                                ForEach(filters, id: \.self) { filter in
                                    Button(filter) {
                                        selectedFilter = filter
                                    }
                                }
                            } label: {
                                HStack {
                                    Text(selectedFilter)
                                    Image(systemName: "chevron.down")
                                }
                                .font(.subheadline)
                                .foregroundColor(.blue)
                            }
                        }
                        .padding(.horizontal)
                        
                        LazyVStack(spacing: 10) {
                            ForEach(filteredOrders, id: \.id) { order in
                                OrderCard(order: order) {
                                    router.navigateTo(.orderDetails(order.id))
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Appointments Section
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text("Today's Appointments")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Spacer()
                            
                            Button("View All") {
                                router.navigateTo(.appointments)
                            }
                            .font(.subheadline)
                            .foregroundColor(.blue)
                        }
                        .padding(.horizontal)
                        
                        LazyVStack(spacing: 10) {
                            ForEach(appointments.prefix(3), id: \.id) { appointment in
                                AppointmentCard(appointment: appointment) {
                                    router.navigateTo(.appointmentDetails(appointment.id))
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Home")
            .refreshable {
                // TODO: Implement refresh logic
            }
        }
    }
    
    private var filteredOrders: [Order] {
        if selectedFilter == "All" {
            return orders
        } else {
            return orders.filter { $0.status.lowercased() == selectedFilter.lowercased() }
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
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
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

struct OrderCard: View {
    let order: Order
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 5) {
                    Text("Order #\(order.id)")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text(order.customerName)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Text("$\(order.total, specifier: "%.2f")")
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(.green)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 5) {
                    Text(order.status)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(statusColor)
                        .cornerRadius(8)
                    
                    Text(order.time)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(10)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private var statusColor: Color {
        switch order.status.lowercased() {
        case "pending":
            return .orange
        case "in progress":
            return .blue
        case "completed":
            return .green
        default:
            return .gray
        }
    }
}

struct AppointmentCard: View {
    let appointment: Appointment
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 5) {
                    Text(appointment.customerName)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text(appointment.service)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 5) {
                    Text(appointment.time)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.blue)
                    
                    Text(appointment.status)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(10)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// Sample Data
struct Order {
    let id: String
    let customerName: String
    let total: Double
    let status: String
    let time: String
}

struct Appointment {
    let id: String
    let customerName: String
    let service: String
    let time: String
    let status: String
}

let sampleOrders = [
    Order(id: "12345", customerName: "John Smith", total: 150.00, status: "Pending", time: "2:30 PM"),
    Order(id: "12346", customerName: "Sarah Johnson", total: 275.50, status: "In Progress", time: "1:15 PM"),
    Order(id: "12347", customerName: "Mike Davis", total: 89.99, status: "Completed", time: "11:45 AM"),
    Order(id: "12348", customerName: "Lisa Wilson", total: 320.00, status: "Pending", time: "10:30 AM")
]

let sampleAppointments = [
    Appointment(id: "apt1", customerName: "Robert Brown", service: "Oil Change", time: "3:00 PM", status: "Scheduled"),
    Appointment(id: "apt2", customerName: "Emily Taylor", service: "Brake Inspection", time: "4:30 PM", status: "Confirmed"),
    Appointment(id: "apt3", customerName: "David Miller", service: "Tire Rotation", time: "5:15 PM", status: "Pending")
]

#Preview {
    HomeScreen()
        .environmentObject(AppRouter())
}
