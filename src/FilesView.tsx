import React, { useState, useEffect } from 'react'
import { File, Upload } from 'lucide-react'
import { useArtifact, useDir, useFile, useMeta } from '@artifact/client/hooks'
import BranchSelector from './components/BranchSelector.tsx'
import NavigationBar from './components/NavigationBar.tsx'
import FileList, { type FileItem } from './components/FileList.tsx'
import FileDetails from './components/FileDetails.tsx'

const FilesView: React.FC = () => {
  const artifact = useArtifact()
  const scope = artifact.scope as { repo: string; branch: string }

  const [currentPath, setCurrentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [branches, setBranches] = useState<string[]>([])
  const [showFileDetails, setShowFileDetails] = useState(false)

  const folderContents = useDir(currentPath || '.') || []

  const filePath = selectedFile || ''
  const fileData = useFile(filePath)
  const fileMeta = useMeta(filePath)

  useEffect(() => {
    let ignore = false
    artifact.repo.branches
      .ls()
      .then((b) => {
        if (!ignore) setBranches(b)
      })
      .catch(() => {
        if (!ignore) setBranches([])
      })
    return () => {
      ignore = true
    }
  }, [artifact])

  const handleBranchChange = (branchName: string) => {
    artifact.checkout({ branch: branchName })
  }

  const handleItemClick = (item: FileItem) => {
    if (item.isFolder) {
      setCurrentPath(currentPath ? currentPath + '/' + item.name : item.name)
      setShowFileDetails(false)
      setSelectedFile(null)
    } else {
      const fullPath = currentPath ? currentPath + '/' + item.name : item.name
      if (selectedFile === fullPath) {
        setSelectedFile(null)
        setShowFileDetails(false)
      } else {
        setSelectedFile(fullPath)
        setShowFileDetails(true)
      }
    }
  }

  const handleNavigateUp = () => {
    const parts = currentPath.split('/')
    parts.pop()
    setCurrentPath(parts.join('/'))
    setSelectedFile(null)
    setShowFileDetails(false)
  }

  const currentBranch = scope.branch
  const currentRepo = scope.repo
  const availableBranches = branches.map((b) => ({
    name: b,
    isDefault: b === currentBranch
  }))

  const isAtRoot = !currentPath

  return (
    <div className="animate-fadeIn h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <File className="mr-2" size={24} />
          Files
        </h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Upload size={16} className="mr-2" />
          Upload
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <BranchSelector
            currentBranch={currentBranch}
            branches={availableBranches}
            onChange={handleBranchChange}
          />
        </div>
      </div>

      {currentRepo && (
        <NavigationBar
          currentRepo={currentRepo}
          currentPath={currentPath}
          isAtRoot={isAtRoot}
          onNavigateUp={handleNavigateUp}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${showFileDetails && selectedFile ? 'w-1/2' : 'w-full'} overflow-auto`}
        >
          <FileList
            folderContents={folderContents}
            currentPath={currentPath}
            selectedFile={selectedFile}
            currentBranch={currentBranch}
            onItemClick={handleItemClick}
          />
        </div>

        {showFileDetails && selectedFile && (
          <FileDetails
            selectedFile={selectedFile}
            currentRepo={currentRepo}
            currentBranch={currentBranch}
            fileData={fileData}
            fileMeta={fileMeta}
            onClose={() => setShowFileDetails(false)}
          />
        )}
      </div>
    </div>
  )
}

export default FilesView
