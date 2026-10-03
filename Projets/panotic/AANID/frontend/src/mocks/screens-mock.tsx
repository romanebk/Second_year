import React from 'react';
import { View } from 'react-native';

class MockScreenContainer extends React.Component {
  render() {
    return <View style={{ flex: 1, height: '100%' }}>{this.props.children}</View>;
  }
}

export const ScreenContainer = MockScreenContainer;
export const Screen = MockScreenContainer;
export const MaybeScreenContainer = MockScreenContainer;
export const enableScreens = () => {};
export const shouldUseActivityState = () => true;

export default { ScreenContainer, Screen, MaybeScreenContainer, enableScreens, shouldUseActivityState };
