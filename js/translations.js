// ========================================
// TRANSLATION SYSTEM - i18n
// ========================================

const TranslationManager = {
  currentLang: 'fr',
  translations: {},
  listeners: [],

  /**
   * Initialize the translation system
   * Loads the default language and sets up the lang switcher
   */
  async init() {
    // Check for saved language preference
    const savedLang = localStorage.getItem('preferred-lang') || 'fr';
    await this.setLanguage(savedLang);
    this.setupLangSwitcher();
  },

  /**
   * Fetch a language JSON file
   */
  async fetchTranslations(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      return await response.json();
    } catch (error) {
      console.error(`Error loading translations for "${lang}":`, error);
      return null;
    }
  },

  /**
   * Set the current language and apply translations
   */
  async setLanguage(lang) {
    const data = await this.fetchTranslations(lang);
    if (!data) return;

    this.currentLang = lang;
    this.translations = data;
    localStorage.setItem('preferred-lang', lang);

    // Update the HTML lang attribute
    document.documentElement.setAttribute('lang', lang);

    // Apply translations to all elements with data-i18n
    this.applyTranslations();

    // Update active state on lang switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Notify listeners (e.g., the hero slider)
    this.listeners.forEach(fn => fn(this.translations, lang));
  },

  /**
   * Apply translations to all DOM elements with data-i18n attribute
   * Uses dot notation to access nested keys: "nav.links.home"
   */
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = this.getNestedValue(key);
      if (value !== undefined) {
        el.textContent = value;
      }
    });

    // Also handle placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = this.getNestedValue(key);
      if (value !== undefined) {
        el.setAttribute('placeholder', value);
      }
    });
  },

  /**
   * Get a nested value from the translations object
   * e.g., "nav.links.home" -> translations.nav.links.home
   */
  getNestedValue(key) {
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), this.translations);
  },

  /**
   * Register a listener that will be called when language changes
   */
  onLanguageChange(fn) {
    this.listeners.push(fn);
  },

  /**
   * Setup click handlers for language switcher buttons
   */
  setupLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        if (lang && lang !== this.currentLang) {
          this.setLanguage(lang);
        }
      });
    });
  }
};
