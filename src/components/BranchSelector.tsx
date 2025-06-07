import React, { useState, useEffect, useRef } from 'react'
import { GitBranch, ChevronDown } from 'lucide-react'

interface Branch {
  name: string
  isDefault: boolean
}

interface Props {
  currentBranch: string
  branches: Branch[]
  onChange: (branch: string) => void
}

const BranchSelector: React.FC<Props> = ({
  currentBranch,
  branches,
  onChange
}) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Branch
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="flex items-center justify-between w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center">
            <GitBranch size={16} className="text-gray-500 mr-2" />
            <span>{currentBranch}</span>
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {open && (
          <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200">
            <ul className="py-1 max-h-60 overflow-auto">
              {branches.map((branch) => (
                <li
                  key={branch.name}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center ${
                    branch.name === currentBranch
                      ? 'bg-blue-50 text-blue-700'
                      : ''
                  }`}
                  onClick={() => {
                    onChange(branch.name)
                    setOpen(false)
                  }}
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
  )
}

export default BranchSelector
