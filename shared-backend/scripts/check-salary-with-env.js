/**
 * Check HR Salary Data Script with Environment
 * Loads environment variables and checks salary data
 */

// Load environment variables
require('dotenv').config({ path: '../clutch-backend.env' });

const { getCollection } = require('../config/optimized-database');

async function checkSalaryData() {
  try {
    console.log('🔗 Connecting to database...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    // Use the same database connection as the backend
    const employeesCollection = await getCollection('employees');
    console.log('✅ Connected to employees collection');
    
    // Get all employees with salary data
    const employees = await employeesCollection.find({}, { 
      projection: { 
        _id: 1, 
        firstName: 1, 
        lastName: 1, 
        salary: 1,
        'employment.salary': 1,
        'employment.baseSalary': 1
      } 
    }).toArray();
    
    console.log('📊 Current employee salary data:');
    console.log('=====================================');
    
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName}:`);
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
        console.log(`   - ${emp.firstName} ${emp.lastName}: ${emp.salary || emp.employment?.salary}`);
      });
      
      console.log('');
      console.log('🔧 Would you like to fix these salaries to 50000? (y/n)');
      console.log('   Run: node scripts/fix-salary-data.js');
    } else {
      console.log('✅ No salary data issues found');
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
    }
    
  } catch (error) {
    console.error('❌ Error checking salary data:', error);
  }
}

// Run the script
if (require.main === module) {
  checkSalaryData();
}

module.exports = { checkSalaryData };
