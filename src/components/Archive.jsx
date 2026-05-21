import { ARCHIVE_STRUCTURE } from '../lib/archiveData'

function DeptItem({ dept }) {
  return (
    <div style={{marginBottom:'8px', border:'1px solid #e7e5e4', borderRadius:'12px', overflow:'hidden'}}>
      <div style={{padding:'14px 16px', background:'white'}}>
        <p style={{fontSize:'14px', fontWeight:'500', marginBottom:'4px'}}>{dept.name}</p>
        {dept.description && <p style={{fontSize:'12px', color:'#78716c'}}>{dept.description}</p>}
        <a href={dept.url} target="_blank" rel="noreferrer" style={{fontSize:'12px', color:'#2563eb'}}>
          SALT arsivinde ac
        </a>
      </div>
      {dept.children.length > 0 && (
        <div style={{borderTop:'1px solid #f5f5f4', background:'#fafaf9'}}>
          {dept.children.map(child => (
            <div key={child.name} style={{display:'flex', justifyContent:'space-between', padding:'8px 16px', borderBottom:'1px solid #f5f5f4'}}>
              <span style={{fontSize:'13px', color:'#44403c'}}>{child.name}</span>
              <a href={child.url} target="_blank" rel="noreferrer" style={{fontSize:'12px', color:'#2563eb'}}>ac</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Archive() {
  return (
    <div>
      <h2 style={{fontSize:'15px', fontWeight:'500', marginBottom:'8px'}}>Arsiv Yapisi</h2>
      <p style={{fontSize:'12px', color:'#78716c', marginBottom:'16px'}}>Bank-i Osmani Arsivi — 7 departman, 1856-2001</p>
      {ARCHIVE_STRUCTURE.map(dept => (
        <DeptItem key={dept.name} dept={dept} />
      ))}
    </div>
  )
}