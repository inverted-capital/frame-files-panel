import { useState, useRef } from 'react'
import { File, Upload } from 'lucide-react'
import { useArtifact, useDir, useFile, useMeta } from '@artifact/client/hooks'
import CommitBanner from './components/CommitBanner.tsx'
import NavigationBar from './components/NavigationBar.tsx'
import FileList, { type FileItem } from './components/FileList.tsx'
import FileDetails from './components/FileDetails.tsx'

export default function App() {
  const artifact = useArtifact()
  const [currentPath, setCurrentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showFileDetails, setShowFileDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const folderContents = useDir(currentPath || '.')

  const filePath = selectedFile || ''
  const fileData = useFile(filePath)
  const fileMeta = useMeta(filePath)

  if (!artifact) {
    return <div className="p-6">Loading...</div>
  }
  const handleCreateFile = async () => {
    const name = prompt('Enter new file name')
    if (!name) return
    const path = currentPath ? `${currentPath}/${name}` : name
    artifact.files.write.text(path, '')
    if (artifact.files.isDirty()) {
      await artifact.branch.write.commit(`Add file ${name}`)
    }
  }

  const handleCreateFolder = async () => {
    const name = prompt('Enter new folder name')
    if (!name) return
    const dir = currentPath ? `${currentPath}/${name}` : name
    artifact.files.write.text(`${dir}/.gitkeep`, '')
    if (artifact.files.isDirty()) {
      await artifact.branch.write.commit(`Add folder ${name}`)
    }
  }

  const handleItemClick = (item: FileItem, clickCount: number) => {
    const path = currentPath ? `${currentPath}/${item.name}` : item.name

    if (item.isFolder) {
      if (clickCount > 1) {
        setCurrentPath(path)
        setShowFileDetails(false)
        setSelectedFile(null)
        return
      }
    }

    if (selectedFile === path) {
      setSelectedFile(null)
      setShowFileDetails(false)
    } else {
      setSelectedFile(path)
      setShowFileDetails(true)
    }
  }

  const handleNavigateUp = () => {
    const parts = currentPath.split('/')
    parts.pop()
    setCurrentPath(parts.join('/'))
    setSelectedFile(null)
    setShowFileDetails(false)
  }

  const handleNavigateTo = (path: string) => {
    setCurrentPath(path)
    setSelectedFile(null)
    setShowFileDetails(false)
  }

  const isAtRoot = !currentPath

  return (
    <div className="p-6 animate-fadeIn h-full flex flex-col">
      <CommitBanner />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <File className="mr-2" size={24} />
          Files
        </h1>
        <div className="flex gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            onClick={handleCreateFile}
          >
            New File
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            onClick={handleCreateFolder}
          >
            New Folder
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} className="mr-2" />
            Upload
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = e.target.files
            if (!files) return
            for (const file of files) {
              const data = new Uint8Array(await file.arrayBuffer())
              const path = currentPath
                ? `${currentPath}/${file.name}`
                : file.name
              artifact.files.write.binary(path, data)
            }
            if (artifact.files.isDirty()) {
              await artifact.branch.write.commit('Upload files')
            }
            e.target.value = ''
          }}
        />
      </div>

      <NavigationBar
        currentPath={currentPath}
        isAtRoot={isAtRoot}
        onNavigateUp={handleNavigateUp}
        onNavigateTo={handleNavigateTo}
      />

      <div className="flex flex-1 ">
        <div
          className={`${showFileDetails && selectedFile ? 'w-1/2' : 'w-full'} overflow-auto`}
        >
          <FileList
            folderContents={folderContents}
            currentPath={currentPath}
            selectedFile={selectedFile}
            onItemClick={handleItemClick}
          />
        </div>

        {showFileDetails && selectedFile && (
          <FileDetails
            selectedFile={selectedFile}
            fileData={fileData}
            fileMeta={fileMeta}
            onClose={() => setShowFileDetails(false)}
            onRename={(newPath) => setSelectedFile(newPath)}
          />
        )}
      </div>
    </div>
  )
}
