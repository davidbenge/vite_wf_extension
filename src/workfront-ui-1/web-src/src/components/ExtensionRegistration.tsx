/*
 * <license header>
 */

import React from "react";
import { View, Text } from "@adobe/react-spectrum";
import { register } from "@adobe/uix-guest";
import { EXTENSION_ID } from "./Constants";
import metadata from "../../../../app-metadata.json";

const ExtensionRegistration: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const initGuest = async () => {
      try {
        await register({
          id: EXTENSION_ID,
          metadata,
          methods: {
            myCustomView: {
              async documentIsViewable() {
                return true;
              },
              renderView() {
                return true;
              }
            }
          }
        });
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing guest:", error);
      }
    };

    initGuest();
  }, []);

  return (
    <View>
      {isInitialized ? (
        <Text>IFrame for integration with Host (Workfront)...</Text>
      ) : (
        <Text>Initializing...</Text>
      )}
    </View>
  );
};

export default ExtensionRegistration;
