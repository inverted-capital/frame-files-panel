import React from 'react'
import { File, Folder, ChevronRight, Loader } from 'lucide-react'

interface FileMeta {
  path: string
  type: string
}

export interface FileItem {
  name: string
  path: string
  isFolder: boolean
}

interface Props {
  folderContents: FileMeta[] | undefined
  currentPath: string
  selectedFile: string | null
  onItemClick: (item: FileItem, clickCount: number) => void
}

const FileList: React.FC<Props> = ({
  folderContents,
  currentPath,
  selectedFile,
  onItemClick
}) => {
  if (!folderContents) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex justify-center items-center h-full">
        <Loader className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (folderContents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-2">
          <File size={40} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {currentPath ? 'Empty Folder' : 'No Files Found'}
        </h3>
        <p className="text-gray-500 mb-4">
          {currentPath ? 'This folder is empty' : 'No files available'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      <div className="grid grid-cols-12 gap-4 p-4 font-medium text-gray-500 text-sm border-b border-gray-200">
        <div className="col-span-5">Name</div>
        <div className="col-span-3">Modified</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Size</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {[...folderContents]
          .filter((m) => m.path !== '.gitkeep')
          .sort((a, b) => {
            if (a.type === 'tree' && b.type !== 'tree') return -1
            if (a.type !== 'tree' && b.type === 'tree') return 1
            return a.path.localeCompare(b.path)
          })
          .map((meta) => {
            const item: FileItem = {
              name: meta.path,
              path: currentPath ? currentPath + '/' + meta.path : meta.path,
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
                onClick={(e) => onItemClick(item, e.detail)}
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
                      <ChevronRight size={16} className="ml-1 text-gray-400" />
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
  )
}

export default FileList
