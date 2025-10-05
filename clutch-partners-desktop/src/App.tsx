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
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2
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

interface PopupMessage {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  show: boolean
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
  const [popup, setPopup] = useState<PopupMessage>({
    type: 'info',
    title: '',
    message: '',
    show: false
  })

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
      showPopup('success', t.common.connectionSuccess, result)
    } catch (error) {
      setMessage(`Connection failed: ${error}`)
      setConnectionStatus('disconnected')
      showPopup('error', t.common.connectionFailed, `فشل في الاتصال: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const validatePartnerId = async () => {
    if (!partnerId.trim()) {
      showPopup('warning', t.auth.validationFailed, 'يرجى إدخال معرف الشريك')
      return
    }

    try {
      setLoading(true)
      const result = await invoke<string>('validate_partner_id', { partnerId })
      setMessage(i18n.t().auth.validationSuccess)
      showPopup('success', t.auth.validationSuccess, 'تم التحقق من معرف الشريك بنجاح')
    } catch (error) {
      setMessage(`${i18n.t().auth.validationFailed}: ${error}`)
      showPopup('error', t.auth.validationFailed, `فشل في التحقق من معرف الشريك: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      showPopup('warning', t.auth.loginFailed, 'يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    try {
      setLoading(true)
      const result = await invoke<string>('login', { email, password })
      setMessage(i18n.t().auth.loginSuccess)
      showPopup('success', t.auth.loginSuccess, 'تم تسجيل الدخول بنجاح')
      setCurrentTab('main')
      loadProducts()
    } catch (error) {
      setMessage(`${i18n.t().auth.loginFailed}: ${error}`)
      showPopup('error', t.auth.loginFailed, `فشل في تسجيل الدخول: ${error}`)
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
      showPopup('warning', t.inventory.addProduct, 'يرجى إدخال رمز المنتج والاسم')
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
      showPopup('success', t.inventory.addProduct, 'تم إضافة المنتج بنجاح')
      setProductForm({ sku: '', name: '', price: 0, stock: 0, category: '', barcode: '' })
      loadProducts()
    } catch (error) {
      setMessage(`Failed to add product: ${error}`)
      showPopup('error', t.inventory.addProduct, `فشل في إضافة المنتج: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const processSale = async () => {
    if (!saleForm.productId.trim() || saleForm.quantity <= 0) {
      showPopup('warning', t.pos.title, 'يرجى إدخال معرف المنتج والكمية الصحيحة')
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
      showPopup('success', t.pos.title, 'تم معالجة البيع بنجاح')
      setSaleForm({ productId: '', quantity: 1, customerName: '' })
      loadProducts()
    } catch (error) {
      setMessage(`Failed to process sale: ${error}`)
      showPopup('error', t.pos.title, `فشل في معالجة البيع: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkForUpdates = async () => {
    try {
      setLoading(true)
      const result = await invoke<string>('check_for_updates')
      setMessage('Update check completed')
      showPopup('info', t.common.checkUpdates, 'تم فحص التحديثات بنجاح')
    } catch (error) {
      setMessage(`Update check failed: ${error}`)
      showPopup('error', t.common.checkUpdates, `فشل في فحص التحديثات: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar'
    setLanguage(newLanguage)
  }

  const showPopup = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setPopup({ type, title, message, show: true })
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setPopup(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  const hidePopup = () => {
    setPopup(prev => ({ ...prev, show: false }))
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
                {connectionStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {connectionStatus === 'connected' && <CheckCircle className="w-4 h-4 text-primary" />}
                {connectionStatus === 'disconnected' && <XCircle className="w-4 h-4 text-destructive" />}
                <span className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-primary' : 
                  connectionStatus === 'disconnected' ? 'text-destructive' : 
                  'text-muted-foreground'
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
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {t.common.testConnection}
              </button>
              <button
                onClick={checkForUpdates}
                className="px-3 py-1 text-sm bg-secondary text-primary-foreground rounded-md hover:bg-secondary/90 transition-colors"
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
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
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
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
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
          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-md">
            <p className="text-primary">{message}</p>
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {popup.type === 'success' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                {popup.type === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
                {popup.type === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                {popup.type === 'info' && <Info className="w-6 h-6 text-blue-500" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {popup.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {popup.message}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={hidePopup}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {t.common.ok}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App