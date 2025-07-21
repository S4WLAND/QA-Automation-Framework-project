import { config as baseConfig } from './src/config/wdio.base.conf';

export const config: WebdriverIO.Config = {
  ...baseConfig,
  
  port: 4723,
  services: ['appium'],
  
  capabilities: [
    {
      platformName: 'iOS',
      'appium:deviceName': 'iPhone 14',
      'appium:platformVersion': '16.0',
      'appium:browserName': 'Safari',
      'appium:automationName': 'XCUITest'
    },
    {
      platformName: 'Android',
      'appium:deviceName': 'Android Emulator',
      'appium:platformVersion': '11.0',
      'appium:browserName': 'Chrome',
      'appium:automationName': 'UiAutomator2'
    }
  ],

  specs: ['./features/mobile/**/*.feature']
};