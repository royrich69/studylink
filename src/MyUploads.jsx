
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { ArrowLeft, FileText, RefreshCw } from "lucide-react";
import "./MyUploads.css";

function MyUploads({ user, onBack }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchUploads() {
      try {
        const { data, error } = await supabase
          .from("materials")
          .select("*")
          .eq("uploaded_by", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (active) {
          setMaterials(data || []);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load uploads.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUploads();

    return () => {
      active = false;
    };
  }, [user?.id, refreshKey]);

  return (
    <div className="my-uploads-page">
      <header className="my-uploads-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={17} /> Back to Dashboard
        </button>

        <h1>My Uploads</h1>
        <p>Track the academic materials you have submitted.</p>

        <button
          className="refresh-btn"
          onClick={() => {
            setLoading(true);
            setRefreshKey((key) => key + 1);
          }}
        >
          <RefreshCw size={17} /> Refresh
        </button>
      </header>

      <section className="uploads-list">
        {!user?.id ? (
          <p>Please sign in again.</p>
        ) : loading ? (
          <p>Loading your uploads...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : materials.length === 0 ? (
          <div className="uploads-empty">
            <FileText size={40} />
            <h3>No uploads yet</h3>
            <p>Your submitted materials will appear here.</p>
          </div>
        ) : (
          materials.map((item) => (
            <article className="upload-card" key={item.id}>
              <div className="upload-file-icon">
                <FileText size={27} />
              </div>

              <div className="upload-details">
                <h3>{item.title}</h3>
                <p>{item.course_code} • {item.department}</p>
                <p>Category: {item.material_type}</p>
                <p>File: {item.file_name}</p>
              </div>

              <span className={`upload-status ${item.status || ""}`}>
                {item.status?.toUpperCase() || "UNKNOWN"}
              </span>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default MyUploads;
