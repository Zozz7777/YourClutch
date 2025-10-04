/**
 * Check Database Salary Data Script
 * Directly connects to MongoDB and checks employee salary data
 */

const { MongoClient } = require('mongodb');

async function checkDatabaseSalary() {
  const client = new MongoClient("mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch");
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('clutch');
    const employeesCollection = db.collection('employees');
    
    // Get all employees with salary data
    console.log('📊 Fetching all employees...');
    const employees = await employeesCollection.find({}, { 
      projection: { 
        _id: 1, 
        firstName: 1, 
        lastName: 1, 
        salary: 1,
        'employment.salary': 1,
        'employment.baseSalary': 1,
        email: 1
      } 
    }).toArray();
    
    console.log('📋 Employee Salary Data:');
    console.log('=====================================');
    
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.email})`);
      console.log(`   - Direct salary: ${emp.salary}`);
      console.log(`   - Employment salary: ${emp.employment?.salary}`);
      console.log(`   - Employment baseSalary: ${emp.employment?.baseSalary}`);
      console.log('');
    });
    
    // Check for wrong salary values
    const wrongSalaryEmployees = employees.filter(emp => 
      emp.salary === 500000 || 
      emp.employment?.salary === 500000 ||
      emp.employment?.baseSalary === 500000
    );
    
    if (wrongSalaryEmployees.length > 0) {
      console.log('🚨 Found employees with wrong salary (500000):');
      wrongSalaryEmployees.forEach(emp => {
        const salary = emp.salary || emp.employment?.salary || emp.employment?.baseSalary;
        console.log(`   - ${emp.firstName} ${emp.lastName}: ${salary}`);
      });
      
      console.log('');
      console.log('🔧 These employees need to be fixed to 50000');
    } else {
      console.log('✅ No employees found with wrong salary (500000)');
    }
    
    // Calculate average salary manually
    const validSalaries = employees
      .map(emp => emp.salary || emp.employment?.salary || emp.employment?.baseSalary)
      .filter(salary => salary && salary > 0);
    
    if (validSalaries.length > 0) {
      const averageSalary = validSalaries.reduce((sum, salary) => sum + salary, 0) / validSalaries.length;
      console.log('');
      console.log('📈 Salary Statistics:');
      console.log(`   - Total employees: ${employees.length}`);
      console.log(`   - Employees with salary: ${validSalaries.length}`);
      console.log(`   - Salaries: ${validSalaries.join(', ')}`);
      console.log(`   - Average salary: ${Math.round(averageSalary).toLocaleString()}`);
      
      // Check if this matches what the API is returning
      if (averageSalary === 500000) {
        console.log('');
        console.log('🚨 ISSUE FOUND: Database has wrong salary values!');
        console.log('   The average salary is 500000, which should be 50000');
      } else if (averageSalary === 50000) {
        console.log('');
        console.log('✅ Database has correct salary values');
        console.log('   The issue might be in the API calculation logic');
      }
    } else {
      console.log('⚠️ No valid salaries found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  checkDatabaseSalary();
}

module.exports = { checkDatabaseSalary };
