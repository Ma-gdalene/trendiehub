import { createContext, useContext, useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  Activity, ArrowRight, ArrowUpRight, Bell, BookOpen, Camera, Check, CheckCircle2, ChevronRight,
  CircleAlert, CircleHelp, ClipboardList, Clock3, FileText, ImagePlus, LayoutDashboard, LogOut,
  Mail, Menu, MessageCircle, Plus, RefreshCw, Search, Send, Settings, ShieldCheck, Sparkles,
  Target, Trophy, Users, X, Droplets, CalendarDays, UserRound, Inbox, ExternalLink, Trash2,
} from 'lucide-react';
import {
  useGetProfile, useGetDashboard, useListModels, useListApplications, useSubmitApplication,
  useUpdateProfile,
  useDecideApplication, useListTasks, useCreateTask, useUpdateTask, useSubmitTask,
  useReviewSubmission, useGetLeaderboard, useListPoints, useAwardPoints, useListAnnouncements,
  useCreateAnnouncement, useUpdateAnnouncement, useMarkAnnouncementRead, useListConversations,
  useCreateConversation, useListMessages, useSendMessage, useListNotifications,
  useMarkNotificationsRead, useListDailyEntries, useSaveDailyEntry, useListSupportRequests,
  useCreateSupportRequest, useUpdateSupportRequest, useReplyToSupportRequest,
  useSetModelSuspension, useUpdateModelProfile,
  useListAuditLogs, useGetAdminStats, getGetProfileQueryKey, getGetDashboardQueryKey,
  getListModelsQueryKey, getListApplicationsQueryKey, getListTasksQueryKey,
  getGetLeaderboardQueryKey, getListPointsQueryKey, getListAnnouncementsQueryKey,
  getListConversationsQueryKey, getListMessagesQueryKey, getListNotificationsQueryKey,
  getListDailyEntriesQueryKey, getListSupportRequestsQueryKey, getListAuditLogsQueryKey,
  getGetAdminStatsQueryKey,
  getListAgencyAdminsQueryKey, useListAgencyAdmins,
} from '@workspace/api-client-react';
import type { AgencyProfile, AgencyTask } from '@workspace/api-client-react';
import { supabase } from './lib/supabase';

type AuthInfo = { userId: string | null; email: string | null; loading: boolean };
const AuthContext = createContext<AuthInfo>({ userId: null, email: null, loading: true });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<AuthInfo>({ userId: null, email: null, loading: true });
  useEffect(() => {
    if (!supabase) { setInfo({ userId: null, email: null, loading: false }); return; }
    supabase.auth.getSession().then(({ data }) => setInfo({ userId: data.session?.user.id ?? null, email: data.session?.user.email ?? null, loading: false }));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setInfo({ userId: session?.user.id ?? null, email: session?.user.email ?? null, loading: false }));
    return () => data.subscription.unsubscribe();
  }, []);
  return <AuthContext.Provider value={info}>{children}</AuthContext.Provider>;
}

function Brand({ light = false }: { light?: boolean }) { return <Link href="/" className={`brand ${light ? 'brand-light' : ''}`}><img className="brand-logo" src="/trendie-logo.png" alt="TRENDIE MODELS logo"/><span className="brand-name">TRENDIE <b>MODELS</b><small>ACCRA · GHANA</small></span></Link>; }
function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'secondary' | 'quiet' }) { return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>; }

