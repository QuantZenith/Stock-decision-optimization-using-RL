import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../api/api";

export default function LiveDecisionFeed() {
  const [feed, setFeed] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(API_BASE);

    socketRef.current.on("decision", (data) => {
      setFeed(prev => [data, ...prev].slice(0, 50));
    });

    return () => socketRef.current.disconnect();
  }, []);

  return (
    <div className="card decision-feed">
      <h2>Live Decision Feed</h2>
      {feed.length === 0 && <p>Waiting for events...</p>}
      <div className="feed-list">
        {feed.map((d, i) => (
          <div key={i} className={`feed-item ${d.action.toLowerCase()}`}>
            <span>{d.symbol}</span>
            <span className="chip">{d.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
