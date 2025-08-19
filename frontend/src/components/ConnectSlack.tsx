import { useMemo, useState, useEffect } from "react";
import api from "../services/api";

// Add type declaration for Vite env variables
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_BASE: string;
    };
  }
}

const ConnectSlack = () => {
  const [teamId, setTeamId] = useState("");
  const [botInfo, setBotInfo] = useState<{ bot_name: string; team_name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startUrl = useMemo(() => {
    return `${import.meta.env.VITE_API_BASE}/auth/slack/start`;
  }, []);

  useEffect(() => {
    // Get team_id from URL params
    const url = new URL(window.location.href);
    const tid = url.searchParams.get("team_id") || "";
    setTeamId(tid);
  }, []);

  const findBotName = async () => {
    if (!teamId) {
      setError("No team ID found. Please connect to Slack first.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await api.get("/messages/bot-info", { params: { team_id: teamId } });
      setBotInfo(response.data);
      console.log("Bot info retrieved:", response.data);
    } catch (error: unknown) {
      console.error("Error getting bot info:", error);
      let errorMessage = "Failed to get bot info";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { error?: string } } };
        errorMessage = apiError.response?.data?.error || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      textAlign: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '1.5rem', 
        color: '#1e293b',
        fontWeight: '600'
      }}>
        🔗 Connect Your Slack Workspace
      </h3>
      <p style={{ 
        margin: '0 0 24px 0', 
        color: '#64748b',
        fontSize: '1rem',
        lineHeight: '1.5'
      }}>
        Get started by connecting your Slack workspace to schedule and send messages
      </p>
      
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={startUrl} style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.transform = 'translateY(-2px)';
            target.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.4)';
        }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.transform = 'translateY(0)';
            target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
          }}>
            🚀 Connect Slack
          </button>
        </a>

        {teamId && (
          <button 
            onClick={findBotName}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(-2px)';
                target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}>
            {loading ? '🔍 Finding...' : '🤖 Find Bot Name'}
          </button>
        )}
      </div>

      {/* Bot Info Display */}
      {botInfo && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '8px',
          border: '1px solid #93c5fd'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '1.1rem' }}>
            🤖 Bot Information
          </h4>
          <p style={{ margin: '0 0 4px 0', color: '#1e40af', fontSize: '0.95rem' }}>
            <strong>Bot Name:</strong> @{botInfo.bot_name}
          </p>
          <p style={{ margin: '0 0 0 0', color: '#1e40af', fontSize: '0.95rem' }}>
            <strong>Team:</strong> {botInfo.team_name}
          </p>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#1e40af', 
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            💡 Use <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
              /invite @{botInfo.bot_name}
            </code> in any Slack channel to add the bot
          </p>
        </div>
      )}

      {/* Important Banner */}
      {teamId && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '12px',
          border: '2px solid #f59e0b',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '1.5rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}>
              ⚠️
            </span>
            <h4 style={{ 
              margin: '0', 
              color: '#92400e', 
              fontSize: '1.2rem',
              fontWeight: '700'
            }}>
              Important: Invite Bot to Channels
            </h4>
          </div>
          <div style={{ color: '#92400e', fontSize: '1rem', lineHeight: '1.6' }}>
            
            <ol style={{ 
              margin: '0 0 12px 0', 
              paddingLeft: '0',
              fontWeight: '500'
            }}>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span style={{
                  minWidth: '20px',
                  fontWeight: '600',
                  color: '#92400e'
                }}> Before you can schedule messages, you must invite the bot to the channel you want to send messages to.</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span style={{
                  minWidth: '20px',
                  fontWeight: '600',
                  color: '#92400e'
                }}>1.</span>
                <span>Click <strong>"🤖 Find Bot Name"</strong> above to get your bot's name</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span style={{
                  minWidth: '20px',
                  fontWeight: '600',
                  color: '#92400e'
                }}>2.</span>
                <span>Go to any Slack channel where you want to send messages</span>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '0'
              }}>
                <span style={{
                  minWidth: '20px',
                  fontWeight: '600',
                  color: '#92400e'
                }}>3.</span>
                <span>Type <code style={{ 
                  background: '#fef3c7', 
                  padding: '4px 8px', 
                  borderRadius: '6px',
                  border: '1px solid #f59e0b',
                  fontFamily: 'monospace',
                  fontWeight: '600'
                }}>/invite @YourBotName</code> and press Enter</span>
              </li>
            </ol>
            <p style={{ 
              margin: '0', 
              fontSize: '0.95rem',
              fontStyle: 'italic',
              background: 'rgba(255,255,255,0.3)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}>
              💡 <strong>Note:</strong> You can invite the bot to multiple channels. The bot will only be able to send messages to channels where it's been invited.
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#fef2f2',
          color: '#dc2626',
          borderRadius: '6px',
          border: '1px solid #fecaca',
          fontSize: '0.9rem'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default ConnectSlack;
