'use client'

const Icon = ({type}:{type:'people'|'process'|'progress'|'customer'|'platform'|'trial'|'secure'|'cloud'|'globe'|'mail'|'lock'|'eye'}) => {
  const paths:any = {
    people:<><circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3 19c0-3.2 2.5-5 6-5s6 1.8 6 5"/><path d="M14 14.5c3.2-.4 6 1.1 6 4.5"/></>,
    process:<><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4.5"/></>,
    progress:<><path d="M4 19V9M10 19V5M16 19v-8M22 19H2"/></>,
    customer:<><path d="M4 21V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v17"/><path d="M17 9h3a2 2 0 0 1 2 2v10H2M8 6h4M8 10h4M8 14h4"/></>,
    platform:<><path d="M12 3 20 6v5c0 5-3.3 8.6-8 10-4.7-1.4-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
    trial:<><path d="M5 16c-1-5 2-9 7-11 2.4 2.2 4 5 3 9-1 3-4 5-7 5l-3-3Z"/><path d="m13 5 4-2 4 4-2 4"/><path d="M8 17 4 21"/></>,
    secure:<><path d="M12 3 20 6v5c0 5-3.3 8.6-8 10-4.7-1.4-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
    cloud:<><path d="M7 18h10a5 5 0 0 0 .5-9.97A7 7 0 0 0 4.2 10.4 4 4 0 0 0 7 18Z"/></>,
    globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.2 2.4 3.2 5.4 3.2 9s-1 6.6-3.2 9c-2.2-2.4-3.2-5.4-3.2-9S9.8 5.4 12 3Z"/></>,
    mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    eye:<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>
  }
  return <span className={`icon icon-${type}`}><svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg></span>
}

function PreviewCard({type,title,subtitle,href}:{type:'customer'|'platform',title:string,subtitle:string,href:string}){
  return <a className="preview-login-card" href={href} aria-label={`${title} page`}>
    <div className="preview-login-head"><h2>{title}</h2><span>Open →</span></div>
    <p>{subtitle}</p>
    <div className="preview-field"><Icon type="mail"/> <span>Email</span></div>
    <div className="preview-field"><Icon type="lock"/> <span>Password</span><Icon type="eye"/></div>
    <div className="preview-button">Login <b>→</b></div>
    <div className="preview-secure"><Icon type="secure"/> Secure Access <span>Your data is safe with us</span></div>
  </a>
}

export default function Home(){
  return <main className="landing-page">
    <section className="landing-left">
      <div className="landing-topline">A BRIGHTER TOMORROW TOGETHER<div className="topline-mark"/></div>
      <div className="landing-left-content">
        <img src="/humanest-logo.png" className="landing-logo" alt="HumaNest"/>
        <h1>People Empower<br/>Progress<span>.</span></h1>
        <p className="landing-copy">A smarter platform for organizations<br/>to manage people, processes and possibilities.</p>

        <div className="pillars">
          <div><Icon type="people"/><b>People</b><span>Empowering<br/>your workforce</span></div>
          <div><Icon type="process"/><b>Process</b><span>Simplifying<br/>your operations</span></div>
          <div><Icon type="progress"/><b>Progress</b><span>Driving a<br/>brighter tomorrow</span></div>
        </div>

        <div className="landing-actions">
          <a href="/login" className="action-card"><Icon type="customer"/><div><b>Customer Login</b><span>Access your<br/>organization's HRMS</span></div><i>→</i></a>
          <a href="/platform-admin" className="action-card"><Icon type="platform"/><div><b>Platform Login</b><span>Manage customers,<br/>modules and operations</span></div><i>→</i></a>
          <a href="/trial" className="action-card"><Icon type="trial"/><div><b>Start Free Trial</b><span>Experience HumaNest<br/>with a 7-day free trial</span></div><i>→</i></a>
        </div>

        <div className="trust-row"><span><Icon type="secure"/>Secure</span><span><Icon type="cloud"/>Scalable</span><span><Icon type="people"/>People Centric</span><span><Icon type="globe"/>Future Ready</span></div>
      </div>
      <div className="landing-waves"><span/><span/><span/></div>
    </section>

    <section className="landing-right">
      <div className="preview-stack">
        <PreviewCard type="customer" title="Customer Login" subtitle="Access your organization's HRMS" href="/login"/>
        <PreviewCard type="platform" title="Platform Login" subtitle="Manage customers, modules and platform operations" href="/platform-admin"/>
      </div>
    </section>
  </main>
}
