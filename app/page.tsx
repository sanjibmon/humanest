'use client'
import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'
export default function Home(){
 const [path,setPath]=useState('/login')
 useEffect(()=>{supabase.auth.getUser().then(({data})=>setPath(data.user?'/hrms':'/login'))},[])
 if(typeof window!=='undefined'&&window.location.pathname!=='/'){return null}
 return <main className="choice"><img src="/humanest-logo.png" className="choice-logo"/><h1>HumaNest</h1><p>Your People. Your Process.</p><div className="choice-actions"><a href="/login">Employee / Customer Login</a><a href="/trial">Create 7-Day Trial</a><a href="/platform-admin">Platform Admin</a></div></main>
}
