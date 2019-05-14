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
    HELM_CHART_REPOSITORY_URL = 'http://jenkins-x-chartmuseum:8080'
    HELM_CHART_NUXEO = 'nuxeo'
    HELM_RELEASE_NUXEO = 'rest-api-tests'
    NAMESPACE_NUXEO = 'nuxeo-platform-rest-api-tests'
    SERVICE_NUXEO = "${HELM_RELEASE_NUXEO}-${HELM_CHART_NUXEO}"
    SERVICE_DOMAIN = ".${NAMESPACE_NUXEO}.svc.cluster.local"
    SERVICE_ACCOUNT = 'jenkins'
  }

  stages {
    stage('Test') {
      steps {
        container('nodejs') {
          script {
            def ENV_VARS = [
              "NUXEO_SERVER_URL=http://${SERVICE_NUXEO}${SERVICE_DOMAIN}/nuxeo",
            ];
            withEnv(ENV_VARS) {
              try {
                echo """
                -----------------------------
                Start Nuxeo Platform Instance
                -----------------------------"""

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

                echo """
                -----------------------------
                Run Tests with Yarn
                -----------------------------"""
                sh 'yarn'
                sh 'yarn test'
              } finally {
                // clean up namespace
                sh "kubectl delete namespace ${NAMESPACE_NUXEO}"
              }
            }
          }
        }
      }
    }
  }

  // post {
  //   always {
  //     archive '**/target*/failsafe-reports/*, **/target*/*.png, **/target*/**/*.log, **/target*/**/log/*'
  //   }
  // }
}
