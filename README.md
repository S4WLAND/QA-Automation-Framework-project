# QA Automation Framework

A comprehensive, enterprise-grade test automation framework built with WebDriverIO, Cucumber, TypeScript, and Jest. This framework supports cross-browser testing, API testing, mobile testing, visual regression testing, and performance testing with comprehensive reporting and CI/CD integration.

## 🚀 Features

### Core Testing Capabilities
- **Web Testing**: Cross-browser testing with Chrome, Firefox, Edge, and Safari
- **Mobile Testing**: iOS and Android testing with Appium integration
- **API Testing**: RESTful API testing with comprehensive validation
- **Visual Regression**: Automated visual comparison testing
- **Performance Testing**: Load and performance testing with Artillery
- **Accessibility Testing**: Automated a11y testing with axe-core
- **Security Testing**: Basic security and vulnerability testing

### Framework Features
- **Page Object Model**: Clean, maintainable page object pattern
- **BDD Support**: Cucumber with Gherkin syntax for readable test cases
- **Data-Driven Testing**: Support for CSV, JSON, and Excel data sources
- **Parallel Execution**: Configurable parallel test execution
- **Retry Mechanism**: Automatic retry for flaky tests
- **Screenshot/Video Recording**: Capture on failures and key steps
- **Comprehensive Reporting**: Allure reports with detailed analytics

### DevOps Integration
- **Docker Support**: Containerized testing with Docker Compose
- **CI/CD Ready**: GitHub Actions and Jenkins pipeline configurations
- **Selenium Grid**: Scalable test execution across multiple nodes
- **Cloud Integration**: Ready for cloud testing platforms

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Docker and Docker Compose
- Git
- Chrome, Firefox, Edge browsers (for local execution)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd qa-automation-framework
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
nano .env
```

### 4. Build the Project
```bash
npm run build
```

## 🏃‍♂️ Quick Start

### Running Tests Locally

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit           # Unit tests
npm run test:api            # API tests
npm run test:e2e            # End-to-end tests
npm run test:smoke          # Smoke tests
npm run test:regression     # Regression tests

# Run tests for specific browsers
npm run test:e2e:chrome     # Chrome only
npm run test:e2e:firefox    # Firefox only
npm run test:e2e:edge       # Edge only

# Run tests with different configurations
npm run test:headless       # Headless mode
npm run test:parallel       # Parallel execution
npm run test:mobile         # Mobile tests
```

### Using Docker

```bash
# Start Selenium Grid
npm run grid:start

# Run tests in Docker
npm run docker:test

# Stop Selenium Grid
npm run grid:stop
```

## 📁 Project Structure

```
qa-automation-framework/
├── src/
│   ├── pages/              # Page Object Model classes
│   │   ├── BasePage.ts     # Base page with common functionality
│   │   ├── LoginPage.ts    # Login page object
│   │   └── HomePage.ts     # Home page object
│   ├── steps/              # Cucumber step definitions
│   │   └── LoginSteps.ts   # Login-related steps
│   ├── utils/              # Utility classes and helpers
│   │   ├── Logger.ts       # Logging utility
│   │   ├── WaitUtils.ts    # Wait and synchronization utilities
│   │   ├── ScreenshotUtils.ts # Screenshot utilities
│   │   └── DataGenerator.ts # Test data generation
│   ├── api/                # API testing modules
│   │   └── BaseApiClient.ts # Base API client
│   ├── data/               # Test data files
│   └── config/             # Configuration files
├── features/               # Cucumber feature files
│   ├── smoke/              # Smoke test features
│   ├── regression/         # Regression test features
│   ├── api/                # API test features
│   ├── mobile/             # Mobile test features
│   └── visual/             # Visual regression features
├── tests/                  # Jest unit and integration tests
│   ├── unit/               # Unit tests
│   ├── api/                # API tests
│   └── setup/              # Test setup files
├── reports/                # Test reports and results
├── screenshots/            # Screenshot storage
├── videos/                 # Video recordings
├── fixtures/               # Test fixtures and mock data
├── docker/                 # Docker configuration files
├── .github/                # GitHub Actions workflows
├── performance/            # Performance test configurations
└── docs/                   # Documentation
```

## ⚙️ Configuration

### WebDriverIO Configuration

The framework uses multiple WebDriverIO configuration files:

- `wdio.conf.ts` - Main configuration
- `wdio.mobile.conf.ts` - Mobile testing configuration
- `wdio.visual.conf.ts` - Visual regression testing
- `wdio.a11y.conf.ts` - Accessibility testing

### Environment Variables

Create a `.env` file with the following variables:

```env
# Application URLs
BASE_URL=https://your-app.com
API_BASE_URL=https://api.your-app.com

# Browser Settings
HEADLESS=false
BROWSER_TIMEOUT=30000
PAGE_LOAD_TIMEOUT=30000

# Selenium Grid
SELENIUM_HUB_HOST=localhost
SELENIUM_HUB_PORT=4444

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=testdb
DB_USER=testuser
DB_PASSWORD=testpass

# Test Settings
MAX_INSTANCES=3
LOG_LEVEL=info
RETRY_COUNT=2

# Reporting
ALLURE_RESULTS_DIR=./reports/allure-results
SCREENSHOTS_DIR=./screenshots
VIDEOS_DIR=./videos

# CI/CD
CI=false
BUILD_NUMBER=
BRANCH_NAME=

# Notifications
SLACK_WEBHOOK_URL=
EMAIL_NOTIFICATIONS=true
QA_TEAM_EMAIL=qa-team@company.com
```

