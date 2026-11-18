import Admin from "./Admin";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import {
  BookOpen,
  Search,
  Upload,
  Download,
  GraduationCap,
  FileText,
  Users,
  ArrowRight,
  Menu,
  ShieldCheck
} from "lucide-react";

import "./App.css";

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminHome, setShowAdminHome] = useState(false);
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(supabase));
  const [adminCheck, setAdminCheck] = useState(null);
  const checkingAdmin = Boolean(
    session && adminCheck?.userId !== session.user.id
  );
  const isAdmin =
    Boolean(session) &&
    adminCheck?.userId === session.user.id &&
    adminCheck.isAdmin;

  useEffect(() => {
    if (!supabase) return;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event !== "INITIAL_SESSION") {
          setSession(newSession);
        }
      }
    );

    let active = true;

    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Unable to read the saved Supabase session.", error);
          if (active) setSession(null);
          return;
        }

        if (!data.session) {
          if (active) setSession(null);
          return;
        }

        const { data: refreshed, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError) {
          if (refreshError.code === "refresh_token_not_found") {
            const { error: signOutError } = await supabase.auth.signOut({
              scope: "local"
            });
            if (signOutError) {
              console.error("Unable to clear the expired local session.", signOutError);
            }
            if (active) setSession(null);
            return;
          }

          console.error("Unable to refresh the Supabase session.", refreshError);
          if (active) setSession(data.session);
          return;
        }

        if (active) setSession(refreshed.session);
      } catch (error) {
        console.error("Unable to restore the Supabase session.", error);
        if (active) setSession(null);
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || checkingSession || !session) return;

    let active = true;

    async function checkAdmin() {
      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (active) {
        setAdminCheck({
          userId: session.user.id,
          isAdmin: !error && Boolean(data)
        });
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [session, checkingSession]);

  if (checkingSession || (session && checkingAdmin)) {
    return <div>Loading StudyLink...</div>;
  }

  if (session && isAdmin && !showAdminHome) {
  return (
    <Admin
      onBack={() => setShowAdminHome(true)}
    />
  );
}
if (session && !isAdmin) return <Dashboard session={session} />;
  if (showAuth) {
    return <Auth onClose={() => setShowAuth(false)} />;
  }

  const categories = [
    { name: "Lecture Notes", icon: BookOpen, count: "Study resources" },
    { name: "Past Questions", icon: FileText, count: "Exam preparation" },
    { name: "Assignments", icon: GraduationCap, count: "Academic work" },
    { name: "Study Guides", icon: ShieldCheck, count: "Learning materials" }
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#" className="logo">
          <div className="logo-icon"><BookOpen size={25} /></div>
          <span>Study<span>Link</span></span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#categories">Categories</a>
          <a href="#how-it-works">How it works</a>
        </div>
<div className="nav-buttons">
  {session && isAdmin ? (
    <button
      className="signup-btn"
      onClick={() => setShowAdminHome(false)}
    >
      <ShieldCheck size={17} /> Admin Dashboard
    </button>
  ) : (
    <>
      <button className="login-btn" onClick={() => setShowAuth(true)}>
        Login
      </button>
      <button className="signup-btn" onClick={() => setShowAuth(true)}>
        Get Started
      </button>
    </>
  )}
</div>

        <button className="menu-btn"><Menu /></button>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="announcement">
              <GraduationCap size={17} />
              Your academic success starts here
            </div>

            <h1>Your Learning Materials,<span> All in One Place.</span></h1>

            <p>
              Discover, share and download academic materials.
              Connect with students and make studying easier with StudyLink.
            </p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={() => setShowAuth(true)}>
                Explore Materials <ArrowRight size={18} />
              </button>
              <button className="secondary-btn" onClick={() => setShowAuth(true)}>
                Upload Materials <Upload size={18} />
              </button>
            </div>

            <div className="hero-trust">
              <Users size={19} />
              <span>Built for students, by students.</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card main-card">
              <div className="visual-top">
                <div className="visual-icon"><BookOpen /></div>
                <span className="available">● Learning made easier</span>
              </div>
              <h3>Your Academic Library</h3>
              <p>Everything you need to study smarter.</p>
              <div className="resource-item">
                <div className="resource-icon purple"><FileText /></div>
                <div><strong>Lecture Notes</strong><small>Organised resources</small></div>
              </div>
              <div className="resource-item">
                <div className="resource-icon blue"><GraduationCap /></div>
                <div><strong>Past Questions</strong><small>Prepare for exams</small></div>
              </div>
              <div className="resource-item">
                <div className="resource-icon orange"><Download /></div>
                <div><strong>Study Materials</strong><small>Download and learn</small></div>
              </div>
              <div className="visual-footer">
                <span>Share</span><span>Learn</span><span>Grow</span>
              </div>
            </div>
            <div className="floating-icon"><GraduationCap size={30} /></div>
          </div>
        </section>

        <section className="features">
          <div><Upload /><strong>Easy Uploads</strong><small>Share your materials</small></div>
          <div><Search /><strong>Quick Search</strong><small>Find what you need</small></div>
          <div><Download /><strong>Free Downloads</strong><small>Access learning resources</small></div>
          <div><ShieldCheck /><strong>Organised Learning</strong><small>Find materials by course</small></div>
        </section>

        <section className="categories-section" id="categories">
          <div className="section-heading">
            <span>EXPLORE RESOURCES</span>
            <h2>Everything you need to study</h2>
            <p>Find academic resources organised to make learning simple.</p>
          </div>
          <div className="category-grid">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div className="category-card" key={category.name}>
                  <div className="category-icon"><Icon size={27} /></div>
                  <h3>{category.name}</h3>
                  <p>{category.count}</p>
                  <ArrowRight className="category-arrow" size={19} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <span>HOW IT WORKS</span>
            <h2>Start learning in three steps</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span>01</span><Upload size={28} /><h3>Upload</h3>
              <p>Share useful academic materials with other students.</p>
            </div>
            <div className="step-card">
              <span>02</span><Search size={28} /><h3>Discover</h3>
              <p>Search for resources by department, level and course.</p>
            </div>
            <div className="step-card">
              <span>03</span><Download size={28} /><h3>Download</h3>
              <p>Get the materials you need and study smarter.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to make studying easier?</h2>
          <p>Join StudyLink and make academic resources accessible.</p>
          <button className="cta-btn" onClick={() => setShowAuth(true)}>
            Get Started <ArrowRight size={18} />
          </button>
        </section>
      </main>

      <footer>
        <a href="#" className="logo">
          <div className="logo-icon"><BookOpen size={22} /></div>
          <span>Study<span>Link</span></span>
        </a>
        <p>Share. Find. Learn. Your academic materials, one link.</p>
        <small>© 2026 StudyLink. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default App;
