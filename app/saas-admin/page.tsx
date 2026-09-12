'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Account = {
  organization_id:string; status:string; account_type:string; plan_code:string;
  trial_ends_at:string|null; organizations?:{name:string;code:string}|null
}
type Quota = {organization_id:string;purchased_employee_quota:number;overage_employee_quota:number;effective_employee_quota:number;overage_expires_at:string|null}

export default function SaaSAdmin(){
  const [user,setUser]=useState<any>(null),[accounts,setAccounts]=useState<Account[]>([])
  const [quotas,setQuotas]=useState<Record<string,Quota>>({}),[selected,setSelected]=useState<Account|null>(null)
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false)
  const [purchased,setPurchased]=useState(0),[overage,setOverage]=useState(0),[overageDate,setOverageDate]=useState('')

  async function load(){
    const {data:{user}}=await supabase.auth.getUser(); setUser(user)
    if(!user)return
    const {data,error}=await supabase.from('saas_accounts').select('organization_id,status,account_type,plan_code,trial_ends_at,organizations(name,code)').order('created_at',{ascending:false})
    if(error){setError(error.message);return}
    setAccounts((data||[]) as any)
    const ids=(data||[]).map((x:any)=>x.organization_id)
    if(ids.length){
      const {data:q}=await supabase.from('saas_license_quotas').select('*').in('organization_id',ids)
      setQuotas(Object.fromEntries((q||[]).map((x:any)=>[x.organization_id,x])))
    }
  }
  useEffect(()=>{load()},[])

  async function login(e:any){
    e.preventDefault();setLoading(true);setError('')
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error)setError(error.message); else await load()
    setLoading(false)
  }
  async function logout(){await supabase.auth.signOut();setUser(null)}
  async function saveQuota(){
    if(!selected)return
    setLoading(true);setError('')
    const {error}=await supabase.from('saas_license_quotas').upsert({
      organization_id:selected.organization_id,
      purchased_employee_quota:purchased,
      overage_employee_quota:overage,
      overage_expires_at:overageDate?new Date(overageDate+'T23:59:59').toISOString():null,
      assigned_at:new Date().toISOString()
    },{onConflict:'organization_id'})
    if(error)setError(error.message); else {setSelected(null);await load()}
    setLoading(false)
  }

  if(!user) return <main className="login"><div className="card authcard"><div className="brand">HumaNest</div><div className="eyebrow">PLATFORM CONTROL CENTER</div><h1>SaaS Admin</h1><p className="muted">Sign in with your HumaNest platform administrator account.</p><form onSubmit={login}><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/></label>{error&&<div className="error">{error}</div>}<button disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><div className="secure">🔐 MFA is required for platform administration.</div></div></main>

  return <main className="shell"><aside><div className="brand">HumaNest</div><div className="side-title">SaaS Admin</div><nav><a className="active">Overview</a><a>Customers</a><a>Modules & Licensing</a><a>Trials</a><a>Platform Users</a><a>Audit Log</a><a>Settings</a></nav><button className="ghost" onClick={logout}>Sign out</button></aside>
  <section className="content"><header><div><div className="eyebrow">PLATFORM CONTROL CENTER</div><h1>Customer Operations</h1></div><div className="userpill">{user.email}</div></header>
  <div className="stats"><div className="stat"><span>Total tenants</span><b>{accounts.length}</b></div><div className="stat"><span>Trials</span><b>{accounts.filter(x=>x.status==='TRIAL').length}</b></div><div className="stat"><span>Active</span><b>{accounts.filter(x=>x.status==='ACTIVE').length}</b></div><div className="stat"><span>Attention</span><b>{accounts.filter(x=>['EXPIRED','DISABLED','PENDING_DELETE'].includes(x.status)).length}</b></div></div>
  <div className="card"><div className="cardhead"><div><h2>Customer tenants</h2><p className="muted">Subscription, module and employee-license control stays with SaaS Admin.</p></div><button>+ Create trial</button></div><div className="tablewrap"><table><thead><tr><th>Customer</th><th>Status</th><th>Plan</th><th>Employee license</th><th>Trial</th><th></th></tr></thead><tbody>{accounts.length===0?<tr><td colSpan={6} className="empty">No customer tenants yet.</td></tr>:accounts.map(a=>{const q=quotas[a.organization_id];return <tr key={a.organization_id}><td><b>{(a as any).organizations?.name||'Unnamed'}</b><small>{(a as any).organizations?.code||a.organization_id.slice(0,8)}</small></td><td><span className={'badge '+a.status.toLowerCase()}>{a.status}</span></td><td>{a.plan_code}</td><td>{q?`${q.purchased_employee_quota} + ${q.overage_employee_quota} = ${q.effective_employee_quota}`:'Not assigned'}</td><td>{a.trial_ends_at?new Date(a.trial_ends_at).toLocaleDateString():'—'}</td><td><button className="linkbtn" onClick={()=>{setSelected(a);setPurchased(q?.purchased_employee_quota||0);setOverage(q?.overage_employee_quota||0);setOverageDate(q?.overage_expires_at?new Date(q.overage_expires_at).toISOString().slice(0,10):'')}}>License</button></td></tr>})}</tbody></table></div></div>
  {selected&&<div className="modal"><div className="card modalcard"><div className="cardhead"><div><h2>Employee licensing</h2><p className="muted">{(selected as any).organizations?.name}</p></div><button className="ghost dark" onClick={()=>setSelected(null)}>Close</button></div><div className="grid2"><label>Purchased licenses<input type="number" min="0" value={purchased} onChange={e=>setPurchased(+e.target.value)}/></label><label>Temporary overage<input type="number" min="0" value={overage} onChange={e=>setOverage(+e.target.value)}/></label><label>Overage valid until<input type="date" value={overageDate} onChange={e=>setOverageDate(e.target.value)}/></label></div><div className="licensepreview"><span>Effective capacity</span><b>{purchased+overage} employees</b></div>{error&&<div className="error">{error}</div>}<button onClick={saveQuota} disabled={loading}>{loading?'Saving…':'Save license quota'}</button></div></div>}
  </section></main>
}