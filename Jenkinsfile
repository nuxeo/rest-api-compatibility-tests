/*
 * (C) Copyright 2020 Nuxeo (http://nuxeo.com/) and others.
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
    reposSource: [$class: 'ManuallyEnteredRepositorySource', url: "${GITHUB_STATUS_REPOSITORY_URL}"],
    commitShaSource: [$class: 'ManuallyEnteredShaSource', sha: "${GITHUB_STATUS_SHA}"],
    contextSource: [$class: 'ManuallyEnteredCommitContextSource', context: context],
    statusResultSource: [$class: 'ConditionalStatusResultSource', results: [[$class: 'AnyBuildResult', message: message, state: state]]],
  ])
}

def isPullRequest() {
  return BRANCH_NAME =~ /PR-.*/
}

def helmAddRepository(name, url) {
  sh "helm3 repo add ${name} ${url}"
}

def helmAddBitnamiRepository() {
  helmAddRepository("${BITNAMI_CHART_REPOSITORY_NAME}", "${BITNAMI_CHART_REPOSITORY_URL}")
}

def helmAddElasticRepository() {
  helmAddRepository("${ELASTIC_CHART_REPOSITORY_NAME}", "${ELASTIC_CHART_REPOSITORY_URL}")
}

def helmAddNuxeoRepository() {
  helmAddRepository("${NUXEO_CHART_REPOSITORY_NAME}", "${NUXEO_CHART_REPOSITORY_URL}")
}

def helmInstall(release, repository, chart, version, namespace, values) {
  sh """
    helm3 install ${release} ${repository}/${chart} \
      --version=${version} \
      --namespace=${namespace} \
      --values=${values}
  """
}

def helmInstallMongoDB() {
  helmInstall("${MONGODB_CHART_NAME}", "${BITNAMI_CHART_REPOSITORY_NAME}", "${MONGODB_CHART_NAME}", "${MONGODB_CHART_VERSION}", "${NAMESPACE}", "${HELM_VALUES_DIR}/values-mongodb.yaml~gen")
}

def helmInstallElasticsearch() {
  helmInstall("${ELASTICSEARCH_CHART_NAME}", "${ELASTIC_CHART_REPOSITORY_NAME}", "${ELASTICSEARCH_CHART_NAME}", "${ELASTICSEARCH_CHART_VERSION}", "${NAMESPACE}", "${HELM_VALUES_DIR}/values-elasticsearch.yaml~gen")
}

def helmInstallKafka() {
  helmInstall("${KAFKA_CHART_NAME}", "${BITNAMI_CHART_REPOSITORY_NAME}", "${KAFKA_CHART_NAME}", "${KAFKA_CHART_VERSION}", "${NAMESPACE}", "${HELM_VALUES_DIR}/values-kafka.yaml~gen")
}

def helmInstallNuxeo() {
  helmInstall("${NUXEO_CHART_NAME}", "${NUXEO_CHART_REPOSITORY_NAME}", "${NUXEO_CHART_NAME}", "${NUXEO_CHART_VERSION}", "${NAMESPACE}", "${HELM_VALUES_DIR}/values-nuxeo.yaml~gen")
}

def helmUninstall(release, namespace) {
  sh "helm3 uninstall ${release} --namespace=${namespace}"
}

def helmUninstallMongoDB() {
  helmUninstall("${MONGODB_CHART_NAME}", "${NAMESPACE}")
}

def helmUninstallElasticsearch() {
  helmUninstall("${ELASTICSEARCH_CHART_NAME}", "${NAMESPACE}")
}

def helmUninstallKafka() {
  helmUninstall("${KAFKA_CHART_NAME}", "${NAMESPACE}")
}

def helmUninstallNuxeo() {
  helmUninstall("${NUXEO_CHART_NAME}", "${NAMESPACE}")
}

def helmGenerateValues() {
  sh """
    for valuesFile in ${HELM_VALUES_DIR}/*.yaml; do
      USAGE=${USAGE} envsubst < \$valuesFile > \$valuesFile~gen
    done
  """
}