export function PublicHome() {
  const auth = useContext(AuthContext);
  const [, go] = useLocation();
  return (
    <div className="landing">
      <header className="public-nav wrap">
        <Brand />
        <nav>
          <a href="#agency">About</a>
          <a href="#drives">Values</a>
          <a href="#partnership">Partnership</a>
          <a href="#departments">Departments</a>
          <a href="#journey">Journey</a>
          <a href="#standards">Standards</a>
          <a href="#team">Team</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav-actions">
          {auth.userId ? (
            <>
              <Link href="/dashboard" className="button button-outline">Dashboard</Link>
              <button
                type="button"
                className="nav-signout-btn"
                onClick={async () => {
                  await supabase?.auth.signOut();
                  go('/');
                }}
              >
                <LogOut size={15}/> <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="nav-signin">Sign in</Link>
              <Link href="/sign-up" className="button button-primary">Join the agency <ArrowRight size={16}/></Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-copy wrap">
            <div className="eyebrow">
              <i/> WHERE TALENT MEETS OPPORTUNITY · ACCRA, GHANA
            </div>
            <h1>
              Where Emerging Talent<br/>Meets <em>Global Opportunity.</em>
            </h1>
            <p className="hero-lede">
              Trendie Models Ghana is a professional modeling and talent development agency based in Accra, dedicated to discovering, developing, and representing emerging talent. At Trendie Models, modeling is more than appearance — it is about confidence, discipline, professionalism, and representing brands with excellence.
            </p>
            <div className="requirements-callout">
              <span className="req-tag">Call For Models</span>
              <span className="req-text">Females · Ages 18 – 30 · All Nationalities · All Heights Welcome</span>
            </div>
            <div className="hero-buttons">
              <Link href="/sign-up" className="button button-primary button-large">
                Start your application <ArrowRight size={17}/>
              </Link>
              <a href="#departments" className="text-link">
                Explore departments <ChevronRight size={16}/>
              </a>
            </div>
            <div className="hero-proof">
              <span/>
              <p>Discover · Develop · Represent · Create Opportunities</p>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=85&fit=crop&crop=faces,top"
                alt="TRENDIE MODELS — editorial portrait"
                fetchPriority="high"
              />
            </div>
            <div className="hero-stamp">
              <b>TM</b>
              <small>ACCRA<br/>GHANA</small>
            </div>
            <div className="hero-caption">01 / WHERE TALENT MEETS OPPORTUNITY</div>
          </div>
        </section>

        {/* FOUR PILLARS BAR */}
        <div className="pillars-bar">
          <div className="wrap pillars-grid">
            <div className="pillar-item">
              <span>PILLAR 01</span>
              <b>Discover</b>
            </div>
            <div className="pillar-item">
              <span>PILLAR 02</span>
              <b>Develop</b>
            </div>
            <div className="pillar-item">
              <span>PILLAR 03</span>
              <b>Represent</b>
            </div>
            <div className="pillar-item">
              <span>PILLAR 04</span>
              <b>Create Opportunities</b>
            </div>
          </div>
        </div>

        {/* 01 WHO WE ARE */}
        <section id="agency" className="intro-section">
          <div className="wrap intro-grid">
            <p className="section-kicker">01 — WHO WE ARE</p>
            <div>
              <h2>Good representation<br/>starts with <em>good people.</em></h2>
              <p className="intro-text">
                Trendie Models Ghana is a professional modeling and talent development agency based in Accra, dedicated to discovering, developing, and representing emerging talent. We create opportunities for individuals who aspire to build careers in fashion, commercial modeling, brand representation, media, and entertainment.
              </p>
              <p className="intro-text" style={{ marginTop: '-8px' }}>
                At Trendie Models, modeling is more than appearance. It is about confidence, discipline, professionalism, and the ability to represent a brand with excellence.
              </p>
              <Link href="/sign-up" className="text-link">
                Meet your next chapter <ArrowRight size={16}/>
              </Link>
            </div>
            <div className="intro-note">
              <span/>
              <p>Local perspective.<br/>Ambitious outlook.<br/>People, always.</p>
            </div>
          </div>
        </section>

        {/* 02 WHAT DRIVES US: MISSION, VISION & CORE VALUES */}
        <section id="drives" className="drives-section wrap">
          <div>
            <p className="section-kicker">02 — WHAT DRIVES US</p>
            <h2>Mission, Vision &amp;<br/><em>Core Values</em></h2>
          </div>
          <div className="mission-vision-grid">
            <div className="drive-card">
              <span>OUR MISSION</span>
              <h3>Meaningful pathways to sustainable careers.</h3>
              <p>
                To discover, develop, and professionally represent modeling talent while creating meaningful opportunities for models to build sustainable careers.
              </p>
            </div>
            <div className="drive-card">
              <span>OUR VISION</span>
              <h3>Connecting Ghanaian talent to the world.</h3>
              <p>
                To become a leading modeling agency in Ghana, recognized for developing exceptional talent and connecting Ghanaian models to opportunities locally and internationally.
              </p>
            </div>
          </div>
          <div className="values-head">
            <p className="section-kicker">OUR PILLARS OF EXCELLENCE</p>
            <h3>Core values that guide our work</h3>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <span className="value-num">01 / VALUES</span>
              <h4>Excellence</h4>
              <p>We pursue high standards in everything we do, from training to runway representation.</p>
            </div>
            <div className="value-card">
              <span className="value-num">02 / VALUES</span>
              <h4>Professionalism</h4>
              <p>We prepare our models to conduct themselves with confidence, discipline, and respect.</p>
            </div>
            <div className="value-card">
              <span className="value-num">03 / VALUES</span>
              <h4>Integrity</h4>
              <p>We value honesty, transparency, and responsible representation across every engagement.</p>
            </div>
            <div className="value-card">
              <span className="value-num">04 / VALUES</span>
              <h4>Confidence</h4>
              <p>We help individuals recognize their true potential and express it with radiant confidence.</p>
            </div>
            <div className="value-card">
              <span className="value-num">05 / VALUES</span>
              <h4>Discipline</h4>
              <p>We believe consistency, punctuality, and unwavering commitment are essential to success.</p>
            </div>
            <div className="value-card">
              <span className="value-num">06 / VALUES</span>
              <h4>Opportunity</h4>
              <p>We aim to create genuine pathways for talent to grow, earn, and succeed on global stages.</p>
            </div>
          </div>
        </section>

        {/* 03 CREATIVE PARTNERSHIP */}
        <section id="partnership" className="partnership-section">
          <div className="wrap partnership-grid">
            <div className="partnership-copy">
              <p className="section-kicker">03 — CREATIVE PARTNERSHIP</p>
              <h2>Trendie Models ×<br/><em>Kwesi Arthur Pixel</em></h2>
              <p className="partnership-lead">
                Trendie Models Ghana is partnering with Kwesi Arthur Pixel to strengthen the visual development and professional presentation of our models. This collaboration brings together agency expertise and creative photography to build compelling visual identities for our talent.
              </p>
              <div className="partnership-features">
                <div className="partnership-feature-item">
                  <Check size={14}/>
                  <span>Professional Model Photography</span>
                </div>
                <div className="partnership-feature-item">
                  <Check size={14}/>
                  <span>Portfolio Development</span>
                </div>
                <div className="partnership-feature-item">
                  <Check size={14}/>
                  <span>Creative Direction</span>
                </div>
                <div className="partnership-feature-item">
                  <Check size={14}/>
                  <span>Model Branding</span>
                </div>
                <div className="partnership-feature-item">
                  <Check size={14}/>
                  <span>Professional Visual Content</span>
                </div>
                <div className="partnership-feature-item">
                  <Check size={14}/>
                  <span>Campaign &amp; Promotional Content</span>
                </div>
              </div>
            </div>
            <div className="partnership-badge-wrap">
              <div className="partnership-box">
                <small>Official Visual Development</small>
                <h3>High-Caliber Imagery for Every Model</h3>
                <p>
                  Every approved talent undergoes professional comp card shoots, editorial creative direction, and campaign packaging.
                </p>
                <Link href="/sign-up" className="button button-primary">
                  Begin your portfolio <ArrowRight size={15}/>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 04 OUR DEPARTMENTS */}
        <section id="departments" className="departments-section">
          <div className="wrap">
            <div className="section-heading">
              <div>
                <p className="section-kicker">04 — OUR DEPARTMENTS</p>
                <h2>Areas of Representation<br/><em>&amp; Industry Focus</em></h2>
              </div>
              <p>
                Trendie Models develops and represents talent across multiple areas of the modeling and creative industry.
              </p>
            </div>
            <div className="departments-grid">
              <article className="dept-card">
                <span className="dept-num">DEPARTMENT 01</span>
                <h3>Fashion &amp; Runway</h3>
                <p>Models prepared for runway shows, fashion weeks, designer presentations, and high-profile fashion events.</p>
              </article>
              <article className="dept-card">
                <span className="dept-num">DEPARTMENT 02</span>
                <h3>Commercial Modeling</h3>
                <p>Models for advertisements, product campaigns, lifestyle campaigns, and commercial video productions.</p>
              </article>
              <article className="dept-card">
                <span className="dept-num">DEPARTMENT 03</span>
                <h3>Editorial</h3>
                <p>Models for high-fashion editorials, magazines, creative campaigns, and professional fashion photography.</p>
              </article>
              <article className="dept-card">
                <span className="dept-num">DEPARTMENT 04</span>
                <h3>Brand Ambassadors</h3>
                <p>Models representing luxury and consumer brands at campaigns, product activations, launches, and promotional events.</p>
              </article>
              <article className="dept-card">
                <span className="dept-num">DEPARTMENT 05</span>
                <h3>Influencer &amp; Digital Talent</h3>
                <p>Talent suited for digital campaigns, social media storytelling, and creator-led brand collaborations.</p>
              </article>
              <article className="dept-card">
                <span className="dept-num">DEPARTMENT 06</span>
                <h3>Events &amp; Promotional</h3>
                <p>Professional talent for luxury events, trade exhibitions, brand activations, and promotional campaigns.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 05 THE 7-STEP JOURNEY */}
        <section id="journey" className="journey-section">
          <div className="wrap journey-grid">
            <div className="journey-heading">
              <p className="section-kicker">05 — FROM APPLICATION TO OPPORTUNITY</p>
              <h2>A clear, structured path<br/>from discovery to <em>representation.</em></h2>
              <p>
                We guide each model step by step — from your first photo submission through training, portfolio shoots, and professional brand bookings.
              </p>
              <Link href="/sign-up" className="button button-primary">
                Apply to join <ArrowRight size={16}/>
              </Link>
            </div>
            <div className="steps">
              {[
                ['01', 'Application', 'Applicants submit their required personal details and initial photographs.'],
                ['02', 'Screening', 'Applications are carefully reviewed based on suitability, presentation, and raw potential.'],
                ['03', 'Interview / Assessment', 'Selected applicants are invited for further physical assessment and discovery conversation.'],
                ['04', 'Portfolio Development', 'Successful talent receives professional guidance, creative direction, and visual development.'],
                ['05', 'Training & Orientation', 'Models are introduced to professional expectations, runway walk, posing, grooming, communication, and industry standards.'],
                ['06', 'Agency Representation', 'Approved models become part of the exclusive Trendie Models talent pool and are actively promoted.'],
                ['07', 'Bookings & Opportunities', 'Models are presented for appropriate fashion, commercial, promotional, and creative opportunities.'],
              ].map(([n, t, d]) => (
                <div className="step" key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 06 PROFESSIONALISM: 10 STANDARDS */}
        <section id="standards" className="standards-section wrap">
          <div>
            <p className="section-kicker">06 — PROFESSIONALISM STARTS HERE</p>
            <h2>The 10 Core Agency<br/><em>Professional Standards</em></h2>
            <p style={{ maxWidth: '640px', color: '#68756d', fontSize: '14px', lineHeight: '1.8', margin: '14px 0 0' }}>
              Being represented by Trendie Models means understanding that your conduct, attitude, and professionalism are part of your personal brand and the agency's reputation.
            </p>
          </div>
          <div className="standards-grid">
            {[
              ['01', 'Punctuality', 'Arrive on time for all castings, training sessions, fittings, and confirmed bookings.'],
              ['02', 'Professional Conduct', 'Treat clients, photographers, designers, agency staff, and fellow models with respect.'],
              ['03', 'Personal Presentation', 'Maintain appropriate grooming, hygiene, health, and clean professional appearance.'],
              ['04', 'Communication', 'Respond promptly and communicate clearly with agency management at all times.'],
              ['05', 'Commitment', 'Attend scheduled training, castings, rehearsals, and assignments responsibly.'],
              ['06', 'Confidentiality', 'Respect confidential information relating to clients, campaigns, and agency activities.'],
              ['07', 'Social Media', 'Maintain responsible online conduct that reflects positively on your professional engagements.'],
              ['08', 'Bookings', 'Follow agency procedures regarding bookings, availability, and client communication.'],
              ['09', 'Honesty', 'Provide accurate personal information and disclose relevant details whenever required.'],
              ['10', 'Teamwork', 'Respect other models and contribute positively to the Trendie Models community.'],
            ].map(([num, title, desc]) => (
              <div className="standard-card" key={num}>
                <span>{num}</span>
                <div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 07 MEET THE LEADERSHIP TEAM */}
        <section id="team" className="team-section">
          <div className="wrap">
            <p className="section-kicker">07 — LEADERSHIP</p>
            <h2>Meet the Team<br/><em>Behind Trendie Models</em></h2>
            <p style={{ maxWidth: '580px', color: '#67746c', fontSize: '13.5px', lineHeight: '1.8', margin: '14px 0 0' }}>
              The people behind Trendie Models Ghana — dedicated to building exceptional talent and a credible, world-class creative platform.
            </p>
            <div className="team-grid">
              <div className="team-card">
                <div className="team-avatar">LKA</div>
                <div className="team-info">
                  <h3>Legon Kwesi Arthur</h3>
                  <span className="team-role">Founder / CEO</span>
                  <p>
                    Responsible for the overall vision, strategy, creative partnerships, and growth of Trendie Models Ghana.
                  </p>
                </div>
              </div>
              <div className="team-card">
                <div className="team-avatar">M</div>
                <div className="team-info">
                  <h3>MAGDALENE</h3>
                  <span className="team-role">Operations / Management</span>
                  <p>
                    Responsible for talent coordination, model administration, bookings workflow, and day-to-day agency operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 08 CONTACT & CALL FOR MODELS */}
        <section id="contact" className="contact-section">
          <div className="wrap contact-grid">
            <div>
              <p className="section-kicker">08 — YOUR NEXT CHAPTER</p>
              <h2>Ready to take your<br/><em>talent further?</em></h2>
              <div className="requirements-callout" style={{ margin: '22px 0 0' }}>
                <span className="req-tag">Requirements</span>
                <span className="req-text">Females · Ages 18–30 · All Nationalities · All Heights Welcome</span>
              </div>
            </div>
            <div>
              <p>
                Whether you are applying for representation or inquiring about booking our models for upcoming campaigns, our management team is here to assist.
              </p>
              <div className="contact-numbers">
                <a href="mailto:hellotrendie@gmail.com" className="contact-phone-item">
                  <Mail size={16}/> hellotrendie@gmail.com
                </a>
                <a href="https://wa.me/233267730824" target="_blank" rel="noreferrer" className="contact-phone-item">
                  <span className="whatsapp-pill">WhatsApp</span> +233 26 773 0824
                </a>
                <a href="https://wa.me/233537298655" target="_blank" rel="noreferrer" className="contact-phone-item">
                  <span className="whatsapp-pill">WhatsApp</span> +233 53 729 8655
                </a>
                <span className="contact-phone-item" style={{ color: '#68756d', fontSize: '12px' }}>
                  Additional lines: 0205701711 · +1 334 578 5158
                </span>
              </div>
              <Link href="/sign-up" className="button button-primary">
                Submit model application <ArrowRight size={16}/>
              </Link>
              <p className="contact-small">
                Trendie Models Ghana — Where Talent Meets Opportunity · Accra, Ghana
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer wrap">
        <Brand />
        <p>Where Talent Meets Opportunity · Accra • Ghana</p>
        <div>
          <Link href="/sign-up">Apply to join</Link>
          <Link href="/sign-in">Member sign in</Link>
          <a href="mailto:hellotrendie@gmail.com">hellotrendie@gmail.com</a>
        </div>
        <small>© {new Date().getFullYear()} TRENDIE MODELS GHANA · ACCRA, GHANA · ALL RIGHTS RESERVED</small>
      </footer>
    </div>
  );
}

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password' }) {
  const auth = useContext(AuthContext); const [, go] = useLocation();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [name, setName] = useState('');
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  useEffect(() => { if (auth.userId && mode !== 'reset-password') go('/dashboard'); }, [auth.userId, mode, go]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setNotice('');
    if (!supabase) { setNotice('Authentication is not configured yet. Please contact the agency team.'); return; }
    setBusy(true);
    try {
       if (mode === 'sign-in') { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; go('/dashboard'); }
      else if (mode === 'sign-up') { const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }); if (error) throw error; setNotice('Your account is ready. Check your inbox if email confirmation is enabled, then sign in to begin your application.'); }
       else if (mode === 'forgot-password') { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) throw error; setNotice('If an account exists for that email, a recovery link is on its way.'); }
       else { const { error } = await supabase.auth.updateUser({ password: newPassword }); if (error) throw error; setNotice('Your password has been updated. You can continue to your dashboard.'); go('/dashboard'); }
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); } finally { setBusy(false); }
  };
  const title = mode === 'sign-in' ? 'Welcome back.' : mode === 'sign-up' ? 'Your story starts here.' : mode === 'reset-password' ? 'Choose a new password.' : 'Let’s get you back in.';
  return <div className="auth-page"><aside className="auth-aside"><Brand light/><div className="auth-quote"><p>“A place to show up as yourself, and grow into what’s next.”</p><small>TRENDIE MODELS · ACCRA</small></div><div className="auth-aside-bottom">TALENT · COMMUNITY · CARE</div></aside><main className="auth-main"><Link href="/" className="auth-back">← Back to the agency</Link><div className="auth-form-wrap"><div className="eyebrow"><i/> MEMBER ACCESS</div><h1>{title}</h1><p className="auth-sub">{mode === 'sign-up' ? 'Create your member account to start an application.' : mode === 'forgot-password' ? 'Enter your account email and we’ll send a secure recovery link.' : mode === 'reset-password' ? 'Set a new password for your TRENDIE MODELS account.' : 'Sign in to continue your agency journey.'}</p><form className="auth-form" onSubmit={submit}>{mode === 'sign-up' && <Field label="Your full name"><input required value={name} onChange={e => setName(e.target.value)} placeholder="As you’d like us to know you"/></Field>}{mode !== 'reset-password' && <Field label="Email address"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/></Field>}{mode === 'sign-in' && <Field label="Password"><input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"/></Field>}{mode === 'sign-up' && <Field label="Password"><input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"/></Field>}{mode === 'reset-password' && <Field label="New password"><input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters"/></Field>}{mode === 'sign-in' && <div className="forgot-line"><Link href="/forgot-password">Forgot password?</Link></div>}{notice && <p className="form-notice" role="status">{notice}</p>}<Button type="submit" disabled={busy} className="button-full">{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create account' : mode === 'reset-password' ? 'Update password' : 'Send recovery link'} <ArrowRight size={16}/></Button></form><p className="auth-switch">{mode === 'sign-up' ? 'Already a member?' : 'New to TRENDIE MODELS?'} <Link href={mode === 'sign-up' ? '/sign-in' : '/sign-up'}>{mode === 'sign-up' ? 'Sign in' : 'Create an account'}</Link></p><p className="auth-help">Need help? <a href="mailto:hellotrendiemodels@gmail.com">hellotrendiemodels@gmail.com</a></p></div></main></div>;
}

