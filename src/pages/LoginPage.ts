import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private selectors = {
    emailInput: '#email',
    passwordInput: '#password',
    loginButton: '[data-testid="login-button"]',
    forgotPasswordLink: '[data-testid="forgot-password"]',
    signupLink: '[data-testid="signup-link"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    rememberMeCheckbox: '#remember-me',
    showPasswordButton: '[data-testid="show-password"]'
  };

  constructor() {
    super('/login');
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    this.logger.info(`Attempting to login with email: ${email}`);
    
    await this.safeType(this.selectors.emailInput, email);
    await this.safeType(this.selectors.passwordInput, password);
    
    if (rememberMe) {
      await this.safeClick(this.selectors.rememberMeCheckbox);
    }
    
    await this.safeClick(this.selectors.loginButton);
    await this.waitForLoginCompletion();
  }

  /**
   * Wait for login process to complete
   */
  private async waitForLoginCompletion(): Promise<void> {
    // Wait for loading spinner to disappear
    await browser.waitUntil(async () => {
      return !(await this.isElementVisible(this.selectors.loadingSpinner));
    }, {
      timeout: 15000,
      timeoutMsg: 'Login process did not complete within 15 seconds'
    });
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.safeClick(this.selectors.forgotPasswordLink);
  }

  /**
   * Click signup link
   */
  async clickSignup(): Promise<void> {
    await this.safeClick(this.selectors.signupLink);
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    if (await this.isElementVisible(this.selectors.errorMessage)) {
      return await this.getTextContent(this.selectors.errorMessage);
    }
    return '';
  }

  /**
   * Get success message
   */
  async getSuccessMessage(): Promise<string> {
    if (await this.isElementVisible(this.selectors.successMessage)) {
      return await this.getTextContent(this.selectors.successMessage);
    }
    return '';
  }

  /**
   * Check if login form is displayed
   */
  async isLoginFormDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.emailInput) &&
           await this.isElementVisible(this.selectors.passwordInput) &&
           await this.isElementVisible(this.selectors.loginButton);
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.safeClick(this.selectors.showPasswordButton);
  }

  /**
   * Check if password is visible
   */
  async isPasswordVisible(): Promise<boolean> {
    const passwordType = await this.getAttribute(this.selectors.passwordInput, 'type');
    return passwordType === 'text';
  }

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    const emailElement = await $(this.selectors.emailInput);
    const passwordElement = await $(this.selectors.passwordInput);
    
    await emailElement.clearValue();
    await passwordElement.clearValue();
  }

  /**
   * Get email input value
   */
  async getEmailValue(): Promise<string> {
    const element = await $(this.selectors.emailInput);
    return await element.getValue();
  }

  /**
   * Get password input value
   */
  async getPasswordValue(): Promise<string> {
    const element = await $(this.selectors.passwordInput);
    return await element.getValue();
  }

  /**
   * Check if remember me is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    const element = await $(this.selectors.rememberMeCheckbox);
    return await element.isSelected();
  }

  /**
   * Validate email format client-side
   */
  async validateEmailFormat(email: string): Promise<boolean> {
    await this.safeType(this.selectors.emailInput, email);
    const validity = await this.executeScript(`
      return document.querySelector('${this.selectors.emailInput}').validity.valid;
    `);
    return validity;
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    const element = await $(this.selectors.loginButton);
    return await element.isEnabled();
  }
}