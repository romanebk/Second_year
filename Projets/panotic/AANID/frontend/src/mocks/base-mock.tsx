import React, { createContext } from 'react';

export class MockComponent extends React.Component {
  render() {
    return this.props.children || null;
  }
}

const defaultInsets = { top: 0, left: 0, right: 0, bottom: 0 };
const defaultFrame = { x: 0, y: 0, width: 0, height: 0 };

export const SafeAreaProvider = MockComponent;
export const SafeAreaView = MockComponent;
export const SafeAreaConsumer = ({ children }) => children(defaultInsets);
export const useSafeAreaInsets = () => defaultInsets;
export const useSafeAreaFrame = () => defaultFrame;
export const initialWindowMetrics = { frame: defaultFrame, insets: defaultInsets };
export const SafeAreaInsetsContext = createContext(defaultInsets);
export const SafeAreaFrameContext = createContext(defaultFrame);

export default MockComponent;