function initials(name?: string) { return (name || 'TM').split(' ').filter(Boolean).slice(0,2).map(s => s[0]?.toUpperCase()).join('') || 'TM'; }
function fmt(value?: string | null) { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GH', { month:'short', day:'numeric', year:'numeric' }); }
function Pill({ status }: { status: string }) { return <span className={`status-pill status-${status.toLowerCase().replaceAll('_','-')}`}>{status.replaceAll('_',' ')}</span>; }
function PageTitle({ title, description, eyebrow = 'YOUR AGENCY SPACE', action }: { title: string; description?: string; eyebrow?: string; action?: ReactNode }) { return <div className="page-title"><div><p className="section-kicker">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action}</div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
function LoadingState() { return <div className="loading-state"><i className="skeleton sk-title"/><i className="skeleton sk-line"/><i className="skeleton sk-card"/><i className="skeleton sk-card"/></div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div className="state-card"><CircleAlert/><h3>We couldn’t load this just now</h3><p>Please check your connection and try again. Your information is still safe.</p><Button variant="outline" onClick={retry}><RefreshCw size={15}/> Try again</Button></div>; }
function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) { return <div className="empty-state"><div className="empty-symbol"><Sparkles size={20}/></div><h3>{title}</h3><p>{body}</p>{action}</div>; }
function Metric({ icon, label, value, hint, tone }: { icon: ReactNode; label: string; value: number | string; hint: string; tone: string }) { return <div className="metric-card"><div className={`metric-icon metric-${tone}`}>{icon}</div><div className="metric-copy"><small>{label}</small><strong>{value}</strong><span>{hint}</span></div><ArrowUpRight className="metric-arrow" size={16}/></div>; }
function TaskRow({ task, onSubmit }: { task: AgencyTask; onSubmit?: () => void }) { return <div className="task-row"><span className="task-check">{task.status === 'completed' ? <Check size={15}/> : <Clock3 size={15}/>}</span><div className="task-row-main"><b>{task.title}</b><small>{task.deadline ? `Due ${fmt(task.deadline)}` : task.description}</small></div><Pill status={task.assignment_status || task.status}/>{onSubmit && <Button variant="outline" onClick={onSubmit}>Submit</Button>}</div>; }
function usePrivateUrl(bucket: string, path?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setUrl(null);
    if (!path || !supabase) return () => { active = false; };
    supabase.storage.from(bucket).createSignedUrl(path, 30 * 60).then(({ data, error }) => {
      if (active) setUrl(error ? '' : data?.signedUrl ?? '');
    }).catch(() => { if (active) setUrl(''); });
    return () => { active = false; };
  }, [bucket, path]);
  return url;
}
function PrivateImage({ bucket, path, alt, className = '' }: { bucket: string; path: string; alt: string; className?: string }) {
  const url = usePrivateUrl(bucket, path);
  return url ? <img className={className} src={url} alt={alt} loading="lazy"/> : <span className={`private-image-loading ${className}`} aria-label="Private image loading"><Camera size={17}/></span>;
}
function PrivateGallery({ paths, bucket, label }: { paths: string[]; bucket: string; label: string }) {
  if (!paths.length) return <p className="quiet-line">No {label.toLowerCase()} have been added yet.</p>;
  return <div className="private-gallery">{paths.map((path) => <PrivateGalleryItem key={path} bucket={bucket} path={path} label={label}/>)}</div>;
}
function PrivateGalleryItem({ bucket, path, label }: { bucket: string; path: string; label: string }) {
  const url = usePrivateUrl(bucket, path);
  if (url === null) return <span className="private-gallery-item"><span className="private-image-loading"><Camera size={17}/></span></span>;
  if (!url) return <span className="private-gallery-item"><span className="private-image-loading">Image unavailable</span></span>;
  return <a className="private-gallery-item" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${label}`}><img src={url} alt={label} loading="lazy"/></a>;
}
const modelNav = [['Overview','/dashboard',LayoutDashboard],['My profile','/profile',UserRound],['My tasks','/tasks',ClipboardList],['Points & ranking','/points',Trophy],['Messages','/messages',MessageCircle],['Announcements','/announcements',BookOpen],['Daily tracker','/daily-tracker',Activity],['Notifications','/notifications',Bell],['Help & support','/support',CircleHelp],['Settings','/settings',Settings]] as const;
const adminNav = [['Overview','/dashboard',LayoutDashboard],['Models','/models',Users],['Applications','/applications',FileText],['Tasks','/tasks',ClipboardList],['Points','/points',Trophy],['Messages','/messages',MessageCircle],['Announcements','/announcements',BookOpen],['Notifications','/notifications',Bell],['Support','/support',CircleHelp],['Audit log','/audit-logs',ShieldCheck],['Settings','/settings',Settings]] as const;
const routeTitles: Record<string,string> = { '/dashboard':'Overview','/profile':'My profile','/models':'Models','/applications':'Applications','/tasks':'Tasks','/points':'Points & ranking','/leaderboard':'Leaderboard','/messages':'Messages','/announcements':'Announcements','/daily-tracker':'Daily tracker','/notifications':'Notifications','/support':'Support','/audit-logs':'Audit log','/settings':'Settings' };

export function ProtectedPage({ path }: { path: string }) {
  const auth = useContext(AuthContext); const profileQuery = useGetProfile<AgencyProfile>({ query: { enabled: !!auth.userId, queryKey: getGetProfileQueryKey() } }); const [, go] = useLocation(); const [open, setOpen] = useState(false);
  useEffect(() => { if (!auth.loading && !auth.userId) go('/sign-in'); }, [auth.loading, auth.userId, go]);
  if (auth.loading || (auth.userId && profileQuery.isLoading)) return <div className="protected-loading"><div className="shell-skeleton"/><LoadingState/></div>;
  if (!auth.userId) return null;
  if (profileQuery.isError) return <div className="standalone-state"><ErrorState retry={() => profileQuery.refetch()}/></div>;
  const profile = profileQuery.data; if (!profile) return null;
  const admin = profile.role === 'admin';
  if (!admin && ['/models','/applications','/audit-logs'].includes(path)) return <div className="standalone-state"><EmptyState title="This space is for the agency team." body="Your member dashboard is ready for you." action={<Link href="/dashboard" className="button button-primary">Back to overview</Link>}/></div>;
  const currentTitle = routeTitles[path] || 'Agency space';
  return <div className="app-shell"><aside className={`sidebar ${open ? 'sidebar-open' : ''}`}><div className="sidebar-brand"><Brand light/><button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X/></button></div><div className="sidebar-kicker">{admin ? 'AGENCY CONSOLE' : 'MEMBER SPACE'}</div><nav className="side-nav">{(admin ? adminNav : modelNav).map(([label, href, Icon]) => <Link href={href} key={href} className={`side-link ${path === href || (path === '/leaderboard' && href === '/points') ? 'side-link-active' : ''}`} onClick={() => setOpen(false)}><Icon size={18}/><span>{label}</span></Link>)}</nav><div className="sidebar-bottom"><div className="sidebar-help"><CircleHelp/><div><b>Need a hand?</b><small>Our team is here for you.</small></div><Link href="/support"><ArrowUpRight size={16}/></Link></div><div className="user-mini"><span className="avatar">{initials(profile.full_name)}</span><div className="user-mini-text"><b>{profile.full_name || 'Member'}</b><small>{admin ? 'Agency admin' : 'Agency member'}</small></div></div><button type="button" className="sidebar-signout-row" onClick={async () => { await supabase?.auth.signOut(); go('/'); }}><LogOut size={16}/><span>Sign out</span></button></div></aside>{open && <button className="mobile-scrim" onClick={() => setOpen(false)} aria-label="Close menu"/>}<div className="main-column"><header className="app-topbar"><button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu/></button><div className="breadcrumb"><span>Agency space</span><ChevronRight size={14}/><b>{currentTitle}</b></div><div className="topbar-tools"><span className="today-label">{new Date().toLocaleDateString('en-GH',{weekday:'short',month:'short',day:'numeric'})}</span><Link href="/notifications" className="top-icon" title="Notifications"><Bell size={18}/></Link><Link href="/profile" className="top-avatar" title="My profile">{initials(profile.full_name)}</Link><button type="button" className="topbar-signout-btn" onClick={async () => { await supabase?.auth.signOut(); go('/'); }} title="Sign out"><LogOut size={15}/><span>Sign out</span></button></div></header><main className="page-content"><RouteScreen path={path} profile={profile} admin={admin}/></main></div></div>;
}

function RouteScreen({ path, profile, admin }: { path: string; profile: AgencyProfile; admin: boolean }) {
  switch (path) {
    case '/dashboard': return <Dashboard profile={profile} admin={admin}/>;
    case '/profile': return <Profile profile={profile}/>;
    case '/models': return <Models/>;
    case '/applications': return <Applications/>;
    case '/tasks': return <Tasks admin={admin} modelId={profile.id}/>;
    case '/points': case '/leaderboard': return <Points admin={admin}/>;
    case '/messages': return <Messages profile={profile} admin={admin}/>;
    case '/announcements': return <Announcements admin={admin}/>;
    case '/daily-tracker': return <Tracker/>;
    case '/notifications': return <Notifications userId={profile.id}/>;
    case '/support': return <Support admin={admin}/>;
    case '/audit-logs': return <Audit/>;
    case '/settings': return <SettingsPage profile={profile}/>;
    default: return <EmptyState title="This page isn’t available." body="Use the navigation to find your way around." action={<Link href="/dashboard" className="button button-primary">Go to overview</Link>}/>;
  }
}

function Dashboard({ profile, admin }: { profile: AgencyProfile; admin: boolean }) {
  const { data, isLoading, isError, refetch } = useGetDashboard();
  if (isLoading) return <LoadingState/>; if (isError || !data) return <ErrorState retry={() => refetch()}/>;
  return <><PageTitle eyebrow={admin ? 'AGENCY AT A GLANCE' : 'YOUR AGENCY SPACE'} title={admin ? 'Good to see you.' : `Welcome, ${profile.full_name.split(' ')[0]}.`} description={admin ? 'A clear view of what needs your attention today.' : 'Your next steps, all in one place.'} action={<Link href={admin ? '/applications' : '/profile'} className="button button-primary">{admin ? 'Review applications' : 'Complete your profile'} <ArrowRight size={16}/></Link>}/>
    {!admin && profile.application_status !== 'approved' && <div className="application-banner"><div className="banner-icon"><FileText/></div><div><b>{profile.application_status === 'pending' ? 'Your application is with our team.' : profile.application_status === 'rejected' ? 'Your application needs another look.' : 'Your agency journey begins with an application.'}</b><p>{profile.application_status === 'pending' ? 'We’ll keep you updated as soon as there’s news.' : profile.review_reason || 'Complete your profile and share a little about yourself to apply.'}</p></div><Pill status={profile.application_status}/>{profile.application_status !== 'pending' && <Link href="/profile" className="text-link">Continue <ArrowRight size={15}/></Link>}</div>}
    <div className="metric-grid">{admin ? <><Metric icon={<Users/>} label="Models" value={data.total_models} hint={`${data.approved_models} approved`} tone="olive"/><Metric icon={<FileText/>} label="Applications" value={data.pending_applications} hint="Awaiting review" tone="sand"/><Metric icon={<ClipboardList/>} label="Active tasks" value={data.tasks} hint={`${data.completed_tasks} completed`} tone="peach"/><Metric icon={<CircleHelp/>} label="Support requests" value={data.support_requests} hint="Across the agency" tone="blue"/></> : <><Metric icon={<Trophy/>} label="Points earned" value={profile.points} hint={data.leaderboard_position ? `Ranked #${data.leaderboard_position}` : 'Keep building momentum'} tone="olive"/><Metric icon={<ClipboardList/>} label="Your tasks" value={data.tasks} hint={`${data.completed_tasks} completed`} tone="sand"/><Metric icon={<MessageCircle/>} label="Messages" value={data.unread_messages} hint="Unread conversations" tone="peach"/><Metric icon={<Bell/>} label="Notifications" value={data.unread_notifications} hint="Updates for you" tone="blue"/></>}</div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><p className="section-kicker">UP NEXT</p><h2>{admin ? 'Agency pulse' : 'Upcoming tasks'}</h2></div><Link href={admin ? '/models' : '/tasks'} className="panel-link">View all <ArrowRight size={15}/></Link></div>{admin ? <div className="quick-links"><Link href="/applications"><span className="quick-icon"><FileText/></span><span><b>Applications to review</b><small>{data.pending_applications} waiting for a decision</small></span><ChevronRight/></Link><Link href="/support"><span className="quick-icon"><CircleHelp/></span><span><b>Support requests</b><small>{data.support_requests} conversations in progress</small></span><ChevronRight/></Link><Link href="/announcements"><span className="quick-icon"><BookOpen/></span><span><b>Keep the community in the loop</b><small>Share a new agency announcement</small></span><ChevronRight/></Link></div> : data.upcoming_tasks.length ? <div>{data.upcoming_tasks.slice(0,4).map(t => <TaskRow key={t.id} task={t}/>)}</div> : <EmptyState title="A little breathing room." body="There are no upcoming tasks right now. New assignments will appear here."/>}</section>
      <section className="panel"><div className="panel-head"><div><p className="section-kicker">FROM THE AGENCY</p><h2>Latest notes</h2></div><Link href="/announcements" className="panel-link">All notes <ArrowRight size={15}/></Link></div>{data.announcements.length ? data.announcements.slice(0,3).map(a=><article className="announcement-mini" key={a.id}><span className="announcement-mark"><BookOpen size={17}/></span><div><h3>{a.title}</h3><p>{a.body}</p><small>{fmt(a.created_at)}</small></div></article>) : <EmptyState title="A quiet bulletin board." body="Agency news will show here when it’s shared."/>}</section></div>
    <section className="panel activity-panel"><div className="panel-head"><div><p className="section-kicker">RECENT ACTIVITY</p><h2>{admin ? 'Agency activity' : 'Your recent progress'}</h2></div></div>{data.recent_activity.length ? data.recent_activity.slice(0,5).map((item,i)=><div className="activity-row" key={i}><i/><span>{String(item['description'] || item['action'] || 'Agency activity')}</span><small>{item['created_at'] ? fmt(String(item['created_at'])) : 'Recently'}</small></div>) : <p className="quiet-line">Your new activity will appear here.</p>}</section>
  </>;
}

