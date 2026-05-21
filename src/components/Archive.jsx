import { useState } from 'react'
import { Folder, FolderOpen, FileText, ExternalLink, ChevronRight } from 'lucide-react'
import { ARCHIVE_STRUCTURE } from '../lib/archiveData'

function DeptItem({ dept }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3.5 bg-white hover:bg-stone-50 text-left transition-colors"
      >
        {open ? <FolderOpen size={16} className="text-amber-500 flex-shrink-0" /> : <Folder size={16} className="text-amber-500 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800">{dept.name}</p>
          {dept.description && <p className="text-xs text-stone-500 mt-0.5 truncate">{dept.description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {dept.children.length > 0 && (
            <span className="text-xs text-stone-400">{dept.children.length} alt koleksiyon</span>
          )}
          
            href={dept.url}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600"
          >
            <ExternalLink size={13} />
          </a>
          <ChevronRight size={14} className={`text-stone-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {open && dept.children.length > 0 && (
        <div className="border-t border-stone-100 divide-y divide-stone-100">
          {dept.children.map(child => (
            <div key={child.name} className="flex items-center gap-3 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 transition-colors">
              <FileText size={13} className="text-stone-400 flex-shrink-0" />
              <span className="text-sm text-stone-700 flex-1">{child.name}</span>
              
                href={child.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline flex-shrink-0"
              >
                Aç <ExternalLink size={11} />
              </a>
            </div>
          ))}
        </div>
      )}

      {open && dept.children.length === 0 && (
        <div className="border-t border-stone-100 px-4 py-3 bg-stone-50">
          <a href={dept.url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
            SALT'ta görüntüle <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  )
}

export default function Archive() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-stone-800">Arşiv Yapısı</h2>
        
          href="https://archives.saltresearch.org/handle/123456789/2302"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
        >
          <ExternalLink size={12} /> SALT'ta aç
        </a>
      </div>
      <p className="text-xs text-stone-500 mb-4">
        Bank-ı Osmanî-i Şahane Arşivi — 7 departman, 10.000+ belge, 1856–2001
      </p>
      <div className="space-y-2">
        {ARCHIVE_STRUCTURE.map(dept => (
          <DeptItem key={dept.name} dept={dept} />
        ))}
      </div>
    </div>
  )
}