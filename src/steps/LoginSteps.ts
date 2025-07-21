import { Given, When, Then } from '@wdio/cucumber-framework';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';
import { DataGenerator } from '@utils/DataGenerator';
import { Logger } from '@utils/Logger';

const loginPage = new LoginPage();
const homePage = new HomePage();
const dataGenerator = new DataGenerator();
const logger = new Logger('LoginSteps');

Given(/^I am on the login page$/, async () => {
  logger.info('Navigating to login page');
  await loginPage.navigate();
  
  const isDisplayed = await loginPage.isLoginFormDisplayed();
  expect(isDisplayed).toBe(true);
});

Given(/^I am a registered user with email "([^"]*)" and password "([^"]*)"$/, async (email: string, password: string) => {
  // Store credentials for later use
  browser.execute(() => {
    (window as any).testCredentials = { email, password };
  });
  logger.info(`Registered user credentials set`, { email });
});

When(/^I enter email "([^"]*)"$/, async (email: string) => {
  logger.info(`Entering email: ${email}`);
  await loginPage.safeType('#email', email);
});

When(/^I enter password "([^"]*)"$/, async (password: string) => {
  logger.info('Entering password');
  await loginPage.safeType('#password', password);
});

When(/^I click the login button$/, async () => {
  logger.info('Clicking login button');
  await loginPage.safeClick('[data-testid="login-button"]');
});

When(/^I login with email "([^"]*)" and password "([^"]*)"$/, async (email: string, password: string) => {
  logger.info(`Logging in with credentials`, { email });
  await loginPage.login(email, password);
});

When(/^I login with valid credentials$/, async () => {
  const credentials = await browser.execute(() => (window as any).testCredentials);
  if (!credentials) {
    const testUser = dataGenerator.generateUser();
    await loginPage.login(testUser.email, 'Test123!');
  } else {
    await loginPage.login(credentials.email, credentials.password);
  }
});

When(/^I login with invalid credentials$/, async () => {
  logger.info('Attempting login with invalid credentials');
  await loginPage.login('invalid@example.com', 'wrongpassword');
});

When(/^I check the remember me option$/, async () => {
  logger.info('Checking remember me option');
  await loginPage.safeClick('#remember-me');
});

When(/^I click the forgot password link$/, async () => {
  logger.info('Clicking forgot password link');
  await loginPage.clickForgotPassword();
});

When(/^I toggle password visibility$/, async () => {
  logger.info('Toggling password visibility');
  await loginPage.togglePasswordVisibility();
});

Then(/^I should be redirected to the home page$/, async () => {
  logger.info('Verifying redirection to home page');
  await homePage.waitForUrlContains('/dashboard');
  
  const currentUrl = await browser.getUrl();
  expect(currentUrl).toContain('/dashboard');
});

Then(/^I should see a welcome message$/, async () => {
  logger.info('Verifying welcome message');
  const isLoggedIn = await homePage.isUserLoggedIn();
  expect(isLoggedIn).toBe(true);
  
  const welcomeMessage = await homePage.getWelcomeMessage();
  expect(welcomeMessage).toContain('Welcome');
});

Then(/^I should see an error message "([^"]*)"$/, async (expectedMessage: string) => {
  logger.info(`Verifying error message: ${expectedMessage}`);
  await loginPage.waitForVisible('[data-testid="error-message"]');
  
  const errorMessage = await loginPage.getErrorMessage();
  expect(errorMessage).toContain(expectedMessage);
});

Then(/^I should remain on the login page$/, async () => {
  logger.info('Verifying still on login page');
  const currentUrl = await browser.getUrl();
  expect(currentUrl).toContain('/login');
  
  const isFormDisplayed = await loginPage.isLoginFormDisplayed();
  expect(isFormDisplayed).toBe(true);
});

Then(/^the login button should be disabled$/, async () => {
  logger.info('Verifying login button is disabled');
  const isEnabled = await loginPage.isLoginButtonEnabled();
  expect(isEnabled).toBe(false);
});

Then(/^the password should be visible$/, async () => {
  logger.info('Verifying password visibility');
  const isVisible = await loginPage.isPasswordVisible();
  expect(isVisible).toBe(true);
});

Then(/^the password should be hidden$/, async () => {
  logger.info('Verifying password is hidden');
  const isVisible = await loginPage.isPasswordVisible();
  expect(isVisible).toBe(false);
});

Then(/^the remember me option should be checked$/, async () => {
  logger.info('Verifying remember me is checked');
  const isChecked = await loginPage.isRememberMeChecked();
  expect(isChecked).toBe(true);
});

Then(/^I should be redirected to the forgot password page$/, async () => {
  logger.info('Verifying redirection to forgot password page');
  await loginPage.waitForUrlContains('/forgot-password');
  
  const currentUrl = await browser.getUrl();
  expect(currentUrl).toContain('/forgot-password');
});

Then(/^the email field should contain "([^"]*)"$/, async (expectedEmail: string) => {
  logger.info(`Verifying email field contains: ${expectedEmail}`);
  const emailValue = await loginPage.getEmailValue();
  expect(emailValue).toBe(expectedEmail);
});

Then(/^the form should be cleared$/, async () => {
  logger.info('Verifying form is cleared');
  const emailValue = await loginPage.getEmailValue();
  const passwordValue = await loginPage.getPasswordValue();
  
  expect(emailValue).toBe('');
  expect(passwordValue).toBe('');
});

// Data-driven step definitions
When(/^I login with the following credentials:$/, async (dataTable: any) => {
  const data = dataTable.hashes()[0];
  logger.info('Logging in with data table credentials', { email: data.email });
  await loginPage.login(data.email, data.password, data.rememberMe === 'true');
});

// Validation steps
Then(/^the email format should be valid$/, async () => {
  logger.info('Validating email format');
  const email = await loginPage.getEmailValue();
  const isValid = await loginPage.validateEmailFormat(email);
  expect(isValid).toBe(true);
});

Then(/^the email format should be invalid$/, async () => {
  logger.info('Validating email format is invalid');
  const email = await loginPage.getEmailValue();
  const isValid = await loginPage.validateEmailFormat(email);
  expect(isValid).toBe(false);
});

// Performance and accessibility steps
Then(/^the login page should load within (\d+) seconds$/, async (seconds: string) => {
  const maxTime = parseInt(seconds) * 1000;
  logger.info(`Verifying page load time within ${seconds} seconds`);
  
  const startTime = Date.now();
  await loginPage.waitForPageLoad();
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(maxTime);
});

Then(/^the login form should be accessible$/, async () => {
  logger.info('Verifying login form accessibility');
  
  // Check for proper labels
  const emailLabel = await $('label[for="email"]');
  const passwordLabel = await $('label[for="password"]');
  
  expect(await emailLabel.isExisting()).toBe(true);
  expect(await passwordLabel.isExisting()).toBe(true);
  
  // Check for ARIA attributes
  const loginButton = await $('[data-testid="login-button"]');
  const ariaLabel = await loginButton.getAttribute('aria-label');
  expect(ariaLabel).toBeTruthy();
});