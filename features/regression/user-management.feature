@regression @user-management
Feature: User Management
  As an administrator
  I want to manage user accounts
  So that I can control access to the application

  Background:
    Given I am logged in as an administrator
    And I am on the user management page

  @critical @crud
  Scenario: Create a new user account
    When I click the "Add New User" button
    And I fill in the user registration form with:
      | firstName | John              |
      | lastName  | Doe               |
      | email     | john.doe@test.com |
      | role      | User              |
    And I click the "Create User" button
    Then I should see a success message "User created successfully"
    And the user should appear in the user list
    And the user should receive a welcome email

  @critical @crud
  Scenario: Edit an existing user
    Given there is an existing user "jane.smith@test.com"
    When I click the edit button for user "jane.smith@test.com"
    And I update the user information:
      | firstName | Jane Updated |
      | role      | Manager      |
    And I click the "Save Changes" button
    Then I should see a success message "User updated successfully"
    And the user list should reflect the changes

  @critical @crud
  Scenario: Delete a user account
    Given there is an existing user "temp.user@test.com"
    When I click the delete button for user "temp.user@test.com"
    And I confirm the deletion in the popup
    Then I should see a success message "User deleted successfully"
    And the user should not appear in the user list

  @critical @crud
  Scenario: Deactivate a user account
    Given there is an active user "active.user@test.com"
    When I click the deactivate button for user "active.user@test.com"
    And I confirm the deactivation
    Then I should see a success message "User deactivated successfully"
    And the user status should show as "Inactive"
    And the user should not be able to login

  @functional @search
  Scenario: Search for users
    Given there are multiple users in the system
    When I enter "john" in the search box
    And I click the search button
    Then I should see only users with "john" in their name or email
    And the search results should be highlighted

  @functional @filter
  Scenario: Filter users by role
    Given there are users with different roles in the system
    When I select "Manager" from the role filter dropdown
    Then I should see only users with the "Manager" role
    And the user count should be updated accordingly

  @functional @pagination
  Scenario: Navigate through user pages
    Given there are more than 50 users in the system
    When I am on the user management page
    Then I should see pagination controls
    When I click the "Next" page button
    Then I should see the next set of users
    And the page indicator should update

  @functional @sorting
  Scenario: Sort users by different criteria
    Given there are multiple users in the system
    When I click on the "Name" column header
    Then the users should be sorted by name in ascending order
    When I click on the "Name" column header again
    Then the users should be sorted by name in descending order

  @validation @negative
  Scenario: Create user with invalid email
    When I click the "Add New User" button
    And I fill in the user registration form with:
      | firstName | John           |
      | lastName  | Doe            |
      | email     | invalid-email  |
      | role      | User           |
    And I click the "Create User" button
    Then I should see an error message "Please enter a valid email address"
    And the user should not be created

  @validation @negative
  Scenario: Create user with duplicate email
    Given there is an existing user "existing@test.com"
    When I click the "Add New User" button
    And I fill in the user registration form with:
      | firstName | Duplicate      |
      | lastName  | User           |
      | email     | existing@test.com |
      | role      | User           |
    And I click the "Create User" button
    Then I should see an error message "Email address already exists"
    And the user should not be created

  @bulk-operations
  Scenario: Bulk delete users
    Given I have selected multiple users from the list
    When I click the "Bulk Actions" dropdown
    And I select "Delete Selected Users"
    And I confirm the bulk deletion
    Then I should see a success message indicating the number of users deleted
    And the selected users should no longer appear in the list

  @bulk-operations
  Scenario: Bulk role assignment
    Given I have selected multiple users from the list
    When I click the "Bulk Actions" dropdown
    And I select "Change Role"
    And I select "Manager" as the new role
    And I confirm the bulk role change
    Then I should see a success message "Roles updated successfully"
    And all selected users should have the "Manager" role

  @export @reporting
  Scenario: Export user list
    Given there are users in the system
    When I click the "Export" button
    And I select "CSV" format
    Then a CSV file should be downloaded
    And the file should contain all user information

  @audit @security
  Scenario: User activity audit trail
    Given I am viewing the audit trail for user "audit.user@test.com"
    When the user has performed various actions
    Then I should see a chronological list of user activities
    And each activity should include timestamp, action, and IP address

  @permissions @security
  Scenario: Role-based access control
    Given I am logged in as a regular user
    When I try to access the user management page
    Then I should see an "Access Denied" message
    And I should be redirected to the dashboard

  @integration @email
  Scenario: Password reset email
    Given there is an existing user "reset.user@test.com"
    When I click the "Send Password Reset" button for the user
    Then I should see a success message "Password reset email sent"
    And the user should receive a password reset email
    And the email should contain a valid reset link

  @performance @load
  Scenario: User list performance with large dataset
    Given there are 10000 users in the system
    When I navigate to the user management page
    Then the page should load within 5 seconds
    And the user list should be properly paginated
    And searching should return results within 2 seconds