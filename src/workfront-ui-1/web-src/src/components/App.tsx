/*
 * <license header>
 */

import React from "react";
import { Provider, defaultTheme } from "@adobe/react-spectrum";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ExtensionRegistration from "./ExtensionRegistration";
import Testport from "./TestportMainMenuItem";

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider theme={defaultTheme}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Router>
          <Routes>
            <Route index element={<ExtensionRegistration />} />
            <Route path="index.html" element={<ExtensionRegistration />} />
            <Route path="test-port" element={<Testport />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
