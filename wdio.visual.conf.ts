import { config as baseConfig } from './src/config/wdio.base.conf';

export const config: WebdriverIO.Config = {
  ...baseConfig,
  
  specs: ['./features/visual/**/*.feature'],
  
  services: [
    ...baseConfig.services || [],
    ['visual', {
      compare: {
        baselineFolder: require('path').join(process.cwd(), './screenshots/baseline/'),
        actualFolder: require('path').join(process.cwd(), './screenshots/actual/'),
        diffFolder: require('path').join(process.cwd(), './screenshots/diff/'),
        compareOptions: {
          threshold: 0.2,
          ignoreColors: false,
          ignoreAntialiasing: true,
          ignoreLess: true,
          ignoreNothing: false
        }
      }
    }]
  ]
};