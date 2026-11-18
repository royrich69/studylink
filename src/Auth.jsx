
import { useState } from "react";
import { supabase } from "./supabase";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowLeft
} from "lucide-react";
import "./Auth.css";

function Auth({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "",
    level: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!supabase) {
      setError(
        "Supabase has not been configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable login and signup."
      );
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
if (error) throw error;

setMessage("Login successful!");

if (onClose) {
  onClose();
}
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.full_name,
              department: form.department,
              level: form.level
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          setMessage("Account created successfully!");
        } else {
          setMessage(
            "Registration successful! Please check your email to confirm your account."
          );
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <button className="auth-back" onClick={onClose}>
          <ArrowLeft size={18} /> Back to home
        </button>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <BookOpen size={28} />
          </div>
          <h2>Study<span>Link</span></h2>
        </div>

        <div className="auth-heading">
          <h1>{isLogin ? "Welcome Back!" : "Create Your Account"}</h1>
          <p>
            {isLogin
              ? "Log in to continue your learning journey."
              : "Join StudyLink and access academic resources."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <>
              <label>Full Name</label>
              <div className="auth-input">
                <User size={18} />
                <input
                  name="full_name"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <label>Department</label>
              <div className="auth-input">
                <GraduationCap size={18} />
                <input
                  name="department"
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              </div>

              <label>Academic Level</label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                required
              >
                <option value="">Select your level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </>
          )}

          <label>Email Address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <Lock size={18} />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <button className="auth-submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login to StudyLink"
              : "Create Account"}
          </button>

        </form>

        <div className="auth-switch">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Auth;
