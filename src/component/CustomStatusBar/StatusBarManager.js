import React from 'react';
import {View, StyleSheet} from 'react-native';
import CustomStatusBar from './CustomStatusBar';
import {useStatusBar} from '../../utils/StatusBarContext';

const StatusBarManager = () => {
  const {showStatusBar} = useStatusBar();

  if (!showStatusBar) {
    return null;
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});

export default StatusBarManager;