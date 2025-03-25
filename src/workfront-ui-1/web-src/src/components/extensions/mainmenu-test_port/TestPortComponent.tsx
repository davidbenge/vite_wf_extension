import React from 'react';
import { View, Text, Heading, Divider, Content } from '@adobe/react-spectrum';

const TestPortComponent: React.FC = () => {
  return (
    <View padding="size-1000">
      <Content>
        <Heading level={1}>Welcome to Test Port!</Heading>
        <Divider size="M" />
        <Text>
          This is a beautiful hello world message from your Adobe Workfront extension.
          The component is styled using Adobe React Spectrum components for a consistent
          and professional look.
        </Text>
        <View marginTop="size-200">
          <Text>
            You can start customizing this component to add your own functionality.
            The sky's the limit!
          </Text>
        </View>
      </Content>
    </View>
  );
};

export default TestPortComponent; 