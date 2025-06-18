import React, { useMemo, useState, useEffect } from 'react'
import {
  ChevronDown,
  FileText,
  Edit,
  Download,
  File,
  Pencil
} from 'lucide-react'
import { marked } from 'marked'
import { useArtifact } from '@artifact/client/hooks'

interface Props {
  selectedFile: string
  fileData: ArrayBuffer | undefined
  fileMeta: { type: string } | null | false | undefined
  onClose: () => void
  onRename: (newPath: string) => void
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

const FileDetails: React.FC<Props> = ({
  selectedFile,
  fileData,
  fileMeta,
  onClose,
  onRename
}) => {
  const artifact = useArtifact()
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameParts, setRenameParts] = useState<string[]>(
    selectedFile.split('/')
  )

  useEffect(() => {
    setRenameParts(selectedFile.split('/'))
  }, [selectedFile])

  const preview = useMemo(() => {
    if (!fileData) return null
    const ext = selectedFile.split('.').pop()?.toLowerCase() || ''
    const blob = new Blob([fileData])

    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      const url = URL.createObjectURL(blob)
      return (
        <img
          src={url}
          className="max-h-96 mx-auto"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      )
    }

    const text = new TextDecoder().decode(fileData)

    if (['md', 'markdown'].includes(ext)) {
      const html = marked.parse(text)
      return (
        <div
          className="markdown-preview"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }

    return <pre className="whitespace-pre-wrap text-sm font-mono">{text}</pre>
  }, [fileData, selectedFile])

  if (!artifact) {
    return null
  }

  const handleRenameSubmit = async () => {
    const newPath = renameParts.join('/')
    if (!newPath || newPath === selectedFile) {
      setIsRenaming(false)
      return
    }
    await artifact.files.write.mv(selectedFile, newPath)
    if (artifact.files.isDirty()) {
      await artifact.branch.write.commit(`Rename ${selectedFile} to ${newPath}`)
    }
    setIsRenaming(false)
    onRename(newPath)
  }

  const handleDownload = async () => {
    let data = fileData
    if (!data) {
      data = await artifact.files.read.binary(selectedFile)
    }
    if (!data) return
    const blob = new Blob([data])
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = selectedFile.split('/').pop() || 'file'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-1/2 pl-4 overflow-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
              <File size={20} className="text-gray-500" />
            </div>
            <div>
              {isRenaming ? (
                <div className="flex flex-wrap items-center">
                  {renameParts.map((part, i) => (
                    <React.Fragment key={i}>
                      <input
                        className="border px-1 py-0.5 text-sm rounded w-24 mr-1"
                        value={part}
                        onChange={(e) => {
                          const np = [...renameParts]
                          np[i] = e.target.value
                          setRenameParts(np)
                        }}
                      />
                      {i < renameParts.length - 1 && (
                        <span className="mx-1">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-lg">
                    {selectedFile.split('/').pop()}
                  </h3>
                  <div className="text-sm text-gray-500">{selectedFile}</div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
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
            <div>{'/' + selectedFile}</div>
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
            {isRenaming ? (
              <>
                <button
                  className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md flex items-center text-sm hover:bg-green-100"
                  onClick={handleRenameSubmit}
                >
                  <Pencil size={14} className="mr-1" />
                  Save
                </button>
                <button
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md flex items-center text-sm hover:bg-gray-100"
                  onClick={() => setIsRenaming(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-md flex items-center text-sm hover:bg-yellow-100"
                onClick={() => setIsRenaming(true)}
              >
                <Pencil size={14} className="mr-1" />
                Rename
              </button>
            )}
            <button
              className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md flex items-center text-sm hover:bg-green-100"
              onClick={handleDownload}
            >
              <Download size={14} className="mr-1" />
              Download
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-medium mb-2">Preview</h4>
          <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-auto">
            {preview || (
              <div className="text-gray-400 text-center flex flex-col items-center justify-center h-full">
                <FileText size={24} className="mb-2" />
                <span>Preview not available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileDetails
