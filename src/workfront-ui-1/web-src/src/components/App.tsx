/*
 * <license header>
 */

import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ExtensionRegistration from "./ExtensionRegistration";
import Testport from "./TestportMainMenuItem";
import IframeWrapper from "./IframeWrapper";

const App: React.FC = () => {
  // error handler on UI rendering failure
  const onError = (error: Error, info: React.ErrorInfo): void => {
    console.error('Error:', error);
    console.error('Component Stack:', info.componentStack);
  };

  // component to show if UI fails rendering
  const fallbackComponent: React.FC<FallbackProps> = ({ error }) => {
    return (
      <React.Fragment>
        <h1 style={{ textAlign: "center", marginTop: "20px" }}>
          Phly, phly... Something went wrong :(
        </h1>
        <pre>
          {error?.message || 'An unknown error occurred'}
        </pre>
      </React.Fragment>
    );
  };

  return (
    <IframeWrapper>
      <Router>
        <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
          <Routes>
            <Route index element={<ExtensionRegistration />} />    
            <Route path="index.html" element={<ExtensionRegistration />} />  
            {/* @todo YOUR CUSTOM ROUTES SHOULD BE HERE */}          
            <Route
              path="test-port"
              element={<Testport />}
            />
          </Routes>
        </ErrorBoundary>
      </Router>
    </IframeWrapper>
  );
};

export default App; 