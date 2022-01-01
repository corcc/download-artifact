import * as core from '@actions/core'
import {Inputs} from './constants'
import {execSync} from 'child_process'

export async function command(): Promise<void> {
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
    const RunCommand = getV('RunCommand')
    core.info(execSync(RunCommand).toString())
  } catch (err) {
    core.setFailed(err.message)
  }
}
