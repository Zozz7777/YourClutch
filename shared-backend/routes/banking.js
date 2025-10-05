const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const BankAccount = require('../models/BankAccount');
const BankTransaction = require('../models/BankTransaction');
const BankReconciliation = require('../models/BankReconciliation');

// Rate limiting for banking operations
const bankingRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many banking requests from this IP, please try again later.'
});

// GET /api/v1/banking/accounts - List all bank accounts
router.get('/accounts', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), bankingRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('currency').optional().isIn(['EGP', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, isActive, currency } = req.query;
    
    // Build query
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (currency) query.currency = currency;

    const skip = (page - 1) * limit;
    
    const [accounts, total] = await Promise.all([
      BankAccount.find(query)
        .sort({ bankName: 1, accountNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BankAccount.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching bank accounts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bank accounts', error: error.message });
  }
});

// POST /api/v1/banking/accounts - Add bank account
router.post('/accounts', authenticateToken, checkRole(['head_administrator', 'finance_officer']), bankingRateLimit, [
  body('bankName').notEmpty().withMessage('Bank name is required'),
  body('accountNumber').notEmpty().withMessage('Account number is required'),
  body('accountType').isIn(['checking', 'savings', 'money_market', 'cd', 'line_of_credit', 'other']).withMessage('Invalid account type'),
  body('accountHolderName').notEmpty().withMessage('Account holder name is required'),
  body('currency').isIn(['EGP', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const accountData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const newAccount = new BankAccount(accountData);
    await newAccount.save();

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: newAccount
    });
  } catch (error) {
    logger.error('Error adding bank account:', error);
    res.status(500).json({ success: false, message: 'Failed to add bank account', error: error.message });
  }
});

// GET /api/v1/banking/accounts/:id/transactions - Get transactions for account
router.get('/accounts/:id/transactions', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), bankingRateLimit, [
  param('id').isMongoId().withMessage('Invalid account ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('type').optional().isIn(['debit', 'credit']).withMessage('Invalid transaction type'),
  query('category').optional().isIn(['income', 'expense', 'transfer', 'fee', 'interest', 'other']).withMessage('Invalid category'),
  query('reconciled').optional().isBoolean().withMessage('reconciled must be a boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { startDate, endDate, type, category, reconciled, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { bankAccountId: id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;
    if (category) query.category = category;
    if (reconciled !== undefined) query.reconciled = reconciled === 'true';

    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      BankTransaction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BankTransaction.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching bank transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bank transactions', error: error.message });
  }
});

// POST /api/v1/banking/transactions/import - Import bank statement
router.post('/transactions/import', authenticateToken, checkRole(['head_administrator', 'finance_officer']), bankingRateLimit, [
  body('bankAccountId').isMongoId().withMessage('Valid bank account ID is required'),
  body('transactions').isArray().withMessage('Transactions must be an array'),
  body('transactions.*.date').isISO8601().withMessage('Valid transaction date is required'),
  body('transactions.*.description').notEmpty().withMessage('Transaction description is required'),
  body('transactions.*.amount').isFloat().withMessage('Transaction amount must be a number'),
  body('transactions.*.type').isIn(['debit', 'credit']).withMessage('Invalid transaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { bankAccountId, transactions } = req.body;

    // Get bank account info
    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    // Process transactions
    const importedTransactions = [];
    for (const txn of transactions) {
      const transactionData = {
        bankAccountId,
        bankAccountNumber: bankAccount.accountNumber,
        date: new Date(txn.date),
        description: txn.description,
        amount: txn.amount,
        type: txn.type,
        category: txn.category || 'other',
        payee: txn.payee || '',
        reference: txn.reference || '',
        checkNumber: txn.checkNumber || '',
        bankTransactionId: txn.bankTransactionId || '',
        bankReference: txn.bankReference || '',
        createdBy: req.user.userId
      };

      const newTransaction = new BankTransaction(transactionData);
      await newTransaction.save();
      importedTransactions.push(newTransaction);
    }

    res.status(201).json({
      success: true,
      message: 'Bank transactions imported successfully',
      data: {
        imported: importedTransactions.length,
        transactions: importedTransactions
      }
    });
  } catch (error) {
    logger.error('Error importing bank transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to import bank transactions', error: error.message });
  }
});

