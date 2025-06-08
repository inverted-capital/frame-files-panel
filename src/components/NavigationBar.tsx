import React from 'react'
import { ArrowUp, Code } from 'lucide-react'

interface Props {
  currentPath: string
  isAtRoot: boolean
  onNavigateUp: () => void
}

const NavigationBar: React.FC<Props> = ({
  currentPath,
  isAtRoot,
  onNavigateUp
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

      <span className="text-gray-500 mr-2">Path:</span>
      <Code size={16} className="mr-1 text-blue-600" />
      <span className="text-blue-600 mr-1 font-medium">/</span>
      {currentPath && <span className="text-gray-600">{currentPath}</span>}
    </div>
  </div>
)

export default NavigationBar
