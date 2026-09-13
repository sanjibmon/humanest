'use client'

import {useEffect, useState} from 'react'
import {supabase} from '../../lib/supabase'

function qrSrc(value:string){
  if(!value) return ''
  if(value.startsWith('data:')) return value
  return `data:image/svg+xml;utf8,${encodeURIComponent(value)}`
}

export default function MFASetup(){
  const [email,setEmail]=useState('')
  const [factorId,setFactorId]=useState('')
  const [qr,setQr]=useState('')
  const [secret,setSecret]=useState('')
  const [code,setCode]=useState('')
  const [err,setErr]=useState('')
  const [busy,setBusy]=useState(false)
  const [loading,setLoading]=useState(true)

  const next = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('next') === '/hrms' ? '/hrms' : '/hrms'

  useEffect(()=>{
    let cancelled=false
    ;(async()=>{
      const u=await supabase.auth.getUser()
      if(!u.data.user){ location.href='/login'; return }
      if(cancelled) return
      setEmail(u.data.user.email||'')

      const aal=await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if(aal.data.currentLevel==='aal2'){
        location.href=next
        return
      }

      const factors=await supabase.auth.mfa.listFactors()
      if(factors.error){setErr(factors.error.message);setLoading(false);return}
      const verified=(factors.data.totp||[]).find((x:any)=>x.status==='verified')
      if(verified){
        location.href=next
        return
      }

      // Remove abandoned unverified enrollment attempts before creating a fresh QR.
      for(const f of (factors.data.totp||[]).filter((x:any)=>x.status==='unverified')){
        await supabase.auth.mfa.unenroll({factorId:f.id})
      }

      const enrolled=await supabase.auth.mfa.enroll({
        factorType:'totp',
        friendlyName:`HumaNest - ${u.data.user.email||'Account'}`,
      })
      if(enrolled.error){setErr(enrolled.error.message);setLoading(false);return}
      if(cancelled) return
      setFactorId(enrolled.data.id)
      setQr(qrSrc(enrolled.data.totp?.qr_code||''))
      setSecret(enrolled.data.totp?.secret||'')
      setLoading(false)
    })()
    return ()=>{cancelled=true}
  },[next])

  async function verify(e:any){
    e.preventDefault();setBusy(true);setErr('')
    if(!factorId){setErr('MFA setup is not ready. Please refresh the page.');setBusy(false);return}
    const challenge=await supabase.auth.mfa.challenge({factorId})
    if(challenge.error){setErr(challenge.error.message);setBusy(false);return}
    const result=await supabase.auth.mfa.verify({
      factorId,
      challengeId:challenge.data.id,
      code:code.replace(/\D/g,'')
    })
    if(result.error){setErr(result.error.message);setBusy(false);return}
    await supabase.auth.refreshSession()
    location.href=next
  }

  if(loading) return <main className="form-page"><div className="form-card mfa-card"><img src="/humanest-logo-tight.png" className="trial-logo" alt="HumaNest"/><div className="trial-badge">SECURE ACCOUNT SETUP</div><h1>Protect your HumaNest account</h1><p className="muted">Preparing your Authenticator setup…</p></div></main>

  return <main className="form-page"><div className="form-card mfa-card">
    <img src="/humanest-logo-tight.png" className="trial-logo" alt="HumaNest"/>
    <div className="trial-badge">MANDATORY MFA</div>
    <h1>Secure your HumaNest account</h1>
    <p className="muted">Two-factor authentication is required before you can access the HRMS portal.</p>

    <div className="mfa-steps">
      <div><b>1. Install an Authenticator app</b><span>Microsoft Authenticator or Google Authenticator.</span></div>
      <div><b>2. Scan the QR code</b><span>Use your phone's Authenticator app to scan this code.</span></div>
    </div>

    {qr && <div className="qr-box"><img src={qr} alt="HumaNest Authenticator QR code"/></div>}

    <details className="mfa-secret"><summary>Can't scan the QR code?</summary><code>{secret}</code></details>

    <form onSubmit={verify}>
      <label><span>3. Enter the 6-digit code from your Authenticator</span><input className="code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} maxLength={6} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" autoFocus required/></label>
      {err&&<div className="error">{err}</div>}
      <button className="gradient large" disabled={busy||code.length!==6}>{busy?'Enabling MFA…':'Enable MFA & Continue →'}</button>
    </form>
    <div className="secure-note">Signed in as <strong>{email}</strong></div>
  </div></main>
}
