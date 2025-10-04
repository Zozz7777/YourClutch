# Test User Cleanup Scripts

This directory contains scripts to safely remove test users from the database while preserving real users.

## 🧹 Available Scripts

### 1. Quick Cleanup (Recommended)
```bash
npm run cleanup:test-users:quick
```
- **Purpose**: Quickly removes obvious test users
- **Use case**: Immediate cleanup of test data
- **Safety**: Preserves real users with common email domains (gmail, yahoo, etc.)

### 2. Comprehensive Cleanup
```bash
npm run cleanup:test-users
```
- **Purpose**: Detailed analysis and cleanup with advanced pattern matching
- **Use case**: Thorough cleanup with detailed reporting
- **Options**: 
  - `--dry-run`: Show what would be deleted without actually deleting
  - `--confirm`: Skip confirmation prompt

### 3. Dry Run (Safe Testing)
```bash
npm run cleanup:test-users:dry-run
```
- **Purpose**: See what would be deleted without making changes
- **Use case**: Test the cleanup logic before actual deletion

## 🎯 What Gets Deleted

### Test User Patterns
- **Email patterns**: test@, @test.com, @example.com, @localhost, @dummy.com, @fake.com, @temp.com, @yourclutch.com, @clutch.app
- **Phone patterns**: temp_*, user_*, 123456789*, 000000000*, 111111111*
- **Name patterns**: Test User, Admin User, Demo User, Sample User, Dummy User, Fake User, Temp User

### Real User Patterns (Preserved)
- **Email domains**: gmail.com, yahoo.com, hotmail.com, outlook.com, icloud.com, live.com, msn.com, aol.com, protonmail.com, yandex.com, mail.ru, zoho.com, fastmail.com, tutanota.com
- **Phone numbers**: Valid international formats (Egyptian: 01xxxxxxxxx, US: +1xxxxxxxxxx, UK: +44xxxxxxxxxx, etc.)

## 🚀 Usage Examples

### Quick Cleanup (Most Common)
```bash
cd shared-backend
npm run cleanup:test-users:quick
```

### Safe Testing First
```bash
cd shared-backend
npm run cleanup:test-users:dry-run
```

### Comprehensive Cleanup with Confirmation
```bash
cd shared-backend
npm run cleanup:test-users
```

### Direct Script Execution
```bash
cd shared-backend
node scripts/quick-cleanup-test-users.js
node scripts/cleanup-test-users.js --dry-run
node scripts/cleanup-test-users.js --confirm
```

## 📊 Expected Results

For a database with ~200 test users:
- **Before**: ~200 total users
- **After**: ~50-100 real users (depending on actual test data)
- **Reduction**: 50-75% of users removed

## ⚠️ Safety Features

1. **Whitelist Protection**: Real users with common email domains are never deleted
2. **Pattern Matching**: Only removes users matching specific test patterns
3. **Confirmation Required**: Asks for confirmation before deletion (unless --confirm flag used)
4. **Dry Run Mode**: Test the cleanup without making changes
5. **Detailed Logging**: Shows exactly what will be deleted
6. **Backup Recommendation**: Always backup database before cleanup

## 🔧 Customization

To modify what gets deleted, edit the pattern arrays in the scripts:

### In `quick-cleanup-test-users.js`:
```javascript
const testUserQueries = [
  { email: { $regex: /^test/i } },
  { email: { $regex: /@test/i } },
  // Add more patterns here
];
```

### In `cleanup-test-users.js`:
```javascript
const TEST_USER_PATTERNS = {
  emailPatterns: [
    /^test/i,
    /@test/i,
    // Add more patterns here
  ]
};
```

## 📝 Logs and Output

The scripts provide detailed output:
- Total users before/after cleanup
- Number of test users found
- Examples of users to be deleted
- Confirmation prompts
- Success/failure messages
- Database connection status

## 🚨 Important Notes

1. **Backup First**: Always backup your database before running cleanup scripts
2. **Test Environment**: Test on a development database first
3. **Review Patterns**: Review the deletion patterns to ensure they match your test data
4. **Monitor Results**: Check the results to ensure no real users were accidentally deleted
5. **Database Access**: Ensure the script has proper database connection permissions

## 🆘 Troubleshooting

### Connection Issues
- Check `MONGODB_URI` environment variable
- Verify database credentials
- Ensure network access to database

### Permission Issues
- Ensure database user has delete permissions
- Check collection access rights

### No Users Found
- Verify test user patterns match your data
- Check if users are in a different collection
- Review the dry-run output for pattern matching

## 📞 Support

If you encounter issues:
1. Run with `--dry-run` first to see what would be deleted
2. Check the logs for specific error messages
3. Verify database connection and permissions
4. Review the pattern matching logic
