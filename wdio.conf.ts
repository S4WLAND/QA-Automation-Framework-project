import { config as baseConfig } from './src/config/wdio.base.conf';
import { Logger } from './src/utils/Logger';

const logger = new Logger('WDIO-Main');

export const config: WebdriverIO.Config = {
  ...baseConfig,
  
  // Test execution settings
  maxInstances: process.env.MAX_INSTANCES ? parseInt(process.env.MAX_INSTANCES) : 3,
  
  // Capabilities for different browsers
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080',
          ...(process.env.HEADLESS === 'true' ? ['--headless'] : [])
        ]
      }
    },
    {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: [
          '--width=1920',
          '--height=1080',
          ...(process.env.HEADLESS === 'true' ? ['--headless'] : [])
        ]
      }
    },
    {
      browserName: 'MicrosoftEdge',
      'ms:edgeOptions': {
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1920,1080',
          ...(process.env.HEADLESS === 'true' ? ['--headless'] : [])
        ]
      }
    }
  ],

  // Test suites
  suites: {
    smoke: ['./features/smoke/**/*.feature'],
    regression: ['./features/regression/**/*.feature'],
    api: ['./features/api/**/*.feature'],
    chrome: ['./features/**/*.feature'],
    firefox: ['./features/**/*.feature'],
    edge: ['./features/**/*.feature']
  },

  // Hooks
  before: async function(capabilities, specs) {
    logger.info('Starting test execution', { capabilities, specs });
    await import('./src/utils/GlobalSetup').then(module => module.setupGlobal());
  },

  after: async function(result, capabilities, specs) {
    logger.info('Test execution completed', { result, capabilities, specs });
    await import('./src/utils/GlobalTeardown').then(module => module.teardownGlobal());
  },

  beforeTest: async function(test, context) {
    logger.info('Starting test case', { test: test.title });
  },

  afterTest: async function(test, context, { error, result, duration, passed, retries }) {
    if (error) {
      logger.error('Test failed', { test: test.title, error: error.message });
      await browser.takeScreenshot();
    } else {
      logger.info('Test passed', { test: test.title, duration });
    }
  }
};