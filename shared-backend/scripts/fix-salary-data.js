/**
 * Fix HR Salary Data Script
 * Uses the same database connection as the backend
 */

const { getCollection } = require('../config/optimized-database');

async function fixSalaryData() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Use the same database connection as the backend
    const employeesCollection = await getCollection('employees');
    console.log('✅ Connected to employees collection');
    
    // Find employees with wrong salary (500000)
    const wrongSalaryEmployees = await employeesCollection.find({
      $or: [
        { salary: 500000 },
        { 'employment.salary': 500000 },
        { 'employment.baseSalary': 500000 }
      ]
    }).toArray();
    
    if (wrongSalaryEmployees.length === 0) {
      console.log('✅ No salary data issues found');
      return;
    }
    
    console.log(`🔧 Found ${wrongSalaryEmployees.length} employees with wrong salary (500000)`);
    
    // Fix the salary data
    const fixResults = [];
    for (const emp of wrongSalaryEmployees) {
      console.log(`   - Fixing ${emp.firstName} ${emp.lastName}...`);
      
      const updateResult = await employeesCollection.updateOne(
        { _id: emp._id },
        { 
          $set: { 
            salary: 50000,
            'employment.salary': 50000,
            'employment.baseSalary': 50000
          } 
        }
      );
      
      fixResults.push({
        employeeId: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        fixed: updateResult.modifiedCount > 0
      });
      
      console.log(`     ✅ Updated: ${updateResult.modifiedCount} document(s) modified`);
    }
    
    console.log('');
    console.log('🎉 Salary data fixed!');
    console.log(`   - Total employees fixed: ${fixResults.filter(r => r.fixed).length}`);
    
    // Verify the fix
    const updatedEmployees = await employeesCollection.find({}, { 
      projection: { 
        _id: 1, 
        firstName: 1, 
        lastName: 1, 
        salary: 1,
        'employment.salary': 1,
        'employment.baseSalary': 1
      } 
    }).toArray();
    
    console.log('');
    console.log('📊 Updated employee salary data:');
    updatedEmployees.forEach(emp => {
      const salary = emp.salary || emp.employment?.salary || emp.employment?.baseSalary;
      console.log(`   - ${emp.firstName} ${emp.lastName}: ${salary}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing salary data:', error);
  }
}

// Run the script
if (require.main === module) {
  fixSalaryData();
}

module.exports = { fixSalaryData };