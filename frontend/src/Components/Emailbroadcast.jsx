import React, { useState, useRef, useEffect } from "react";
import "./Emailbroadcast.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo from "../assets/logo.png";


// Email validation regex
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const EmailApp = () => {
  const [emails, setEmails] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [recipients, setRecipients] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // checked emails
  const [confirmDelete, setConfirmDelete] = useState(false);
   const [openExportMenu, setOpenExportMenu] = useState(null); // Add this state

  const toInputRef = useRef(null);

  // ✅ Fetch emails from backend
  const fetchMails = async () => {
    try {
      const res = await fetch("http://localhost:5000/mails");
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error("Error fetching mails:", err);
    }
  };

  useEffect(() => {
    fetchMails();
  }, []);

  // ✅ Search mails
  const handleSearch = async (query) => {
    setSearchQuery(query);
    try {
      const res = await fetch(
        `http://localhost:5000/search?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // Add recipient
  const addRecipient = (raw) => {
    const candidate = raw.trim().replace(/,$/, "");
    if (!candidate) return;
    if (!isValidEmail(candidate)) {
      setError(`Invalid email: ${candidate}`);
      return;
    }
    if (!recipients.includes(candidate)) {
      setRecipients((prev) => [...prev, candidate]);
    }
    setNewEmail((prev) => ({ ...prev, to: "" }));
    setError("");
  };

  const onRecipientKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addRecipient(newEmail.to);
    }
    if (e.key === "Backspace" && !newEmail.to && recipients.length) {
      setRecipients((prev) => prev.slice(0, -1));
    }
  };

  const removeRecipient = (email) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  // Handle attachments
  const handleFileChange = (e) => {
    setAttachments([...attachments, ...Array.from(e.target.files)]);
  };

  const removeAttachment = (fileName) => {
    setAttachments((prev) => prev.filter((f) => f.name !== fileName));
  };

  // ✅ Send email via backend
 const handleSend = async () => {
  // Add the current input to recipients if it's valid and not already present
  if (newEmail.to && isValidEmail(newEmail.to) && !recipients.includes(newEmail.to)) {
    recipients.push(newEmail.to);
  }

  if (!recipients.length || !newEmail.subject || !newEmail.body) {
    alert("All fields are required!");
    return;
  } else {
    alert("Mail sent successfully");
  }

  const mailPayload = {
    to: recipients.join(", "),
    subject: newEmail.subject,
    message: newEmail.body,
  };



    try {
      const res = await fetch("http://localhost:5000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mailPayload),
      });

      const result = await res.json();
      if (!result.success) {
        alert("Failed to send email!");
        return;
      }

      await fetchMails();
      setShowCompose(false);
      setNewEmail({ to: "", subject: "", body: "" });
      setRecipients([]);
      setAttachments([]);
    } catch (err) {
      console.error("Error sending mail:", err);
      alert("Error sending mail");
    }
  };

  // ✅ Toggle select email
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Confirm delete
  const handleDelete = async () => {
    try {
      for (const id of selectedIds) {
        await fetch(`http://localhost:5000/api/mails/${id}`, {
          method: "DELETE",
        });
      }
      await fetchMails();
      setSelectedIds([]);
      setConfirmDelete(false);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
  const exportMailToCSV = (mail) => {
    const headers = ["To", "Subject", "Message", "Date"];
    const row = [
      [mail.to, mail.subject, (mail.body || mail.message || "").replace(/\n/g, " "), mail.date || mail.timestamp]
    ];
    let csvContent =
      headers.join(",") +
      "\n" +
      row.map(r => r.map(v => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${mail.subject || "mail"}.csv`);
  };

  // --- Excel Export for single mail ---
  const exportMailToExcel = (mail) => {
    const worksheet = XLSX.utils.json_to_sheet([mail]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mail");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${mail.subject || "mail"}.xlsx`);
  };
  return (
    <div className="email-app">
      {/* Header */}
      <div className="app-header">
       <div className="app-title">
  <img  src={logo}
    alt="MailX Logo"
    style={{ height: "32px", verticalAlign: "middle", marginRight: "8px" }}
  />
 <span style={{
    fontFamily: " 'courier, monospace'",
    fontWeight: "bold",
    fontSize: "2rem",
   
  }}>
    <span style={{ color: "#4285F4" }}>G</span>
    <span style={{ color: "#EA4335" }}>M</span>
    <span style={{ color: "#FBBC05" }}>A</span>
    <span style={{ color: "#34A853" }}>I</span>
    <span style={{ color: "#EA4335" }}>L</span>
  </span>
</div>
       <div className="app-user" style={{ padding: "16px" }}>
  <img
    src="https://i.pravatar.cc/60"
    alt="User"
    className="user-avatar"
    style={{ width: "50px", height: "40px", borderRadius: "50%" }}
  />
</div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <button className="compose-btn" onClick={() => setShowCompose(true)}>
          ✉ Compose
        </button>
        <ul>
          <li className="active"> 📩 Inbox</li>
          <li> Ⓜ️ Sent</li>
          <li> 📃 Drafts</li>
        </ul>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <h2>📩 Inbox</h2>
          <div className="search-box">
          <input
  type="text"
  placeholder=" 🔍 Search mail (subject, to, message)"
  value={searchQuery}
  onChange={(e) => handleSearch(e.target.value)}
  style={{
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)" // <-- box shadow
  }}
/>

          </div>
          {selectedIds.length > 0 && (
           <button
  className="delete-btn"
  onClick={() => setConfirmDelete(true)}
  style={{
    marginLeft: "10px",
    background: "#d32f2f",         // Red background
    color: "#fff",                 // White text
    border: "2px solid #b71c1c",  // Red border
    fontWeight: "bold",            // Bold text
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer"
  }}
>
  🗑️ Delete
</button>
          )}
        </div>

        {/* Email List */}
        <div className="email-list">
          {emails.map((mail,index) => (
            <div key={mail.id} className="email-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(mail.id)}
                onChange={() => toggleSelect(mail.id)}
              />
              <div
                className="email-from"
                onClick={() => setSelectedEmail(mail)}
              >
                {mail.to || "chakkasatwika225@gmail.com"}
              </div>
              <div
                className="email-subject"
                onClick={() => setSelectedEmail(mail)}
              >
                {mail.subject}
              </div>
              <div className="email-time">
  {new Date(mail.date).toLocaleString()}
</div>
<div style={{ position: "relative", display: "inline-block" }}>
  <button
    onClick={() =>
      setOpenExportMenu(openExportMenu === index ? null : index)
    }
    style={{
      marginLeft: "10px",
      background: "#007bff",
      color: "white",
      border: "none",
      padding: "5px 10px",
      borderRadius: "5px",
      cursor: "pointer"
    }}
  >
    Export
  </button>

  {/* Dropdown Menu */}
  {openExportMenu === index && (
    <div
      style={{
        position: "absolute",
        top: "100%", // directly below button
        left: 0,
        border: "1px solid #ddd",
        background: "#fff",
        padding: "5px",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        zIndex: 10,
        marginTop: "5px",
        minWidth: "120px"
      }}
    >
      <button
        onClick={() => {
          exportMailToCSV(mail);
          setOpenExportMenu(null);
        }}
        style={{
          display: "block",
          width: "100%",
          padding: "8px",
          border: "none",
          background: "transparent",
          textAlign: "left",
          cursor: "pointer"
        }}
      >
        Export CSV
      </button>
      <button
        onClick={() => {
          exportMailToExcel(mail);
          setOpenExportMenu(null);
        }}
        style={{
          display: "block",
          width: "100%",
          padding: "8px",
          border: "none",
          background: "transparent",
          textAlign: "left",
          cursor: "pointer"
        }}
      >
        Export Excel
      </button>
    </div>
  )}
</div>
      

            </div>
          ))}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="compose-modal">
          <div className="compose-box">
            <div className="compose-header">
              <h3>New Message</h3>
              <button onClick={() => setShowCompose(false)}>✖</button>
            </div>

            {/* Recipients */}
            <div
              className="recipient-box"
              onClick={() => toInputRef.current?.focus()}
            >
              {recipients.map((r) => (
                <span key={r} className="recipient-chip">
                  {r}
                  <button onClick={() => removeRecipient(r)}>×</button>
                </span>
              ))}
              <input
                ref={toInputRef}
                type="text"
                placeholder={
                  recipients.length
                    ? "Add more recipients"
                    : "Type email & press Enter"
                }
                value={newEmail.to}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, to: e.target.value })
                }
                onKeyDown={onRecipientKeyDown}
              />
            </div>

            {error && <div className="error">{error}</div>}

            <input
              type="text"
              placeholder="Subject"
              value={newEmail.subject}
              onChange={(e) =>
                setNewEmail({ ...newEmail, subject: e.target.value })
              }
            />

            <textarea
              placeholder="Write your message..."
              value={newEmail.body}
              onChange={(e) =>
                setNewEmail({ ...newEmail, body: e.target.value })
              }
            ></textarea>

            <div className="attachments">
              <input type="file" multiple onChange={handleFileChange} />
              <div className="attachment-list">
                {attachments.map((file) => (
                  <div key={file.name} className="attachment-chip">
                    {file.name}
                    <button onClick={() => removeAttachment(file.name)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <button className="send-btn" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="compose-modal">
          <div className="compose-box">
            <div className="compose-header">
              <h3>{selectedEmail.subject}</h3>
              <button onClick={() => setSelectedEmail(null)}>✖</button>
            </div>
            <div style={{ padding: "15px", fontSize: "14px" }}>
              <p>
                <p>
  <strong>From:</strong> {selectedEmail.from || "chakkasatwika225@gmail.com"}
</p>
              </p>
              <p>
                <strong>To:</strong> {selectedEmail.to}
              </p>
              <p>
  <strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}
</p>

              <hr />
             <p>{selectedEmail.body || selectedEmail.message || "(No message body)"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="compose-modal">
          <div className="compose-box">
            <div className="compose-header">
              <h3>Confirm Delete</h3>
            </div>
            <p>Are you sure you want to delete {selectedIds.length} mail(s)?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button className="send-btn" onClick={handleDelete}>
                Yes, Delete
              </button>
              <button
                className="compose-btn"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailApp;
