
import { useState } from "react";
import { supabase } from "./supabase";
import { Upload, X, FileText } from "lucide-react";
import "./UploadMaterial.css";

function UploadMaterial({ user, onClose, onUploaded }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: user?.user_metadata?.department || "",
    level: user?.user_metadata?.level || "",
    course_code: "",
    material_type: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a document to upload.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("File size must not exceed 20MB.");
      return;
    }

    setLoading(true);

    try {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only PDF, DOC, DOCX, PPT and PPTX files are allowed.");
      }

      const filePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("materials")
        .insert({
          ...form,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: user.id,
          status: "pending"
        });

      if (insertError) {
        await supabase.storage.from("materials").remove([filePath]);
        throw insertError;
      }

      setSuccess("Material uploaded successfully! It is awaiting approval.");

      if (onUploaded) onUploaded();

      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-heading">
          <div>
            <h2>Upload Academic Material</h2>
            <p>Share useful resources with other students.</p>
          </div>
          <button type="button" onClick={onClose} className="upload-close">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Material Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Introduction to Programming Notes"
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Briefly describe this material"
            required
          />

          <label>Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="e.g. Computer Science"
            required
          />

          <label>Academic Level</label>
          <select name="level" value={form.level} onChange={handleChange} required>
            <option value="">Select level</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
            <option value="500">500 Level</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>

          <label>Course Code</label>
          <input
            name="course_code"
            value={form.course_code}
            onChange={handleChange}
            placeholder="e.g. CMP 301"
            required
          />

          <label>Material Category</label>
          <select
            name="material_type"
            value={form.material_type}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="Lecture Notes">Lecture Notes</option>
            <option value="Past Questions">Past Questions</option>
            <option value="Assignments">Assignments</option>
            <option value="Study Guides">Study Guides</option>
          </select>

          <label>Select Document</label>
          <div className="file-upload-box">
            <FileText size={30} />
            <p>{file ? file.name : "Choose your academic document"}</p>
            <small>PDF, DOC, DOCX, PPT or PPTX • Maximum 20MB</small>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files[0] || null)}
              required
            />
          </div>

          {error && <p className="upload-error">{error}</p>}
          {success && <p className="upload-success">{success}</p>}

          <button type="submit" disabled={loading} className="upload-submit">
            <Upload size={18} />
            {loading ? "Uploading..." : "Submit Material"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadMaterial;
