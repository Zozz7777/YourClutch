/**
 * Fix HR Salary Data Script
 * This script checks and corrects salary data in the database
 */

const { MongoClient } = require('mongodb');

async function fixSalaryData() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
  
  try {
    await client.connect();
    console.log('🔗 Connected to database');
    
    const db = client.db();
    const employeesCollection = db.collection('employees');
    
    // Get all employees with their salary data
    const employees = await employeesCollection.find({}, { 
      projection: { 
        _id: 1, 
        firstName: 1, 
        lastName: 1, 
        salary: 1,
        'employment.salary': 1 
      } 
    }).toArray();
    
    console.log('📊 Current employee salary data:');
    employees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName}:`);
      console.log(`  - Direct salary: ${emp.salary}`);
      console.log(`  - Employment salary: ${emp.employment?.salary}`);
    });
    
    // Check if any employee has salary = 500000 (should be 50000)
    const wrongSalaryEmployees = employees.filter(emp => 
      emp.salary === 500000 || emp.employment?.salary === 500000
    );
    
    if (wrongSalaryEmployees.length > 0) {
      console.log('🔧 Found employees with wrong salary (500000), fixing to 50000...');
      
      for (const emp of wrongSalaryEmployees) {
        const updateResult = await employeesCollection.updateOne(
          { _id: emp._id },
          { 
            $set: { 
              salary: 50000,
              'employment.salary': 50000 
            } 
          }
        );
        
        console.log(`✅ Updated ${emp.firstName} ${emp.lastName}: ${updateResult.modifiedCount} document(s) modified`);
      }
      
      console.log('🎉 Salary data fixed!');
    } else {
      console.log('✅ No salary data issues found');
    }
    
    // Verify the fix
    const updatedEmployees = await employeesCollection.find({}, { 
      projection: { 
        _id: 1, 
        firstName: 1, 
        lastName: 1, 
        salary: 1,
        'employment.salary': 1 
      } 
    }).toArray();
    
    console.log('📊 Updated employee salary data:');
    updatedEmployees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName}: ${emp.salary || emp.employment?.salary}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing salary data:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  fixSalaryData();
}

module.exports = { fixSalaryData };
