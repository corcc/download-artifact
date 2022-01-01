import {command} from './command'
import {download} from './download-artifact'
import {publish} from './publish'
;(async function () {
  await download()
  await command()
  await publish()
})()
