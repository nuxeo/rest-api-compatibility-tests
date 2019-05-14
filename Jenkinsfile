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
properties([
  [$class: 'GithubProjectProperty', projectUrlStr: 'https://github.com/nuxeo/rest-api-compatibility-tests/'],
  [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60', numToKeepStr: '60', artifactNumToKeepStr: '5']],
])

void setGitHubBuildStatus(String message, String state) {
  step([
    $class: 'GitHubCommitStatusSetter',
    reposSource: [$class: 'ManuallyEnteredRepositorySource', url: 'https://github.com/nuxeo/rest-api-compatibility-tests'],
    contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: 'nuxeo/master'],
    statusResultSource: [$class: 'ConditionalStatusResultSource', results: [[$class: 'AnyBuildResult', message: message, state: state]]],
  ]);
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
    NAMESPACE_NUXEO = 'nuxeo-platform-rest-api-tests'
    SERVICE_NUXEO = "${HELM_RELEASE_NUXEO}-${HELM_CHART_NUXEO}"
    SERVICE_DOMAIN = ".${NAMESPACE_NUXEO}.svc.cluster.local"
    SERVICE_ACCOUNT = 'jenkins'
  }
  stages {
    stage('Install and start Nuxeo Platform') {
      steps {
        setGitHubBuildStatus('Install and start Nuxeo Platform', 'PENDING')
        container('nodejs') {
          echo """
          --------------------------------
          Install and start Nuxeo Platform
          --------------------------------"""

          // initialize Helm without installing Tyler
          sh "helm init --client-only --service-account ${SERVICE_ACCOUNT}"

          // add local chart repository
          sh "helm repo add ${HELM_CHART_REPOSITORY_NAME} ${HELM_CHART_REPOSITORY_URL}"

          // install the nuxeo chart into a dedicated namespace that will be cleaned up afterwards
          // use 'jx step helm install' to avoid 'Error: could not find tiller' when running 'helm install'
          sh """
            jx step helm install ${HELM_CHART_REPOSITORY_NAME}/${HELM_CHART_NUXEO} \
              --name ${HELM_RELEASE_NUXEO} \
              --set tags.postgresql=true \
              --namespace ${NAMESPACE_NUXEO}
            """

          // check nuxeo chart deployment status
          sh "kubectl rollout status deployment ${SERVICE_NUXEO} --namespace ${NAMESPACE_NUXEO}"
        }
      }
    }
    stage('Run tests with Yarn') {
      steps {
        setGitHubBuildStatus('Run tests with Yarn', 'PENDING')
        container('nodejs') {
          withEnv([ "NUXEO_SERVER_URL=http://${SERVICE_NUXEO}${SERVICE_DOMAIN}/nuxeo"]) {
            echo """
            -----------------------------
            Run tests with Yarn
            -----------------------------"""
            sh 'yarn'
            sh 'yarn test'
          }
        }
      }
    }
  }
  post {
    always {
      // archive Nuxeo server logs
      // archiveArtifacts '**/target*/failsafe-reports/*, **/target*/*.png, **/target*/**/*.log, **/target*/**/log/*'

      // clean up namespace
      sh "kubectl delete namespace ${NAMESPACE_NUXEO}"

      // JIRA
      step([$class: 'JiraIssueUpdater', issueSelector: [$class: 'DefaultIssueSelector'], scm: scm])
    }
    success {
      setGitHubBuildStatus('REST API tests succeeded against nuxeo/master', 'SUCCESS')
    }
    failure {
      setGitHubBuildStatus('REST API tests failed against nuxeo/master', 'FAILURE')
    }
  }
}
