const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkEmployees() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  // Check employees collection
  const employeesCollection = db.collection('employees');
  const employeeCount = await employeesCollection.countDocuments();
  console.log('Employees collection count:', employeeCount);
  
  if (employeeCount > 0) {
    // Get all employees
    const employees = await employeesCollection.find({}).toArray();
    console.log('All employees:');
    employees.forEach((employee, index) => {
      console.log(`${index + 1}. Email: ${employee.email || employee.basicInfo?.email || 'N/A'}`);
      console.log(`   Phone: ${employee.phoneNumber || employee.phone || employee.basicInfo?.phoneNumber || employee.basicInfo?.phone || 'N/A'}`);
      console.log(`   Name: ${employee.name || employee.firstName + ' ' + employee.lastName || employee.basicInfo?.firstName + ' ' + employee.basicInfo?.lastName || 'N/A'}`);
      console.log(`   Active: ${employee.isActive || false}`);
      console.log(`   Role: ${employee.role || 'N/A'}`);
      console.log('-'.repeat(40));
    });
    
    // Search for Ziad specifically
    const ziadEmployees = await employeesCollection.find({
      $or: [
        { email: { $regex: 'ziad', $options: 'i' } },
        { name: { $regex: 'ziad', $options: 'i' } },
        { firstName: { $regex: 'ziad', $options: 'i' } },
        { lastName: { $regex: 'ziad', $options: 'i' } },
        { 'basicInfo.email': { $regex: 'ziad', $options: 'i' } },
        { 'basicInfo.firstName': { $regex: 'ziad', $options: 'i' } },
        { 'basicInfo.lastName': { $regex: 'ziad', $options: 'i' } }
      ]
    }).toArray();
    
    console.log(`\nFound ${ziadEmployees.length} Ziad employees:`);
    ziadEmployees.forEach((employee, index) => {
      console.log(`${index + 1}. Email: ${employee.email || employee.basicInfo?.email || 'N/A'}`);
      console.log(`   Phone: ${employee.phoneNumber || employee.phone || employee.basicInfo?.phoneNumber || employee.basicInfo?.phone || 'N/A'}`);
      console.log(`   Name: ${employee.name || employee.firstName + ' ' + employee.lastName || employee.basicInfo?.firstName + ' ' + employee.basicInfo?.lastName || 'N/A'}`);
      console.log(`   Active: ${employee.isActive || false}`);
      console.log(`   Role: ${employee.role || 'N/A'}`);
      console.log('-'.repeat(40));
    });
  }
  
  await client.close();
}

checkEmployees().catch(console.error);
