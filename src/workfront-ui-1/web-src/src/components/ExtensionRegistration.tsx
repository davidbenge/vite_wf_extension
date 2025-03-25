/*
 * <license header>
 */

import React, { useEffect, useState } from "react";
import { Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { extensionId } from "./Constants";
import metadata from '../../../../app-metadata.json';
import { icon1, icon2 } from './icons';

interface MenuItem {
  id: string;
  url: string;
  label: string;
  icon: string;
}

const ExtensionRegistration: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        const connection = await register({
          id: extensionId,
          metadata,
          methods: {
            mainMenu: {
              getItems(): MenuItem[] {
                return [
                  {
                    id: 'test-port',
                    url: '/index.html#/extensions/mainmenu-test_port',
                    label: 'Test Port',
                    icon: icon1,
                  },
                  // @todo YOUR HEADER BUTTONS DECLARATION SHOULD BE HERE
                ];
              },
            },
          }
        });
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize guest:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize');
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div>
        <Text>Error: {error}</Text>
      </div>
    );
  }

  return (
    <div>
      {isInitialized ? (
        <Text>IFrame for integration with Host (Workfront)...</Text>
      ) : (
        <Text>Initializing...</Text>
      )}
    </div>
  );
};

export default ExtensionRegistration; 