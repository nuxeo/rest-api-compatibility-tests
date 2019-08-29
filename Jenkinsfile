pipeline {
  agent {
    label "jenkins-jx-base"
  }
  stages {
    stage('Test workspace') {
      steps {
        container('jx-base') {
          sleep(100000)
        }
      }
    }
  }
}
