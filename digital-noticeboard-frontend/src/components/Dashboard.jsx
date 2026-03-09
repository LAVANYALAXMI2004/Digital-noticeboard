import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Trash2, LogOut, Upload, Play } from "lucide-react";

const API_BASE = 'http://localhost:5000/api';
const API_URL = `${API_BASE}/notices`;

const Dashboard = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [crawlerLogs, setCrawlerLogs] = useState([]);
  const [crawlerRunning, setCrawlerRunning] = useState(false);
  const [crawlerPages, setCrawlerPages] = useState(1);
  const [crawlerLimit, setCrawlerLimit] = useState(10);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await axios.get(API_URL);
      setNotices(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch notices:', err);
    }
  };

  const handleImageUpload = (file) => {
    if (file.size > 1024 * 1024) {
      alert('Image size exceeds 1MB. Please upload a smaller image.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const addNotice = async () => {
    if (!title || !content || !type || !imageFile) {
      alert("Please fill all required fields (Title, Category, Description, Image)");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('type', type);
      formData.append('link', link);
      formData.append('image', imageFile);

      await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setContent('');
      setType('');
      setLink('');
      setImageFile(null);
      setImagePreview(null);

      fetchNotices();
    } catch (err) {
      console.error('❌ Failed to add notice:', err);
    }
  };

  const deleteNotice = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchNotices();
    } catch (err) {
      console.error('❌ Failed to delete notice:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.reload();
  };

  const invokeCrawler = async () => {
    setCrawlerRunning(true);
    try {
      const res = await axios.get(`${API_BASE}/crawler`, {
        params: { pages: crawlerPages, limit: crawlerLimit },
      });
      const { logs = [], message, added, totalEvents } = res.data || {};
      setCrawlerLogs(prev => [...prev, `Run: ${message || 'completed'} (fetched ${totalEvents || 0}, added ${added || 0})`, ...logs]);
      fetchNotices();
    } catch (err) {
      setCrawlerLogs(prev => [...prev, `Crawler run failed: ${err?.message || 'Unknown error'}`]);
    } finally {
      setCrawlerRunning(false);
    }
  };

  return (
    <div className="dashboard">
      <style>{`
        body {
          background: #ffffff;
          margin: 0;
          padding: 0;
          overflow-y: auto;
        }
        .dashboard {
          padding: 30px;
          max-width: 1100px;
          margin: 0 auto;
          font-family: system-ui, sans-serif;
          color: #0f172a;
          min-height: 100vh;
          overflow-y: visible;
        }
        .dashboard__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .dashboard__logo {
          max-height: 50px;
          height: auto;
          width: auto;
        }

        @media (max-width: 1400px), (max-height: 800px) {
          .dashboard {
            padding: 12px;
            max-width: 900px;
          }
          .dashboard__header {
            margin-bottom: 18px;
          }
          .dashboard__logo {
            max-height: 38px;
          }
          .card {
            padding: 16px;
            border-radius: 12px;
          }
        }

        @media (max-width: 1280px), (max-height: 720px) {
          .dashboard {
            padding: 4px;
            max-width: 700px;
          }
          .dashboard__header {
            margin-bottom: 8px;
          }
          .dashboard__logo {
            max-height: 28px;
          }
          .card {
            padding: 8px;
            border-radius: 8px;
            margin-bottom: 10px;
          }
          .form__grid {
            gap: 8px;
          }
          .form__left {
            max-width: 160px;
          }
          .form__upload {
            min-height: 120px;
            padding: 10px;
          }
          .form__button {
            padding: 8px 14px;
            font-size: 0.85rem;
          }
          .notice__thumb {
            width: 48px;
            height: 48px;
          }
          .notice__card {
            padding: 8px;
            gap: 8px;
            border-radius: 8px;
          }
          .notice__title {
            font-size: 0.9rem;
          }
          .notice__desc {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 640px) {
          .dashboard__logo {
            max-height: 35px;
          }
          .card__header {
            align-items: flex-start;
          }
          .crawler__controls {
            width: 100%;
          }
        }
      `}</style>

      <div className="dashboard__header">
        <img className="dashboard__logo" src="http://ngpdnb.infaverse.com/uploads/admin_logo_black.png" alt="Logo" />
        <button className="dashboard__logout" onClick={logout}>
          Logout <LogOut size={16} />
        </button>
      </div>

      <div className="card">
        <h2 className="card__title_add">Create New Notice</h2>

        <div className="form__grid">
          <div className="form__left">
            <div className="form__group">
              <label className="form__label">Image Upload <span style={{ color: "red" }}>*</span></label>
              <div className="form__upload">
                {!imagePreview ? (
                  <>
                    <Upload size={32} className="form__upload-icon" />
                    <p>Click to upload or drag & drop</p>
                    <small>Max size: 1MB</small>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                    />
                  </>
                ) : (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="form__upload-preview"
                    />
                    <button
                      type="button"
                      className="form__remove"
                      onClick={removeImage}
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="form__right">
            <div className="form__group">
              <label className="form__label">Title <span style={{ color: "red" }}>*</span></label>
              <input
                className="form__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notice title"
              />
            </div>

            <div className="form__group">
              <label className="form__label">Category <span style={{ color: "red" }}>*</span></label>
              <input
                className="form__input"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., External, Hackathon"
              />
            </div>

            <div className="form__group">
              <label className="form__label">
                Description <span style={{ color: "red" }}>*</span>
              </label>

              <textarea
                className="form__textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter description"
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "6px",
                }}
              >

                <button
                  type="button"
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    border: "1px solid #ffffffff",
                    borderRadius: "6px",
                    background: "#eeeeeeff",
                    color: "#111827",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#353535ff";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.color = "#353535ff";
                  }}
                  onClick={() => {
                    const textarea = document.querySelector(".form__textarea");
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    if (start !== end) {
                      const selectedText = content.substring(start, end);
                      const newText =
                        content.substring(0, start) +
                        `**${selectedText}**` +
                        content.substring(end);
                      setContent(newText);

                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start, end + 4);
                      }, 0);
                    }
                  }}
                >
                  B
                </button>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  {content.length} / 500
                </div>
              </div>
            </div>

            <div className="form__group">
              <label className="form__label">Link (Optional)</label>
              <input
                className="form__input"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <button className="form__button" onClick={addNotice}>
              + Create Notice
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card__title">All Notices ({notices.length})</h2>
        <div className="notices__list">
          {notices.map(n => (
            <div key={n.id} className="notice__card">
              {n.image && <img className="notice__thumb" src={n.image} alt="" />}
              <div className="notice__body">
                <span className="notice__title">
                  {n.title}
                  <span className="notice__badge">{n.type}</span>
                </span>
                <p className="notice__desc">{n.content}</p>
                {n.link && <a href={n.link} target="_blank" rel="noreferrer" className="notice__link">View Link</a>}
              </div>
              <button className="notice__delete" onClick={() => deleteNotice(n.id)}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Crawler Logs</h2>
          <div className="crawler__controls">
            <input
              type="number"
              min="1"
              value={crawlerPages}
              onChange={(e) => setCrawlerPages(Number(e.target.value) || 1)}
              className="crawler__input"
              aria-label="Pages to crawl"
            />
            <input
              type="number"
              min="1"
              value={crawlerLimit}
              onChange={(e) => setCrawlerLimit(Number(e.target.value) || 1)}
              className="crawler__input"
              aria-label="Max notices to add"
            />
            <button className="crawler__button" onClick={invokeCrawler} disabled={crawlerRunning}>
              <Play size={16} style={{ marginRight: "6px" }} /> {crawlerRunning ? "Running..." : "Run Crawler"}
            </button>
          </div>
        </div>

        <div className="crawler__logs">
          {crawlerLogs.length ? (
            crawlerLogs.map((log, i) => (
              <div key={i} className="crawler__log">
                {log}
              </div>
            ))
          ) : (
            <div className="crawler__log">No logs yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
