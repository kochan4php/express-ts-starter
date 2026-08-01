pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'express_ts_starter'
        DOCKER_REGISTRY = 'my-docker-registry.com'
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
        K8S_CREDENTIALS_ID = 'k8s-kubeconfig'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Secrets Scan') {
            steps {
                // Hard fail on any finding
                sh 'docker run --rm -v "${WORKSPACE}:/path" zricethezav/gitleaks:latest detect --source="/path" -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'pnpm install'
            }
        }

        stage('Lint') {
            steps {
                sh 'pnpm run lint'
            }
        }

        stage('SCA Scan') {
            steps {
                sh 'pnpm audit --audit-level=high'
            }
        }

        stage('SAST') {
            steps {
                sh 'pnpm run sast'
            }
        }

        stage('Test') {
            steps {
                sh 'pnpm run test'
            }
        }

        stage('Build Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${env.BUILD_ID}")
                }
            }
        }

        stage('Container Image Scan') {
            steps {
                // Fail the build on HIGH/CRITICAL vulnerabilities
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 --severity HIGH,CRITICAL ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${env.BUILD_ID}"
            }
        }

        stage('Push Image') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                withKubeConfig([credentialsId: K8S_CREDENTIALS_ID]) {
                    sh "sed -i 's|image: express_ts_starter:latest|image: ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${env.BUILD_ID}|g' k8s/deployment.yaml"
                    // Deploy to a staging namespace (assuming k8s manifests use namespace: staging or we apply it)
                    sh 'kubectl apply -f k8s/configmap.yaml -n staging'
                    sh 'kubectl apply -f k8s/secret.yaml -n staging'
                    sh 'kubectl apply -f k8s/deployment.yaml -n staging'
                    sh 'kubectl apply -f k8s/service.yaml -n staging'
                    sh 'kubectl apply -f k8s/hpa.yaml -n staging'
                    
                    sh 'kubectl rollout status deployment/express-ts-starter -n staging'
                }
            }
        }

        stage('DAST Scan') {
            steps {
                // OWASP ZAP Baseline Scan against the staging environment using OpenAPI spec
                // Assume the service is exposed at http://express-ts-starter.staging.svc.cluster.local:3000
                sh 'docker run -t owasp/zap2docker-stable zap-api-scan.py -t http://express-ts-starter.staging.svc.cluster.local:3000/docs/openapi.yaml -f openapi -l FAIL'
            }
        }

        stage('Deploy to Production') {
            steps {
                withKubeConfig([credentialsId: K8S_CREDENTIALS_ID]) {
                    // Deploy to production after passing DAST
                    sh 'kubectl apply -f k8s/configmap.yaml -n production'
                    sh 'kubectl apply -f k8s/secret.yaml -n production'
                    sh 'kubectl apply -f k8s/deployment.yaml -n production'
                    sh 'kubectl apply -f k8s/service.yaml -n production'
                    sh 'kubectl apply -f k8s/hpa.yaml -n production'
                    
                    sh 'kubectl rollout status deployment/express-ts-starter -n production'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Deployment to production successful!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
