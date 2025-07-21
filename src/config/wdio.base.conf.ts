import type { Options } from '@wdio/types';
import { Logger } from '../utils/Logger';

const logger = new Logger('WDIO-Base');

export const config: Options.Testrunner = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true
    }
  },

  specs: ['./features/**/*.feature'],
  exclude: [],

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    'selenium-standalone',
    ['visual', {
      compare: {
        baselineFolder: require('path').join(process.cwd(), './screenshots/baseline/'),
        actualFolder: require('path').join(process.cwd(), './screenshots/actual/'),
        diffFolder: require('path').join(process.cwd(), './screenshots/diff/'),
        compareOptions: {
          threshold: 0.2
        }
      }
    }]
  ],

  framework: 'cucumber',
  reporters: [
    'spec',
    ['allure', {
      outputDir: './reports/allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
      useCucumberStepReporter: true
    }]
  ],

  cucumberOpts: {
    require: ['./src/steps/**/*.ts'],
    backtrace: false,
    requireModule: [
      'ts-node/register',
      () => { require('tsconfig-paths/register'); }
    ],
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: 60000,
    ignoreUndefinedDefinitions: false
  },

  // Screenshot settings
  onPrepare: function (config, capabilities) {
    logger.info('Preparing test execution');
    // Create directories
    require('fs').mkdirSync('./screenshots/actual', { recursive: true });
    require('fs').mkdirSync('./screenshots/baseline', { recursive: true });
    require('fs').mkdirSync('./screenshots/diff', { recursive: true });
    require('fs').mkdirSync('./videos', { recursive: true });
    require('fs').mkdirSync('./reports/allure-results', { recursive: true });
  }
};