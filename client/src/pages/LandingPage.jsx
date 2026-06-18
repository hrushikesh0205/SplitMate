import { Link } from 'react-router-dom';
import '../styles/landing.css';

const stats = [
  { value: '100%', label: 'Free to Use' },
  { value: '3', label: 'Split Methods' },
  { value: '6', label: 'Categories' },
  { value: '∞', label: 'Groups & Expenses' },
];

const features = [
  {
    icon: '👥',
    title: 'Create Groups',
    desc: 'Organize expenses by trips, home, office or any occasion with ease.',
  },
  {
    icon: '',
    title: 'Split Expenses',
    desc: 'Split bills equally, by percentage or exact amounts — your choice.',
  },
  {
    icon: '⚖️',
    title: 'Smart Balances',
    desc: 'Our algorithm minimizes transactions so fewer people need to pay.',
  },
  {
    icon: '🔔',
    title: 'Notifications',
    desc: 'Get notified instantly when someone adds an expense or settles up.',
  },
  {
    icon: '📊',
    title: 'Spending Insights',
    desc: 'Visual charts show where your money goes — by category and month.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'Your data is encrypted and never shared with third parties.',
  },
];

const steps = [
  {
    step: '01',
    icon: '👥',
    title: 'Create a Group',
    desc: 'Add your friends, family or colleagues to a shared expense group.',
  },
  {
    step: '02',
    icon: '🧾',
    title: 'Add Expenses',
    desc: 'Log any expense and choose how to split it among members.',
  },
  {
    step: '03',
    icon: '✅',
    title: 'Settle Up',
    desc: 'See who owes what and settle debts with a single click.',
  },
];

const LandingPage = () => {
  return (
    <div className='landing'>


      <nav className='landing-nav'>
        <div className='landing-nav-brand'>
          <span></span>
          <span>SplitMate</span>
        </div>
        <div className='landing-nav-links'>
          <a href='#features'>Features</a>
          <a href='#how-it-works'>How it works</a>
          <Link to='/login' className='landing-nav-login'>Login</Link>
          <Link to='/register' className='btn btn-primary landing-nav-cta'>
            Get Started Free
          </Link>
        </div>
      </nav>

      <section className='hero'>
        <div className='hero-badge'>✨ Free for personal use</div>
        <h1 className='hero-title'>
          Split Expenses,
          <br />
          <span className='hero-gradient'>Not Friendships</span>
        </h1>
        <p className='hero-subtitle'>
          The smartest way to track shared expenses with friends, family and
          colleagues. No more awkward money conversations.
        </p>
        <div className='hero-actions'>
          <Link to='/register' className='btn btn-primary hero-cta'>
            Start Splitting Free →
          </Link>
          <Link to='/login' className='btn btn-outline hero-login'>
            Login to Account
          </Link>
        </div></section>

    
<div className='hero-visual'>
  <div className='hero-illustration'>

  
    <div className='illus-center'>
      <span></span>
      <p>SplitMate</p>
    </div>

    <div className='illus-card illus-card-1'>
      <span>🏔️</span>
      <div>
        <p>Manali Trip</p>
        <p>4 members</p>
      </div>
    </div>

    <div className='illus-card illus-card-2'>
      <span>✅</span>
      <div>
        <p>Yugank paid</p>
        <p>₹600</p>
      </div>
    </div>

    <div className='illus-card illus-card-3'>
      <span>🏠</span>
      <div>
        <p>Home Expenses</p>
        <p>3 members</p>
      </div>
    </div>

    <div className='illus-card illus-card-4'>
      <span>⚖️</span>
      <div>
        <p>All settled!</p>
        <p>Goa Trip</p>
      </div>
    </div>

  
    <svg className='illus-lines' viewBox='0 0 400 400'>
      <line x1='200' y1='200' x2='80' y2='80' stroke='#6c63ff' strokeWidth='1.5' strokeDasharray='6 4' opacity='0.3' />
      <line x1='200' y1='200' x2='320' y2='80' stroke='#6c63ff' strokeWidth='1.5' strokeDasharray='6 4' opacity='0.3' />
      <line x1='200' y1='200' x2='60' y2='300' stroke='#6c63ff' strokeWidth='1.5' strokeDasharray='6 4' opacity='0.3' />
      <line x1='200' y1='200' x2='340' y2='300' stroke='#6c63ff' strokeWidth='1.5' strokeDasharray='6 4' opacity='0.3' />
      <circle cx='200' cy='200' r='120' stroke='#6c63ff' strokeWidth='1' strokeDasharray='8 6' fill='none' opacity='0.15' />
      <circle cx='200' cy='200' r='170' stroke='#a855f7' strokeWidth='1' strokeDasharray='8 6' fill='none' opacity='0.1' />
    </svg>

  </div>
</div>
      <section className='landing-stats'>
        {stats.map((stat, i) => (
          <div key={i} className='landing-stat'>
            <p className='landing-stat-value'>{stat.value}</p>
            <p className='landing-stat-label'>{stat.label}</p>
          </div>
        ))}
      </section>

      <section className='landing-features' id='features'>
        <div className='section-header'>
          <span className='section-badge'>Features</span>
          <h2>Everything you need to split expenses</h2>
          <p>Powerful features that make expense splitting effortless</p>
        </div>
        <div className='features-grid'>
          {features.map((f, i) => (
            <div key={i} className='feature-card'>
              <div className='feature-icon'>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='how-it-works' id='how-it-works'>
        <div className='section-header'>
          <span className='section-badge'>How it works</span>
          <h2>Get started in 3 simple steps</h2>
          <p>From zero to splitting expenses in under 2 minutes</p>
        </div>
        <div className='steps-grid'>
          {steps.map((s, i) => (
            <div key={i} className='step-card'>
              <div className='step-number'>{s.step}</div>
              <div className='step-icon'>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && (
                <div className='step-arrow'>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className='landing-cta'>
        <div className='landing-cta-inner'>
          <h2>Ready to split smarter?</h2>
          <p>
            Create a free account and start splitting expenses with
            your friends and groups today
          </p>
          <Link to='/register' className='btn btn-primary landing-cta-btn'>
            Create Free Account →
          </Link>
        </div>
      </section>

      <footer className='landing-footer'>
        <div className='footer-brand'>
          <span></span>
          <span>SplitMate</span>
        </div>
        <p>Split expenses effortlessly with friends & groups</p>
        <div className='footer-links'>
          <Link to='/login'>Login</Link>
          <Link to='/register'>Register</Link>
          <a href='#features'>Features</a>
          <a href='#how-it-works'>How it works</a>
        </div>
        <p className='footer-copy'>© 2026 SplitMate. Built By Hrushikesh Bhoir </p>
      </footer>

    </div>
  );
};

export default LandingPage;