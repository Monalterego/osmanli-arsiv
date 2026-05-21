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
        {hasChildren ? (
          <span className="text-stone-400 text-xs w-3">{open ? '-' : '+'}</span>
        ) : (
          <span className="w-3 text-stone-200 text-xs">-</span>
        )}
        <span className={`flex-1 text-sm ${depth === 0 ? 'font-medium text-stone-800' : 'text-stone-600'}`}>
          {item.name}
        </span>
        
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs text-blue-500 hover:underline flex-shrink-0"
        >
          ac
        </a>
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
        
          href="https://archives.saltresearch.org/handle/123456789/2302"
          target="_blank"
          rel="noreferrer"
          className="text-xs px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
        >
          SALT'ta ac
        </a>
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