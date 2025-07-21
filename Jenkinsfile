pipeline {
    agent {
        label 'docker'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 2, unit: 'HOURS')
        parallelsAlwaysFailFast()
        skipStagesAfterUnstable()
    }
    
    environment {
        NODE_VERSION = '18'
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'qa-automation-framework'
        SELENIUM_HUB_HOST = 'selenium-hub'
        SELENIUM_HUB_PORT = '4444'
        HEADLESS = 'true'
        CI = 'true'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Setup') {
            parallel {
                stage('Install Dependencies') {
                    steps {
                        script {
                            docker.image("node:${NODE_VERSION}").inside {
                                sh '''
                                    npm ci
                                    npm run build
                                '''
                            }
                        }
                    }
                }
                
                stage('Start Infrastructure') {
                    steps {
                        script {
                            sh '''
                                docker-compose -f docker-compose.grid.yml up -d
                                echo "Waiting for Selenium Grid to be ready..."
                                timeout 120 bash -c 'until curl -s http://localhost:4444/status; do sleep 2; done'
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        script {
                            docker.image("node:${NODE_VERSION}").inside {
                                sh 'npm run lint:check'
                            }
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'reports/lint',
                                reportFiles: 'index.html',
                                reportName: 'ESLint Report'
                            ])
                        }
                    }
                }
                
                stage('Format Check') {
                    steps {
                        script {
                            docker.image("node:${NODE_VERSION}").inside {
                                sh 'npm run format:check'
                            }
                        }
                    }
                }
                
                stage('Security Audit') {
                    steps {
                        script {
                            docker.image("node:${NODE_VERSION}").inside {
                                sh '''
                                    npm audit --audit-level high --json > reports/security-audit.json || true
                                    npm run test:security
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'reports/security-audit.json', fingerprint: true
                        }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                script {
                    docker.image("node:${NODE_VERSION}").inside {
                        sh 'npm run test:unit:coverage'
                    }
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'reports/unit/junit.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                    step([$class: 'CoberturaPublisher',
                          autoUpdateHealth: false,
                          autoUpdateStability: false,
                          coberturaReportFile: 'reports/coverage/cobertura-coverage.xml',
                          failUnhealthy: false,
                          failUnstable: false,
                          maxNumberOfBuilds: 0,
                          onlyStable: false,
                          sourceEncoding: 'ASCII',
                          zoomCoverageChart: false])
                }
            }
        }
        
        stage('API Tests') {
            steps {
                script {
                    docker.image("node:${NODE_VERSION}").inside {
                        sh '''
                            # Start test database
                            docker run -d --name test-db -p 3306:3306 \
                                -e MYSQL_ROOT_PASSWORD=rootpass \
                                -e MYSQL_DATABASE=testdb \
                                mysql:8.0
                            
                            # Wait for database
                            sleep 30
                            
                            # Run API tests
                            npm run test:api
                        '''
                    }
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'reports/api/junit.xml'
                    script {
                        sh 'docker rm -f test-db || true'
                    }
                }
            }
        }
        
        stage('E2E Tests') {
            parallel {
                stage('Chrome Tests') {
                    steps {
                        script {
                            docker.image("node:${NODE_VERSION}").inside("--link selenium-hub:selenium-hub") {
                                sh '''
                                    export SELENIUM_HUB_HOST=selenium-hub
                                    npm run test:e2e:chrome
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'reports/e2e/chrome/junit.xml'
                            archiveArtifacts artifacts: 'screenshots/**/*.png', allowEmptyArchive: true
                            archiveArtifacts artifacts: 'videos/**/*.mp4', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Firefox Tests') {
                    steps {
                        script {
                            docker.image("node:${NODE_VERSION}").inside("--link selenium-hub:selenium-hub") {
                                sh '''
                                    export SELENIUM_HUB_HOST=selenium-hub
                                    npm run test:e2e:firefox
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'reports/e2e/firefox/junit.xml'
                        }
                    }
                }
                
                stage('Edge Tests') {
                    when {
                        anyOf {
                            branch 'main'
                            branch 'release/*'
                        }
                    }
                    steps {
                        script {
                            docker.image("node:${NODE_VERSION}").inside("--link selenium-hub:selenium-hub") {
                                sh '''
                                    export SELENIUM_HUB_HOST=selenium-hub
                                    npm run test:e2e:edge
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'reports/e2e/edge/junit.xml'
                        }
                    }
                }
            }
        }
        
        stage('Mobile Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    docker.image("node:${NODE_VERSION}").inside {
                        sh '''
                            # Start Appium server
                            npm install -g appium
                            appium --allow-insecure chromedriver_autodownload &
                            sleep 10
                            
                            # Run mobile tests
                            npm run test:e2e:mobile
                        '''
                    }
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'reports/mobile/junit.xml'
                }
            }
        }
        
        stage('Performance Tests') {
            when {
                anyOf {
                    branch 'main'
                    changeRequest()
                }
            }
            steps {
                script {
                    sh '''
                        docker run --rm \
                            -v $(pwd)/performance:/scripts \
                            -v $(pwd)/reports:/reports \
                            artilleryio/artillery:latest \
                            run /scripts/load-test.yml
                    '''
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports/performance',
                        reportFiles: 'report.html',
                        reportName: 'Performance Test Report'
                    ])
                }
            }
        }
        
        stage('Visual Regression Tests') {
            when {
                anyOf {
                    branch 'main'
                    changeRequest()
                }
            }
            steps {
                script {
                    docker.image("node:${NODE_VERSION}").inside("--link selenium-hub:selenium-hub") {
                        sh '''
                            export SELENIUM_HUB_HOST=selenium-hub
                            npm run test:visual
                        '''
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'screenshots/diff',
                        reportFiles: '*.html',
                        reportName: 'Visual Regression Report'
                    ])
                }
            }
        }
        
        stage('Build Docker Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_TAG}")
                    docker.withRegistry("https://${DOCKER_REGISTRY}") {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                script {
                    sh '''
                        # Combine all test results
                        mkdir -p allure-results
                        find reports/ -name "allure-results" -type d -exec cp -r {}/* allure-results/ \\; 2>/dev/null || true
                        
                        # Generate Allure report
                        docker run --rm \
                            -v $(pwd)/allure-results:/app/allure-results \
                            -v $(pwd)/allure-reports:/app/allure-reports \
                            frankescobar/allure-docker-service \
                            allure generate /app/allure-results -o /app/allure-reports --clean
                    '''
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-reports',
                        reportFiles: 'index.html',
                        reportName: 'Allure Test Report'
                    ])
                    
                    // Archive all reports
                    archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'allure-reports/**/*', allowEmptyArchive: true
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Cleanup
                sh '''
                    docker-compose -f docker-compose.grid.yml down || true
                    docker system prune -f || true
                '''
            }
        }
        
        success {
            script {
                // Send success notification
                slackSend(
                    channel: '#qa-team',
                    color: 'good',
                    message: """
                        ✅ Test Pipeline Success
                        Job: ${env.JOB_NAME}
                        Build: ${env.BUILD_NUMBER}
                        Branch: ${env.BRANCH_NAME}
                        Commit: ${env.GIT_COMMIT_SHORT}
                        Duration: ${currentBuild.durationString}
                        
                        Reports: ${env.BUILD_URL}
                    """
                )
            }
        }
        
        failure {
            script {
                // Send failure notification
                slackSend(
                    channel: '#qa-team',
                    color: 'danger',
                    message: """
                        ❌ Test Pipeline Failed
                        Job: ${env.JOB_NAME}
                        Build: ${env.BUILD_NUMBER}
                        Branch: ${env.BRANCH_NAME}
                        Commit: ${env.GIT_COMMIT_SHORT}
                        Duration: ${currentBuild.durationString}
                        
                        Logs: ${env.BUILD_URL}console
                        Reports: ${env.BUILD_URL}
                    """
                )
                
                // Send email notification
                emailext(
                    subject: "Test Pipeline Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                    body: """
                        The test pipeline has failed.
                        
                        Job: ${env.JOB_NAME}
                        Build: ${env.BUILD_NUMBER}
                        Branch: ${env.BRANCH_NAME}
                        Commit: ${env.GIT_COMMIT_SHORT}
                        
                        Please check the build logs: ${env.BUILD_URL}console
                    """,
                    to: '${env.QA_TEAM_EMAIL}'
                )
            }
        }
        
        unstable {
            script {
                slackSend(
                    channel: '#qa-team',
                    color: 'warning',
                    message: """
                        ⚠️ Test Pipeline Unstable
                        Job: ${env.JOB_NAME}
                        Build: ${env.BUILD_NUMBER}
                        Branch: ${env.BRANCH_NAME}
                        Some tests failed but build continued.
                        
                        Reports: ${env.BUILD_URL}
                    """
                )
            }
        }
    }
}