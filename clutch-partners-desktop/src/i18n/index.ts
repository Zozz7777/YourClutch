import ar from './ar.json'
import en from './en.json'

export type Language = 'ar' | 'en'

export interface Translations {
  app: {
    title: string
    subtitle: string
  }
  auth: {
    title: string
    partnerId: string
    email: string
    password: string
    login: string
    validate: string
    loginSuccess: string
    loginFailed: string
    validationSuccess: string
    validationFailed: string
  }
  navigation: {
    pos: string
    inventory: string
    reports: string
    settings: string
  }
  pos: {
    title: string
    processSale: string
    productId: string
    quantity: string
    customerName: string
    process: string
    processing: string
  }
  inventory: {
    title: string
    addProduct: string
    products: string
    sku: string
    name: string
    price: string
    stock: string
    category: string
    barcode: string
    add: string
    adding: string
  }
  reports: {
    title: string
    description: string
  }
  settings: {
    title: string
    description: string
    language: string
    arabic: string
    english: string
  }
  common: {
    testConnection: string
    checkUpdates: string
    online: string
    offline: string
    checking: string
    success: string
    error: string
    loading: string
    save: string
    cancel: string
    confirm: string
    delete: string
    edit: string
    add: string
    search: string
    filter: string
    sort: string
    export: string
    import: string
    refresh: string
  }
  status: {
    connected: string
    disconnected: string
    syncing: string
    synced: string
    error: string
  }
}

const translations: Record<Language, Translations> = {
  ar,
  en
}

export class I18n {
  private currentLanguage: Language = 'ar' // Default to Arabic

  constructor(initialLanguage?: Language) {
    if (initialLanguage) {
      this.currentLanguage = initialLanguage
    }
  }

  setLanguage(language: Language) {
    this.currentLanguage = language
    // Update document direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }

  getLanguage(): Language {
    return this.currentLanguage
  }

  t(): Translations {
    return translations[this.currentLanguage]
  }

  isRTL(): boolean {
    return this.currentLanguage === 'ar'
  }
}

export const i18n = new I18n()