def rolloutStatus(kind, name, timeout, namespace) {
  sh """
    kubectl rollout status ${kind} ${name} \
      --timeout=${timeout} \
      --namespace=${namespace}
  """
}

def rolloutStatusMongoDB() {
  rolloutStatus('deployment', "${MONGODB_CHART_NAME}", "${ROLLOUT_STATUS_TIMEOUT}", "${NAMESPACE}")
}

def rolloutStatusElasticsearch() {
  rolloutStatus('statefulset', "${ELASTICSEARCH_CHART_NAME}-master", "${ROLLOUT_STATUS_TIMEOUT}", "${NAMESPACE}")
}

def rolloutStatusKafka() {
  rolloutStatus('statefulset', "${KAFKA_CHART_NAME}", "${ROLLOUT_STATUS_TIMEOUT}", "${NAMESPACE}")
}

def rolloutStatusNuxeo() {
  rolloutStatus('deployment', "${NUXEO_CHART_NAME}", "${ROLLOUT_STATUS_TIMEOUT}", "${NAMESPACE}")
}

def isTriggered() {
  return !currentBuild.upstreamBuilds.isEmpty()
}

def isTriggeredByNuxeoPR() {
  // rely on availability of the NUXEO_REPOSITORY and NUXEO_SHA parameters to know if the build was triggered by a
  // pull request on the upstream repository
  return isTriggered() && params.NUXEO_REPOSITORY?.trim() && params.NUXEO_SHA?.trim()
}

def mustSetGitHubStatus() {
  return !isTriggered() || isTriggeredByNuxeoPR()
}

def upstreamJobName = isTriggered() ? currentBuild.upstreamBuilds[0].getFullProjectName() : null
def upstreamBuildNumber = isTriggered() ? currentBuild.upstreamBuilds[0].getNumber() : null

