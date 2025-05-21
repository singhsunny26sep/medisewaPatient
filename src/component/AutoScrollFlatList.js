import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';

const AutoScrollFlatList = ({ data, renderItem, keyExtractor, itemWidth }) => {
  const flatListRef = useRef(null);
  let scrollValue = 0;
  let scrolled = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      scrolled++;
      if (scrolled < data.length) {
        scrollValue = scrollValue + itemWidth;
      } else { 
        scrollValue = 0;
        scrolled = 0;
      }
      flatListRef.current.scrollToOffset({ animated: true, offset: scrollValue });
    }, 3000);

    return () => clearInterval(interval);
  }, [data, itemWidth]);

  return (
    <FlatList
      ref={flatListRef}
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10 }} 
    />
  );
};

export default AutoScrollFlatList;
