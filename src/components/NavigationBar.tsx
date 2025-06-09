import React from 'react'
import { ArrowUp, ChevronRight, FolderRoot } from 'lucide-react'

interface Props {
  currentPath: string
  isAtRoot: boolean
  onNavigateUp: () => void
  onNavigateTo: (path: string) => void
}

const NavigationBar: React.FC<Props> = ({
  currentPath,
  isAtRoot,
  onNavigateUp,
  onNavigateTo
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center">
    <div className="flex items-center">
      <button
        onClick={onNavigateUp}
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

      <button
        onClick={() => onNavigateTo('')}
        title="Filesystem Root"
        className="text-blue-600 mr-1 hover:text-blue-800"
      >
        <FolderRoot size={16} />
      </button>
      {currentPath
        .split('/')
        .filter((p) => p)
        .map((part, idx, arr) => {
          const path = arr.slice(0, idx + 1).join('/')
          return (
            <React.Fragment key={path}>
              <ChevronRight size={16} className="text-gray-400" />
              <button
                onClick={() => onNavigateTo(path)}
                className="text-blue-600 ml-1 hover:text-blue-800"
              >
                {part}
              </button>
            </React.Fragment>
          )
        })}
    </div>
  </div>
)

export default NavigationBar
