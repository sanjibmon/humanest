'use client'
import {useState} from 'react'
import {supabase} from '../../lib/supabase'
export default function Trial(){
 const [company,setCompany]=useState(''),[legal,setLegal]=useState(''),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState(''),[ok,setOk]=useState(''),[busy,setBusy]=useState(false)
 async function submit(e:any){e.preventDefault();setBusy(true);setErr('');setOk('');if(password.length<10){setErr('Password must be at least 10 characters');setBusy(false);return}
  const s=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(s.error){setErr(s.error.message);setBusy(false);return}
  if(!s.data.user){setErr('Unable to create account');setBusy(false);return}
  const r=await supabase.rpc('provision_my_trial',{p_company_name:company,p_legal_name:legal,p_full_name:name,p_trial_days:7});if(r.error){await supabase.auth.signOut();setErr(r.error.message);setBusy(false);return}
  setOk('Trial created successfully. Your 7-day HumaNest trial is ready. Continue to login and configure Authenticator MFA.');setBusy(false)
 }
 return <main className="form-page"><div className="form-card"><img src="/humanest-logo.png" className="trial-logo"/><div className="eyebrow">7-DAY FREE TRIAL</div><h1>Create your HumaNest account</h1><p className="muted">All available HRMS modules are enabled during the trial.</p><form onSubmit={submit}><div className="two"><label>Company name<input value={company} onChange={e=>setCompany(e.target.value)} required/></label><label>Legal name<input value={legal} onChange={e=>setLegal(e.target.value)} placeholder="Optional"/></label></div><label>Administrator name<input value={name} onChange={e=>setName(e.target.value)} required/></label><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={10} required/></label>{err&&<div className="error">{err}</div>}{ok&&<div className="success">{ok}</div>}<button className="gradient" disabled={busy}>{busy?'Creating trial…':'Create 7-Day Trial →'}</button></form><a className="back" href="/login">Already have an account? Login</a></div></main>
}
