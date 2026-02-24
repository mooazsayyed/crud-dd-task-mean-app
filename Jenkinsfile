pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'mooazsayyed'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/crud-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/crud-frontend"
        EC2_HOST = 'ubuntu@3.108.45.200'
        GIT_SHORT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_SHORT_SHA}"
    }

    triggers {
        pollSCM('* * * * *')
    }

    stages {
        stage('Cleanup') {
            steps {
                cleanWs()
                checkout scm
            }
        }

        stage('Build Images') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                        }
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                    sh "docker logout"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_HOST} '
                            cd ~/crud-dd-task-mean-app &&
                            docker pull ${BACKEND_IMAGE}:${IMAGE_TAG} &&
                            docker pull ${FRONTEND_IMAGE}:${IMAGE_TAG} &&
                            sed -i "s|${BACKEND_IMAGE}:.*|${BACKEND_IMAGE}:${IMAGE_TAG}|" docker-compose.yml &&
                            sed -i "s|${FRONTEND_IMAGE}:.*|${FRONTEND_IMAGE}:${IMAGE_TAG}|" docker-compose.yml &&
                            docker-compose down &&
                            docker-compose up -d
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi ${BACKEND_IMAGE}:${IMAGE_TAG} || true"
            sh "docker rmi ${FRONTEND_IMAGE}:${IMAGE_TAG} || true"
        }
    }
}
