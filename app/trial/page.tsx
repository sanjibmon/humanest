'use client'
import {useState} from 'react'
import {supabase} from '../../lib/supabase'

const countryCodes=[
  ['+91','India'],['+880','Bangladesh'],['+975','Bhutan'],['+93','Afghanistan'],['+960','Maldives'],['+977','Nepal'],['+92','Pakistan'],['+94','Sri Lanka'],
  ['+1','United States / Canada'],['+44','United Kingdom'],['+971','United Arab Emirates'],['+65','Singapore'],['+60','Malaysia'],['+61','Australia'],['+64','New Zealand'],['+27','South Africa'],['+49','Germany'],['+33','France'],['+81','Japan'],['+86','China'],['+82','South Korea'],['+974','Qatar'],['+966','Saudi Arabia']
] as const

export default function Trial(){
 const [company,setCompany]=useState(''),[country,setCountry]=useState('+91'),[phone,setPhone]=useState(''),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState(''),[submitted,setSubmitted]=useState(false),[busy,setBusy]=useState(false)
 async function submit(e:any){
  e.preventDefault();setBusy(true);setErr('')
  const cleanPhone=phone.replace(/[^0-9]/g,'')
  if(!company.trim()||!name.trim()||!email.trim()||!cleanPhone||!password){setErr('Please complete all mandatory fields.');setBusy(false);return}
  if(cleanPhone.length<7||cleanPhone.length>15){setErr('Please enter a valid contact number.');setBusy(false);return}
  if(password.length<10){setErr('Password must be at least 10 characters');setBusy(false);return}
  const fullPhone=country+cleanPhone
  const {data,error}=await supabase.auth.signUp({
    email:email.trim().toLowerCase(),password,
    options:{
      data:{full_name:name.trim(),phone:fullPhone,company_name:company.trim()},
      emailRedirectTo:`${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/hrms`
    }
  })
  if(error){setErr(error.message);setBusy(false);return}
  if(!data.user){setErr('Unable to submit your trial request. Please try again.');setBusy(false);return}
  // With email confirmation enabled, Supabase returns a user without a session.
  // Provisioning intentionally happens only after the activation link is opened.
  setSubmitted(true);setBusy(false)
 }
 if(submitted) return <main className="form-page"><div className="form-card trial-thankyou"><img src="/humanest-logo-tight.png" className="trial-logo" alt="HumaNest"/><div className="trial-badge">7-DAYS FREE TRIAL</div><div className="thank-icon">✓</div><h1>Thank You.</h1><p className="thank-message">Your trial request has been submitted successfully.</p><p className="muted">We have sent an account activation link to <strong>{email}</strong>. Please open the email and activate your HumaNest account to continue.</p><a className="gradient thank-button" href="/">Back to HumaNest</a></div></main>
 return <main className="form-page"><div className="form-card">
  <img src="/humanest-logo-tight.png" className="trial-logo" alt="HumaNest"/>
  <div className="trial-badge">7-DAYS FREE TRIAL</div><h1>Create your HumaNest account</h1><p className="muted">All available HRMS modules are enabled during the trial.</p>
  <form onSubmit={submit}>
   <label>Company name<input value={company} onChange={e=>setCompany(e.target.value)} required/></label>
   <label>Contact number<div className="phone-row"><select value={country} onChange={e=>setCountry(e.target.value)} required aria-label="Country code">{countryCodes.map(([code,label])=><option key={code+label} value={code}>{code} — {label}</option>)}</select><span className="phone-dash" aria-hidden="true">-</span><input value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9 ]/g,''))} inputMode="tel" autoComplete="tel" placeholder="Contact number" required/></div></label>
   <label>Administrator name<input value={name} onChange={e=>setName(e.target.value)} required/></label>
   <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label>
   <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={10} required/></label>
   {err&&<div className="error">{err}</div>}
   <button className="gradient" disabled={busy}>{busy?'Submitting…':'Create 7-Days Trial →'}</button>
  </form><a className="back" href="/login">Already have an account? Login</a>
 </div></main>
}
