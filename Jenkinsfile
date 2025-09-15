/*
 * (C) Copyright 2020-2025 Nuxeo (http://nuxeo.com/) and others.
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
library identifier: "platform-ci-shared-library@v0.0.72"

def getFirstBuildCause(String className) {
  def upstreamCauses = currentBuild.getBuildCauses(className) ?: []
  if (!upstreamCauses.isEmpty()) {
    return upstreamCauses[0]
  }
  return null
}

def hasUpstream() {
  return !currentBuild.upstreamBuilds.isEmpty()
}

def hasNuxeoVersionParameter() {
  return params.NUXEO_VERSION?.trim()
}

def hasGitHubStatusParameters() {
  return params.GITHUB_STATUS_REPOSITORY_URL?.trim() && params.GITHUB_STATUS_COMMIT_SHA?.trim()
}

def isTriggered() {
  return getFirstBuildCause('org.jenkinsci.plugins.workflow.support.steps.build.BuildUpstreamCause') != null
}

def isTriggeredByNuxeoPR() {
  def upstreamCause = getFirstBuildCause('org.jenkinsci.plugins.workflow.support.steps.build.BuildUpstreamCause')
  return upstreamCause?.upstreamProject?.contains('PR-')
}

def mustNotifyBuildStatus() {
  return !isTriggeredByNuxeoPR() && !(env.NUXEO_VERSION ==~ /^.+PR-.+$/)
}

def upstreamJobName = hasUpstream() ? currentBuild.upstreamBuilds[0].getFullProjectName() : null
def upstreamBuildNumber = hasUpstream() ? currentBuild.upstreamBuilds[0].getNumber() : null

pipeline {

  agent {
    label "jenkins-nodejs"
  }

  options {
    buildDiscarder(logRotator(daysToKeepStr: '60', numToKeepStr: '60', artifactNumToKeepStr: '5'))
    githubProjectProperty(projectUrlStr: 'https://github.com/nuxeo/rest-api-compatibility-tests/')
  }

  parameters {
    string(name: 'NUXEO_VERSION', defaultValue: '', description: 'Version of the Nuxeo server image, defaults to 2021.x.')
    hidden(name: 'GITHUB_STATUS_REPOSITORY_URL', defaultValue: '', description: 'GitHub repository of the nuxeo project.')
    hidden(name: 'GITHUB_STATUS_COMMIT_SHA', defaultValue: '', description: 'Git commit sha of the nuxeo/lts/nuxeo upstream build.')
  }

  environment {
    NUXEO_DOCKER_REPOSITORY = "${isTriggered() ? DOCKER_REGISTRY : PRIVATE_DOCKER_REGISTRY}/nuxeo/nuxeo"
    NUXEO_VERSION = "${hasNuxeoVersionParameter() ? params.NUXEO_VERSION : '2023.x'}"
    NUXEO_LTS_JOB = 'nuxeo/lts/nuxeo'
    NAMESPACE = "nuxeo-rest-api-tests-$BRANCH_NAME-$BUILD_NUMBER".toLowerCase()
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
          if (hasGitHubStatusParameters()) {
            buildInfo += """
            GITHUB_STATUS_REPOSITORY_URL: ${params.GITHUB_STATUS_REPOSITORY_URL}
            GITHUB_STATUS_COMMIT_SHA: ${params.GITHUB_STATUS_COMMIT_SHA}
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
            nxGitHub.setStatus(context: 'yarn/eslint', message: 'Install Yarn dependencies and run ESLint', state: 'PENDING')
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
              nxGitHub.setStatus(context: 'yarn/eslint', message: 'Install Yarn dependencies and run ESLint', state: 'SUCCESS')
            }
          }
        }
        failure {
          script {
            if (!isTriggered()) {
              nxGitHub.setStatus(context: 'yarn/eslint', message: 'Install Yarn dependencies and run ESLint', state: 'FAILURE')
            }
          }
        }
      }
    }

    stage('Run REST API tests') {
      steps {
        script {
          def nuxeoHelmfileRef = nxDocker.getLabel(image: "${NUXEO_DOCKER_REPOSITORY}:${NUXEO_VERSION}", label: 'org.nuxeo.scm-ref')
          nxWithGitHubStatus(context: 'restapitests', message: 'Run REST API tests', state: 'PENDING') {
            container('nodejs') {
              echo """
              -------------------------------------------------------
              Run REST API tests against:
                - ${NUXEO_DOCKER_REPOSITORY}:${NUXEO_VERSION}
                - MongoDB
                - Elasticsearch
                - Kafka
              -------------------------------------------------------"""
              nxWithHelmfileDeployment(namespace: env.NAMESPACE, envVars: [
                "NUXEO_HELMFILE_REF=${nuxeoHelmfileRef}",
                "NUXEO_SERVER_URL=http://nuxeo.${NAMESPACE}.svc.cluster.local/nuxeo",
              ]) {
                echo """
                ------------------
                Run REST API tests
                ------------------"""
                sh 'yarn test'
              }
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
        if (mustNotifyBuildStatus()) {
          nxUtils.callIfBuildRecoverOrFail(
            success: {
              nxTeams.success(
                message: "Successfully built ${currentBuild.fullProjectName}",
                changes: true,
              )},
            error: {
              nxTeams.error(
                message: "Failed to build ${currentBuild.fullProjectName}",
                changes: true,
                culprits: true,
              )},
            buildGroupComputer: {
              build ->
                def versionParameter = nxBuildWrapper(build).getParameterValue("NUXEO_VERSION") ?: '2023.0'
                return nxUtils.getMajorVersion(version: versionParameter)
            }
          )
        }
      }
    }
  }
}
