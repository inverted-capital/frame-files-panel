import React, { useState, useEffect, useRef } from 'react'
import {
  File,
  Upload,
  Code,
  GitBranch,
  ChevronDown,
  FileText,
  Edit,
  Download,
  ArrowUp,
  Folder,
  ChevronRight
} from 'lucide-react'
import { useArtifact, useDir, useFile, useMeta } from '@artifact/client/hooks'

interface FileItem {
  name: string
  path: string
  isFolder: boolean
}

const FilesView: React.FC = () => {
  const artifact = useArtifact()
  const scope = artifact.scope as { repo: string; branch: string }

  const [currentPath, setCurrentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showBranchDropdown, setShowBranchDropdown] = useState(false)
  const [branches, setBranches] = useState<string[]>([])
  const [showFileDetails, setShowFileDetails] = useState(false)
  const branchDropdownRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBranchDropdown(false)
      }
    }

    if (showBranchDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showBranchDropdown])

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '-'
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const handleBranchChange = (branchName: string) => {
    artifact.checkout({ branch: branchName })
    setShowBranchDropdown(false)
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
    setShowBranchDropdown(false)
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
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <div className="relative" ref={branchDropdownRef}>
              <button
                type="button"
                className="flex items-center justify-between w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              >
                <div className="flex items-center">
                  <GitBranch size={16} className="text-gray-500 mr-2" />
                  <span>{currentBranch}</span>
                </div>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {showBranchDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200">
                  <ul className="py-1 max-h-60 overflow-auto">
                    {availableBranches.map((branch) => (
                      <li
                        key={branch.name}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center ${
                          branch.name === currentBranch
                            ? 'bg-blue-50 text-blue-700'
                            : ''
                        }`}
                        onClick={() => handleBranchChange(branch.name)}
                      >
                        {branch.name}
                        {branch.isDefault && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">
                            default
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentRepo && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center">
          <div className="flex items-center">
            <button
              onClick={handleNavigateUp}
              disabled={isAtRoot}
              className={`flex items-center mr-3 px-2 py-1 rounded transition-colors ${
                isAtRoot
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
              }`}
            >
              <ArrowUp size={16} className="mr-1" />
              <span>Up</span>
            </button>
            
            <span className="text-gray-500 mr-2">Path:</span>
            <button className="flex items-center text-blue-600 hover:text-blue-800 mr-1">
              <Code size={16} className="mr-1" />
              <span className="font-medium">{currentRepo}</span>
            </button>
            
            {currentPath && (
              <>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-600">{currentPath}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${showFileDetails && selectedFile ? 'w-1/2' : 'w-full'} overflow-auto`}
        >
          {folderContents.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-2">
                <File size={40} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {currentPath ? 'Empty Folder' : 'No Files Found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {currentPath
                  ? 'This folder is empty'
                  : `This repository doesn't have any files in the ${currentBranch} branch`}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium text-gray-500 text-sm border-b border-gray-200">
                <div className="col-span-5">Name</div>
                <div className="col-span-3">Modified</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Size</div>
              </div>

              <div className="overflow-auto">
                {[...folderContents]
                  .sort((a, b) => {
                    if (a.type === 'tree' && b.type !== 'tree') return -1
                    if (a.type !== 'tree' && b.type === 'tree') return 1
                    return a.path.localeCompare(b.path)
                  })
                  .map((meta) => {
                    const item: FileItem = {
                      name: meta.path,
                      path: currentPath
                        ? currentPath + '/' + meta.path
                        : meta.path,
                      isFolder: meta.type === 'tree'
                    }
                    return (
                      <div
                        key={item.path}
                        className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          item.path === selectedFile
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : ''
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="col-span-5 flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                            {item.isFolder ? (
                              <Folder size={16} className="text-blue-500" />
                            ) : (
                              <File size={16} className="text-gray-500" />
                            )}
                          </div>
                          <span className="truncate flex items-center">
                            {item.name}
                            {item.isFolder && (
                              <ChevronRight
                                size={16}
                                className="ml-1 text-gray-400"
                              />
                            )}
                          </span>
                        </div>
                        <div className="col-span-3 text-gray-500 flex items-center text-sm">
                          -
                        </div>
                        <div className="col-span-2 text-gray-500 flex items-center text-sm uppercase">
                          {item.isFolder ? 'folder' : 'file'}
                        </div>
                        <div className="col-span-2 text-gray-500 flex items-center text-sm">
                          -
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

        {showFileDetails && selectedFile && (
          <div className="w-1/2 pl-4 overflow-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <File size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">
                      {selectedFile.split('/').pop()}
                    </h3>
                    <div className="text-sm text-gray-500">{selectedFile}</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowFileDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium mb-2">File Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Type</div>
                  <div className="uppercase">
                    {fileMeta && fileMeta.type === 'tree' ? 'folder' : 'file'}
                  </div>

                  <div className="text-gray-500">Size</div>
                  <div>{formatFileSize(fileData?.byteLength || 0)}</div>

                  <div className="text-gray-500">Modified</div>
                  <div>-</div>

                  <div className="text-gray-500">Path</div>
                  <div>{selectedFile}</div>

                  <div className="text-gray-500">Repository</div>
                  <div>{currentRepo}</div>

                  <div className="text-gray-500">Branch</div>
                  <div>{currentBranch}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md flex items-center text-sm hover:bg-blue-100">
                    <FileText size={14} className="mr-1" />
                    View Content
                  </button>
                  <button className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md flex items-center text-sm hover:bg-purple-100">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </button>
                  <button className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md flex items-center text-sm hover:bg-green-100">
                    <Download size={14} className="mr-1" />
                    Download
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="bg-gray-50 p-4 rounded-md h-40 overflow-auto">
                  <div className="text-gray-400 text-center flex flex-col items-center justify-center h-full">
                    <FileText size={24} className="mb-2" />
                    <span>Preview not available</span>
                    <span className="text-xs mt-1">
                      Click "View Content" to see the file
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilesView