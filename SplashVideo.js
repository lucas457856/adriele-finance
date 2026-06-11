import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

export default function SplashVideo({ onFinish }) {
  return (
    <View style={styles.container}>
      <Video
        source={require('./assets/video/splash.mp4')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            onFinish();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f14',
  },
});