import { useState } from 'react'
import { ARCHIVE_STRUCTURE } from '../lib/archiveData'

function TreeItem({ item, depth = 0 }) {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <div
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        className={`flex items-center gap-2 py-2 pr-3 ${hasChildren ? 'cursor-pointer hover:bg-stone-50' : ''}`}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        <span className="text-stone-400 text-xs w-3">
          {hasChildren ? (open ? '-' : '+') : ''}
        </span>
        <span className={`flex-1 text-sm ${depth === 0 ? 'font-medium text-stone-800' : 'text-stone-600'}`}>
          {item.name}
        </span>
        <button
          onClick={e => { e.stopPropagation(); window.open(item.url, '_blank') }}
          className="text-xs text-blue-500 hover:underline flex-shrink-0 bg-transparent border-none cursor-pointer"
        >
          {String.fromCharCode(97) + String.fromCharCode(99)}
        </button>
      </div>
      {item.description && depth === 0 && (
        <p className="text-xs text-stone-400 pl-8 pb-1 pr-3">{item.description}</p>
      )}
      {open && hasChildren && (
        <div className="border-l border-stone-100 ml-6">
          {item.children.map(child => (
            <TreeItem key={child.url} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Archive() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-stone-800">Arsiv Yapisi</h2>
        <button
          onClick={() => window.open('https://archives.saltresearch.org/handle/123456789/2302', '_blank')}
          className="text-xs px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 cursor-pointer bg-white"
        >
          SALT
        </button>
      </div>
      <p className="text-xs text-stone-500 mb-3">
        Bank-i Osmani Arsivi — 7 bolum, 10.000+ belge, 1856-2001
      </p>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
        {ARCHIVE_STRUCTURE.map(dept => (
          <TreeItem key={dept.url} item={dept} depth={0} />
        ))}
      </div>
    </div>
  )
}