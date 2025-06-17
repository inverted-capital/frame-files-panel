import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ArtifactFrame, ArtifactSyncer } from '@artifact/client/react'
import { HOST_SCOPE } from '@artifact/client/api'
import FilesView from './App.tsx'
import './index.css'

const mockFiles = {
  'readme.txt': 'Hello Artifact',
  'folder/info.txt': 'More info',
  'folder/subfolder/test.txt': 'Test file',
  'folder/subfolder/test2.txt': 'Test file 2'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArtifactFrame
      mockRepos={{ mock: { main: mockFiles } }}
      mockFrameProps={{
        target: { did: HOST_SCOPE.did, repo: 'mock', branch: 'main' }
      }}
    >
      <ArtifactSyncer>
        <FilesView />
      </ArtifactSyncer>
    </ArtifactFrame>
  </StrictMode>
)
