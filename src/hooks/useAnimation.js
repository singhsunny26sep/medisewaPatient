import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

export const useAnimation = ({duration = 300, initialValue = 0, toValue = 1, useNativeDriver = true}) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  useEffect(() => {
    let isMounted = true;
    
    const animation = Animated.timing(animatedValue, {
      toValue,
      duration,
      useNativeDriver,
    });

    if (isMounted) {
      animation.start();
    }

    return () => {
      isMounted = false;
      animation.stop();
    };
  }, [animatedValue, toValue, duration, useNativeDriver]);

  return animatedValue;
};
