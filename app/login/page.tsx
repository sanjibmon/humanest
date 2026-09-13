'use client'

import {useState} from 'react'
import {supabase} from '../../lib/supabase'

const Icon=({type}:{type:'mail'|'lock'|'eye'|'secure'|'people'|'process'|'progress'})=>{
 const p:any={
  mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  eye:<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  secure:<><path d="M12 3 20 6v5c0 5-3.3 8.6-8 10-4.7-1.4-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
  people:<><circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3 19c0-3.2 2.5-5 6-5s6 1.8 6 5M14 14.5c3.2-.4 6 1.1 6 4.5"/></>,
  process:<><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4.5"/></>,
  progress:<><path d="M4 19V9M10 19V5M16 19v-8M22 19H2"/></>
 }
 return <span className="field-icon"><svg viewBox="0 0 24 24">{p[type]}</svg></span>
}

export default function Login(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState(''),[factor,setFactor]=useState(''),[mode,setMode]=useState<'login'|'mfa'>('login'),[show,setShow]=useState(false),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
 async function submit(e:any){e.preventDefault();setBusy(true);setErr('');const r=await supabase.auth.signInWithPassword({email,password});if(r.error){setErr(r.error.message);setBusy(false);return}const aal=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();if(aal.data.currentLevel==='aal2'){location.href='/hrms';return}const f=await supabase.auth.mfa.listFactors();if(f.error){setErr(f.error.message);setBusy(false);return}const verified=(f.data.totp||[]).find((x:any)=>x.status==='verified');if(!verified){setErr('Authenticator MFA is required for customer access. Please complete MFA setup for this account.');setBusy(false);return}setFactor(verified.id);setMode('mfa');setBusy(false)}
 async function verify(e:any){e.preventDefault();setBusy(true);setErr('');const c=await supabase.auth.mfa.challenge({factorId:factor});if(c.error){setErr(c.error.message);setBusy(false);return}const v=await supabase.auth.mfa.verify({factorId:factor,challengeId:c.data.id,code});if(v.error){setErr(v.error.message);setBusy(false);return}location.href='/hrms'}
 return <main className="auth-page">
   <div className="auth-topline">A BRIGHTER TOMORROW TOGETHER</div>
   <section className="auth-brand">
     <a href="/" className="back-home">← Back to Home</a>
     <div className="brand-center">
       <img src="/humanest-logo.png" className="auth-logo" alt="HumaNest"/>
       <h1>People Empower<br/>Progress<span>.</span></h1>
       <p>A smarter platform for organizations<br/>to manage people, processes and possibilities.</p>
       <div className="mini-pillars"><span><Icon type="people"/>People</span><span><Icon type="process"/>Process</span><span><Icon type="progress"/>Progress</span></div>
     </div>
     <div className="auth-wave"/>
   </section>
   <section className="auth-form-area">
     <div className="glass-card">
       <img src="/humanest-logo.png" className="form-logo" alt="HumaNest"/>
       <h2>Customer Login</h2>
       <p className="subtitle">Access your organization's HRMS</p>
       {mode==='login'?<form onSubmit={submit}>
         <label><span><Icon type="mail"/>Email</span><input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="username" required/></label>
         <label><span><Icon type="lock"/>Password</span><div className="password-wrap"><input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} autoComplete="current-password" required/><button type="button" onClick={()=>setShow(!show)} aria-label="Show password"><Icon type="eye"/></button></div></label>
         {err&&<div className="error">{err}</div>}
         <button className="gradient large" disabled={busy}>{busy?'Signing in…':'Login  →'}</button>
       </form>:<form onSubmit={verify}>
         <div className="mfa-title">Authenticator verification</div><p className="mfa-copy">Enter the 6-digit code from your Authenticator app.</p>
         <input className="code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} maxLength={6} inputMode="numeric" placeholder="000000" autoFocus required/>
         {err&&<div className="error">{err}</div>}
         <button className="gradient large" disabled={busy||code.length!==6}>{busy?'Verifying…':'Verify  →'}</button>
       </form>}
       <div className="secure-line"><Icon type="secure"/> <span>Secure Access</span></div>
       <div className="secure-note">Your data is safe with us</div>
       <div className="auth-links"><a href="/trial">Start Free Trial</a><a href="/">Back to Home</a></div>
     </div>
   </section>
 </main>
}
