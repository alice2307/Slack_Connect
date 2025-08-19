import { useEffect, useState } from "react";
import api from "../services/api";

interface ScheduledMessage {
  id: number;
  channel_id: string;
  text: string;
  send_at: number;
  status: 'pending' | 'sent' | 'canceled' | 'failed';
  last_error?: string;
}

export default function ScheduledMessages() {
  const [teamId, setTeamId] = useState("");
  const [items, setItems] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (tid: string) => {
    if (!tid) return;
    setLoading(true);
    try {
      const r = await api.get("/messages/scheduled", { params: { team_id: tid } });
      setItems(r.data.items);
      console.log("Loaded scheduled messages:", r.data.items);
    } catch (error) {
      console.error("Error loading scheduled messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const tid = url.searchParams.get("team_id") || "";
    setTeamId(tid);
    if (tid) load(tid);
  }, []);

  // Refresh the list
  const refresh = () => {
    if (teamId) load(teamId);
  };

  const cancel = async (id: number) => {
    try {
      await api.delete(`/messages/scheduled/${id}`, { params: { team_id: teamId } });
      refresh(); // Refresh after canceling
    } catch (error) {
      console.error("Error canceling message:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'sent': return '#10b981';
      case 'canceled': return '#6b7280';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'sent': return '✅';
      case 'canceled': return '❌';
      case 'failed': return '⚠️';
      default: return '❓';
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <h3 style={{ 
        margin: '0 0 24px 0', 
        fontSize: '1.5rem', 
        color: '#1e293b',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📋 Scheduled Messages
      </h3>
      
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          Loading scheduled messages...
        </div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          📭 No scheduled messages found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(it => (
            <div key={it.id} style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: getStatusColor(it.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {getStatusIcon(it.status)} {it.status}
                  </span>
                  <span style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    #{it.channel_id}
                  </span>
                </div>
                
                {it.status === 'pending' && (
                  <button 
                    onClick={() => cancel(it.id)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(-1px)';
                      target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    🚫 Cancel
                  </button>
                )}
              </div>
              
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                marginBottom: '12px',
                fontSize: '1rem',
                lineHeight: '1.5',
                color: '#374151'
              }}>
                {it.text}
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem',
                color: '#6b7280'
              }}>
                <span>
                  📅 Sends at: {new Date(it.send_at * 1000).toLocaleString()}
                </span>
                {it.last_error && (
                  <span style={{ color: '#ef4444', fontStyle: 'italic' }}>
                    Error: {it.last_error}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <button 
        onClick={refresh}
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(79, 70, 229, 0.3)',
          transition: 'all 0.2s ease',
          marginTop: '20px'
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = 'translateY(-1px)';
          target.style.boxShadow = '0 6px 12px rgba(79, 70, 229, 0.4)';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = 'translateY(0)';
          target.style.boxShadow = '0 4px 8px rgba(79, 70, 229, 0.3)';
        }}
      >
        {loading ? 'Refreshing...' : 'Refresh Scheduled Messages'}
      </button>
    </div>
  );
}