function Profile({ profile }: { profile: AgencyProfile }) {
  const qc = useQueryClient();
  const update = useUpdateProfile();
  const submitApp = useSubmitApplication();
  const photoUrl = usePrivateUrl('profile-photos', profile.profile_photo_path);
  const [form, setForm] = useState({
    full_name: profile.full_name || '', phone: profile.phone || '',
    date_of_birth: profile.date_of_birth?.slice(0, 10) || '', location: profile.location || '',
    height_cm: profile.height_cm?.toString() || '', biography: profile.biography || '',
    experience: profile.experience || '', bust: String(profile.measurements?.bust_cm ?? ''),
    waist: String(profile.measurements?.waist_cm ?? ''), hips: String(profile.measurements?.hips_cm ?? ''),
    interests: (profile.interests || []).join(', '),
    instagram: profile.social_links?.instagram || '', tiktok: profile.social_links?.tiktok || '',
    otherSocial: profile.social_links?.other || '',
  });
  const [notice, setNotice] = useState('');
  const [statement, setStatement] = useState('');
  useEffect(() => setForm({
    full_name: profile.full_name || '', phone: profile.phone || '',
    date_of_birth: profile.date_of_birth?.slice(0, 10) || '', location: profile.location || '',
    height_cm: profile.height_cm?.toString() || '', biography: profile.biography || '',
    experience: profile.experience || '', bust: String(profile.measurements?.bust_cm ?? ''),
    waist: String(profile.measurements?.waist_cm ?? ''), hips: String(profile.measurements?.hips_cm ?? ''),
    interests: (profile.interests || []).join(', '),
    instagram: profile.social_links?.instagram || '', tiktok: profile.social_links?.tiktok || '',
    otherSocial: profile.social_links?.other || '',
  }), [profile]);
  const save = (e: FormEvent) => {
    e.preventDefault();
    const measurement = (value: string) => value.trim() ? Number(value) : null;
    const social = Object.fromEntries(Object.entries({
      instagram: form.instagram, tiktok: form.tiktok, other: form.otherSocial,
    }).filter(([, value]) => value.trim()));
    update.mutate({ data: {
      full_name: form.full_name.trim(), phone: form.phone.trim() || null,
      date_of_birth: form.date_of_birth || null, location: form.location.trim() || null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      biography: form.biography.trim() || null, experience: form.experience.trim() || null,
      measurements: Object.fromEntries(Object.entries({
        bust_cm: measurement(form.bust), waist_cm: measurement(form.waist), hips_cm: measurement(form.hips),
      }).filter(([, value]) => value !== null)),
      interests: form.interests.split(',').map((item) => item.trim()).filter(Boolean),
      social_links: social,
    } }, {
      onSuccess: (saved) => { qc.setQueryData(getGetProfileQueryKey(), saved); setNotice('Your profile has been updated.'); },
      onError: () => setNotice('Your changes could not be saved. Please check the fields and try again.'),
    });
  };
  const application = (e: FormEvent) => {
    e.preventDefault();
    submitApp.mutate({ data: { statement: statement.trim() || null } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        qc.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        setNotice('Your application has been successfully submitted to the TRENDIE MODELS review team! Our team will review your portfolio and details.');
      },
      onError: (err: unknown) => {
        const errorObj = err as { message?: string; error?: string };
        setNotice(errorObj?.message || errorObj?.error || 'Your application could not be submitted. Please check that your details are saved and try again.');
      },
    });
  };
  return <>
    <PageTitle title="Your profile" description="Help us understand who you are and where you’d like to go."/>
    <div className="profile-layout">
      <aside className="panel profile-summary">
        {photoUrl ? <img className="profile-photo" src={photoUrl} alt={`${profile.full_name || 'Model'} portrait`}/> : <div className="profile-photo-slot"><Camera/><span>Portrait</span><small>Private photo</small></div>}
        <h2>{profile.full_name || 'Your name'}</h2><p>{profile.location || 'Add your location'}</p>
        <Pill status={profile.application_status}/>
        <div className="completion"><div><span>Profile completion</span><b>{profile.profile_completion}%</b></div><div className="progress-track"><i style={{ width: `${Math.min(100, profile.profile_completion)}%` }}/></div><small>A complete profile helps our team get to know you.</small></div>
        <div className="points-preview"><Trophy/><span><b>{profile.points}</b><small>agency points</small></span></div>
        {profile.review_reason && <div className="review-note"><b>Team feedback</b><p>{profile.review_reason}</p></div>}
      </aside>
      <div className="profile-right">
        <form className="panel profile-form" onSubmit={save}>
          <div className="panel-head"><div><p className="section-kicker">PERSONAL DETAILS</p><h2>The essentials</h2></div><span className="privacy-note"><ShieldCheck size={15}/> Private to the agency</span></div>
          <div className="form-grid">
            <Field label="Full name"><input required minLength={2} maxLength={120} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}/></Field>
            <Field label="Email address"><input disabled value={profile.email}/></Field>
            <Field label="Phone number"><input maxLength={40} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+233"/></Field>
            <Field label="Date of birth"><input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })}/></Field>
            <Field label="Location"><input maxLength={120} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Accra, Ghana"/></Field>
            <Field label="Height (cm)"><input type="number" min="0" max="260" step="0.5" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })} placeholder="e.g. 172"/></Field>
            <Field label="Bust (cm)"><input type="number" min="0" max="260" step="0.5" value={form.bust} onChange={e => setForm({ ...form, bust: e.target.value })}/></Field>
            <Field label="Waist (cm)"><input type="number" min="0" max="260" step="0.5" value={form.waist} onChange={e => setForm({ ...form, waist: e.target.value })}/></Field>
            <Field label="Hips (cm)"><input type="number" min="0" max="260" step="0.5" value={form.hips} onChange={e => setForm({ ...form, hips: e.target.value })}/></Field>
            <Field label="Modeling interests"><input maxLength={500} value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} placeholder="Editorial, commercial, runway"/></Field>
            <Field label="Experience"><textarea maxLength={2000} rows={3} value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="Tell us about your experience so far"/></Field>
            <Field label="A little about you"><textarea maxLength={2000} rows={4} value={form.biography} onChange={e => setForm({ ...form, biography: e.target.value })} placeholder="Your story, interests, and what you’re excited to explore"/></Field>
            <Field label="Instagram (optional)"><input maxLength={200} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@username or profile URL"/></Field>
            <Field label="TikTok (optional)"><input maxLength={200} value={form.tiktok} onChange={e => setForm({ ...form, tiktok: e.target.value })} placeholder="@username or profile URL"/></Field>
            <Field label="Other social (optional)"><input maxLength={200} value={form.otherSocial} onChange={e => setForm({ ...form, otherSocial: e.target.value })} placeholder="Website or profile URL"/></Field>
          </div>
          {notice && <p className="form-notice" role="status">{notice}</p>}
          <div className="form-footer"><span>Only share details you’re comfortable sharing.</span><Button disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save changes'} <Check size={16}/></Button></div>
        </form>
        {['not_submitted', 'rejected'].includes(profile.application_status) && <form className="panel application-submit" onSubmit={application}><div><p className="section-kicker">YOUR APPLICATION</p><h2>{profile.application_status === 'rejected' ? 'Update your application' : 'Ready to introduce yourself?'}</h2><p>Tell our team what you’re hoping to explore. Your details stay private while we review.</p></div><Field label="Why would you like to join TRENDIE MODELS?"><textarea maxLength={2000} rows={4} value={statement} onChange={e => setStatement(e.target.value)} placeholder="A few words in your own voice"/></Field><div className="form-footer"><span>Application status: <Pill status={profile.application_status}/></span><Button disabled={submitApp.isPending}>{submitApp.isPending ? 'Submitting…' : 'Submit for review'} <ArrowRight size={16}/></Button></div></form>}
        <div className="panel portfolio-panel">
          <div><p className="section-kicker">PORTFOLIO MATERIALS</p><h2>Your work, thoughtfully presented.</h2><p>Images are stored privately. Profile photos up to 5 MB; portfolio images up to 15 MB.</p><PrivateGallery paths={profile.portfolio_paths || []} bucket="portfolio" label="Portfolio images"/></div>
          <StorageUpload profile={profile} kind="portfolio"/>
          <StorageUpload profile={profile} kind="photo"/>
        </div>
      </div>
    </div>
  </>;
}

