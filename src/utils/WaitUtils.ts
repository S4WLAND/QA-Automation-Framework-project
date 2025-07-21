import { Logger } from './Logger';

export class WaitUtils {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('WaitUtils');
  }

  /**
   * Wait for element to be present in DOM
   */
  async waitForElementPresent(selector: string, timeout: number = 10000): Promise<WebdriverIO.Element> {
    this.logger.debug(`Waiting for element to be present: ${selector}`);
    const element = await $(selector);
    await element.waitForExist({ timeout });
    return element;
  }

  /**
   * Wait for element to be visible
   */
  async waitForElementVisible(selector: string, timeout: number = 10000): Promise<WebdriverIO.Element> {
    this.logger.debug(`Waiting for element to be visible: ${selector}`);
    const element = await $(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  /**
   * Wait for element to be clickable
   */
  async waitForElementClickable(selector: string, timeout: number = 10000): Promise<WebdriverIO.Element> {
    this.logger.debug(`Waiting for element to be clickable: ${selector}`);
    const element = await $(selector);
    await element.waitForClickable({ timeout });
    return element;
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(selector: string, timeout: number = 10000): Promise<void> {
    this.logger.debug(`Waiting for element to disappear: ${selector}`);
    try {
      const element = await $(selector);
      await element.waitForDisplayed({ timeout, reverse: true });
    } catch (error) {
      // Element might not exist, which is fine
      this.logger.debug(`Element ${selector} not found or already disappeared`);
    }
  }

  /**
   * Wait for text to be present in element
   */
  async waitForTextInElement(selector: string, expectedText: string, timeout: number = 10000): Promise<void> {
    this.logger.debug(`Waiting for text "${expectedText}" in element: ${selector}`);
    await browser.waitUntil(async () => {
      try {
        const element = await $(selector);
        const text = await element.getText();
        return text.includes(expectedText);
      } catch (error) {
        return false;
      }
    }, {
      timeout,
      timeoutMsg: `Text "${expectedText}" not found in element ${selector} within ${timeout}ms`
    });
  }

  /**
   * Wait for attribute value
   */
  async waitForAttributeValue(selector: string, attribute: string, expectedValue: string, timeout: number = 10000): Promise<void> {
    this.logger.debug(`Waiting for attribute "${attribute}" to have value "${expectedValue}" in element: ${selector}`);
    await browser.waitUntil(async () => {
      try {
        const element = await $(selector);
        const value = await element.getAttribute(attribute);
        return value === expectedValue;
      } catch (error) {
        return false;
      }
    }, {
      timeout,
      timeoutMsg: `Attribute "${attribute}" did not have value "${expectedValue}" in element ${selector} within ${timeout}ms`
    });
  }

  /**
   * Wait for URL to contain text
   */
  async waitForUrlContains(text: string, timeout: number = 10000): Promise<void> {
    this.logger.debug(`Waiting for URL to contain: ${text}`);
    await browser.waitUntil(async () => {
      const currentUrl = await browser.getUrl();
      return currentUrl.includes(text);
    }, {
      timeout,
      timeoutMsg: `URL does not contain "${text}" within ${timeout}ms`
    });
  }

  /**
   * Wait for page title to contain text
   */
  async waitForTitleContains(text: string, timeout: number = 10000): Promise<void> {
    this.logger.debug(`Waiting for title to contain: ${text}`);
    await browser.waitUntil(async () => {
      const title = await browser.getTitle();
      return title.includes(text);
    }, {
      timeout,
      timeoutMsg: `Title does not contain "${text}" within ${timeout}ms`
    });
  }

  /**
   * Wait for element count
   */
  async waitForElementCount(selector: string, expectedCount: number, timeout: number = 10000): Promise<void> {
    this.logger.debug(`Waiting for ${expectedCount} elements with selector: ${selector}`);
    await browser.waitUntil(async () => {
      try {
        const elements = await $$(selector);
        return elements.length === expectedCount;
      } catch (error) {
        return false;
      }
    }, {
      timeout,
      timeoutMsg: `Expected ${expectedCount} elements with selector ${selector} within ${timeout}ms`
    });
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    this.logger.debug('Waiting for page to load completely');
    await browser.waitUntil(async () => {
      const readyState = await browser.execute(() => document.readyState);
      return readyState === 'complete';
    }, {
      timeout,
      timeoutMsg: 'Page did not load completely within timeout'
    });

    // Additional wait for any dynamic content
    await browser.waitUntil(async () => {
      const pendingRequests = await browser.execute(() => {
        return window.performance && window.performance.getEntriesByType
          ? window.performance.getEntriesByType('xmlhttprequest').filter((req: any) => req.responseEnd === 0).length
          : 0;
      });
      return pendingRequests === 0;
    }, {
      timeout: 5000,
      timeoutMsg: 'Pending requests did not complete'
    });
  }

  /**
   * Smart wait with multiple conditions
   */
  async smartWait(conditions: Array<() => Promise<boolean>>, timeout: number = 10000): Promise<void> {
    this.logger.debug(`Executing smart wait with ${conditions.length} conditions`);
    await browser.waitUntil(async () => {
      for (const condition of conditions) {
        if (!(await condition())) {
          return false;
        }
      }
      return true;
    }, {
      timeout,
      timeoutMsg: 'Smart wait conditions not met within timeout'
    });
  }

  /**
   * Wait with custom polling interval
   */
  async waitWithPolling(condition: () => Promise<boolean>, timeout: number = 10000, interval: number = 500): Promise<void> {
    this.logger.debug(`Waiting with custom polling interval: ${interval}ms`);
    await browser.waitUntil(condition, {
      timeout,
      interval,
      timeoutMsg: 'Custom wait condition not met within timeout'
    });
  }

  /**
   * Exponential backoff wait
   */
  async waitWithBackoff(condition: () => Promise<boolean>, maxAttempts: number = 5, baseDelay: number = 1000): Promise<void> {
    this.logger.debug(`Waiting with exponential backoff, max attempts: ${maxAttempts}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (await condition()) {
          return;
        }
      } catch (error) {
        this.logger.debug(`Attempt ${attempt} failed: ${error}`);
      }

      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        this.logger.debug(`Waiting ${delay}ms before next attempt`);
        await browser.pause(delay);
      }
    }

    throw new Error(`Condition not met after ${maxAttempts} attempts with exponential backoff`);
  }
}