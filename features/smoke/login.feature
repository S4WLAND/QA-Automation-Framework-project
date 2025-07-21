@smoke @login
Feature: User Login
  As a registered user
  I want to be able to login to the application
  So that I can access my account and use the features

  Background:
    Given I am on the login page
    And I am a registered user with email "testuser@example.com" and password "Test123!"

  @critical @happy-path
  Scenario: Successful login with valid credentials
    When I login with email "testuser@example.com" and password "Test123!"
    Then I should be redirected to the home page
    And I should see a welcome message

  @critical @negative
  Scenario: Login with invalid email
    When I login with email "invalid-email" and password "Test123!"
    Then I should see an error message "Please enter a valid email address"
    And I should remain on the login page

  @critical @negative
  Scenario: Login with invalid password
    When I login with email "testuser@example.com" and password "wrongpassword"
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  @negative
  Scenario: Login with empty credentials
    When I click the login button
    Then the login button should be disabled
    And I should remain on the login page

  @functional
  Scenario: Remember me functionality
    When I enter email "testuser@example.com"
    And I enter password "Test123!"
    And I check the remember me option
    And I click the login button
    Then I should be redirected to the home page
    And the remember me option should be checked

  @functional
  Scenario: Password visibility toggle
    When I enter password "Test123!"
    And I toggle password visibility
    Then the password should be visible
    When I toggle password visibility
    Then the password should be hidden

  @functional
  Scenario: Forgot password link
    When I click the forgot password link
    Then I should be redirected to the forgot password page

  @data-driven
  Scenario Outline: Login with different user types
    When I login with email "<email>" and password "<password>"
    Then I should see "<expected_result>"

    Examples:
      | email                 | password    | expected_result           |
      | admin@example.com     | Admin123!   | Welcome Admin             |
      | user@example.com      | User123!    | Welcome User              |
      | manager@example.com   | Manager123! | Welcome Manager           |

  @data-table
  Scenario: Login with data table
    When I login with the following credentials:
      | email               | password | rememberMe |
      | testuser@example.com| Test123! | true       |
    Then I should be redirected to the home page
    And I should see a welcome message

  @validation
  Scenario: Email format validation
    When I enter email "invalid-email-format"
    Then the email format should be invalid
    When I enter email "valid@example.com"
    Then the email format should be valid

  @performance
  Scenario: Login page performance
    Then the login page should load within 3 seconds

  @accessibility
  Scenario: Login form accessibility
    Then the login form should be accessible

  @security
  Scenario: Password field security
    When I enter password "Test123!"
    Then the password should be hidden
    And the password field should have type "password"

  @responsive @mobile
  Scenario: Mobile login experience
    Given I am using a mobile device
    When I login with valid credentials
    Then I should be redirected to the home page
    And the mobile navigation should be visible