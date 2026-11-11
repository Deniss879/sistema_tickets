import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Onda decorativa superior derecha (degradado azul → rosa/magenta)
export const WaveTop = ({ style }) => (
  <Svg
    width={width * 0.7}
    height={200}
    viewBox="0 0 350 200"
    style={[{ position: 'absolute', top: -20, right: -20 }, style]}
  >
    <Defs>
      <LinearGradient id="gradTop" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#1B3A8C" />
        <Stop offset="0.5" stopColor="#6B3FA0" />
        <Stop offset="1" stopColor="#E040A0" />
      </LinearGradient>
    </Defs>
    <Path
      d="M100,0 C150,0 200,20 250,60 C300,100 330,140 350,200 L350,0 Z"
      fill="url(#gradTop)"
      opacity={0.85}
    />
    <Path
      d="M150,0 C200,10 250,50 300,100 C330,130 345,170 350,200 L350,0 Z"
      fill="url(#gradTop)"
      opacity={0.4}
    />
  </Svg>
);

// Onda decorativa inferior izquierda
export const WaveBottom = ({ style }) => (
  <Svg
    width={width * 0.7}
    height={200}
    viewBox="0 0 350 200"
    style={[{ position: 'absolute', bottom: -20, left: -20 }, style]}
  >
    <Defs>
      <LinearGradient id="gradBottom" x1="1" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor="#1B3A8C" />
        <Stop offset="0.5" stopColor="#6B3FA0" />
        <Stop offset="1" stopColor="#E040A0" />
      </LinearGradient>
    </Defs>
    <Path
      d="M0,200 C0,150 20,100 60,60 C100,20 150,0 250,0 L0,0 Z"
      fill="url(#gradBottom)"
      opacity={0.85}
    />
    <Path
      d="M0,200 C10,160 40,110 80,70 C120,30 170,10 250,0 L0,0 Z"
      fill="url(#gradBottom)"
      opacity={0.4}
    />
  </Svg>
);

export default { WaveTop, WaveBottom };
