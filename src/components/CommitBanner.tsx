import { useFrame } from '@artifact/client/hooks'

export default function CommitBanner() {
  const frame = useFrame()
  const target = frame.target as Record<string, unknown>

  if ('commit' in target && typeof target.commit === 'string') {
    const { did, repo, branch, commit } = target as {
      did: string
      repo: string
      branch: string
      commit: string
    }
    const short = commit.slice(0, 7)
    const handle = () => {
      frame.onSelection?.({ did, repo, branch })
    }
    return (
      <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4 flex justify-between items-center">
        <span className="text-sm font-medium">Pinned to commit {short}</span>
        <button className="text-sm underline" onClick={handle}>
          Switch to latest
        </button>
      </div>
    )
  }
  return null
}