// POST /api/v1/banking/transactions/categorize - Auto-categorize transactions
router.post('/transactions/categorize', authenticateToken, checkRole(['head_administrator', 'finance_officer']), bankingRateLimit, [
  body('bankAccountId').isMongoId().withMessage('Valid bank account ID is required'),
  body('transactionIds').isArray().withMessage('Transaction IDs must be an array'),
  body('transactionIds.*').isMongoId().withMessage('Each transaction ID must be a valid Mongo ID'),
  body('category').isIn(['income', 'expense', 'transfer', 'fee', 'interest', 'other']).withMessage('Invalid category'),
  body('subCategory').optional().isString().withMessage('Sub category must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { bankAccountId, transactionIds, category, subCategory } = req.body;

    const updateData = { category };
    if (subCategory) updateData.subCategory = subCategory;

    const result = await BankTransaction.updateMany(
      { 
        _id: { $in: transactionIds },
        bankAccountId 
      },
      { 
        $set: updateData,
        updatedBy: req.user.userId
      }
    );

    res.json({
      success: true,
      message: 'Transactions categorized successfully',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    logger.error('Error categorizing transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to categorize transactions', error: error.message });
  }
});

// POST /api/v1/banking/reconciliation - Start reconciliation
router.post('/reconciliation', authenticateToken, checkRole(['head_administrator', 'finance_officer']), bankingRateLimit, [
  body('bankAccountId').isMongoId().withMessage('Valid bank account ID is required'),
  body('statementDate').isISO8601().withMessage('Valid statement date is required'),
  body('statementBalance').isFloat().withMessage('Statement balance must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { bankAccountId, statementDate, statementBalance } = req.body;

    // Get bank account
    const bankAccount = await BankAccount.findById(bankAccountId);
    if (!bankAccount) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    // Calculate book balance (sum of all transactions)
    const bookBalanceResult = await BankTransaction.aggregate([
      { $match: { bankAccountId } },
      {
        $group: {
          _id: null,
          totalDebits: {
            $sum: {
              $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0]
            }
          },
          totalCredits: {
            $sum: {
              $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const bookBalance = (bookBalanceResult[0]?.totalCredits || 0) - (bookBalanceResult[0]?.totalDebits || 0);

    // Get unreconciled transactions
    const unreconciledTransactions = await BankTransaction.find({
      bankAccountId,
      reconciled: false
    }).sort({ date: 1 }).lean();

    const reconciliationData = {
      bankAccountId,
      bankAccountNumber: bankAccount.accountNumber,
      statementDate: new Date(statementDate),
      statementBalance,
      bookBalance,
      transactions: unreconciledTransactions.map(txn => ({
        transactionId: txn.transactionId,
        bankTransactionId: txn.bankTransactionId,
        date: txn.date,
        description: txn.description,
        amount: txn.amount,
        type: txn.type,
        matched: false,
        matchedLedgerEntry: txn.matchedLedgerEntry,
        notes: ''
      })),
      createdBy: req.user.userId
    };

    const newReconciliation = new BankReconciliation(reconciliationData);
    await newReconciliation.save();

    res.status(201).json({
      success: true,
      message: 'Reconciliation started successfully',
      data: newReconciliation
    });
  } catch (error) {
    logger.error('Error starting reconciliation:', error);
    res.status(500).json({ success: false, message: 'Failed to start reconciliation', error: error.message });
  }
});

// POST /api/v1/banking/reconciliation/:id/complete - Complete reconciliation
router.post('/reconciliation/:id/complete', authenticateToken, checkRole(['head_administrator', 'finance_officer']), bankingRateLimit, [
  param('id').isMongoId().withMessage('Invalid reconciliation ID'),
  body('adjustments').optional().isArray().withMessage('Adjustments must be an array'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { adjustments = [], notes = '' } = req.body;

    const reconciliation = await BankReconciliation.findById(id);
    if (!reconciliation) {
      return res.status(404).json({ success: false, message: 'Reconciliation not found' });
    }

    if (reconciliation.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Reconciliation already completed' });
    }

    // Update reconciliation
    reconciliation.adjustments = adjustments;
    reconciliation.notes = notes;
    reconciliation.status = 'completed';
    reconciliation.completedBy = req.user.userId;
    reconciliation.completedAt = new Date();
    reconciliation.updatedBy = req.user.userId;

    await reconciliation.save();

    // Update bank account last reconciled date
    await BankAccount.findByIdAndUpdate(reconciliation.bankAccountId, {
      lastReconciled: new Date(),
      lastReconciledBy: req.user.userId
    });

    // Mark matched transactions as reconciled
    const matchedTransactionIds = reconciliation.transactions
      .filter(txn => txn.matched)
      .map(txn => txn.transactionId);

    if (matchedTransactionIds.length > 0) {
      await BankTransaction.updateMany(
        { transactionId: { $in: matchedTransactionIds } },
        { 
          $set: { 
            reconciled: true,
            reconciliationDate: new Date(),
            reconciledBy: req.user.userId
          }
        }
      );
    }

    res.json({
      success: true,
      message: 'Reconciliation completed successfully',
      data: reconciliation
    });
  } catch (error) {
    logger.error('Error completing reconciliation:', error);
    res.status(500).json({ success: false, message: 'Failed to complete reconciliation', error: error.message });
  }
});

// GET /api/v1/banking/cash-flow - Cash flow statement
router.get('/cash-flow', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), bankingRateLimit, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('bankAccountId').optional().isMongoId().withMessage('Invalid bank account ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, bankAccountId } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }
    if (bankAccountId) query.bankAccountId = bankAccountId;

    // Get cash flow data
    const cashFlowData = await BankTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          totalInflow: {
            $sum: {
              $cond: [{ $eq: ['$type', 'credit'] }, '$amountInEGP', 0]
            }
          },
          totalOutflow: {
            $sum: {
              $cond: [{ $eq: ['$type', 'debit'] }, '$amountInEGP', 0]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          categories: {
            $push: {
              category: '$_id',
              inflow: '$totalInflow',
              outflow: '$totalOutflow',
              netFlow: { $subtract: ['$totalInflow', '$totalOutflow'] },
              count: '$transactionCount'
            }
          },
          totalInflow: { $sum: '$totalInflow' },
          totalOutflow: { $sum: '$totalOutflow' }
        }
      }
    ]);

    const result = cashFlowData[0] || {
      categories: [],
      totalInflow: 0,
      totalOutflow: 0
    };

    result.netCashFlow = result.totalInflow - result.totalOutflow;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching cash flow:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cash flow', error: error.message });
  }
});

module.exports = router;
