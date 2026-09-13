'use client'

const Pillar = ({icon,title,lines}:{icon:string;title:string;lines:string[]}) => (
  <div className="pillar">
    <img className="pillar-badge" src={icon} alt="" />
    <div className="pillar-title">{title}</div>
    <div className="pillar-caption">{lines.map((x,i)=><span key={i}>{x}</span>)}</div>
  </div>
)

const TrustIcon = ({type}:{type:'secure'|'cloud'|'people'|'globe'}) => {
  const p:any={
    secure:<><path d="M12 3 20 6v5c0 5-3.2 8.7-8 10-4.8-1.3-8-5-8-10V6l8-3Z"/><path d="m8.3 12 2.3 2.3 5-5"/></>,
    cloud:<><path d="M7.2 18.5h10.6a4.2 4.2 0 0 0 .5-8.4A6.5 6.5 0 0 0 6 8.9a4.8 4.8 0 0 0 1.2 9.6Z"/></>,
    people:<><circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M3 19c0-3.2 2.5-5 6-5s6 1.8 6 5M14 14.5c3.2-.4 6 1.1 6 4.5"/></>,
    globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.5 18.5 12 21M12 3C9.5 5.5 8.5 8.5 8.5 12s1 6.5 3.5 9"/></>
  }
  return <svg className="trust-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{p[type]}</svg>
}

export default function Home(){
  return <main className="landing-page">
    <section className="landing-left">
      <div className="landing-orb orb-a"/><div className="landing-orb orb-b"/><div className="landing-orb orb-c"/><div className="landing-orb orb-d"/>
      <div className="landing-topline">A BRIGHTER TOMORROW TOGETHER<div className="topline-mark"/></div>

      <div className="landing-left-content">
        <img src="/humanest-logo-tight.png" className="landing-logo" alt="HumaNest — Your People. Your Process." />
        <h1>People Empower<br/>Progress<span>.</span></h1>
        <p className="landing-copy">A smarter platform for organizations<br/>to manage people, processes and possibilities.</p>

        <div className="pillars" aria-label="People, Process and Progress">
          <Pillar icon="/pillar_people_badge.png" title="People" lines={["Empowering","your workforce"]}/>
          <Pillar icon="/pillar_process_badge.png" title="Process" lines={["Simplifying","your operations"]}/>
          <Pillar icon="/pillar_progress_badge.png" title="Progress" lines={["Driving a Brighter","tomorrow"]}/>
        </div>

        <div className="landing-actions">
          <a href="/login" className="action-card"><img src="/customer_icon2_transparent.png" className="action-reference-icon" alt=""/><div><b>Customer Login</b><span>Access your<br/>organization's HRMS</span></div><i>→</i></a>
          <a href="/platform-admin" className="action-card"><img src="/platform_icon2_transparent.png" className="action-reference-icon" alt=""/><div><b>Platform Login</b><span>Manage customers,<br/>modules and platform<br/>operations</span></div><i>→</i></a>
          <a href="/trial" className="action-card"><img src="/trial_icon2_transparent.png" className="action-reference-icon" alt=""/><div><b>Start Free Trial</b><span>Experience HumaNest<br/>with a 7-day free trial</span></div><i>→</i></a>
        </div>

        <div className="trust-row">
          <span><TrustIcon type="secure"/>Secure</span>
          <span><TrustIcon type="cloud"/>Scalable</span>
          <span><TrustIcon type="people"/>People Centric</span>
          <span><TrustIcon type="globe"/>Future Ready</span>
        </div>
      </div>

      <div className="landing-footer-statement">YOUR PEOPLE. YOUR PROCESS. A BRIGHTER TOMORROW.</div>
      <div className="landing-waves"><span/><span/><span/></div>
    </section>
  </main>
}
