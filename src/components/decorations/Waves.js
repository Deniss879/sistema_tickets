import React from 'react';
import { StyleSheet, View, Image, useWindowDimensions } from 'react-native';

// Esquina decorativa superior derecha oficial (arte original)
export const WaveTop = ({ style }) => {
  const { width } = useWindowDimensions();
  const cornerWidth = Math.min(Math.round(width * 0.78), 360);
  const cornerHeight = Math.round((cornerWidth * 185) / 342);

  return (
    <View style={[styles.topContainer, style]} pointerEvents="none">
      <Image
        source={require('../../../assets/esquina_top_right.png')}
        style={{ width: cornerWidth, height: cornerHeight }}
        resizeMode="contain"
      />
    </View>
  );
};

// Esquina decorativa inferior izquierda oficial (arte original)
export const WaveBottom = ({ style }) => {
  const { width } = useWindowDimensions();
  const cornerWidth = Math.min(Math.round(width * 0.78), 360);
  const cornerHeight = Math.round((cornerWidth * 185) / 342);

  return (
    <View style={[styles.bottomContainer, style]} pointerEvents="none">
      <Image
        source={require('../../../assets/esquina_bottom_left.png')}
        style={{ width: cornerWidth, height: cornerHeight }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
});

export default { WaveTop, WaveBottom };