function StorageUpload({ profile, kind }: { profile: AgencyProfile; kind: 'photo' | 'portfolio' }) {
  const qc = useQueryClient();
  const update = useUpdateProfile();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const bucket = kind === 'photo' ? 'profile-photos' : 'portfolio';
  const maxBytes = kind === 'photo' ? 5 * 1024 * 1024 : 15 * 1024 * 1024;
  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setStatus('Choose a JPG, PNG, or WebP image.'); return; }
    if (file.size > maxBytes) { setStatus(`This image is larger than ${kind === 'photo' ? '5' : '15'} MB. Choose a smaller file.`); return; }
    if (!supabase) { setStatus('Private upload is not configured. Contact the agency team.'); return; }
    setBusy(true);
    setStatus('Uploading securely…');
    try {
      const path = `${profile.id}/${kind}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const result = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
      if (result.error) throw result.error;
      const next = kind === 'photo' ? { profile_photo_path: path } : { portfolio_paths: [...(profile.portfolio_paths || []), path] };
      const saved = await update.mutateAsync({ data: next });
      qc.setQueryData(getGetProfileQueryKey(), saved);
      setStatus('Upload complete. Your private profile was updated.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return <div className={`storage-upload storage-${kind}`}>
    <label className="upload-control"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy}/><span className="upload-icon">{kind === 'photo' ? <Camera/> : <ImagePlus/>}</span><span><b>{kind === 'photo' ? 'Profile portrait' : 'Add portfolio image'}</b><small>{kind === 'photo' ? (profile.profile_photo_path ? 'Replace current portrait' : 'No portrait uploaded yet') : `${profile.portfolio_paths?.length || 0} image${profile.portfolio_paths?.length === 1 ? '' : 's'} in your portfolio`}</small></span><span className="upload-action">{busy ? 'Uploading…' : 'Choose file'}</span></label>
    {busy && <progress className="upload-progress"/>}{status && <p className={`upload-feedback ${/failed|Choose|larger|error/i.test(status) ? 'feedback-error' : ''}`} role="status">{status}</p>}
    <small className="upload-security"><ShieldCheck size={13}/> Private bucket · JPG, PNG, WebP · max {kind === 'photo' ? '5' : '15'} MB</small>
  </div>;
}

function Models() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<AgencyProfile | null>(null);
  const [notice, setNotice] = useState('');
  const q = useListModels({ search: search || undefined, status: status as never });
  const update = useUpdateModelProfile();
  const suspend = useSetModelSuspension();
  const [form, setForm] = useState({ full_name: '', phone: '', location: '', height_cm: '', biography: '' });
  useEffect(() => {
    if (selected) setForm({
      full_name: selected.full_name || '', phone: selected.phone || '',
      location: selected.location || '', height_cm: selected.height_cm?.toString() || '',
      biography: selected.biography || '',
    });
  }, [selected]);
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    update.mutate({ id: selected.id, data: {
      full_name: form.full_name.trim(), phone: form.phone.trim() || null,
      location: form.location.trim() || null, height_cm: form.height_cm ? Number(form.height_cm) : null,
      biography: form.biography.trim() || null,
    } }, {
      onSuccess: (model) => {
        setSelected(model);
        setNotice('Model profile updated.');
        qc.invalidateQueries({ queryKey: getListModelsQueryKey() });
      },
      onError: () => setNotice('The profile could not be updated. Please try again.'),
    });
  };
  const changeSuspension = () => {
    if (!selected) return;
    const next = !selected.suspended_at;
    if (!window.confirm(`${next ? 'Suspend' : 'Restore'} access for ${selected.full_name}?`)) return;
    suspend.mutate({ id: selected.id, data: { suspended: next } }, {
      onSuccess: (model) => {
        setSelected(model);
        setNotice(next ? 'This model’s access has been suspended.' : 'This model’s access has been restored.');
        qc.invalidateQueries({ queryKey: getListModelsQueryKey() });
      },
      onError: () => setNotice('The account status could not be changed. Please try again.'),
    });
  };
  return <>
    <PageTitle eyebrow="AGENCY ROSTER" title="Models" description="Search the roster, review private profiles, and manage account access."/>
    <div className="toolbar"><label className="search-field"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email"/></label><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">All members</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select></div>
    {q.isLoading ? <LoadingState/> : q.isError ? <ErrorState retry={() => q.refetch()}/> : q.data?.length ? <div className="panel table-panel"><table><thead><tr><th>Model</th><th>Location</th><th>Status</th><th>Points</th><th>Joined</th><th>Profile</th></tr></thead><tbody>{q.data.map(m => <tr key={m.id}><td><div className="table-person">{m.profile_photo_path ? <PrivateImage bucket="profile-photos" path={m.profile_photo_path} alt="" className="table-photo"/> : <span className="avatar">{initials(m.full_name)}</span>}<span><b>{m.full_name}</b><small>{m.email}</small></span></div></td><td>{m.location || '—'}</td><td><Pill status={m.suspended_at ? 'suspended' : m.application_status}/></td><td>{m.points}</td><td>{fmt(m.created_at)}</td><td><Button variant="outline" onClick={() => { setSelected(m); setNotice(''); }}>Inspect</Button></td></tr>)}</tbody></table></div> : <EmptyState title="Your roster is ready to take shape." body={search ? 'No models match this search. Try another name or email.' : 'Model records will appear here after visitors create accounts.'}/>}
    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}><section className="modal modal-wide model-detail" role="dialog" aria-modal="true" aria-labelledby="model-detail-title"><button type="button" className="modal-close" onClick={() => setSelected(null)} aria-label="Close profile"><X/></button><p className="section-kicker">PRIVATE MODEL PROFILE</p><div className="model-detail-heading">{selected.profile_photo_path ? <PrivateImage bucket="profile-photos" path={selected.profile_photo_path} alt={`${selected.full_name} portrait`} className="model-detail-photo"/> : <span className="avatar avatar-large">{initials(selected.full_name)}</span>}<div><h2 id="model-detail-title">{selected.full_name || 'Model'}</h2><p>{selected.email}</p><Pill status={selected.suspended_at ? 'suspended' : selected.application_status}/></div></div>
      <div className="model-detail-grid"><div><b>Phone</b><span>{selected.phone || 'Not provided'}</span></div><div><b>Location</b><span>{selected.location || 'Not provided'}</span></div><div><b>Date of birth</b><span>{selected.date_of_birth ? fmt(selected.date_of_birth) : 'Not provided'}</span></div><div><b>Height</b><span>{selected.height_cm ? `${selected.height_cm} cm` : 'Not provided'}</span></div><div><b>Interests</b><span>{selected.interests?.join(', ') || 'Not provided'}</span></div><div><b>Points</b><span>{selected.points}</span></div><div className="model-detail-wide"><b>Experience</b><span>{selected.experience || 'Not provided'}</span></div><div className="model-detail-wide"><b>About</b><span>{selected.biography || 'Not provided'}</span></div><div className="model-detail-wide"><b>Measurements</b><span>{Object.keys(selected.measurements || {}).length ? Object.entries(selected.measurements || {}).map(([key,value]) => `${key.replace('_cm','')}: ${String(value)} cm`).join(' · ') : 'Not provided'}</span></div><div className="model-detail-wide"><b>Social links</b><span>{Object.entries(selected.social_links || {}).map(([key,value]) => `${key}: ${value}`).join(' · ') || 'Not provided'}</span></div></div>
      <div className="model-portfolio"><h3>Private portfolio</h3><PrivateGallery paths={selected.portfolio_paths || []} bucket="portfolio" label="Portfolio images"/></div>
      <form className="model-admin-edit" onSubmit={save}><h3>Update permitted details</h3><div className="form-grid"><Field label="Full name"><input required minLength={2} maxLength={120} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}/></Field><Field label="Phone"><input maxLength={40} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></Field><Field label="Location"><input maxLength={120} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}/></Field><Field label="Height (cm)"><input type="number" min="0" max="260" step="0.5" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })}/></Field><Field label="Biography"><textarea maxLength={2000} rows={3} value={form.biography} onChange={e => setForm({ ...form, biography: e.target.value })}/></Field></div>{notice && <p className="form-notice" role="status">{notice}</p>}<div className="modal-actions"><Button type="button" variant="outline" onClick={changeSuspension} disabled={suspend.isPending}>{suspend.isPending ? 'Updating…' : selected.suspended_at ? 'Restore account' : 'Suspend account'}</Button><Button disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save profile'}</Button></div></form>
    </section></div>}
  </>;
}

function Applications() {
  const qc=useQueryClient(); const [filter,setFilter]=useState('pending'); const [review,setReview]=useState<{id:string;status:'approved'|'rejected'}|null>(null); const [reason,setReason]=useState('');
  const q=useListApplications({status:filter as never}); const mutation=useDecideApplication();
  const decide=(e:FormEvent)=>{e.preventDefault();if(!review)return;mutation.mutate({id:review.id,data:{status:review.status,reason}},{onSuccess:()=>{qc.invalidateQueries({queryKey:getListApplicationsQueryKey()});qc.invalidateQueries({queryKey:getListModelsQueryKey()});qc.invalidateQueries({queryKey:getGetDashboardQueryKey()});setReview(null);setReason('');}});};
  return <><PageTitle eyebrow="MEMBERSHIP REVIEW" title="Applications" description="Give every application a thoughtful, clear review."/><div className="tabs">{['pending','approved','rejected','all'].map(s=><button key={s} className={filter===s?'tab-active':''} onClick={()=>setFilter(s)}>{s[0].toUpperCase()+s.slice(1)}</button>)}</div>{q.isLoading?<LoadingState/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:q.data?.length?<div className="application-list">{q.data.map(a=><article className="panel application-card" key={a.id}><div className="application-person"><span className="avatar avatar-large">{initials(a.applicant?.full_name)}</span><div><h2>{a.applicant?.full_name||'Applicant'}</h2><p>{a.applicant?.email||'Account details unavailable'} · {a.applicant?.location||'Location not shared'}</p><small>Submitted {fmt(a.submitted_at)}</small></div><Pill status={a.status}/></div><div className="application-statement"><b>Why TRENDIE MODELS?</b><p>{a.statement||'No application statement was added.'}</p>{a.review_reason&&<div className="review-note"><b>Previous review note</b><p>{a.review_reason}</p></div>}</div>{a.status==='pending'&&<div className="application-actions"><Button variant="outline" onClick={()=>{setReview({id:a.id,status:'rejected'});setReason('');}}>Decline with a note</Button><Button onClick={()=>{setReview({id:a.id,status:'approved'});setReason('Approved to join the agency.');}}>Approve applicant <Check size={16}/></Button></div>}</article>)}</div>:<EmptyState title="No applications in this view." body="New applications will appear here for review. The list reflects live agency records."/>}
  {review&&<div className="modal-backdrop"><form className="modal" onSubmit={decide}><button type="button" className="modal-close" onClick={()=>setReview(null)} aria-label="Close"><X/></button><p className="section-kicker">APPLICATION DECISION</p><h2>{review.status==='approved'?'Welcome them in.':'Share a clear decision.'}</h2><p>Add a short reason or note for the applicant. This is shared with them.</p><Field label="Review note"><textarea required minLength={3} maxLength={1000} rows={4} value={reason} onChange={e=>setReason(e.target.value)} placeholder="A thoughtful note from the agency"/></Field><div className="modal-actions"><Button type="button" variant="outline" onClick={()=>setReview(null)}>Cancel</Button><Button disabled={mutation.isPending}>{mutation.isPending?'Saving…':`Confirm ${review.status}`} <ArrowRight size={15}/></Button></div></form></div>}</>;
}

function Tasks({ admin, modelId }: { admin: boolean; modelId: string }) {
  const qc = useQueryClient();
  const q = useListTasks();
  const models = useListModels({ status: 'approved' }, { query: { enabled: admin, queryKey: getListModelsQueryKey({ status: 'approved' }) } });
  const create = useCreateTask();
  const update = useUpdateTask();
  const submit = useSubmitTask();
  const review = useReviewSubmission();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [taskId, setTaskId] = useState('');
  const [notes, setNotes] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [reviewPoints, setReviewPoints] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [uploadNotice, setUploadNotice] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
  const emptyForm = { title: '', description: '', instructions: '', deadline: '', priority: 'normal', assignment_user_ids: [] as string[] };
  const [form, setForm] = useState(emptyForm);
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client.channel(`agency-tasks-${modelId}`);
    if (admin) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        void qc.invalidateQueries({ queryKey: getListTasksQueryKey() });
        void qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      });
    } else {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignments', filter: `model_id=eq.${modelId}` }, () => {
        void qc.invalidateQueries({ queryKey: getListTasksQueryKey() });
        void qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      });
    }
    channel.subscribe();
    return () => { void client.removeChannel(channel); };
  }, [admin, modelId, qc]);
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListTasksQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
  };
  const editTask = (task: AgencyTask) => {
    const details = task as unknown as { assignees?: { id: string; status?: string }[] };
    setEditingTask(task.id);
    setForm({
      title: task.title, description: task.description || '', instructions: task.instructions || '',
      deadline: task.deadline?.slice(0, 10) || '', priority: task.priority,
      assignment_user_ids: (details.assignees || []).filter((person) => person.status !== 'cancelled').map((person) => person.id),
    });
    setCreateOpen(true);
  };
  const closeTaskForm = () => { setCreateOpen(false); setEditingTask(null); setForm(emptyForm); };
  const deleteTask = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete task “${title}”? This will remove all assignees and submissions. This cannot be undone.`)) return;
    try {
      const session = (await supabase?.auth.getSession())?.data.session;
      const token = session?.access_token;
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete task');
      }
      invalidate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete task.');
    }
  };
  const saveTask = (e: FormEvent) => {
    e.preventDefault();
    const deadline = form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null;
    const body = { title: form.title.trim(), description: form.description.trim(), instructions: form.instructions.trim() || null, deadline, priority: form.priority as never, assignment_user_ids: form.assignment_user_ids };
    const onSuccess = () => { invalidate(); closeTaskForm(); };
    if (editingTask) update.mutate({ id: editingTask, data: body }, { onSuccess });
    else create.mutate({ data: body }, { onSuccess });
  };
  const submitTask = async (task: AgencyTask, e: FormEvent) => {
    e.preventDefault();
    if (!task.assignment_id) return;
    if (evidenceFiles.length > 20) { setUploadNotice('You can attach up to 20 files.'); return; }
    setUploadNotice('');
    const paths: string[] = [];
    if (evidenceFiles.length) {
      if (!supabase) { setUploadNotice('Private file storage is not configured. Contact the agency team.'); return; }
      setUploadBusy(true);
      try {
        for (const file of evidenceFiles) {
          if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) throw new Error('Attach JPG, PNG, WebP, or PDF files only.');
          if (file.size > 10 * 1024 * 1024) throw new Error('Each evidence file must be 10 MB or smaller.');
          const path = `${modelId}/${task.assignment_id}/submissions/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const result = await supabase.storage.from('task-evidence').upload(path, file, { upsert: false, contentType: file.type });
          if (result.error) throw result.error;
          paths.push(path);
        }
        setUploadNotice('Files uploaded privately. Sending your submission…');
      } catch (err) {
        setUploadNotice(err instanceof Error ? err.message : 'An evidence file could not be uploaded.');
        setUploadBusy(false);
        return;
      }
    }
    try {
      await submit.mutateAsync({ id: task.assignment_id, data: { notes: notes.trim() || null, evidence_paths: paths } });
      invalidate(); setTaskId(''); setNotes(''); setEvidenceFiles([]); setUploadNotice('Your task has been submitted.');
    } catch (err) {
      setUploadNotice(err instanceof Error ? err.message : 'Your submission could not be sent.');
    } finally {
      setUploadBusy(false);
    }
  };
  const reviewTask = (task: AgencyTask, e: FormEvent) => {
    e.preventDefault();
    if (!task.assignment_id) return;
    review.mutate({ id: task.assignment_id, data: { status: reviewStatus, review_note: reviewNote, points_awarded: Number(reviewPoints) || 0 } }, {
      onSuccess: () => { invalidate(); setTaskId(''); setReviewNote(''); setReviewPoints(''); },
    });
  };
  const taskStatus = (task: AgencyTask) => {
    const status = task.assignment_status || task.status;
    return task.deadline && ['open', 'in_progress'].includes(status) && new Date(task.deadline).getTime() < Date.now() ? 'overdue' : status;
  };
  const canSubmit = (task: AgencyTask) => ['open', 'in_progress'].includes(task.assignment_status || '');
  return <>
    <PageTitle title={admin ? 'Tasks & assignments' : 'My tasks'} eyebrow={admin ? 'AGENCY OPERATIONS' : 'YOUR ASSIGNMENTS'} description={admin ? 'Create assignments, review submissions, and keep expectations clear.' : 'Your assignments and submissions, all in one place.'} action={admin ? <Button onClick={() => { setEditingTask(null); setForm(emptyForm); setCreateOpen(true); }}><Plus size={16}/> Create task</Button> : undefined}/>
    {q.isLoading ? <LoadingState/> : q.isError ? <ErrorState retry={() => q.refetch()}/> : q.data?.length ? <div className="task-list">{q.data.map(task => {
       const details = task as unknown as { assignees?: { id: string; full_name?: string; assignment_id: string; status: string }[] };
      const assignment = details.assignees?.find((person) => person.assignment_id === task.assignment_id);
       const submission = task.submission as unknown as { notes?: string; status?: string; evidence_paths?: string[]; review_note?: string } | null;
      const taskKey = task.assignment_id || task.id;
      return <article className="panel task-card" key={taskKey}>
        <div className="task-card-head"><span className="task-check"><ClipboardList size={17}/></span><div><h2>{task.title}</h2><p>{task.description}</p></div><Pill status={taskStatus(task)}/></div>
        {admin && assignment && <p className="task-assignee">Assigned to <b>{assignment.full_name || 'Model'}</b></p>}
        {task.instructions && <div className="task-instructions"><b>Instructions</b><p>{task.instructions}</p></div>}
        <div className="task-meta"><span><Clock3 size={15}/> {task.deadline ? `Due ${fmt(task.deadline)}` : 'No deadline'}</span><span className={`priority priority-${task.priority}`}>{task.priority} priority</span></div>
         {submission && <div className="submission-preview"><b>Submission</b><p>{submission.notes || 'Evidence submitted for review.'}</p>{submission.status && <Pill status={submission.status}/>}<div className="evidence-list">{submission.evidence_paths?.map((path) => <SignedEvidence key={path} path={path}/>)}</div>{submission.review_note && <p className="review-feedback"><b>Agency feedback:</b> {submission.review_note}</p>}</div>}
        {!admin && canSubmit(task) && <form className="inline-submit task-submit-form" onSubmit={e => submitTask(task, e)}><Field label="Submission notes"><textarea value={taskId === taskKey ? notes : ''} onChange={e => { setTaskId(taskKey); setNotes(e.target.value); }} rows={2} placeholder="Add context for your submission"/></Field><label className="task-upload"><input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => { setTaskId(taskKey); setEvidenceFiles(Array.from(e.target.files || [])); setUploadNotice(''); }}/><span><ImagePlus size={15}/> Attach evidence</span><small>{taskId === taskKey && evidenceFiles.length ? evidenceFiles.map(f => f.name).join(', ') : 'Images or PDF · 10 MB max each'}</small></label>{taskId === taskKey && uploadNotice && <p className="upload-feedback" role="status">{uploadNotice}</p>}{uploadBusy && <progress className="upload-progress"/>}<Button disabled={submit.isPending || uploadBusy || !task.assignment_id}>{uploadBusy ? 'Uploading…' : submit.isPending ? 'Submitting…' : 'Submit task'} <ArrowRight size={15}/></Button></form>}
        {admin && task.assignment_status === 'submitted' && <form className="inline-submit review-form" onSubmit={e => reviewTask(task, e)}><Field label="Review note"><input required maxLength={1000} value={taskId === taskKey ? reviewNote : ''} onChange={e => { setTaskId(taskKey); setReviewNote(e.target.value); }} placeholder="Feedback for this model"/></Field><Field label="Points"><input type="number" min="0" max="10000" value={taskId === taskKey ? reviewPoints : ''} onChange={e => { setTaskId(taskKey); setReviewPoints(e.target.value); }}/></Field><select value={reviewStatus} onChange={e => setReviewStatus(e.target.value as 'approved' | 'rejected')}><option value="approved">Approve</option><option value="rejected">Request changes</option></select><Button disabled={review.isPending}>Save review</Button></form>}
        {admin && <div className="task-admin-controls"><Button variant="quiet" onClick={() => editTask(task)}>Edit task</Button>{task.status !== 'completed' && task.status !== 'cancelled' && <Button variant="quiet" onClick={() => { if (window.confirm(`Cancel “${task.title}” for its remaining assignees?`)) update.mutate({ id: task.id, data: { status: 'cancelled' } }, { onSuccess: invalidate }); }}>Cancel task</Button>}<Button variant="quiet" className="delete-btn" onClick={() => deleteTask(task.id, task.title)}><Trash2 size={14}/> Delete</Button></div>}
      </article>;
    })}</div> : <EmptyState title={admin ? 'No tasks have been assigned yet.' : 'Nothing on your task list.'} body={admin ? 'Create a task when the team has a clear goal for members.' : 'When the agency assigns you something, it will appear here.'} action={admin ? <Button onClick={() => { setEditingTask(null); setForm(emptyForm); setCreateOpen(true); }}><Plus size={16}/> Create a task</Button> : undefined}/>}
    {createOpen && <div className="modal-backdrop"><form className="modal modal-wide" onSubmit={saveTask}><button type="button" className="modal-close" onClick={closeTaskForm} aria-label="Close"><X/></button><p className="section-kicker">{editingTask ? 'EDIT ASSIGNMENT' : 'NEW ASSIGNMENT'}</p><h2>{editingTask ? 'Keep the next step clear.' : 'Make the next step clear.'}</h2><div className="form-grid"><Field label="Task title"><input required minLength={2} maxLength={160} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/></Field><Field label="Priority"><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></Field><Field label="Description"><textarea required maxLength={4000} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></Field><Field label="Instructions (optional)"><textarea maxLength={4000} rows={3} value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })}/></Field><Field label="Deadline"><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}/></Field><Field label="Assign approved models"><select multiple size={5} value={form.assignment_user_ids} onChange={e => setForm({ ...form, assignment_user_ids: Array.from(e.target.selectedOptions, option => option.value) })} disabled={models.isLoading || models.isError}>{models.data?.map(model => <option value={model.id} key={model.id}>{model.full_name} · {model.email}</option>)}</select><small>Select one or several models. Leave empty to save a draft task without assignees.</small></Field></div>{models.isError && <p className="form-notice" role="alert">Approved members could not be loaded, so assignments cannot be selected. Try again after the roster is available.</p>}<div className="modal-actions"><Button type="button" variant="outline" onClick={closeTaskForm}>Cancel</Button><Button disabled={create.isPending || update.isPending || models.isError}>{create.isPending || update.isPending ? 'Saving…' : editingTask ? 'Save changes' : 'Create task'} <ArrowRight size={15}/></Button></div></form></div>}
  </>;
}

function SignedEvidence({ path }: { path: string }) {
  const url = usePrivateUrl('task-evidence', path);
  const filename = path.split('/').pop() || 'Submission evidence';
  return url ? <a className="evidence-link" href={url} target="_blank" rel="noreferrer"><ExternalLink size={14}/>{filename}</a> : <span className="quiet-line">Loading private evidence…</span>;
}

function Points({ admin }: { admin:boolean }) {
  const qc=useQueryClient(); const leaderboard=useGetLeaderboard(); const points=useListPoints(); const models=useListModels({status:'approved'},{query:{enabled:admin,queryKey:getListModelsQueryKey({status:'approved'})}}); const award=useAwardPoints();
  const [open,setOpen]=useState(false); const [form,setForm]=useState({model_id:'',delta:'',reason:''});
  const submit=(e:FormEvent)=>{e.preventDefault();award.mutate({data:{model_id:form.model_id,delta:Number(form.delta),reason:form.reason}},{onSuccess:()=>{qc.invalidateQueries({queryKey:getListPointsQueryKey()});qc.invalidateQueries({queryKey:getGetLeaderboardQueryKey()});qc.invalidateQueries({queryKey:getListModelsQueryKey()});setOpen(false);setForm({model_id:'',delta:'',reason:''});}});};
  return <><PageTitle eyebrow={admin?'COMMUNITY RECOGNITION':'YOUR PROGRESS'} title={admin?'Points & leaderboard':'Points & ranking'} description={admin?'Recognise contributions and see how the community is growing.':'Every point marks a step forward. See your place in the community.'} action={admin?<Button onClick={()=>setOpen(true)}><Plus size={16}/> Award points</Button>:undefined}/><div className="points-layout"><section className="panel leaderboard-panel"><div className="panel-head"><div><p className="section-kicker">COMMUNITY BOARD</p><h2>Leaderboard</h2></div><Trophy className="panel-head-icon"/></div>{leaderboard.isLoading?<LoadingState/>:leaderboard.isError?<ErrorState retry={()=>leaderboard.refetch()}/>:leaderboard.data?.length?<div className="leaderboard-list">{leaderboard.data.map((entry,i)=><div className={`leader-row ${i<3?'leader-top':''}`} key={entry.user_id}><b className="rank-no">{String(entry.rank).padStart(2,'0')}</b><span className="avatar">{initials(entry.full_name)}</span><span className="leader-name">{entry.full_name}</span><span className="leader-score">{entry.points}<small> pts</small></span>{i===0&&<span className="leader-badge">LEADING</span>}</div>)}</div>:<EmptyState title="The first place is still open." body="There are no leaderboard entries yet. As members earn points, they’ll show here."/>}</section><section className="panel points-history"><div className="panel-head"><div><p className="section-kicker">{admin?'RECENT TRANSACTIONS':'YOUR ACTIVITY'}</p><h2>Points history</h2></div></div>{points.isLoading?<LoadingState/>:points.isError?<ErrorState retry={()=>points.refetch()}/>:points.data?.length?points.data.map(p=><div className="points-row" key={p.id}><span className={`delta ${p.delta>=0?'delta-plus':'delta-minus'}`}>{p.delta>0?'+':''}{p.delta}</span><span><b>{p.reason}</b><small>{admin?p.model_id:'Agency points'}</small></span><time>{fmt(p.created_at)}</time></div>):<EmptyState title="Your points start here." body="Points from agency activity will be recorded here. Nothing is added until it’s earned or awarded."/>}</section></div>
    {open&&<div className="modal-backdrop"><form className="modal" onSubmit={submit}><button type="button" className="modal-close" onClick={()=>setOpen(false)} aria-label="Close"><X/></button><p className="section-kicker">RECOGNISE THE WORK</p><h2>A little encouragement goes far.</h2><Field label="Approved model"><select required value={form.model_id} onChange={e=>setForm({...form,model_id:e.target.value})}><option value="">Choose a member</option>{models.data?.map(m=><option value={m.id} key={m.id}>{m.full_name} · {m.email}</option>)}</select></Field><Field label="Point change"><input type="number" min="-10000" max="10000" required value={form.delta} onChange={e=>setForm({...form,delta:e.target.value})}/></Field><Field label="Reason"><textarea required minLength={3} maxLength={1000} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} rows={3}/></Field><div className="modal-actions"><Button variant="outline" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button disabled={award.isPending}>Award points <ArrowRight size={15}/></Button></div></form></div>}</>;
}

function Announcements({ admin }: { admin:boolean }) {
  const qc=useQueryClient(); const q=useListAnnouncements(); const create=useCreateAnnouncement(); const update=useUpdateAnnouncement(); const mark=useMarkAnnouncementRead();
  const models=useListModels({status:'approved'},{query:{enabled:admin,queryKey:getListModelsQueryKey({status:'approved'})}});
  const [open,setOpen]=useState(false); const [editing,setEditing]=useState<string|null>(null); const [notice,setNotice]=useState('');
  const emptyForm={title:'',body:'',status:'published',audience:'all',recipient_ids:[] as string[]};
  const [form,setForm]=useState(emptyForm);
  useEffect(()=>{const client=supabase;if(!client)return;const channel=client.channel('agency-announcements').on('postgres_changes',{event:'*',schema:'public',table:'announcements'},()=>{void qc.invalidateQueries({queryKey:getListAnnouncementsQueryKey()});void qc.invalidateQueries({queryKey:getGetDashboardQueryKey()});}).subscribe();return()=>{void client.removeChannel(channel);};},[qc]);
  const reset=()=>{setOpen(false);setEditing(null);setForm(emptyForm);setNotice('');};
  const deleteAnnouncement = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete announcement “${title}”? This cannot be undone.`)) return;
    try {
      const session = (await supabase?.auth.getSession())?.data.session;
      const token = session?.access_token;
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete announcement');
      }
      qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not delete announcement.');
    }
  };
  const openNew=()=>{setEditing(null);setForm(emptyForm);setNotice('');setOpen(true);};
  const save=(e:FormEvent)=>{e.preventDefault();if(form.audience==='selected'&&form.recipient_ids.length===0){setNotice('Choose at least one approved member for this announcement.');return;}const data={...form,title:form.title.trim(),body:form.body.trim(),status:form.status as 'draft'|'published',audience:form.audience as 'all'|'selected'};const onSuccess=()=>{void qc.invalidateQueries({queryKey:getListAnnouncementsQueryKey()});reset();};const onError=()=>setNotice('The announcement could not be saved. Please try again.');if(editing)update.mutate({id:editing,data},{onSuccess,onError});else create.mutate({data},{onSuccess,onError});};
  return <><PageTitle eyebrow={admin?'COMMUNITY COMMS':'AGENCY BULLETIN'} title="Announcements" description={admin?'Keep the agency connected with clear, timely updates.':'News and notes from the TRENDIE MODELS team.'} action={admin?<Button onClick={openNew}><Plus size={16}/> New announcement</Button>:undefined}/>{q.isLoading?<LoadingState/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:q.data?.length?<div className="announcement-list">{q.data.map(a=><article className="panel announcement-card" key={a.id}><div className="announcement-card-top"><span className="announcement-mark"><BookOpen/></span><Pill status={a.status}/><small>{fmt(a.published_at||a.created_at)}</small></div><h2>{a.title}</h2><p>{a.body}</p><div className="announcement-card-foot">{!admin&&!a.is_read&&<Button variant="outline" onClick={()=>mark.mutate({id:a.id},{onSuccess:()=>qc.invalidateQueries({queryKey:getListAnnouncementsQueryKey()})})}>Mark as read <Check size={14}/></Button>}{admin&&<div className="announcement-admin"><span>Audience: {a.audience === 'selected' ? `${a.recipient_ids?.length || 0} selected members` : 'All members'}</span><Button variant="quiet" onClick={()=>{setEditing(a.id);setForm({title:a.title,body:a.body,status:a.status==='archived'?'draft':a.status,audience:a.audience,recipient_ids:a.recipient_ids||[]});setNotice('');setOpen(true);}}>Edit</Button>{a.status!=='archived'&&<Button variant="quiet" onClick={()=>{if(window.confirm(`Archive “${a.title}”?`))update.mutate({id:a.id,data:{status:'archived'}},{onSuccess:()=>qc.invalidateQueries({queryKey:getListAnnouncementsQueryKey()}),onError:()=>setNotice('This announcement could not be archived. Please try again.')});}}>Archive</Button>}<Button variant="quiet" className="delete-btn" onClick={()=>deleteAnnouncement(a.id, a.title)}><Trash2 size={14}/> Delete</Button></div>}</div></article>)}</div>:<EmptyState title="No announcements yet." body={admin?'When the team shares an update, it will appear here.':'When the agency has news to share, it will appear here.'} action={admin?<Button onClick={openNew}><Plus size={15}/> Write an update</Button>:undefined}/>}
    {open&&<div className="modal-backdrop"><form className="modal modal-wide" onSubmit={save}><button type="button" className="modal-close" onClick={reset} aria-label="Close"><X/></button><p className="section-kicker">AGENCY BULLETIN</p><h2>{editing?'Edit announcement':'Share an update.'}</h2><Field label="Headline"><input required minLength={2} maxLength={160} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></Field><Field label="Message"><textarea required minLength={2} maxLength={8000} rows={6} value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></Field><div className="form-grid"><Field label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="published">Publish now</option><option value="draft">Save draft</option></select></Field><Field label="Audience"><select value={form.audience} onChange={e=>setForm({...form,audience:e.target.value})}><option value="all">All members</option><option value="selected">Selected members</option></select></Field></div>{form.audience==='selected'&&<Field label="Recipients (approved models)"><select multiple size={5} value={form.recipient_ids} disabled={models.isLoading||models.isError} onChange={e=>setForm({...form,recipient_ids:Array.from(e.target.selectedOptions,o=>o.value)})}>{models.data?.map(model=><option value={model.id} key={model.id}>{model.full_name} · {model.email}</option>)}</select></Field>}{models.isError&&form.audience==='selected'&&<p className="form-notice" role="alert">The approved-model list could not be loaded.</p>}{notice&&<p className="form-notice" role="alert">{notice}</p>}<div className="modal-actions"><Button variant="outline" type="button" onClick={reset}>Cancel</Button><Button disabled={create.isPending||update.isPending||(form.audience==='selected'&&models.isError)}>{create.isPending||update.isPending?'Saving…':'Save announcement'} <ArrowRight size={15}/></Button></div></form></div>}</>;
}

