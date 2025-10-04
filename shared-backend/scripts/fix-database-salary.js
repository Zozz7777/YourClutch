/**
 * Fix Database Salary Data Script
 * Corrects wrong salary values in the database
 */

const { MongoClient } = require('mongodb');

async function fixDatabaseSalary() {
  const client = new MongoClient("mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch");
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('clutch');
    const employeesCollection = db.collection('employees');
    
    // Find employees with wrong salary (500000)
    console.log('🔍 Finding employees with wrong salary...');
    const wrongSalaryEmployees = await employeesCollection.find({
      $or: [
        { salary: 500000 },
        { 'employment.salary': 500000 },
        { 'employment.baseSalary': 500000 }
      ]
    }).toArray();
    
    if (wrongSalaryEmployees.length === 0) {
      console.log('✅ No employees found with wrong salary');
      return;
    }
    
    console.log(`🔧 Found ${wrongSalaryEmployees.length} employees with wrong salary:`);
    wrongSalaryEmployees.forEach(emp => {
      console.log(`   - ${emp.firstName} ${emp.lastName}: ${emp.salary}`);
    });
    
    // Fix the salary data
    console.log('');
    console.log('🔧 Fixing salary data...');
    
    for (const emp of wrongSalaryEmployees) {
      console.log(`   - Fixing ${emp.firstName} ${emp.lastName}...`);
      
      // Update the salary to 50000
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
      
      console.log(`     ✅ Updated: ${updateResult.modifiedCount} document(s) modified`);
    }
    
    console.log('');
    console.log('🎉 Salary data fixed!');
    
    // Verify the fix
    console.log('');
    console.log('🔍 Verifying the fix...');
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
    
    console.log('📊 Updated employee salary data:');
    updatedEmployees.forEach(emp => {
      const salary = emp.salary || emp.employment?.salary || emp.employment?.baseSalary;
      console.log(`   - ${emp.firstName} ${emp.lastName}: ${salary}`);
    });
    
    // Calculate new average
    const validSalaries = updatedEmployees
      .map(emp => emp.salary || emp.employment?.salary || emp.employment?.baseSalary)
      .filter(salary => salary && salary > 0);
    
    if (validSalaries.length > 0) {
      const averageSalary = validSalaries.reduce((sum, salary) => sum + salary, 0) / validSalaries.length;
      console.log('');
      console.log('📈 New Salary Statistics:');
      console.log(`   - Average salary: ${Math.round(averageSalary).toLocaleString()}`);
      
      if (averageSalary === 50000) {
        console.log('✅ Salary data is now correct!');
      } else {
        console.log('⚠️ Salary data still needs attention');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  fixDatabaseSalary();
}

module.exports = { fixDatabaseSalary };
