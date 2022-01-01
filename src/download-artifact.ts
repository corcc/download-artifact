import * as core from '@actions/core'
import * as artifact from '@actions/artifact'
import * as os from 'os'
import {resolve} from 'path'
import {Inputs, Outputs} from './constants'

export async function download(): Promise<void> {
  try {
    const ArtifactName = core.getInput(Inputs.ArtifactName, {required: true})
    const ArtifactPath = core.getInput(Inputs.ArtifactPath, {required: true})
    // const ArtifactPath = core.getInput(Inputs.Path, {required: false})

    let resolvedArtifactPath
    // resolve tilde expansions, ArtifactPath.replace only replaces the first occurrence of a pattern
    if (ArtifactPath.startsWith(`~`)) {
      resolvedArtifactPath = resolve(ArtifactPath.replace('~', os.homedir()))
    } else {
      resolvedArtifactPath = resolve(ArtifactPath)
    }
    core.debug(`Resolved ArtifactPath is ${resolvedArtifactPath}`)

    const artifactClient = artifact.create()
    if (!ArtifactName) {
      // download all artifacts
      core.info('No artifact ArtifactName specified, downloading all artifacts')
      core.info(
        'Creating an extra directory for each artifact that is being downloaded'
      )
      const downloadResponse = await artifactClient.downloadAllArtifacts(
        resolvedArtifactPath
      )
      core.info(`There were ${downloadResponse.length} artifacts downloaded`)
      for (const artifact of downloadResponse) {
        core.info(
          `Artifact ${artifact.artifactName} was downloaded to ${artifact.downloadPath}`
        )
      }
    } else {
      // download a single artifact
      core.info(`Starting download for ${ArtifactName}`)
      const downloadOptions = {
        createArtifactFolder: false
      }
      const downloadResponse = await artifactClient.downloadArtifact(
        ArtifactName,
        resolvedArtifactPath,
        downloadOptions
      )
      core.info(
        `Artifact ${downloadResponse.artifactName} was downloaded to ${downloadResponse.downloadPath}`
      )
    }
    // output the directory that the artifact(s) was/were downloaded to
    // if no ArtifactPath is provided, an empty string resolves to the current working directory
    core.setOutput(Outputs.DownloadPath, resolvedArtifactPath)
    core.info('Artifact download has finished successfully')
  } catch (err) {
    core.setFailed(err.message)
  }
}