function Messages({ profile, admin }: { profile:AgencyProfile; admin:boolean }) {
  const qc=useQueryClient(); const conv=useListConversations();
  const models=useListModels({status:'all'},{query:{enabled:admin,queryKey:getListModelsQueryKey({status:'all'})}});
  const agencyAdmins=useListAgencyAdmins({query:{enabled:!admin,queryKey:getListAgencyAdminsQueryKey()}});
  const [selected,setSelected]=useState(()=>new URLSearchParams(window.location.search).get('conversation')||''); const [body,setBody]=useState(''); const [recipient,setRecipient]=useState(''); const [title,setTitle]=useState(''); const [firstMessage,setFirstMessage]=useState(''); const [notice,setNotice]=useState('');
  const create=useCreateConversation(); const send=useSendMessage(); const messageQuery=useListMessages(selected,{query:{enabled:!!selected,queryKey:getListMessagesQueryKey(selected)}});
  const messages=messageQuery.data||[];
  useEffect(()=>{const client=supabase;if(!client||!selected)return;const channel=client.channel(`private-messages-${selected}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${selected}`},()=>{void qc.invalidateQueries({queryKey:getListMessagesQueryKey(selected)});void qc.invalidateQueries({queryKey:getListConversationsQueryKey()});void qc.invalidateQueries({queryKey:getGetDashboardQueryKey()});}).subscribe();return()=>{void client.removeChannel(channel);};},[selected,qc]);
  useEffect(()=>{if(selected&&messageQuery.data)void qc.invalidateQueries({queryKey:getListConversationsQueryKey()});},[selected,messageQuery.data,qc]);
  const start=(e:FormEvent)=>{e.preventDefault();if(!recipient){setNotice('Choose an available contact first.');return;}setNotice('');create.mutate({data:{recipient_id:recipient,title:title.trim()||null,initial_message:firstMessage.trim()}},{onSuccess:c=>{void qc.invalidateQueries({queryKey:getListConversationsQueryKey()});setSelected(c.id);setRecipient('');setTitle('');setFirstMessage('');},onError:()=>setNotice('The conversation could not be started. Please try again.')});};
  const sendMessage=(e:FormEvent)=>{e.preventDefault();if(!selected||!body.trim())return;send.mutate({id:selected,data:{body:body.trim()}},{onSuccess:()=>{void qc.invalidateQueries({queryKey:getListMessagesQueryKey(selected)});void qc.invalidateQueries({queryKey:getListConversationsQueryKey()});void qc.invalidateQueries({queryKey:getGetDashboardQueryKey()});setBody('');setNotice('');},onError:()=>setNotice('Your message could not be sent. Please try again.')});};
  const formatModelLabel=(m:AgencyProfile)=>{
    const statusLabel = m.application_status === 'approved' ? 'Approved' : m.application_status === 'pending' ? 'Applicant (Pending)' : m.application_status === 'rejected' ? 'Applicant (Declined)' : 'Applicant';
    return `${m.full_name || m.email} · ${statusLabel}`;
  };
  const options=admin?(models.data||[]).map(model=>({id:model.id,name:formatModelLabel(model)})):(agencyAdmins.data||[]).map(person=>({id:person.id,name:person.full_name||'TRENDIE MODELS team'}));
  const directoryLoading=admin?models.isLoading:agencyAdmins.isLoading; const directoryError=admin?models.isError:agencyAdmins.isError;
  return <><PageTitle eyebrow="PRIVATE AGENCY CHANNEL" title="Messages" description="A private, real-time line between models and the TRENDIE MODELS team."/><div className="messages-layout"><aside className="panel conversation-list"><div className="conversation-head"><h2>Conversations</h2><span>{conv.data?.length||0}</span></div>{conv.isLoading?<LoadingState/>:conv.isError?<ErrorState retry={()=>conv.refetch()}/>:conv.data?.length?conv.data.map(c=><button className={`conversation-item ${selected===c.id?'conversation-selected':''}`} key={c.id} onClick={()=>setSelected(c.id)}><span className="avatar"><MessageCircle size={16}/></span><span><b>{c.title||'Agency conversation'}</b><small>{c.unread_count?`${c.unread_count} unread`:'No unread messages'}</small></span><ChevronRight size={16}/></button>):<EmptyState title="No conversations yet." body="A conversation will appear here when you or the agency starts one."/>}</aside>
    <section className="panel message-panel">{selected?<><div className="message-head"><span className="avatar"><MessageCircle size={16}/></span><div><b>{conv.data?.find(c=>c.id===selected)?.title||'Agency conversation'}</b><small>Private conversation</small></div></div><div className="message-thread">{messageQuery.isLoading?<LoadingState/>:messageQuery.isError?<ErrorState retry={()=>messageQuery.refetch()}/>:messages.length?messages.map(m=><div className={`message-bubble ${m.sender_id===profile.id?'message-mine':''}`} key={m.id}><p>{m.body}</p><small>{m.sender_id===profile.id?'You':'Agency team'} · {fmt(m.created_at)}</small></div>):<EmptyState title="A fresh conversation." body="Send a note to begin."/>}</div><form className="message-compose" onSubmit={sendMessage}><input required maxLength={4000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write a message to the agency…"/><Button aria-label="Send message" disabled={send.isPending}><Send size={17}/></Button></form></>:<div className="message-empty"><span><Inbox/></span><h2>Make room for a conversation.</h2><p>Select a thread or start a new private conversation.</p></div>}</section></div>
    <form className="panel new-conversation" onSubmit={start}><div><p className="section-kicker">START A PRIVATE THREAD</p><h2>Send a first note</h2><p>{admin?'Start a one-to-one conversation with any applicant or approved model.':'Choose an agency contact for a private message.'}</p></div><div className="new-convo-fields"><Field label={admin?'Applicant or approved model':'Agency contact'}><select required value={recipient} onChange={e=>setRecipient(e.target.value)} disabled={directoryLoading||directoryError}><option value="">{directoryLoading?'Loading contacts…':'Choose a recipient'}</option>{options.map(person=><option value={person.id} key={person.id}>{person.name}</option>)}</select></Field><Field label="Subject (optional)"><input maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder="What would you like to discuss?"/></Field><Field label="First message"><input required minLength={1} maxLength={4000} value={firstMessage} onChange={e=>setFirstMessage(e.target.value)} placeholder="Write your opening message"/></Field><Button disabled={create.isPending||directoryLoading||directoryError||options.length===0}>{create.isPending?'Starting…':'Start conversation'} <ArrowRight size={15}/></Button></div>{directoryError&&<p className="form-notice" role="alert">The contact list could not be loaded. Please refresh or contact the agency.</p>}{!directoryLoading&&!directoryError&&options.length===0&&<p className="quiet-line">No available contacts were found.</p>}{notice&&<p className="form-notice" role="alert">{notice}</p>}</form></>;
}

function Notifications({ userId }: { userId: string }) {
  const qc=useQueryClient(); const q=useListNotifications(); const mark=useMarkNotificationsRead();
  useEffect(()=>{const client=supabase;if(!client)return;const channel=client.channel(`notifications-${userId}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${userId}`},()=>{void qc.invalidateQueries({queryKey:getListNotificationsQueryKey()});void qc.invalidateQueries({queryKey:getGetDashboardQueryKey()});}).subscribe();return()=>{void client.removeChannel(channel);};},[qc,userId]);
  const unread=q.data?.filter(n=>!n.is_read).map(n=>n.id)||[];
  return <><PageTitle title="Notifications" description="Important updates from your agency, in one place." action={unread.length?<Button variant="outline" onClick={()=>mark.mutate({data:{ids:unread}},{onSuccess:()=>qc.invalidateQueries({queryKey:getListNotificationsQueryKey()})})} disabled={mark.isPending}>Mark all read <Check size={15}/></Button>:undefined}/>{q.isLoading?<LoadingState/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:q.data?.length?<div className="notification-list">{q.data.map(n=><article className={`panel notification-card ${n.is_read?'notification-read':''}`} key={n.id}><span className="notification-mark"><Bell size={17}/></span><div><div className="notification-heading"><h2>{n.title}</h2>{!n.is_read&&<i/>}</div>{n.body&&<p>{n.body}</p>}<small>{fmt(n.created_at)} · {n.kind}</small></div>{n.link&&<Link href={n.link} className="panel-link">Open <ArrowUpRight size={15}/></Link>}</article>)}</div>:<EmptyState title="All caught up." body="New agency updates and reminders will find their way here."/>}</>;
}

