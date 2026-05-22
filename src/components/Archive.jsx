import { useState } from 'react'
import { ARCHIVE_STRUCTURE } from '../lib/archiveData'

function TreeItem({ item, depth = 0 }) {
  const [open, setOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <div
        style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:`7px ${12 + depth * 16}px 7px 12px`,
          cursor: hasChildren ? 'pointer' : 'default',
          borderBottom:'0.5px solid rgba(30,27,46,0.04)',
        }}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        <span style={{fontSize:'11px', color:'#9B97B8', width:'12px', flexShrink:0, textAlign:'center'}}>
          {hasChildren ? (open ? '−' : '+') : ''}
        </span>
        <span style={{
          flex:1, fontSize: depth === 0 ? '12px' : '11px',
          fontWeight: depth === 0 ? 500 : 400,
          color: depth === 0 ? '#1E1B2E' : '#4A4670',
          lineHeight:1.4,
        }}>
          {item.name}
        </span>
        <button
          onClick={e => { e.stopPropagation(); window.open(item.url, '_blank') }}
          style={{fontSize:'10px', padding:'2px 8px', border:'0.5px solid rgba(30,27,46,0.12)', borderRadius:'4px', background:'transparent', color:'#7F77DD', cursor:'pointer', flexShrink:0}}
        >
          ac
        </button>
      </div>
      {item.description && depth === 0 && (
        <p style={{fontSize:'10px', color:'#9B97B8', padding:'0 12px 6px 36px', lineHeight:1.5}}>
          {item.description}
        </p>
      )}
      {open && hasChildren && (
        <div style={{borderLeft:'1px solid rgba(127,119,221,0.15)', marginLeft:'20px'}}>
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
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
        <h2 style={{fontSize:'15px', fontWeight:500, color:'#1E1B2E'}}>Arsiv Yapisi</h2>
        <button
          onClick={() => window.open('https://archives.saltresearch.org/handle/123456789/2302', '_blank')}
          style={{fontSize:'11px', padding:'5px 12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'transparent', color:'#6B6488', cursor:'pointer'}}
        >
          SALT ana sayfa
        </button>
      </div>
      <p style={{fontSize:'11px', color:'#9B97B8', marginBottom:'12px'}}>
        Bank-i Osmani Arsivi — 7 bolum, 10.000+ belge, 1856-2001
      </p>
      <div style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'10px', overflow:'hidden'}}>
        {ARCHIVE_STRUCTURE.map(dept => (
          <TreeItem key={dept.url} item={dept} depth={0} />
        ))}
      </div>
    </div>
  )
}