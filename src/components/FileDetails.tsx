import React from 'react'
import { ChevronDown, FileText, Edit, Download, File } from 'lucide-react'

interface Props {
  selectedFile: string
  currentRepo: string
  currentBranch: string
  fileData: ArrayBuffer | undefined
  fileMeta: { type: string } | null | false | undefined
  onClose: () => void
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

const FileDetails: React.FC<Props> = ({
  selectedFile,
  currentRepo,
  currentBranch,
  fileData,
  fileMeta,
  onClose
}) => (
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
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
)

export default FileDetails
