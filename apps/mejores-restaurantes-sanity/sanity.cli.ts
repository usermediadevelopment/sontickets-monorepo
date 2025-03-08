import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '7d9e3dzz',
    dataset: process.env.SANITY_STUDIO_API_DATASET || 'production',
  },
  /**
   * Enable auto-updates for studios.

   */
  autoUpdates: true,
})
