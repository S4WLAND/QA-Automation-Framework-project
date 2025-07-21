# Multi-stage build for test automation framework
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Create directories for reports and screenshots
RUN mkdir -p reports screenshots videos logs

# Set permissions
RUN chmod -R 755 reports screenshots videos logs

# Install browsers and drivers
RUN apk add --no-cache chromium firefox

# Set browser environment variables
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV FIREFOX_BIN=/usr/bin/firefox

# Production test runner stage
FROM base AS production

# Install only production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=development /app/dist ./dist
COPY --from=development /app/features ./features
COPY --from=development /app/wdio*.ts ./
COPY --from=development /app/jest*.js ./

# Create directories
RUN mkdir -p reports screenshots videos logs

# Install browsers for production testing
RUN apk add --no-cache chromium firefox curl

# Set browser environment variables
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV FIREFOX_BIN=/usr/bin/firefox
ENV HEADLESS=true
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD ["npm", "run", "test:e2e"]

# Test execution stage for CI/CD
FROM development AS test-runner

# Set environment variables for CI
ENV CI=true
ENV HEADLESS=true
ENV MAX_INSTANCES=3
ENV SELENIUM_HUB_HOST=selenium-hub
ENV SELENIUM_HUB_PORT=4444

# Copy test configuration
COPY docker/test-runner-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# API testing stage
FROM node:18-alpine AS api-tests

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy API test files
COPY src/api ./src/api
COPY tests/api ./tests/api
COPY jest.api.config.js ./
COPY tsconfig.json ./

# Run API tests
CMD ["npm", "run", "test:api"]

# Visual regression testing stage
FROM development AS visual-tests

# Install additional packages for visual testing
RUN npm install --save-dev pixelmatch pngjs

# Copy visual test configuration
COPY wdio.visual.conf.ts ./
COPY tests/visual ./tests/visual

# Set environment for visual testing
ENV VISUAL_TESTING=true

# Run visual tests
CMD ["npm", "run", "test:visual"]

# Mobile testing stage
FROM development AS mobile-tests

# Install Appium and mobile testing dependencies
RUN npm install --save-dev appium @appium/doctor

# Copy mobile test configuration
COPY wdio.mobile.conf.ts ./
COPY tests/mobile ./tests/mobile

# Set environment for mobile testing
ENV MOBILE_TESTING=true

# Run mobile tests
CMD ["npm", "run", "test:mobile"]

# Performance testing stage
FROM node:18-alpine AS performance-tests

WORKDIR /app

# Install Artillery and dependencies
RUN npm install -g artillery

# Copy performance test files
COPY performance ./performance

# Run performance tests
CMD ["artillery", "run", "./performance/load-test.yml"]

# Security testing stage
FROM node:18-alpine AS security-tests

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install security testing tools
RUN npm install --save-dev jest-axe

# Copy security test files
COPY tests/security ./tests/security
COPY jest.security.config.js ./

# Run security tests
CMD ["npm", "run", "test:security"]