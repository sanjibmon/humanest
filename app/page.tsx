'use client'

const Pillar = ({icon,title,lines}:{icon:string;title:string;lines:string[]}) => (
  <div className="pillar">
    <img className="pillar-badge" src={icon} alt="" />
    <div className="pillar-title">{title}</div>
    <div className="pillar-caption">{lines.map((x,i)=><span key={i}>{x}</span>)}</div>
  </div>
)

const TrustIcon = ({type}:{type:'secure'|'cloud'|'people'|'globe'}) => {
  const src={secure:'/trust_secure_transparent.png',cloud:'/trust_cloud_transparent.png',people:'/trust_people_transparent.png',globe:'/trust_globe_transparent.png'}[type]
  return <img className="trust-image" src={src} alt="" />
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
          <div className="pillar-slot"><Pillar icon="/pillar_people_badge.png" title="People" lines={["Empowering","your workforce"]}/></div>
          <div className="pillar-slot"><Pillar icon="/pillar_process_badge.png" title="Process" lines={["Simplifying","your operations"]}/></div>
          <div className="pillar-slot"><Pillar icon="/pillar_progress_badge.png" title="Progress" lines={["Driving a Brighter","tomorrow"]}/></div>
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
      <div className="display-recommendation" role="note">Recommended display: <strong>1920 × 1080</strong> · Browser zoom: <strong>100%</strong></div>
      <div className="landing-waves"><span/><span/><span/></div>
    </section>
  </main>
}
