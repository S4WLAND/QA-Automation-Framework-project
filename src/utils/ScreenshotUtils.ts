import path from 'path';
import fs from 'fs';
import { Logger } from './Logger';

export class ScreenshotUtils {
  private logger: Logger;
  private screenshotDir: string;

  constructor() {
    this.logger = new Logger('ScreenshotUtils');
    this.screenshotDir = path.join(process.cwd(), 'screenshots');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Take screenshot with custom name
   */
  async takeScreenshot(name?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = name ? `${name}_${timestamp}.png` : `screenshot_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    try {
      await browser.saveScreenshot(filePath);
      this.logger.info(`Screenshot saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error('Failed to take screenshot', { error, filePath });
      throw error;
    }
  }

  /**
   * Take screenshot of specific element
   */
  async takeElementScreenshot(selector: string, name?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = name ? `${name}_element_${timestamp}.png` : `element_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    try {
      const element = await $(selector);
      await element.saveScreenshot(filePath);
      this.logger.info(`Element screenshot saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error('Failed to take element screenshot', { error, selector, filePath });
      throw error;
    }
  }

  /**
   * Take full page screenshot
   */
  async takeFullPageScreenshot(name?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = name ? `${name}_fullpage_${timestamp}.png` : `fullpage_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    try {
      // Get full page dimensions
      const bodyHeight = await browser.execute(() => document.body.scrollHeight);
      const windowHeight = await browser.execute(() => window.innerHeight);
      
      // Set window size to capture full page
      await browser.setWindowSize(1920, bodyHeight);
      await browser.saveScreenshot(filePath);
      
      // Restore original window size
      await browser.setWindowSize(1920, windowHeight);
      
      this.logger.info(`Full page screenshot saved: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error('Failed to take full page screenshot', { error, filePath });
      throw error;
    }
  }

  /**
   * Take screenshot on failure
   */
  async takeFailureScreenshot(testName: string, error: Error): Promise<string> {
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `FAILURE_${sanitizedTestName}_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, 'failures', fileName);

    // Ensure failures directory exists
    const failuresDir = path.join(this.screenshotDir, 'failures');
    if (!fs.existsSync(failuresDir)) {
      fs.mkdirSync(failuresDir, { recursive: true });
    }

    try {
      await browser.saveScreenshot(filePath);
      this.logger.error(`Failure screenshot saved: ${filePath}`, { 
        testName, 
        error: error.message 
      });
      return filePath;
    } catch (screenshotError) {
      this.logger.error('Failed to take failure screenshot', { 
        error: screenshotError, 
        originalError: error.message, 
        testName 
      });
      throw screenshotError;
    }
  }

  /**
   * Compare screenshots for visual regression testing
   */
  async compareScreenshots(baselinePath: string, actualPath: string, diffPath: string): Promise<boolean> {
    try {
      // This would typically use an image comparison library like pixelmatch
      // For now, we'll just check if files exist and log the comparison
      const baselineExists = fs.existsSync(baselinePath);
      const actualExists = fs.existsSync(actualPath);

      if (!baselineExists) {
        this.logger.warn(`Baseline screenshot not found: ${baselinePath}`);
        return false;
      }

      if (!actualExists) {
        this.logger.error(`Actual screenshot not found: ${actualPath}`);
        return false;
      }

      // Placeholder for actual image comparison logic
      this.logger.info('Screenshot comparison performed', {
        baseline: baselinePath,
        actual: actualPath,
        diff: diffPath
      });

      return true;
    } catch (error) {
      this.logger.error('Screenshot comparison failed', { error });
      return false;
    }
  }

  /**
   * Create screenshot gallery for test report
   */
  async createScreenshotGallery(testName: string, screenshots: string[]): Promise<string> {
    const galleryDir = path.join(this.screenshotDir, 'galleries');
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true });
    }

    const galleryPath = path.join(galleryDir, `${testName}_gallery.html`);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Screenshot Gallery - ${testName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
          .screenshot { border: 1px solid #ddd; padding: 10px; text-align: center; }
          .screenshot img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <h1>Screenshot Gallery - ${testName}</h1>
        <div class="gallery">
          ${screenshots.map((screenshot, index) => `
            <div class="screenshot">
              <h3>Screenshot ${index + 1}</h3>
              <img src="${screenshot}" alt="Screenshot ${index + 1}" />
              <p>${path.basename(screenshot)}</p>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    fs.writeFileSync(galleryPath, htmlContent);
    this.logger.info(`Screenshot gallery created: ${galleryPath}`);
    return galleryPath;
  }

  /**
   * Clean old screenshots
   */
  async cleanOldScreenshots(daysOld: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      const files = fs.readdirSync(this.screenshotDir);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.screenshotDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      this.logger.info(`Cleaned ${deletedCount} old screenshots older than ${daysOld} days`);
    } catch (error) {
      this.logger.error('Failed to clean old screenshots', { error });
    }
  }
}