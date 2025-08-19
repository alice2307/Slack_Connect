import ConnectSlack from "./components/ConnectSlack";
import MessageForm from "./components/MessageForm";
import ScheduledMessages from "./components/ScheduledMessages";
import { useState } from "react";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMessageScheduled = () => {
    // Trigger a refresh of scheduled messages
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1500px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.5rem', 
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            🚀 Slack Connect
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: '1.1rem', 
            opacity: 0.9,
            fontWeight: '300'
          }}>
            Schedule and send messages to your Slack channels
          </p>
        </div>
        
        <div style={{ padding: '32px' }}>
          <ConnectSlack />
          <div style={{ margin: '32px 0', height: '1px', background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)' }} />
          <MessageForm onMessageScheduled={handleMessageScheduled} />
          <div style={{ margin: '32px 0', height: '1px', background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)' }} />
          <ScheduledMessages key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
