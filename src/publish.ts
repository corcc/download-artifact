import * as core from '@actions/core'
import {Inputs} from './constants'
import gitStatus from 'git-status'
import {execSync} from 'child_process'

export async function publish(): Promise<void> {
  try {
    const getV = function (name: string) {
      const fromEnv = function () {
        return execSync(`echo $${name}`).toString()
      }
      let _a: any
      try {
        _a = core.getInput(Inputs[name], {required: false})
      } catch (e) {
        core.warning(e)
        _a = fromEnv()
      }
      _a = _a ? _a : fromEnv()
      return _a
    }
    const CommitMessage = getV('CommitMessage')
    const GITHUB_ACTOR = getV('GITHUB_ACTOR')
    const GITHUB_TOKEN = getV('GITHUB_TOKEN')
    const GITHUB_REPOSITORY = getV('GITHUB_REPOSITORY')
    const GITHUB_SHA = getV('GITHUB_SHA')
    const REMOTE_REPO = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`
    const BRANCH_NAME = getV('BRANCH_NAME')
    let TIMEZONE = getV('TIMEZONE')
    TIMEZONE = TIMEZONE ? TIMEZONE : 'Asia/Tokyo'
    process.env.TZ = TIMEZONE
    gitStatus(
      gitStatus.parseWithLineEndingWarnings((err: any, data: any) => {
        if (data) {
          core.info(execSync('git config http.sslVerify false').toString())
          core.info(
            execSync('git config user.name "Automated Publisher"').toString()
          )
          core.info(
            execSync(
              'git config user.email "actions@users.noreply.github.com"'
            ).toString()
          )
          execSync(`git remote add publisher "${REMOTE_REPO}"`).toString()
          core.info(execSync('git show - ref').toString())
          core.info(execSync('git branch--verbose').toString())
          core.info(execSync(`git add .`).toString())
          core.info(execSync(`git branch --verbose`).toString())
          core.info(execSync(`git checkout "${BRANCH_NAME}"`).toString())
          core.info(execSync(`git add -A`).toString())
          core.info(
            execSync(
              `git commit -m "${CommitMessage} ${execSync(
                `date`
              ).toString()} ${GITHUB_SHA}" || exit 0`
            ).toString()
          )
          core.info(execSync('git pull--rebase').toString())
          core.info(
            execSync(`git pull--rebase publisher "${BRANCH_NAME}"`).toString()
          )
          core.info(execSync(`git push publisher "${BRANCH_NAME}"`).toString())
        }
        console.log('parseWithLineEndingWarnings\n', err || data)
      })
    )
  } catch (err) {
    core.setFailed(err.message)
  }
}
