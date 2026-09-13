'use client'
import {useState} from 'react'
import {supabase} from '../../lib/supabase'

const countryCodes=[
  ['+91','India'],['+1','United States / Canada'],['+44','United Kingdom'],['+971','United Arab Emirates'],
  ['+65','Singapore'],['+61','Australia'],['+49','Germany'],['+33','France'],['+81','Japan'],['+65','Singapore'],
  ['+27','South Africa'],['+64','New Zealand'],['+60','Malaysia'],['+65','Singapore'],['+974','Qatar'],['+966','Saudi Arabia']
] as const

export default function Trial(){
 const [company,setCompany]=useState(''),[country,setCountry]=useState('+91'),[phone,setPhone]=useState(''),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState(''),[ok,setOk]=useState(''),[busy,setBusy]=useState(false)
 async function submit(e:any){
  e.preventDefault();setBusy(true);setErr('');setOk('')
  const cleanPhone=phone.replace(/[^0-9]/g,'')
  if(!company.trim()||!name.trim()||!email.trim()||!cleanPhone||!password){setErr('Please complete all mandatory fields.');setBusy(false);return}
  if(cleanPhone.length<7||cleanPhone.length>15){setErr('Please enter a valid contact number.');setBusy(false);return}
  if(password.length<10){setErr('Password must be at least 10 characters');setBusy(false);return}
  const fullPhone=country+cleanPhone
  const s=await supabase.auth.signUp({email,password,options:{data:{full_name:name,phone:fullPhone,company_name:company}}});
  if(s.error){setErr(s.error.message);setBusy(false);return}
  if(!s.data.user){setErr('Unable to create account');setBusy(false);return}
  const r=await supabase.rpc('provision_my_trial',{p_company_name:company,p_legal_name:company,p_full_name:name,p_trial_days:7});
  if(r.error){await supabase.auth.signOut();setErr(r.error.message);setBusy(false);return}
  setOk('Trial created successfully. Your 7-day HumaNest trial is ready. Continue to login and configure Authenticator MFA.');setBusy(false)
 }
 return <main className="form-page"><div className="form-card">
  <img src="/humanest-logo-tight.png" className="trial-logo" alt="HumaNest"/>
  <div className="trial-badge">7-DAY FREE TRIAL</div>
  <h1>Create your HumaNest account</h1>
  <p className="muted">All available HRMS modules are enabled during the trial.</p>
  <form onSubmit={submit}>
   <label>Company name<input value={company} onChange={e=>setCompany(e.target.value)} required/></label>
   <label>Contact number<div className="phone-row"><select value={country} onChange={e=>setCountry(e.target.value)} required aria-label="Country code">{countryCodes.map(([code,label])=><option key={code+label} value={code}>{code} — {label}</option>)}</select><input value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9 ]/g,''))} inputMode="tel" autoComplete="tel" placeholder="Contact number" required/></div></label>
   <label>Administrator name<input value={name} onChange={e=>setName(e.target.value)} required/></label>
   <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label>
   <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={10} required/></label>
   {err&&<div className="error">{err}</div>}{ok&&<div className="success">{ok}</div>}
   <button className="gradient" disabled={busy}>{busy?'Creating trial…':'Create 7-Day Trial →'}</button>
  </form>
  <a className="back" href="/login">Already have an account? Login</a>
 </div></main>
}
