import { useEffect, useState } from "react";
import api from "../services/api";

export default function MessageForm({ onMessageScheduled }: { onMessageScheduled?: () => void }) {
  const [teamId, setTeamId] = useState<string>("");
  const [channels, setChannels] = useState<{id:string;name:string}[]>([]);
  const [channelId, setChannelId] = useState("");
  const [text, setText] = useState("");
  const [sendAt, setSendAt] = useState(""); // ISO string

  useEffect(() => {
    // read team_id from URL after callback
    const url = new URL(window.location.href);
    const tid = url.searchParams.get("team_id") || "";
    setTeamId(tid);
    if (tid) {
      api.get("/channels", { params: { team_id: tid } }).then(r => setChannels(r.data.channels));
    }
    console.log("MessageForm: team_id from URL:", tid);
  }, []);

  // Debug: log state changes
  useEffect(() => {
    console.log("MessageForm state:", { teamId, channelId, text, channelsCount: channels.length });
  }, [teamId, channelId, text, channels]);

  const sendNow = async () => {
    console.log("Sending message with:", { teamId, channelId, text });
    
    if (!teamId) {
      alert("No team ID found. Please connect to Slack first.");
      return;
    }
    
    if (!channelId) {
      alert("Please select a channel.");
      return;
    }
    
    if (!text.trim()) {
      alert("Please enter a message.");
      return;
    }
    
    try {
      const response = await api.post("/messages/send", { team_id: teamId, channel_id: channelId, text });
      console.log("Message sent successfully:", response.data);
      alert("Sent!");
      setText(""); // Clear the message after sending
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const apiError = error as { response?: { data?: { error?: string; invite_endpoint?: string } } };
        errorMessage = apiError.response?.data?.error || 'API error';
        
        // If it's a "not_in_channel" error, offer to invite the bot
        if (apiError.response?.data?.error?.includes('not_in_channel')) {
          const shouldInvite = confirm(`${errorMessage}\n\nWould you like me to try to invite the bot to this channel?`);
          if (shouldInvite) {
            inviteBotToChannel();
            return;
          }
        }
      }
      
      alert(`Failed to send message: ${errorMessage}`);
    }
  };

  const inviteBotToChannel = async () => {
    if (!teamId || !channelId) {
      alert("Missing team ID or channel ID");
      return;
    }
    
    try {
      console.log("Inviting bot to channel:", { teamId, channelId });
      const response = await api.post("/messages/invite", { team_id: teamId, channel_id: channelId });
      console.log("Bot invited successfully:", response.data);
      alert("Bot invited to channel! Now try sending your message again.");
    } catch (error: unknown) {
      console.error("Error inviting bot:", error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const apiError = error as { response?: { data?: { error?: string } } };
        errorMessage = apiError.response?.data?.error || 'API error';
      }
      
      if (errorMessage.includes('missing_scope')) {
        alert(`Failed to invite bot: ${errorMessage}\n\nTo fix this permanently:\n1. Go to api.slack.com/apps\n2. Select your app → OAuth & Permissions\n3. Add scopes: channels:write.invites, groups:write.invites\n4. Reinstall the app\n\nFor now, invite manually:\n/invite @YourBotName in the Slack channel`);
      } else {
        alert(`Failed to invite bot: ${errorMessage}\n\nPlease invite the bot manually using /invite @YourBotName in the Slack channel.`);
      }
    }
  };

  const schedule = async () => {
    await api.post("/messages/schedule", { team_id: teamId, channel_id: channelId, text, sendAtISO: sendAt });
    alert("Scheduled!");
    onMessageScheduled?.(); // Notify parent component
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
        💬 Message Form
      </h3>
      
      {/* Status indicator */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: teamId ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${teamId ? '#bbf7d0' : '#fecaca'}`,
        color: teamId ? '#166534' : '#dc2626'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          {teamId ? '✅ Connected to Slack' : '❌ Not connected to Slack'}
        </div>
        {teamId && (
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Team ID: {teamId} | Available channels: {channels.length}
          </div>
        )}
        {!teamId && (
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Please click "Connect Slack" first to authorize this app
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Channel:
        </label>
        <select 
          value={channelId} 
          onChange={e=>setChannelId(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            backgroundColor: 'white'
          }}
        >
          <option value="">Select channel</option>
          {channels.map(c=> <option key={c.id} value={c.id}>#{c.name}</option>)}
        </select>
        
       
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Message:
        </label>
        <textarea 
          value={text} 
          onChange={e=>setText(e.target.value)} 
          placeholder="Your message..." 
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button 
          onClick={sendNow} 
          disabled={!channelId || !text}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease',
            opacity: (!channelId || !text) ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (channelId && text) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'translateY(-1px)';
              target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (channelId && text) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
            }
          }}
        >
          📤 Send Now
        </button>
      </div>

      <div style={{ 
        marginTop: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <h4 style={{ 
          margin: '0 0 16px 0', 
          color: '#92400e',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          ⏰ Schedule for Later
        </h4>
        
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input 
            type="datetime-local" 
            onChange={e=>{
              const local = e.target.value; // e.g. "2025-08-18T17:30"
              if (!local) return setSendAt("");
              // Convert local -> ISO so backend stores UTC
              const iso = new Date(local).toISOString();
              setSendAt(iso);
            }}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          />
          <button 
            onClick={schedule} 
            disabled={!channelId || !text || !sendAt}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.2s ease',
              opacity: (!channelId || !text || !sendAt) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (channelId && text && sendAt) {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (channelId && text && sendAt) {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
              }
            }}
          >
            📅 Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
