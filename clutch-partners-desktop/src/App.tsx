import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Wifi, 
  WifiOff,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface Product {
  id: number
  sku: string
  name: string
  price: number
  stock: number
  category: string
  barcode: string
}

interface Sale {
  id: number
  product_id: number
  quantity: number
  price: number
  total: number
  customer_name: string
  timestamp: string
}

function App() {
  const [currentTab, setCurrentTab] = useState('auth')
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Form states
  const [partnerId, setPartnerId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    price: 0,
    stock: 0,
    category: '',
    barcode: ''
  })
  const [saleForm, setSaleForm] = useState({
    productId: '',
    quantity: 1,
    customerName: ''
  })

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setLoading(true)
      const result = await invoke<string>('test_connection')
      setMessage(result)
      setConnectionStatus('connected')
    } catch (error) {
      setMessage(`Connection failed: ${error}`)
      setConnectionStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  const validatePartnerId = async () => {
    if (!partnerId.trim()) {
      setMessage('Please enter a Partner ID')
      return
    }

    try {
      setLoading(true)
      const result = await invoke<string>('validate_partner_id', { partnerId })
      setMessage(result)
    } catch (error) {
      setMessage(`Validation failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage('Please enter email and password')
      return
    }

    try {
      setLoading(true)
      const result = await invoke<string>('login', { email, password })
      setMessage(result)
      setCurrentTab('main')
      loadProducts()
    } catch (error) {
      setMessage(`Login failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const result = await invoke<string>('get_products')
      setProducts(JSON.parse(result))
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const addProduct = async () => {
    if (!productForm.sku.trim() || !productForm.name.trim()) {
      setMessage('Please enter SKU and name')
      return
    }

    try {
      setLoading(true)
      const result = await invoke<string>('add_product', {
        sku: productForm.sku,
        name: productForm.name,
        price: productForm.price,
        stock: productForm.stock,
        category: productForm.category,
        barcode: productForm.barcode
      })
      setMessage('Product added successfully!')
      setProductForm({ sku: '', name: '', price: 0, stock: 0, category: '', barcode: '' })
      loadProducts()
    } catch (error) {
      setMessage(`Failed to add product: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const processSale = async () => {
    if (!saleForm.productId.trim() || saleForm.quantity <= 0) {
      setMessage('Please enter valid product ID and quantity')
      return
    }

    try {
      setLoading(true)
      const result = await invoke<string>('process_sale', {
        productId: parseInt(saleForm.productId),
        quantity: saleForm.quantity,
        customerName: saleForm.customerName
      })
      setMessage('Sale processed successfully!')
      setSaleForm({ productId: '', quantity: 1, customerName: '' })
      loadProducts()
    } catch (error) {
      setMessage(`Failed to process sale: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkForUpdates = async () => {
    try {
      setLoading(true)
      const result = await invoke<string>('check_for_updates')
      setMessage('Update check completed')
    } catch (error) {
      setMessage(`Update check failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🚀 Clutch Partners System</h1>
              <div className="flex items-center space-x-2">
                {connectionStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                {connectionStatus === 'connected' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {connectionStatus === 'disconnected' && <XCircle className="w-4 h-4 text-red-500" />}
                <span className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-green-600' : 
                  connectionStatus === 'disconnected' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {connectionStatus === 'checking' ? 'Checking...' :
                   connectionStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={testConnection}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Connection
              </button>
              <button
                onClick={checkForUpdates}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                Check Updates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {currentTab === 'main' && (
        <div className="bg-white shadow-sm">
          <div className="px-6 py-3">
            <nav className="flex space-x-8">
              <button
                onClick={() => setCurrentTab('pos')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>POS</span>
              </button>
              <button
                onClick={() => setCurrentTab('inventory')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Package className="w-4 h-4" />
                <span>Inventory</span>
              </button>
              <button
                onClick={() => setCurrentTab('reports')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
              </button>
              <button
                onClick={() => setCurrentTab('settings')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {currentTab === 'auth' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">🔐 Authentication</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner ID
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      placeholder="Enter your Partner ID"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={validatePartnerId}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      Validate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={login}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'pos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">💰 Process Sale</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={saleForm.productId}
                    onChange={(e) => setSaleForm({...saleForm, productId: e.target.value})}
                    placeholder="Enter product ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({...saleForm, quantity: parseInt(e.target.value) || 1})}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={saleForm.customerName}
                    onChange={(e) => setSaleForm({...saleForm, customerName: e.target.value})}
                    placeholder="Customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={processSale}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Process Sale'}
              </button>
            </div>
          </div>
        )}

        {currentTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">📦 Add Product</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    placeholder="Product SKU"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="Product name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    placeholder="Product category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({...productForm, barcode: e.target.value})}
                    placeholder="Product barcode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={addProduct}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">📦 Products</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Reports</h2>
            <p className="text-gray-600">Reports and analytics will be displayed here.</p>
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">⚙️ Settings</h2>
            <p className="text-gray-600">Settings and configuration options will be displayed here.</p>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
