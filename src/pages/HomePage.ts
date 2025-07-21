import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private selectors = {
    welcomeMessage: '[data-testid="welcome-message"]',
    userMenu: '[data-testid="user-menu"]',
    logoutButton: '[data-testid="logout-button"]',
    navigationMenu: '[data-testid="navigation-menu"]',
    searchBox: '[data-testid="search-box"]',
    searchButton: '[data-testid="search-button"]',
    featuredProducts: '[data-testid="featured-products"]',
    cartIcon: '[data-testid="cart-icon"]',
    cartCount: '[data-testid="cart-count"]',
    profileLink: '[data-testid="profile-link"]',
    notificationIcon: '[data-testid="notification-icon"]',
    notificationCount: '[data-testid="notification-count"]'
  };

  constructor() {
    super('/');
  }

  /**
   * Check if user is logged in
   */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.userMenu);
  }

  /**
   * Get welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getTextContent(this.selectors.welcomeMessage);
  }

  /**
   * Click user menu
   */
  async clickUserMenu(): Promise<void> {
    await this.safeClick(this.selectors.userMenu);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.clickUserMenu();
    await this.safeClick(this.selectors.logoutButton);
  }

  /**
   * Search for products
   */
  async searchProducts(searchTerm: string): Promise<void> {
    await this.safeType(this.selectors.searchBox, searchTerm);
    await this.safeClick(this.selectors.searchButton);
  }

  /**
   * Get cart count
   */
  async getCartCount(): Promise<number> {
    if (await this.isElementVisible(this.selectors.cartCount)) {
      const countText = await this.getTextContent(this.selectors.cartCount);
      return parseInt(countText) || 0;
    }
    return 0;
  }

  /**
   * Click cart icon
   */
  async clickCart(): Promise<void> {
    await this.safeClick(this.selectors.cartIcon);
  }

  /**
   * Navigate to profile
   */
  async navigateToProfile(): Promise<void> {
    await this.safeClick(this.selectors.profileLink);
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    if (await this.isElementVisible(this.selectors.notificationCount)) {
      const countText = await this.getTextContent(this.selectors.notificationCount);
      return parseInt(countText) || 0;
    }
    return 0;
  }

  /**
   * Click notifications
   */
  async clickNotifications(): Promise<void> {
    await this.safeClick(this.selectors.notificationIcon);
  }

  /**
   * Check if featured products are displayed
   */
  async areFeaturedProductsDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.featuredProducts);
  }

  /**
   * Get featured products count
   */
  async getFeaturedProductsCount(): Promise<number> {
    const products = await $$(`${this.selectors.featuredProducts} [data-testid="product-item"]`);
    return products.length;
  }
}