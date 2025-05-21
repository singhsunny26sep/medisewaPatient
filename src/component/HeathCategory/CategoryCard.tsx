import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { colors,WIDTH } from '../../utils/colors';

const CategoryCard = ({ image, text, onPress }: any) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    );
};

export default CategoryCard;

const styles = StyleSheet.create({
    card: {
        width: WIDTH / 3.8,
        // width: '25%',
        height: WIDTH / 3,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        padding: 10,
        elevation: 1,
        marginHorizontal: '2.5%',
    },
    image: {
        width: '100%',
        height: '70%',
        resizeMode: 'cover',
        marginBottom: 8,
        borderRadius: WIDTH / 2
    },
    text: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        color: colors.black,
    },
});
