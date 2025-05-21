
import React, {useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Image,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import {COLORS} from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import {Instance} from '../../api/Instance';
import ShimmerCard from '../Shimmer/ShimmerCard';

const {width} = Dimensions.get('window');

const ImageSlider = () => {
  const [data, setData] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await Instance.get('api/v1/banners/getAll');
        if (response.data.success) {
          setData(
            response.data.result.map(banner => ({
              id: banner._id,
              image: {uri: banner.image},
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (data.length > 0) {
        const nextIndex = (currentIndex + 1) % data.length;
        flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
        setCurrentIndex(nextIndex);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [currentIndex, data.length]);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const renderItem = ({item}) => (
    <View style={styles.imageContainer}>
      <Image resizeMode="contain" source={item.image} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      {data.length === 0 ? (
        <View style={styles.shimmerWrapper}>
          {[1, 2, 3].map(index => (
            <View key={index} style={styles.shimmerItem}>
              <ShimmerCard type="banner" />
            </View>
          ))}
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={data}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
            }}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {useNativeDriver: false},
            )}
          />
          <View style={styles.pagination}>
            {data.map((_, i) => (
              <View
                key={i.toString()}
                style={[styles.dot, currentIndex === i && styles.activeDot]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: verticalScale(170),
    justifyContent: 'center',
  },
  imageContainer: {
    width: width - 32,
    height: scale(185),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(15),
    padding: scale(15),
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: scale(10),
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: verticalScale(0),
    alignSelf: 'center',
  },
  dot: {
    height: scale(3),
    width: scale(40),
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.AshGray,
    marginHorizontal: scale(2),
  },
  activeDot: {
    backgroundColor: COLORS.DODGERBLUE,
  },
  shimmerWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(10),
  },
  shimmerItem: {
    width: (width - 54) / 2,
    marginHorizontal: scale(8),
  },
});

export default ImageSlider;