function Tracker() {
  const qc=useQueryClient(); const q=useListDailyEntries(); const save=useSaveDailyEntry();
  const today=new Date().toLocaleDateString('en-CA'); const existing=q.data?.find(entry=>entry.entry_date===today);
  const [checked,setChecked]=useState(false); const [water,setWater]=useState(0); const [wellness,setWellness]=useState<string[]>([]); const [notes,setNotes]=useState('');
  const [measurements,setMeasurements]=useState({height_cm:'',waist_cm:'',hips_cm:''});
  useEffect(()=>{if(existing){setChecked(existing.checked_in);setWater(existing.water_glasses);setWellness(existing.wellness||[]);setNotes(existing.notes||'');const values=(existing.measurements||{}) as Record<string,unknown>;setMeasurements({height_cm:values.height_cm==null?'':String(values.height_cm),waist_cm:values.waist_cm==null?'':String(values.waist_cm),hips_cm:values.hips_cm==null?'':String(values.hips_cm)});}},[existing?.id]);
  const choices=['Movement','Rest','Stretching','Mindfulness'];
  const saveEntry=(e:FormEvent)=>{e.preventDefault();const measurementsPayload=Object.fromEntries(Object.entries(measurements).map(([key,value])=>[key,value===''?null:Number(value)]));save.mutate({data:{entry_date:today,checked_in:checked,water_glasses:water,measurements:measurementsPayload,wellness,notes:notes||null}},{onSuccess:()=>qc.invalidateQueries({queryKey:getListDailyEntriesQueryKey()})});};
  return <><PageTitle eyebrow="A SMALL DAILY CHECK-IN" title="Daily tracker" description="Notice the habits that help you feel prepared, present, and well."/><div className="tracker-grid"><form className="panel tracker-form" onSubmit={saveEntry}><div className="tracker-date"><span><CalendarDays/></span><div><p className="section-kicker">TODAY</p><h2>{new Date().toLocaleDateString('en-GH',{weekday:'long',month:'long',day:'numeric'})}</h2></div></div><label className="checkin-toggle"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/><span className="custom-check"><Check size={14}/></span><span><b>Check in for today</b><small>One small step, logged for you.</small></span></label><div className="water-control"><div><Droplets/><span><b>Water</b><small>Glasses today</small></span></div><div className="stepper"><button type="button" onClick={()=>setWater(Math.max(0,water-1))} aria-label="Remove glass">−</button><b>{water}</b><button type="button" onClick={()=>setWater(Math.min(50,water+1))} aria-label="Add glass">+</button></div></div><div className="wellness-field"><b>What supported you today?</b><div className="choice-chips">{choices.map(choice=><button type="button" className={wellness.includes(choice)?'chip-selected':''} onClick={()=>setWellness(wellness.includes(choice)?wellness.filter(w=>w!==choice):[...wellness,choice])} key={choice}>{wellness.includes(choice)&&<Check size={12}/>} {choice}</button>)}</div></div><div className="tracker-measurements"><p>Optional progress measures</p><div className="form-grid"><Field label="Height (cm)"><input inputMode="decimal" type="number" min="0" max="260" step="0.1" value={measurements.height_cm} onChange={e=>setMeasurements({...measurements,height_cm:e.target.value})}/></Field><Field label="Waist (cm)"><input inputMode="decimal" type="number" min="0" max="250" step="0.1" value={measurements.waist_cm} onChange={e=>setMeasurements({...measurements,waist_cm:e.target.value})}/></Field><Field label="Hips (cm)"><input inputMode="decimal" type="number" min="0" max="250" step="0.1" value={measurements.hips_cm} onChange={e=>setMeasurements({...measurements,hips_cm:e.target.value})}/></Field></div><small>These entries are private to your account.</small></div><Field label="Notes for yourself (optional)"><textarea rows={4} maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Anything worth remembering about today?"/></Field><div className="form-footer"><span>{existing?'Your entry is saved for today.':'Your check-in is private to your account.'}</span><Button disabled={save.isPending}>{save.isPending?'Saving…':'Save today’s entry'} <Check size={15}/></Button></div></form><aside className="panel tracker-history"><p className="section-kicker">RECENT CHECK-INS</p><h2>Showing up, day by day.</h2>{q.isLoading?<LoadingState/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:q.data?.length?q.data.slice(0,7).map(entry=><div className="tracker-history-row" key={entry.id}><span className={entry.checked_in?'history-checked':''}>{entry.checked_in?<Check size={14}/>:<span/>}</span><b>{fmt(entry.entry_date)}</b><small>{entry.water_glasses} glasses</small></div>):<EmptyState title="Your first check-in is waiting." body="A little daily attention can make a difference. Nothing has been recorded yet."/>}</aside></div></>;
}

