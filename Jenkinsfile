/*
 * (C) Copyright 2019 Nuxeo (http://nuxeo.com/) and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Contributors:
 *     Antoine Taillefer <ataillefer@nuxeo.com>
 */
repositoryUrl = 'https://github.com/nuxeo/rest-api-compatibility-tests/'

properties([
  [$class: 'GithubProjectProperty', projectUrlStr: repositoryUrl],
  [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60', numToKeepStr: '60', artifactNumToKeepStr: '5']],
])

void setGitHubBuildStatus(String context, String message, String state) {
  step([
    $class: 'GitHubCommitStatusSetter',
    reposSource: [$class: 'ManuallyEnteredRepositorySource', url: repositoryUrl],
    contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: context],
    statusResultSource: [$class: 'ConditionalStatusResultSource', results: [[$class: 'AnyBuildResult', message: message, state: state]]],
  ])
}

pipeline {
  agent {
    label "jenkins-nodejs"
  }
  environment {
    HELM_CHART_REPOSITORY_NAME = 'local-jenkins-x'
    HELM_CHART_REPOSITORY_URL = 'http://jenkins-x-chartmuseum:8080'
    HELM_CHART_NUXEO = 'nuxeo'
    HELM_RELEASE_NUXEO = 'rest-api-tests'
    NAMESPACE_NUXEO = "nuxeo-platform-rest-api-tests-${BUILD_NUMBER}"
    SERVICE_NUXEO = "${HELM_RELEASE_NUXEO}-${HELM_CHART_NUXEO}"
    SERVICE_DOMAIN = ".${NAMESPACE_NUXEO}.svc.cluster.local"
  }
  stages {
    stage('Yarn/ESLint') {
      steps {
        container('nodejs') {
          echo """
          ----------------------------------------
          Install Yarn dependencies and run ESLint
          ----------------------------------------"""
          script {
            def nodeVersion = sh(script: 'node -v', returnStdout: true).trim()
            echo "node version: ${nodeVersion}"
          }
          sh 'yarn'
          sh 'yarn lint'
        }
      }
      post {
        success {
          setGitHubBuildStatus('yarn/eslint', 'Install Yarn dependencies and run ESLint', 'SUCCESS')
        }
        failure {
          setGitHubBuildStatus('yarn/eslint', 'Install Yarn dependencies and run ESLint', 'FAILURE')
        }
      }
    }
    stage('Run REST API tests') {
      steps {
        setGitHubBuildStatus('master/mongodb/elasticsearch', 'Run REST API tests', 'PENDING')
        container('nodejs') {
          withEnv(["NUXEO_SERVER_URL=http://${SERVICE_NUXEO}${SERVICE_DOMAIN}/nuxeo"]) {
            echo """
            -------------------------------------------------------
            Install and start nuxeo/master/mongodb/elasticsearch
            -------------------------------------------------------"""

            // initialize Helm without installing Tiller
            sh 'helm init --client-only'

            // add local chart repository
            sh "helm repo add ${HELM_CHART_REPOSITORY_NAME} ${HELM_CHART_REPOSITORY_URL}"

            // install the nuxeo chart into a dedicated namespace that will be cleaned up afterwards
            // use 'jx step helm install' to avoid 'Error: could not find tiller' when running 'helm install'
            sh """
              jx step helm install ${HELM_CHART_REPOSITORY_NAME}/${HELM_CHART_NUXEO} \
                --name ${HELM_RELEASE_NUXEO} \
                --set tags.mongodb=true \
                --set tags.elasticsearch=true \
                --set nuxeo.image.tag=11.x \
                --namespace ${NAMESPACE_NUXEO}
              """

            // check nuxeo chart deployment status
            sh "kubectl rollout status deployment ${SERVICE_NUXEO} --namespace ${NAMESPACE_NUXEO}"

            echo """
            ------------------
            Run REST API tests
            ------------------"""
            sh 'yarn test'
          }
        }
      }
      post {
        always {
          container('nodejs') {
            script {
              try {
                // archive Nuxeo server logs
                def nuxeoPod = sh(
                  script: "kubectl get pod -n ${NAMESPACE_NUXEO} -o custom-columns=NAME:.metadata.name | grep ${SERVICE_NUXEO}",
                  returnStdout: true
                ).trim()
                if (nuxeoPod) {
                  def logFile = 'server.log'
                  sh "kubectl cp ${NAMESPACE_NUXEO}/${nuxeoPod}:/var/log/nuxeo/${logFile} ."
                  archiveArtifacts "${logFile}"
                } else {
                  echo "No pod found in namespace ${NAMESPACE_NUXEO} for the ${SERVICE_NUXEO} service. Won't archive any artifact."
                }
              } catch (e) {
                echo 'An error occurred while trying to archive artifacts.'
                throw e
              } finally {
                // clean up namespace
                sh "kubectl delete namespace ${NAMESPACE_NUXEO} --ignore-not-found=true"
              }
            }
          }
        }
        success {
          setGitHubBuildStatus('master/mongodb/elasticsearch', 'Run REST API tests', 'SUCCESS')
        }
        failure {
          setGitHubBuildStatus('master/mongodb/elasticsearch', 'Run REST API tests', 'FAILURE')
        }
      }
    }
  }
  post {
    always {
      script {
        if (BRANCH_NAME == 'master') {
          // update JIRA issue
          step([$class: 'JiraIssueUpdater', issueSelector: [$class: 'DefaultIssueSelector'], scm: scm])
        }
      }
    }
  }
}
