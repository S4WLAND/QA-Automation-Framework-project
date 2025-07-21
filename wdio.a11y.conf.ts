import { config as baseConfig } from './src/config/wdio.base.conf';

export const config: WebdriverIO.Config = {
  ...baseConfig,
  
  specs: ['./features/accessibility/**/*.feature'],
  
  before: async function() {
    // Inject axe-core into the page
    const axeSource = require('fs').readFileSync('./node_modules/axe-core/axe.min.js', 'utf8');
    await browser.execute(axeSource);
  }
};