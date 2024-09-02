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
library identifier: "platform-ci-shared-library@v0.0.38"

repositoryUrl = 'https://github.com/nuxeo/rest-api-compatibility-tests/'

void setGitHubBuildStatus(String context, String message, String state) {
  nxGitHub.setStatus(repositoryUrl: env.GITHUB_STATUS_REPOSITORY_URL, commitSha: env.GITHUB_STATUS_SHA, context: context, message: message, state: state)
}

def hasUpstream() {
  return !currentBuild.upstreamBuilds.isEmpty()
}

def hasNuxeoVersionParameter() {
  return params.NUXEO_VERSION?.trim()
}

def hasNuxeoGitParameters() {
  return params.NUXEO_REPOSITORY?.trim() && params.NUXEO_SHA?.trim()
}

def isTriggered() {
  // rely on availability of the NUXEO_VERSION parameter to know if the build was triggered by a
  // build of the reference branch on the upstream repository
  return hasNuxeoVersionParameter()
}

def isTriggeredByNuxeoPR() {
  // rely on availability of the NUXEO_REPOSITORY and NUXEO_SHA parameters to know if the build was triggered by a
  // pull request on the upstream repository
  return hasNuxeoGitParameters()
}

def mustSetGitHubStatus() {
  return !isTriggered() || isTriggeredByNuxeoPR()
}

def upstreamJobName = hasUpstream() ? currentBuild.upstreamBuilds[0].getFullProjectName() : null
def upstreamBuildNumber = hasUpstream() ? currentBuild.upstreamBuilds[0].getNumber() : null

pipeline {

  agent {
    label "jenkins-nodejs"
  }

  options {
    buildDiscarder(logRotator(daysToKeepStr: '60', numToKeepStr: '60', artifactNumToKeepStr: '5'))
    githubProjectProperty(projectUrlStr: repositoryUrl)
  }

  parameters {
    string(name: 'NUXEO_VERSION', defaultValue: '', description: 'Version of the Nuxeo server image, defaults to 2021.x.')
    string(name: 'NUXEO_REPOSITORY', defaultValue: '', description: 'GitHub repository of the nuxeo project.')
    string(name: 'NUXEO_SHA', defaultValue: '', description: 'Git commit sha of the nuxeo/lts/nuxeo upstream build.')
  }

  environment {
    NUXEO_DOCKER_REPOSITORY = "${isTriggered() ? DOCKER_REGISTRY : PRIVATE_DOCKER_REGISTRY}/nuxeo/nuxeo"
    NUXEO_VERSION = "${hasNuxeoVersionParameter() ? params.NUXEO_VERSION : '2021.x'}"
    NUXEO_LTS_JOB = 'nuxeo/lts/nuxeo'
    NAMESPACE = "nuxeo-rest-api-tests-$BRANCH_NAME-$BUILD_NUMBER".toLowerCase()
    GITHUB_STATUS_REPOSITORY_URL = "${isTriggeredByNuxeoPR() ? params.NUXEO_REPOSITORY : repositoryUrl}"
    GITHUB_STATUS_SHA = "${isTriggeredByNuxeoPR() ? params.NUXEO_SHA : GIT_COMMIT}"
  }

  stages {

    stage('Set labels') {
      steps {
        container('nodejs') {
          script {
            nxK8s.setPodLabels()
          }
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
            if (hasUpstream()) {
              buildInfo += """
            Triggered by: ${upstreamJobName} #${upstreamBuildNumber}
            """
            } else {
              buildInfo += """
            Originally triggered by a ${NUXEO_LTS_JOB} upstream build.
            """
            }
            buildInfo += """
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
            echo """
            -------------------------------------------------------
            Run REST API tests against:
              - ${NUXEO_DOCKER_REPOSITORY}:${NUXEO_VERSION}
              - MongoDB
              - Elasticsearch
              - Kafka
            -------------------------------------------------------"""
            nxWithHelmfileDeployment(namespace: env.NAMESPACE, envVars: ["NUXEO_SERVER_URL=http://nuxeo.${NAMESPACE}.svc.cluster.local/nuxeo"]) {
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
          def upstream = hasUpstream() ? "${upstreamJobName} #${upstreamBuildNumber}" : "${NUXEO_LTS_JOB}"
          currentBuild.description = "Upstream: ${upstream}"
        }
        if (!isTriggered()) {
          nxJira.updateIssues()
        }
      }
    }
    success {
      script {
        if (!nxUtils.isPullRequest() && !isTriggeredByNuxeoPR()) {
          if (!hudson.model.Result.SUCCESS.toString().equals(currentBuild.getPreviousBuild()?.getResult())) {
            def triggeredBy = isTriggered() ? ", triggered by ${upstreamJobName} #${upstreamBuildNumber}" : ''
            nxSlack.success(message: "Successfully built nuxeo/rest-api-compatibility-tests ${BRANCH_NAME} #${BUILD_NUMBER}${triggeredBy}: ${BUILD_URL}")
          }
        }
      }
    }
    unsuccessful {
      script {
        if (!nxUtils.isPullRequest() && !isTriggeredByNuxeoPR()) {
          def triggeredBy = isTriggered() ? ", triggered by ${upstreamJobName} #${upstreamBuildNumber}" : ''
          nxSlack.error(message: "Failed to build nuxeo/rest-api-compatibility-tests ${BRANCH_NAME} #${BUILD_NUMBER}${triggeredBy}: ${BUILD_URL}")
        }
      }
    }
  }
}
