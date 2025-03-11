import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '7d9e3dzz',
    dataset: process.env.SANITY_STUDIO_API_DATASET,
  },
  autoUpdates: true,
  studioHost: process.env.SANITY_STUDIO_HOST,
})
