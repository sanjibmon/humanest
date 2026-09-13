'use client'
import {useEffect,useState} from 'react'
import {supabase} from '../../../lib/supabase'

export default function AuthCallback(){
 const [message,setMessage]=useState('Activating your HumaNest account…')
 const [error,setError]=useState('')
 useEffect(()=>{
  let active=true
  ;(async()=>{
    // The client SDK restores the confirmed session from the auth callback URL.
    const {data,error:sessionError}=await supabase.auth.getSession()
    if(sessionError||!data.session){
      if(active)setError('This activation link is invalid or has expired. Please submit a new trial request.')
      return
    }
    const user=data.session.user
    const meta=user.user_metadata||{}
    const company=String(meta.company_name||'').trim()
    const fullName=String(meta.full_name||'').trim()
    if(!company||!fullName){if(active)setError('Your activation information is incomplete. Please contact HumaNest support.');return}
    const {data:result,error:rpcError}=await supabase.rpc('provision_my_trial',{p_company_name:company,p_legal_name:null,p_full_name:fullName,p_trial_days:7})
    // A refresh after successful activation can safely continue to the HRMS portal.
    if(rpcError && !/already belongs to an organization/i.test(rpcError.message||'')){
      if(active)setError(rpcError.message||'Unable to activate your HumaNest trial.')
      return
    }
    if(active){setMessage('Your HumaNest account is active. Redirecting to your HRMS portal…');window.location.replace('/hrms')}
  })()
  return()=>{active=false}
 },[])
 return <main className="form-page"><div className="form-card trial-thankyou"><img src="/humanest-logo-tight.png" className="trial-logo" alt="HumaNest"/><div className="trial-badge">ACCOUNT ACTIVATION</div>{error?<><div className="error">{error}</div><a className="gradient thank-button" href="/trial">Start a new trial request</a></>:<><div className="thank-icon">✓</div><h1>Welcome to HumaNest</h1><p className="thank-message">{message}</p><p className="muted">Please wait while we prepare your HRMS workspace.</p></>}</div></main>
}