pipeline {

  agent {
    label "jenkins-nodejs"
  }

  parameters {
    string(name: 'NUXEO_VERSION', defaultValue: '2021.x', description: 'Version of the Nuxeo server image, defaults to 2021.x.')
    string(name: 'NUXEO_REPOSITORY', defaultValue: '', description: 'GitHub repository of the nuxeo project.')
    string(name: 'NUXEO_SHA', defaultValue: '', description: 'Git commit sha of the nuxeo/lts/nuxeo upstream build.')
  }

  environment {
    BITNAMI_CHART_REPOSITORY_NAME = 'bitnami'
    BITNAMI_CHART_REPOSITORY_URL = 'https://charts.bitnami.com/bitnami'
    ELASTIC_CHART_REPOSITORY_NAME = 'elastic'
    ELASTIC_CHART_REPOSITORY_URL = 'https://helm.elastic.co/'
    NUXEO_CHART_REPOSITORY_NAME = 'nuxeo'
    NUXEO_CHART_REPOSITORY_URL = 'https://chartmuseum.platform.dev.nuxeo.com/'
    MONGODB_CHART_NAME = 'mongodb'
    MONGODB_CHART_VERSION = '7.14.2'
    ELASTICSEARCH_CHART_NAME = 'elasticsearch'
    ELASTICSEARCH_CHART_VERSION = '7.9.2'
    KAFKA_CHART_NAME = 'kafka'
    KAFKA_CHART_VERSION = '11.8.8'
    NUXEO_CHART_NAME = 'nuxeo'
    NUXEO_CHART_VERSION = '~2.0.0'
    NUXEO_DOCKER_REPOSITORY = "${isTriggered() ? DOCKER_REGISTRY : PRIVATE_DOCKER_REGISTRY}/nuxeo/nuxeo"
    NUXEO_VERSION = "${params.NUXEO_VERSION}"
    HELM_VALUES_DIR = 'helm'
    NAMESPACE = "nuxeo-rest-api-tests-$BRANCH_NAME-$BUILD_NUMBER".toLowerCase()
    USAGE = 'rest-api-tests'
    ROLLOUT_STATUS_TIMEOUT = '5m'
    SERVICE_DOMAIN = ".${NAMESPACE}.svc.cluster.local"
    GITHUB_STATUS_REPOSITORY_URL = "${isTriggeredByNuxeoPR() ? params.NUXEO_REPOSITORY : repositoryUrl}"
    GITHUB_STATUS_SHA = "${isTriggeredByNuxeoPR() ? params.NUXEO_SHA : GIT_COMMIT}"
    SLACK_CHANNEL = 'platform-notifs'
  }

  stages {

    stage('Set labels') {
      steps {
        container('nodejs') {
          echo """
          ----------------------------------------
          Set Kubernetes resource labels
          ----------------------------------------
          """
          echo "Set label 'branch: ${BRANCH_NAME}' on pod ${NODE_NAME}"
          sh """
            kubectl label pods ${NODE_NAME} branch=${BRANCH_NAME}
          """
        }
      }
    }

    stage('Build info') {
      steps {
        script {
          def buildInfo = """
            ----------------------------------------
            Build information
            ----------------------------------------

            Branch: ${BRANCH_NAME}
          """
          if (isTriggered()) {
            buildInfo += """
            Triggered by: ${upstreamJobName} #${upstreamBuildNumber}
            With parameter NUXEO_VERSION: ${params.NUXEO_VERSION}
            """
          } else {
            buildInfo += """
            Not triggered by an upstream job.
            """
          }
          if (mustSetGitHubStatus()) {
            buildInfo += """
            GITHUB_STATUS_REPOSITORY_URL: ${GITHUB_STATUS_REPOSITORY_URL}
            GITHUB_STATUS_SHA: ${GITHUB_STATUS_SHA}
            """
          }
          echo buildInfo
        }
      }
    }

    stage('Yarn/ESLint') {
      // set GitHub status check only on the REST API tests repository, not on the nuxeo repository when triggered
      steps {
        script {
          if (!isTriggered()) {
            setGitHubBuildStatus('yarn/eslint', 'Install Yarn dependencies and run ESLint', 'PENDING')
          }
          container('nodejs') {
            echo """
            ----------------------------------------
            Install Yarn dependencies and run ESLint
            ----------------------------------------"""
            def nodeVersion = sh(script: 'node -v', returnStdout: true).trim()
            echo "node version: ${nodeVersion}"
            sh 'yarn'
            sh 'yarn lint'
          }
        }
      }
      post {
        success {
          script {
            if (!isTriggered()) {
              setGitHubBuildStatus('yarn/eslint', 'Install Yarn dependencies and run ESLint', 'SUCCESS')
            }
          }
        }
        failure {
          script {
            if (!isTriggered()) {
              setGitHubBuildStatus('yarn/eslint', 'Install Yarn dependencies and run ESLint', 'FAILURE')
            }
          }
        }
      }
    }

    stage('Run REST API tests') {
      // set GitHub status checks on the REST API tests repository or on the nuxeo repository when triggered by a pull request
      steps {
        script {
          if (mustSetGitHubStatus()) {
            setGitHubBuildStatus('restapitests', 'Run REST API tests', 'PENDING')
          }
          container('nodejs') {
            withEnv(["NUXEO_SERVER_URL=http://${NUXEO_CHART_NAME}${SERVICE_DOMAIN}/nuxeo"]) {
              echo """
              -------------------------------------------------------
              Run REST API tests against:
                - ${NUXEO_DOCKER_REPOSITORY}:${NUXEO_VERSION}
                - MongoDB
                - Elasticsearch
                - Kafka
              -------------------------------------------------------"""

              echo 'Create test namespace'
              sh "kubectl create namespace ${NAMESPACE}"

              echo 'Copy image pull secret to test namespace'
              sh "kubectl --namespace=platform get secret kubernetes-docker-cfg -ojsonpath='{.data.\\.dockerconfigjson}' | base64 --decode > /tmp/config.json"
              sh """
                kubectl create secret generic kubernetes-docker-cfg \
                  --namespace=${NAMESPACE} \
                  --from-file=.dockerconfigjson=/tmp/config.json \
                  --type=kubernetes.io/dockerconfigjson --dry-run -o yaml | kubectl apply -f -
              """

              echo 'Add chart repositories'
              helmAddBitnamiRepository()
              helmAddElasticRepository()
              helmAddNuxeoRepository()

              echo 'Substitute environment variables in chart values'
              helmGenerateValues()

              echo 'Install external service releases'
              helmInstallMongoDB()
              helmInstallElasticsearch()
              helmInstallKafka()
              rolloutStatusMongoDB()
              rolloutStatusElasticsearch()
              rolloutStatusKafka()

              echo 'Install nuxeo test release'
              helmInstallNuxeo()
              try {
                rolloutStatusNuxeo()
              } catch (e) {
                sh """
                  kubectl --namespace=${NAMESPACE} get event --sort-by .lastTimestamp
                  kubectl --namespace=${NAMESPACE} get all,configmaps,secrets
                  kubectl --namespace=${NAMESPACE} describe pod --selector=app=${NUXEO_CHART_NAME}
                  kubectl --namespace=${NAMESPACE} logs --selector=app=${NUXEO_CHART_NAME} --tail=1000
                """
                throw e
              }

              echo """
              ------------------
              Run REST API tests
              ------------------"""
              sh 'yarn test'
            }
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
                  script: "kubectl --namespace=${NAMESPACE} get pod --selector=app=${NUXEO_CHART_NAME} --output=custom-columns=NAME:.metadata.name --no-headers",
                  returnStdout: true
                ).trim()
                if (nuxeoPod) {
                  def logFile = 'server.log'
                  sh "kubectl cp ${NAMESPACE}/${nuxeoPod}:/var/log/nuxeo/${logFile} ${logFile}"
                  archiveArtifacts "${logFile}"
                } else {
                  echo "No ${NUXEO_CHART_NAME} pod found in namespace ${NAMESPACE}. Won't archive any artifact."
                }
              } catch (e) {
                echo 'An error occurred while trying to archive artifacts.'
                throw e
              } finally {
                try {
                  helmUninstallNuxeo()
                  helmUninstallElasticsearch()
                  helmUninstallKafka()
                  helmUninstallMongoDB()
                } finally {
                  // clean up namespace
                  sh "kubectl delete namespace ${NAMESPACE} --ignore-not-found=true"
                }
              }
            }
          }
        }
        success {
          script {
            if (mustSetGitHubStatus()) {
              setGitHubBuildStatus('restapitests', 'Run REST API tests', 'SUCCESS')
            }
          }
        }
        failure {
          script {
            if (mustSetGitHubStatus()) {
              setGitHubBuildStatus('restapitests', 'Run REST API tests', 'FAILURE')
            }
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (isTriggered()) {
          currentBuild.description = "Upstream: ${upstreamJobName} #${upstreamBuildNumber}"
        }
        if (!isTriggered() && !isPullRequest()) {
          step([$class: 'JiraIssueUpdater', issueSelector: [$class: 'DefaultIssueSelector'], scm: scm])
        }
      }
    }
    success {
      script {
        if (!isPullRequest() && !isTriggeredByNuxeoPR() && env.DRY_RUN != 'true') {
          if (!hudson.model.Result.SUCCESS.toString().equals(currentBuild.getPreviousBuild()?.getResult())) {
            def triggeredBy = isTriggered() ? ", triggered by ${upstreamJobName} #${upstreamBuildNumber}" : ''
            slackSend(channel: "${SLACK_CHANNEL}", color: 'good', message: "Successfully built nuxeo/rest-api-compatibility-tests ${BRANCH_NAME} #${BUILD_NUMBER}${triggeredBy}: ${BUILD_URL}")
          }
        }
      }
    }
    unsuccessful {
      script {
        if (!isPullRequest() && !isTriggeredByNuxeoPR() && env.DRY_RUN != 'true') {
          def triggeredBy = isTriggered() ? ", triggered by ${upstreamJobName} #${upstreamBuildNumber}" : ''
          slackSend(channel: "${SLACK_CHANNEL}", color: 'danger', message: "Failed to build nuxeo/rest-api-compatibility-tests ${BRANCH_NAME} #${BUILD_NUMBER}${triggeredBy}: ${BUILD_URL}")
        }
      }
    }
  }
}
