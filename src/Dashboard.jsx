
import MyUploads from "./MyUploads";
import UploadMaterial from "./UploadMaterial";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
  BookOpen,
  Search,
  Upload,
  FileText,
  Download,
  LogOut,
  User,
  GraduationCap,
    X,
  Menu
} from "lucide-react";
import "./Dashboard.css";

function Dashboard({ session, initialCategory = "" }) {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showMyUploads, setShowMyUploads] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
const [menuOpen, setMenuOpen] = useState(false);


  const user = session?.user;

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error) setMaterials(data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const filteredMaterials = materials.filter((item) => {
    const matchesSearch =
      `${item.title} ${item.course_code} ${item.department}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      !selectedCategory || item.material_type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (showMyUploads) {
    return (
      <MyUploads
        user={user}
        onBack={() => setShowMyUploads(false)}
      />
    );
  }

  if (showUpload) {
    return (
      <UploadMaterial
        user={user}
        onClose={() => setShowUpload(false)}
        onUploaded={fetchMaterials}
      />
    );
  }

  return (
    <div className="dashboard">
     
<nav className="dashboard-nav">
  <h2><BookOpen /> Study<span>Link</span></h2>

  <button
    className="student-menu-btn"
    type="button"
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label="Toggle navigation menu"
  >
    {menuOpen ? <X /> : <Menu />}
  </button>

  <div className={`student-nav-links ${menuOpen ? "active" : ""}`}>
    <button onClick={() => {
      setSelectedCategory("");
      setShowMyUploads(false);
      setShowUpload(false);
      setMenuOpen(false);
    }}>
      Explore Materials
    </button>

    <button onClick={() => {
      setShowMyUploads(true);
      setMenuOpen(false);
    }}>
      My Uploads
    </button>

    <button onClick={() => {
      setShowUpload(true);
      setMenuOpen(false);
    }}>
      Upload Material
    </button>

    <button onClick={handleLogout}>
      <LogOut size={17} /> Logout
    </button>
  </div>
</nav>


      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <div>
            <button
              type="button"
              className="my-uploads-btn"
              onClick={() => setShowMyUploads(true)}
            >
              My Uploads
            </button>

            <p>STUDENT DASHBOARD</p>
            <h1>
              Welcome, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
            </h1>
            <span>Find and share academic materials with other students.</span>
          </div>
          <div className="welcome-icon">
            <GraduationCap size={45} />
          </div>
        </section>

        <section className="dashboard-stats">
          <div><BookOpen /><h3>{materials.length}</h3><p>Available Materials</p></div>
          <div><FileText /><h3>4</h3><p>Resource Categories</p></div>
          <div><User /><h3>Student</h3><p>Your Account</p></div>
        </section>

        <section className="materials-section">
          <div className="materials-heading">
            <div>
              <h2>
                {selectedCategory || "Explore Materials"}
              </h2>
              <p>
                {selectedCategory
                  ? `Showing approved ${selectedCategory.toLowerCase()}`
                  : "Discover resources shared by students."}
              </p>
            </div>

            <button
              className="upload-material-btn"
              onClick={() => setShowUpload(true)}
            >
              <Upload size={17} /> Upload Material
            </button>
          </div>

          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              style={{
                marginBottom: "15px",
                padding: "9px 14px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer"
              }}
            >
              <X size={15} /> Clear category filter
            </button>
          )}

          <div className="material-search">
            <Search size={19} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, course code or department..."
            />
          </div>

          {loading ? (
            <p>Loading materials...</p>
          ) : filteredMaterials.length === 0 ? (
            <div className="empty-materials">
              <BookOpen size={40} />
              <h3>No materials found</h3>
              <p>
                {selectedCategory
                  ? `No approved materials in ${selectedCategory} yet.`
                  : "There are no approved materials available yet."}
              </p>
            </div>
          ) : (
            <div className="materials-grid">
              {filteredMaterials.map((item) => (
                <div className="material-card" key={item.id}>
                  <FileText size={30} />
                  <h3>{item.title}</h3>
                  <p>{item.course_code}</p>
                  <small>{item.department} • {item.level} Level</small>

                  <button
                    onClick={async () => {
                      const { data, error } = await supabase.storage
                        .from("materials")
                        .createSignedUrl(item.file_path, 60);

                      if (error) {
                        alert(error.message);
                        return;
                      }

                      window.open(data.signedUrl, "_blank");
                    }}
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
