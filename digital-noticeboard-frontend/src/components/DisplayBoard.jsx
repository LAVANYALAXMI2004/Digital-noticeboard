import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import "./DisplayBoard.css";

const WS_URL = (() => {
  const { protocol, hostname } = window.location;
  const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${hostname}:5000/ws/`;
})();
const DURATION = 10000;

const DisplayBoard = () => {
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dateTime, setDateTime] = useState(dayjs());
  const [progress, setProgress] = useState(0);

  const formatContent = (text = "") =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (e) => {
      try {
        setNotices(JSON.parse(e.data));
      } catch { }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setDateTime(dayjs());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const i = setInterval(() => {
      const p = Math.min(((Date.now() - start) / DURATION) * 100, 100);
      setProgress(p);
      if (p >= 100 && notices.length)
        setCurrentIndex((v) => (v + 1) % notices.length);
    }, 100);
    return () => clearInterval(i);
  }, [currentIndex, notices.length]);

  const BASE_URL = (() => {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000`;
  })();

  const fallback = {
    image: `${BASE_URL}/uploads/no_notice.jpg`,
    title: "No Notices Available",
    content: "Stay tuned! Notices will appear here in real-time.",
    link: `${BASE_URL}`,
  };

  const notice = notices.length ? notices[currentIndex] : fallback;

  return (
    <div className="modern-board">
      {/* LEFT SECTION: Logo & Date/Day */}
      <div className="left-section">
        <div className="logo-container">
          <img
            src={`https://ngpdnb.infaverse.com/uploads/ngp_logo.png`}
            alt="Institution Logo"
            className="logo"
          />
        </div>

        <div className="divider"></div>

        <div className="date-section">
          <div className="date-box date-box-small">
            <div className="prev-date">{dateTime.subtract(1, 'day').format("DD")}</div>
          </div>
          <div className="date-box date-box-large">
            <div className="day-name">{dateTime.format("dddd")}</div>
            <div className="date-display">{dateTime.format("DD")}</div>
            <div className="month-name">{dateTime.format("MMMM YYYY")}</div>
          </div>
          <div className="date-box date-box-small">
            <div className="next-date">{dateTime.add(1, 'day').format("DD")}</div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="status-badge">
          <div className="status-dot"></div>
          <span>Live</span>
        </div>
      </div>

      {/* CENTER SECTION: Poster with Progress */}
      <div className="center-section">
        <div className="poster-frame">
          <img
            src={notice.image.startsWith('http') ? notice.image : `${BASE_URL}/uploads/${notice.image}`}
            alt={notice.title}
            className="poster-image"
          />
        </div>
        <div className="progress-indicator">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* RIGHT SECTION: Public Display Support */}
      <div className="right-section">
        {/* Logo & Time Header */}
        <div className="header-top">
         

          {/* Time & Location */}
          <div className="sidebar-clock">
            <svg className="analog-clock" viewBox="0 0 200 200">
              {/* Clock face circle */}
              <circle cx="100" cy="100" r="95" className="clock-face" />

              {/* Hour markers */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x1 = 100 + 85 * Math.cos(angle);
                const y1 = 100 + 85 * Math.sin(angle);
                const x2 = 100 + 75 * Math.cos(angle);
                const y2 = 100 + 75 * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="hour-marker" />;
              })}

              {/* Hour hand */}
              <line
                x1="100"
                y1="100"
                x2={100 + 40 * Math.sin((dateTime.hour() % 12 + dateTime.minute() / 60) * (Math.PI / 6))}
                y2={100 - 40 * Math.cos((dateTime.hour() % 12 + dateTime.minute() / 60) * (Math.PI / 6))}
                className="hour-hand"
              />

              {/* Minute hand */}
              <line
                x1="100"
                y1="100"
                x2={100 + 60 * Math.sin(dateTime.minute() * (Math.PI / 30))}
                y2={100 - 60 * Math.cos(dateTime.minute() * (Math.PI / 30))}
                className="minute-hand"
              />

              {/* Second hand */}
              <line
                x1="100"
                y1="100"
                x2={100 + 65 * Math.sin(dateTime.second() * (Math.PI / 30))}
                y2={100 - 65 * Math.cos(dateTime.second() * (Math.PI / 30))}
                className="second-hand"
              />

              {/* Center dot */}
              <circle cx="100" cy="100" r="4" className="center-dot" />
            </svg>
          </div>
        </div>

        {/* Event Info
        <div className="event-info">
          <h3 className="event-title">{notice.title}</h3>
          <div className="event-divider"></div>
          <div className="event-details">
            <div className="event-field">
              <span className="field-label">Details</span>
              <span className="field-value"
                dangerouslySetInnerHTML={{
                  __html: formatContent(notice.content),
                }}
              />
            </div>
          </div>
        </div> */}

        {/* QR Code */}
        <div className="qr-section">
          <div className="qr-header">
            <span className="qr-title">Quick Access</span>
          </div>

          <div className="qr-frame">
            <QRCodeCanvas
              value={String(notice.link)}
              size={180}
              level="H"
              includeMargin={false}
              bgColor="#f5f5f5"
              fgColor="#333333"
            />
          </div>

          <div className="qr-text">Scan to Register</div>
        </div>

        {/* Department Footer */}
        <div className="department-footer">
          <div style={{ marginTop: '8px', fontSize: '0.85em', opacity: '0.8' }}>
            Designed and implemented by
          </div>
          <div>Department of Computer Science & Engineering</div>
        </div>
      </div>
    </div>
  );
};

export default DisplayBoard;
