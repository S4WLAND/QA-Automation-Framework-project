import { Logger } from '@utils/Logger';
import { WaitUtils } from '@utils/WaitUtils';
import { ScreenshotUtils } from '@utils/ScreenshotUtils';

export abstract class BasePage {
  protected logger: Logger;
  protected waitUtils: WaitUtils;
  protected screenshotUtils: ScreenshotUtils;
  protected url: string;

  constructor(url: string = '') {
    this.url = url;
    this.logger = new Logger(this.constructor.name);
    this.waitUtils = new WaitUtils();
    this.screenshotUtils = new ScreenshotUtils();
  }

  /**
   * Navigate to the page
   */
  async navigate(): Promise<void> {
    this.logger.info(`Navigating to: ${this.url}`);
    await browser.url(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await browser.waitUntil(async () => {
      const readyState = await browser.execute(() => document.readyState);
      return readyState === 'complete';
    }, {
      timeout: 30000,
      timeoutMsg: 'Page did not load completely within 30 seconds'
    });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await browser.getTitle();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return await browser.getUrl();
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    const element = await $(selector);
    await element.scrollIntoView();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name?: string): Promise<void> {
    await this.screenshotUtils.takeScreenshot(name || this.constructor.name);
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(selector: string, timeout: number = 10000): Promise<WebdriverIO.Element> {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  /**
   * Wait for element to be clickable
   */
  async waitForClickable(selector: string, timeout: number = 10000): Promise<WebdriverIO.Element> {
    const element = await $(selector);
    await element.waitForClickable({ timeout });
    return element;
  }

  /**
   * Safe click with retry mechanism
   */
  async safeClick(selector: string, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        const element = await this.waitForClickable(selector);
        await element.click();
        this.logger.info(`Successfully clicked element: ${selector}`);
        return;
      } catch (error) {
        this.logger.warn(`Click attempt ${i + 1} failed for ${selector}: ${error}`);
        if (i === retries - 1) throw error;
        await browser.pause(1000);
      }
    }
  }

  /**
   * Safe type with clear
   */
  async safeType(selector: string, text: string): Promise<void> {
    const element = await this.waitForVisible(selector);
    await element.clearValue();
    await element.setValue(text);
    this.logger.info(`Successfully typed text into element: ${selector}`);
  }

  /**
   * Get element text with wait
   */
  async getTextContent(selector: string): Promise<string> {
    const element = await this.waitForVisible(selector);
    return await element.getText();
  }

  /**
   * Check if element exists
   */
  async isElementPresent(selector: string): Promise<boolean> {
    try {
      const elements = await $$(selector);
      return elements.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    try {
      const element = await $(selector);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(sourceSelector: string, targetSelector: string): Promise<void> {
    const source = await $(sourceSelector);
    const target = await $(targetSelector);
    await source.dragAndDrop(target);
  }

  /**
   * Upload file
   */
  async uploadFile(inputSelector: string, filePath: string): Promise<void> {
    const fileInput = await $(inputSelector);
    await fileInput.setValue(filePath);
  }

  /**
   * Switch to frame
   */
  async switchToFrame(frameSelector: string): Promise<void> {
    const frame = await $(frameSelector);
    await browser.switchToFrame(frame);
  }

  /**
   * Switch back to default content
   */
  async switchToDefaultContent(): Promise<void> {
    await browser.switchToFrame(null);
  }

  /**
   * Execute JavaScript
   */
  async executeScript(script: string, ...args: any[]): Promise<any> {
    return await browser.execute(script, ...args);
  }

  /**
   * Wait for text to be present
   */
  async waitForText(selector: string, expectedText: string, timeout: number = 10000): Promise<void> {
    await browser.waitUntil(async () => {
      const element = await $(selector);
      const text = await element.getText();
      return text.includes(expectedText);
    }, {
      timeout,
      timeoutMsg: `Text "${expectedText}" not found in element ${selector} within ${timeout}ms`
    });
  }

  /**
   * Hover over element
   */
  async hoverOver(selector: string): Promise<void> {
    const element = await this.waitForVisible(selector);
    await element.moveTo();
  }

  /**
   * Get attribute value
   */
  async getAttribute(selector: string, attributeName: string): Promise<string | null> {
    const element = await this.waitForVisible(selector);
    return await element.getAttribute(attributeName);
  }

  /**
   * Wait for URL to contain text
   */
  async waitForUrlContains(text: string, timeout: number = 10000): Promise<void> {
    await browser.waitUntil(async () => {
      const currentUrl = await browser.getUrl();
      return currentUrl.includes(text);
    }, {
      timeout,
      timeoutMsg: `URL does not contain "${text}" within ${timeout}ms`
    });
  }
}

export { BasePage }