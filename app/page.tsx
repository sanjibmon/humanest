'use client'

const TrustIcon = ({src, alt}:{src:string;alt:string}) => (
  <img className="trust-image" src={src} alt={alt} aria-hidden={!alt} />
)

export default function Home(){
  return (
    <main className="landing-page">
      <section className="landing-left">
        <div className="landing-orb orb-a"/><div className="landing-orb orb-b"/>
        <div className="landing-orb orb-c"/><div className="landing-orb orb-d"/>

        <div className="landing-topline">
          A BRIGHTER TOMORROW TOGETHER
          <div className="topline-mark"/>
        </div>

        <div className="landing-left-content">
          <img src="/humanest-logo-tight.png" className="landing-logo" alt="HumaNest — Your People. Your Process." />

          <h1>People Empower<br/>Progress<span>.</span></h1>
          <p className="landing-copy">
            A smarter platform for organizations<br/>
            to manage people, processes and possibilities.
          </p>

          <div className="pillars" aria-label="People, Process and Progress">
            <div><img className="pillar-image" src="/pillar_people_transparent.png" alt="People — Empowering your workforce" /></div>
            <div><img className="pillar-image" src="/pillar_process_transparent.png" alt="Process — Simplifying your operations" /></div>
            <div><img className="pillar-image" src="/pillar_progress_transparent.png" alt="Progress — Driving a brighter tomorrow" /></div>
          </div>

          <div className="landing-actions">
            <a href="/login" className="action-card">
              <img className="action-reference-icon" src="/customer_icon2_transparent.png" alt="" />
              <div><b>Customer Login</b><span>Access your<br/>organization's HRMS</span></div>
              <i>→</i>
            </a>
            <a href="/platform-admin" className="action-card">
              <img className="action-reference-icon" src="/platform_icon2_transparent.png" alt="" />
              <div><b>Platform Login</b><span>Manage customers,<br/>modules and platform<br/>operations</span></div>
              <i>→</i>
            </a>
            <a href="/trial" className="action-card">
              <img className="action-reference-icon" src="/trial_icon2_transparent.png" alt="" />
              <div><b>Start Free Trial</b><span>Experience HumaNest<br/>with a 7-day free trial</span></div>
              <i>→</i>
            </a>
          </div>

          <div className="trust-row">
            <span><TrustIcon src="/trust_secure_transparent.png" alt=""/>Secure</span>
            <span><TrustIcon src="/trust_cloud_transparent.png" alt=""/>Scalable</span>
            <span><TrustIcon src="/trust_people_transparent.png" alt=""/>People Centric</span>
            <span><TrustIcon src="/trust_globe_transparent.png" alt=""/>Future Ready</span>
          </div>
        </div>

        <div className="landing-footer-statement">
          YOUR PEOPLE. YOUR PROCESS. A BRIGHTER TOMORROW.
        </div>
        <div className="landing-waves"><span/><span/><span/></div>
      </section>
    </main>
  )
}
