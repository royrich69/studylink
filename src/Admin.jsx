
import "./Admin.css";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
  ShieldCheck,
  Check,
  X,
  FileText,
  LogOut,
  Users,
  GraduationCap
} from "lucide-react";
import "./Admin.css";

function Admin({ onBack }) {
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [activeTab, setActiveTab] = useState("materials");

  const [stats, setStats] = useState({
    students: 0,
    approved: 0,
    pending: 0
  });

  useEffect(() => {
    fetchPendingMaterials();
    fetchStudents();
    fetchStats();
  }, []);

  async function fetchStats() {
    const { count: studentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: approvedCount } = await supabase
      .from("materials")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: pendingCount } = await supabase
      .from("materials")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setStats({
      students: studentsCount || 0,
      approved: approvedCount || 0,
      pending: pendingCount || 0
    });
  }

  async function fetchPendingMaterials() {
    setLoading(true);

    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setMaterials(data || []);

    setLoading(false);
  }

  async function fetchStudents() {
    setLoadingStudents(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, department, level, created_at")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setStudents(data || []);

    setLoadingStudents(false);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("materials")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setMaterials((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  async function previewFile(path) {
    const { data, error } = await supabase.storage
      .from("materials")
      .createSignedUrl(path, 60);

    if (error) {
      alert(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <h2><ShieldCheck /> StudyLink Admin</h2>

        <div className="admin-nav-actions">
          <button onClick={onBack}>Back to Home</button>
          <button onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </nav>

      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <p>ADMINISTRATION</p>
            <h1>Admin Dashboard</h1>
            <span>Manage students and academic materials.</span>
          </div>
        </div>


          <div className="admin-stats">
  <div className="stat-card">
    <h3>Total Students</h3>
    <h1>{stats.students}</h1>
  </div>

  <div className="stat-card">
    <h3>Approved Materials</h3>
    <h1>{stats.approved}</h1>
  </div>

  <div className="stat-card">
    <h3>Pending Materials</h3>
    <h1>{stats.pending}</h1>
  </div>
</div>


        <div className="admin-tabs">
          <button
            className={activeTab === "materials" ? "active" : ""}
            onClick={() => setActiveTab("materials")}
          >
            <FileText size={17} /> Material Approvals
          </button>

          <button
            className={activeTab === "students" ? "active" : ""}
            onClick={() => setActiveTab("students")}
          >
            <Users size={17} /> Registered Students
          </button>
        </div>

        {activeTab === "materials" && (
          <>
            <div className="pending-count">
              {materials.length} Pending
            </div>

            {loading ? (
              <p>Loading submissions...</p>
            ) : materials.length === 0 ? (
              <div className="admin-empty">
                <ShieldCheck size={45} />
                <h3>All caught up!</h3>
                <p>There are no pending materials to review.</p>
              </div>
            ) : (
              <div className="admin-materials">
                {materials.map((item) => (
                  <div className="admin-card" key={item.id}>
                    <FileText size={30} />

                    <div className="admin-card-info">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <small>
                        {item.course_code} • {item.department} • {item.level} Level
                      </small>
                      <small>Category: {item.material_type}</small>
                      <small>File: {item.file_name}</small>

                      <button
                        className="preview-btn"
                        onClick={() => previewFile(item.file_path)}
                      >
                        Preview Document
                      </button>
                    </div>

                    <div className="admin-actions">
                      <button
                        className="approve-btn"
                        onClick={() => updateStatus(item.id, "approved")}
                      >
                        <Check size={16} /> Approve
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() => updateStatus(item.id, "rejected")}
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="refresh-btn" onClick={fetchPendingMaterials}>
              Refresh Submissions
            </button>
          </>
        )}

        {activeTab === "students" && (
          <>
            <div className="pending-count">
              {students.length} Registered Students
            </div>

            {loadingStudents ? (
              <p>Loading students...</p>
            ) : students.length === 0 ? (
              <div className="admin-empty">
                <Users size={45} />
                <h3>No students found</h3>
                <p>Registered students will appear here.</p>
              </div>
            ) : (
              <div className="admin-materials">
                {students.map((student) => (
                  <div className="admin-card" key={student.id}>
                    <GraduationCap size={30} />

                    <div className="admin-card-info">
                      <h3>{student.full_name || "Student"}</h3>
                      <small>Department: {student.department || "Not provided"}</small>
                      <small>Level: {student.level || "Not provided"}</small>
                      <small>
                        Registered: {student.created_at
                          ? new Date(student.created_at).toLocaleDateString()
                          : "Not available"}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="refresh-btn" onClick={fetchStudents}>
              Refresh Students
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default Admin;