## 📝 Writing Tests

### Creating Page Objects

```typescript
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  private selectors = {
    submitButton: '[data-testid="submit-button"]',
    inputField: '#input-field'
  };

  constructor() {
    super('/my-page');
  }

  async fillForm(data: string): Promise<void> {
    await this.safeType(this.selectors.inputField, data);
    await this.safeClick(this.selectors.submitButton);
  }
}
```

### Writing Cucumber Features

```gherkin
@smoke @login
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I login with valid credentials
    Then I should be redirected to the dashboard
    And I should see a welcome message
```

### Writing Step Definitions

```typescript
import { Given, When, Then } from '@wdio/cucumber-framework';
import { LoginPage } from '@pages/LoginPage';

const loginPage = new LoginPage();

Given(/^I am on the login page$/, async () => {
  await loginPage.navigate();
});

When(/^I login with valid credentials$/, async () => {
  await loginPage.login('test@example.com', 'password123');
});
```

### Writing API Tests

```typescript
import { BaseApiClient } from '@api/BaseApiClient';

describe('User API', () => {
  const apiClient = new BaseApiClient('https://api.example.com');

  test('should create a new user', async () => {
    const response = await apiClient.post('/users', {
      name: 'John Doe',
      email: 'john@example.com'
    });

    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
  });
});
```

## 📊 Reporting

### Allure Reports

Generate and view Allure reports:

```bash
# Generate report
npm run report:generate

# Serve report
npm run report:allure

# Open report
npm run report:open
```

### Screenshots and Videos

The framework automatically:
- Takes screenshots on test failures
- Records videos of test execution (configurable)
- Captures full-page screenshots for visual regression
- Organizes media files by test suite and timestamp

## 🐳 Docker Usage

### Development Environment

```bash
# Start development environment
docker-compose up -d

# Run tests in development
docker-compose exec test-runner npm run test:e2e
```

### CI/CD Environment

```bash
# Build and run tests
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

### Selenium Grid

```bash
# Start Selenium Grid with multiple browsers
docker-compose -f docker-compose.grid.yml up -d

# Scale browser nodes
docker-compose -f docker-compose.grid.yml up --scale chrome-node=3 --scale firefox-node=2
```

## 🔄 CI/CD Integration

### GitHub Actions

The framework includes comprehensive GitHub Actions workflows:

- **CI Pipeline**: Code quality, unit tests, integration tests
- **E2E Testing**: Cross-browser testing with parallel execution
- **Mobile Testing**: iOS and Android testing
- **Performance Testing**: Load and performance testing
- **Visual Regression**: Automated visual testing
- **Security Testing**: Security scans and vulnerability testing

### Jenkins

The included Jenkinsfile provides:

- Multi-stage pipeline with parallel execution
- Docker-based test execution
- Comprehensive reporting
- Slack and email notifications
- Artifact management

## 📚 Best Practices

### Test Organization
- Use Page Object Model for maintainable UI tests
- Organize tests by feature/functionality
- Use descriptive test names and scenarios
- Implement proper test data management

### Code Quality
- Follow TypeScript strict mode guidelines
- Use ESLint and Prettier for code formatting
- Implement comprehensive error handling
- Write unit tests for utility functions

### Test Execution
- Use appropriate wait strategies
- Implement retry mechanisms for flaky tests
- Take screenshots on failures
- Use meaningful assertions with custom messages

### CI/CD
- Run tests in parallel when possible
- Use proper test categorization (smoke, regression, etc.)
- Implement proper artifact management
- Set up comprehensive notifications

## 🔧 Troubleshooting

### Common Issues

1. **Browser Driver Issues**
   ```bash
   # Update browser drivers
   npx @wdio/cli install
   ```

2. **Selenium Grid Connection Issues**
   ```bash
   # Check grid status
   curl http://localhost:4444/status
   
   # View grid console
   curl http://localhost:4444/grid/console
   ```

3. **Test Timeouts**
   - Increase timeout values in configuration
   - Check for network connectivity issues
   - Verify application responsiveness

4. **Docker Issues**
   ```bash
   # Clean Docker environment
   docker system prune -a
   
   # Rebuild containers
   docker-compose build --no-cache
   ```

### Debug Mode

```bash
# Run tests in debug mode
DEBUG=true npm run test:e2e

# Run with verbose logging
LOG_LEVEL=debug npm run test:e2e

# Run single test for debugging
npx wdio run ./wdio.conf.ts --spec ./features/login.feature
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the test suite
5. Submit a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Set up pre-commit hooks
npm run setup

# Run tests before committing
npm run pre-commit
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the QA team at stifhlife@gmail.com
- Check the documentation in the `docs/` folder

## 📈 Roadmap

- [ ] Integration with cloud testing platforms (BrowserStack, Sauce Labs)
- [ ] AI-powered test generation
- [ ] Advanced visual regression testing
- [ ] Performance testing enhancements
- [ ] Machine learning for flaky test detection
- [ ] Enhanced mobile testing capabilities
- [ ] Integration with test management tools

---

**Happy Testing! 🎉**