function Support({admin}:{admin:boolean}) {
  const qc=useQueryClient(); const q=useListSupportRequests(); const create=useCreateSupportRequest(); const update=useUpdateSupportRequest(); const reply=useReplyToSupportRequest();
  const [open,setOpen]=useState(false); const [subject,setSubject]=useState(''); const [message,setMessage]=useState(''); const [replyText,setReplyText]=useState<Record<string,string>>({});
  const submit=(e:FormEvent)=>{e.preventDefault();create.mutate({data:{subject,message}},{onSuccess:()=>{qc.invalidateQueries({queryKey:getListSupportRequestsQueryKey()});setOpen(false);setSubject('');setMessage('');}});};
  const sendReply=(id:string,e:FormEvent)=>{e.preventDefault();const body=replyText[id]?.trim();if(!body)return;reply.mutate({id,data:{body}},{onSuccess:()=>{qc.invalidateQueries({queryKey:getListSupportRequestsQueryKey()});setReplyText({...replyText,[id]:''});}});};
  return <><PageTitle eyebrow={admin?'AGENCY CARE':'WE’RE HERE TO HELP'} title={admin?'Support requests':'Support'} description={admin?'Follow through on requests with clear status updates and replies.':'Ask a question or let the agency team know what you need.'} action={!admin?<Button onClick={()=>setOpen(true)}><Plus size={16}/> New request</Button>:undefined}/>{q.isLoading?<LoadingState/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:q.data?.length?<div className="support-list">{q.data.map(request=><article className="panel support-card" key={request.id}><div className="support-head"><div><p className="section-kicker">REQUEST · {fmt(request.created_at)}</p><h2>{request.subject}</h2></div>{admin?<select value={request.status} onChange={e=>update.mutate({id:request.id,data:{status:e.target.value as never}},{onSuccess:()=>qc.invalidateQueries({queryKey:getListSupportRequestsQueryKey()})})}><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select>:<Pill status={request.status}/>}</div><div className="support-thread">{request.replies?.length?request.replies.map(r=><div className="support-reply" key={r.id}><span className="avatar">{initials(r.author_id===request.user_id?'You':'TM')}</span><div><p>{r.body}</p><small>{fmt(r.created_at)} · {r.author_id===request.user_id?'You':'Agency team'}</small></div></div>):<p className="quiet-line">The conversation is just beginning. The team will reply here.</p>}</div><form className="support-reply-form" onSubmit={e=>sendReply(request.id,e)}><input required maxLength={4000} value={replyText[request.id]||''} onChange={e=>setReplyText({...replyText,[request.id]:e.target.value})} placeholder="Write a reply…"/><Button variant="outline" disabled={reply.isPending}><Send size={15}/> Reply</Button></form></article>)}</div>:<EmptyState title={admin?'No requests are waiting.':'A helpful team is one message away.'} body={admin?'Support requests will appear here when members ask for help.':'Create a request and the agency team will follow up with you here.'} action={!admin?<Button onClick={()=>setOpen(true)}><Plus size={15}/> Create a request</Button>:undefined}/>}
    {open&&<div className="modal-backdrop"><form className="modal" onSubmit={submit}><button type="button" className="modal-close" onClick={()=>setOpen(false)} aria-label="Close"><X/></button><p className="section-kicker">MEMBER SUPPORT</p><h2>How can we help?</h2><Field label="Subject"><input required minLength={3} maxLength={160} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="A short summary"/></Field><Field label="Message"><textarea required minLength={3} maxLength={4000} rows={5} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Share the details that will help us support you"/></Field><div className="modal-actions"><Button variant="outline" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button disabled={create.isPending}>{create.isPending?'Sending…':'Send request'} <ArrowRight size={15}/></Button></div></form></div>}</>;
}

function Audit() {
  const q=useListAuditLogs();
  return <><PageTitle eyebrow="AGENCY OVERSIGHT" title="Audit log" description="A record of actions across the agency. Access is restricted to administrators."/><section className="panel audit-panel">{q.isLoading?<LoadingState/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:q.data?.length?<div className="audit-list">{q.data.map(event=><article className="audit-row" key={event.id}><span className="audit-icon"><ShieldCheck size={16}/></span><div><b>{event.action.replaceAll('_',' ')}</b><small>{event.entity_type}{event.entity_id?` · ${event.entity_id}`:''}</small></div><time>{fmt(event.created_at)}</time><details><summary>Details</summary><pre>{JSON.stringify(event.details,null,2)}</pre></details></article>)}</div>:<EmptyState title="No events have been recorded." body="Actions will appear here as the agency workspace is used. Nothing is being generated for an empty project."/>}</section></>;
}

function SettingsPage({profile}:{profile:AgencyProfile}) {
  const stats=useGetAdminStats({query:{enabled:profile.role==='admin',queryKey:getGetAdminStatsQueryKey()}});
  const [,go]=useLocation();
  return <><PageTitle eyebrow="WORKSPACE PREFERENCES" title="Settings" description="Account and agency workspace details."/><div className="settings-grid"><section className="panel settings-card"><div className="panel-head"><div><p className="section-kicker">YOUR ACCOUNT</p><h2>Profile &amp; access</h2></div><UserRound/></div><p>Your profile information is managed in your member profile. Your account role is controlled by the agency and cannot be changed here.</p><Link href="/profile" className="button button-outline">Edit profile <ArrowRight size={15}/></Link><div className="settings-detail"><small>Signed in as</small><b>{profile.email}</b><small>Agency role</small><b>{profile.role==='admin'?'Administrator':'Model member'}</b></div></section><section className="panel settings-card"><div className="panel-head"><div><p className="section-kicker">AGENCY CONTACT</p><h2>Reach the team</h2></div><Mail/></div><p>Questions about your account or agency experience? Contact the team directly.</p><a className="contact-email" href="mailto:hellotrendiemodels@gmail.com">hellotrendiemodels@gmail.com <ExternalLink size={15}/></a><small>Accra, Ghana · Applicant and member support</small></section>{profile.role==='admin'&&<section className="panel settings-card admin-settings"><div className="panel-head"><div><p className="section-kicker">LIVE AGENCY COUNTS</p><h2>Workspace status</h2></div><Activity/></div>{stats.isLoading?<LoadingState/>:stats.isError?<ErrorState retry={()=>stats.refetch()}/>:stats.data?<div className="settings-stats"><span><b>{stats.data.total_models}</b><small>Total models</small></span><span><b>{stats.data.pending_applications}</b><small>Pending applications</small></span><span><b>{stats.data.open_support_requests}</b><small>Open requests</small></span></div>:<p className="quiet-line">No stats returned from the agency API.</p>}<p className="quiet-line">Counts come from agency records; this view does not create or modify settings that the API does not support.</p></section>}<section className="panel settings-card"><div className="panel-head"><div><p className="section-kicker">SESSION</p><h2>Sign out safely</h2></div><ShieldCheck/></div><p>End your current session on this device. You can sign back in at any time.</p><Button variant="outline" onClick={async()=>{await supabase?.auth.signOut();go('/');}}><LogOut size={16}/> Sign out</Button></section></div></>;
}
