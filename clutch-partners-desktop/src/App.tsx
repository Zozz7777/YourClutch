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
  Loader2,
  Globe,
  Menu,
  X
} from 'lucide-react'
import { i18n, type Language } from './i18n'

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
  const [language, setLanguage] = useState<Language>('ar')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    i18n.setLanguage(language)
    testConnection()
  }, [language])

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
      setMessage(i18n.t().auth.validationFailed)
      return
    }

    try {
      setLoading(true)
      const result = await invoke<string>('validate_partner_id', { partnerId })
      setMessage(i18n.t().auth.validationSuccess)
    } catch (error) {
      setMessage(`${i18n.t().auth.validationFailed}: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage(i18n.t().auth.loginFailed)
      return
    }

    try {
      setLoading(true)
      const result = await invoke<string>('login', { email, password })
      setMessage(i18n.t().auth.loginSuccess)
      setCurrentTab('main')
      loadProducts()
    } catch (error) {
      setMessage(`${i18n.t().auth.loginFailed}: ${error}`)
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

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLanguage)
  }

  const t = i18n.t()

  return (
    <div className={`min-h-screen bg-background ${i18n.isRTL() ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo-black.png" 
                alt="Clutch Partners" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground font-sans">{t.app.title}</h1>
                <p className="text-sm text-muted-foreground">{t.app.subtitle}</p>
              </div>
              <div className="flex items-center space-x-2">
                {connectionStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-info" />}
                {connectionStatus === 'connected' && <CheckCircle className="w-4 h-4 text-success" />}
                {connectionStatus === 'disconnected' && <XCircle className="w-4 h-4 text-destructive" />}
                <span className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-success' : 
                  connectionStatus === 'disconnected' ? 'text-destructive' : 
                  'text-info'
                }`}>
                  {connectionStatus === 'checking' ? t.common.checking :
                   connectionStatus === 'connected' ? t.common.online : t.common.offline}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'ar' ? 'العربية' : 'English'}</span>
              </button>
              <button
                onClick={testConnection}
                className="px-3 py-1 text-sm bg-info text-primary-foreground rounded-md hover:bg-info/90 transition-colors"
              >
                {t.common.testConnection}
              </button>
              <button
                onClick={checkForUpdates}
                className="px-3 py-1 text-sm bg-success text-primary-foreground rounded-md hover:bg-success/90 transition-colors"
              >
                {t.common.checkUpdates}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      {currentTab === 'main' && (
        <div className="lg:hidden bg-card border-b border-border">
          <div className="px-4 py-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center space-x-2 text-foreground"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span>{t.navigation.pos}</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {currentTab === 'main' && (
        <div className={`bg-card shadow-sm ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="px-6 py-3">
            <nav className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-8">
              <button
                onClick={() => { setCurrentTab('pos'); setSidebarOpen(false) }}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t.navigation.pos}</span>
              </button>
              <button
                onClick={() => { setCurrentTab('inventory'); setSidebarOpen(false) }}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>{t.navigation.inventory}</span>
              </button>
              <button
                onClick={() => { setCurrentTab('reports'); setSidebarOpen(false) }}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t.navigation.reports}</span>
              </button>
              <button
                onClick={() => { setCurrentTab('settings'); setSidebarOpen(false) }}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>{t.navigation.settings}</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {currentTab === 'auth' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-foreground">{t.auth.title}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.auth.partnerId}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      placeholder={t.auth.partnerId}
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                    />
                    <button
                      onClick={validatePartnerId}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {t.auth.validate}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.auth.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.auth.email}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.auth.password}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.password}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>

                <button
                  onClick={login}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-success text-primary-foreground rounded-md hover:bg-success/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? t.common.loading : t.auth.login}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'pos' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">{t.pos.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.pos.productId}
                  </label>
                  <input
                    type="text"
                    value={saleForm.productId}
                    onChange={(e) => setSaleForm({...saleForm, productId: e.target.value})}
                    placeholder={t.pos.productId}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.pos.quantity}
                  </label>
                  <input
                    type="number"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({...saleForm, quantity: parseInt(e.target.value) || 1})}
                    min="1"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.pos.customerName}
                  </label>
                  <input
                    type="text"
                    value={saleForm.customerName}
                    onChange={(e) => setSaleForm({...saleForm, customerName: e.target.value})}
                    placeholder={t.pos.customerName}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
              </div>
              <button
                onClick={processSale}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-success text-primary-foreground rounded-md hover:bg-success/90 disabled:opacity-50 transition-colors"
              >
                {loading ? t.pos.processing : t.pos.process}
              </button>
            </div>
          </div>
        )}

        {currentTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">{t.inventory.addProduct}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.inventory.sku}
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    placeholder={t.inventory.sku}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.inventory.name}
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder={t.inventory.name}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.inventory.price}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.inventory.stock}
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.inventory.category}
                  </label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    placeholder={t.inventory.category}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.inventory.barcode}
                  </label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({...productForm, barcode: e.target.value})}
                    placeholder={t.inventory.barcode}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                  />
                </div>
              </div>
              <button
                onClick={addProduct}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? t.inventory.adding : t.inventory.add}
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">{t.inventory.products}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.inventory.sku}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.inventory.name}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.inventory.price}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.inventory.stock}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.inventory.category}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{product.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'reports' && (
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">{t.reports.title}</h2>
            <p className="text-muted-foreground">{t.reports.description}</p>
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">{t.settings.title}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t.settings.language}
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setLanguage('ar')}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      language === 'ar' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {t.settings.arabic}
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      language === 'en' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {t.settings.english}
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground">{t.settings.description}</p>
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-md">
            <p className="text-info">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App