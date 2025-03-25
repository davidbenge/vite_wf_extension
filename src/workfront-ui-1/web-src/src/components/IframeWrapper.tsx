import React, { useEffect, useState, useRef } from 'react';
import { register, GuestServer } from '@adobe/uix-guest';
import { Button } from '@adobe/react-spectrum';
import { isInIframe, isLocalhost } from '../utils';

interface IframeWrapperProps {
  children: React.ReactNode;
}


const IframeWrapper: React.FC<IframeWrapperProps> = ({ children }) => {
  const [shouldUseIframe, setShouldUseIframe] = useState(false);
  const [guestServer, setGuestServer] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const initGuest = async () => {
      try {
        const server = await register({

          // Must match extension ID from registry
          id: "My Custom View Extension",
          // enable logging in dev build
          debug: process.env.NODE_ENV !== "production",
          // Host can access these methods from its Port to this guest
          methods: {
            // Methods must be namespaced by one or more levels
            myCustomView: {
              async documentIsViewable(docId) {
              const doc = await callMyRuntimeAction(docId);
              return someValidation(doc);
          },
          renderView(docId, depth) {
            // Use a host method
            const tooltip = await server.host.editor.requestTooltip({
              type: 'frame',
              url: new URL(`/show/${docId}`, location).href
            })
          }
          },
          },
        })
        setGuestServer(server);
      } catch (error) {
        console.error('Error initializing guest:', error);
        setShouldUseIframe(false);
      }
    };

    initGuest();
  }, []);

  const handleNavigateToTestPort = () => {

  };

  if (shouldUseIframe) {
    return (
      <div>
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          <Button 
            variant="primary" 
            onPress={handleNavigateToTestPort}
          >
            Go to Test Port
          </Button>
        </div>
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100vh', 
          overflow: 'hidden' 
        }}>
          <iframe
            data-uix-guest="true" 
            role="presentation" 
            referrerpolicy="strict-origin" 
            aria-hidden="true"
            ref={iframeRef}
            src={window.location.href}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Application Frame"
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default IframeWrapper; 
