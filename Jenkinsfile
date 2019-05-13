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
  [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60', numToKeepStr: '60', artifactNumToKeepStr: '1']],
  [$class: 'GithubProjectProperty', displayName: '', projectUrlStr: 'https://github.com/nuxeo/nuxeo-aspera-connector/']
])

pipeline {
  agent {
    label "jenkins-nodejs"
  }

  environment {
    HELM_CHART_REPOSITORY_NAME = 'local-jenkins-x'
    HELM_RELEASE_NUXEO = 'nuxeo-rest-api-tests'
    K8S_NAMESPACE_NUXEO = 'nuxeo-rest-api-tests'
  }

  stages {
    stage('Test') {
      steps {
        container('nodejs') {
          try {
            echo 'Start a Nuxeo Platform instance'

            // initialize helm without installing Tyler, using the jenkins service account
            sh 'helm init --client-only --service-account jenkins'

            // add local chart repository
            sh "helm repo add \"${HELM_CHART_REPOSITORY_NAME}\" http://jenkins-x-chartmuseum:8080"

            // install the nuxeo chart into a namespace created on the fly so it can be easily cleaned up afterwards
            sh "helm install --name \"${HELM_RELEASE_NUXEO}\" --namespace \"${NUXEO_K8S_NAMESPACE}\" \"${HELM_CHART_REPOSITORY_NAME}\"/nuxeo

            sh "njx k8s rollout --namespace \"${NUXEO_K8S_NAMESPACE}\" deployment \"${NUXEO_K8S_NAMESPACE}-deployment\""

            // check nuxeo chart deployment status
            sh "kubectl rollout status deployment \"${HELM_RELEASE_NUXEO}\"-nuxeo"

            echo 'Run tests with Yarn'
            sh 'yarn'
            sh 'yarn test'
          } finally {
            // clean up Kubernetes namespace
            sh "kubectl delete namespace \"${NUXEO_K8S_NAMESPACE}\""
          }
        }
      }
    }
  }
}
