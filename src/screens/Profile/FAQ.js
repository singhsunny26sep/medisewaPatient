import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import {Fonts} from '../../Theme/Fonts';
import strings from '../../../localization';
import {useSelector} from 'react-redux';

const faqData = [
  {
    question: strings.FAQ1Question,
    answer: strings.FAQ1Answer,
  },
  {
    question: strings.FAQ2Question,
    answer: strings.FAQ2Answer,
  },
  {
    question: strings.FAQ3Question,
    answer: strings.FAQ3Answer,
  },
  {
    question: strings.FAQ4Question,
    answer: strings.FAQ4Answer,
  },
  {
    question: strings.FAQ5Question,
    answer: strings.FAQ5Answer,
  },
  {
    question: strings.FAQ6Question,
    answer: strings.FAQ6Answer,
  },
  {
    question: strings.FAQ7Question,
    answer: strings.FAQ7Answer,
  },
  {
    question: strings.FAQ8Question,
    answer: strings.FAQ8Answer,
  },
  {
    question: strings.FAQ9Question,
    answer: strings.FAQ9Answer,
  },
  {
    question: strings.FAQ10Question,
    answer: strings.FAQ10Answer,
  },
];

export default function FaqScreen({navigation}) {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const language = useSelector(state => state.Common.language);

  const handleToggle = index => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader
        title={strings.FrequentlyAskedQuestions}
        navigation={navigation}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.faqContainer}>
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqTitleContainer}
                onPress={() => handleToggle(index)}>
                <Text style={styles.faqTitle}>{faq.question}</Text>
                <Ionicons
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.black}
                  marginRight={5}
                />
              </TouchableOpacity>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: scale(15),
  },
  faqContainer: {
    marginTop: scale(15),
  },
  faqItem: {
    borderWidth: 0.5,
    marginVertical: verticalScale(5),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(5),
  },
  faqTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqTitle: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Bold,
    color: COLORS.black,
    flex: 1,
    marginLeft: scale(8),
  },
  faqAnswer: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Regular,
    color: 'grey',
    marginTop: scale(5),
    paddingHorizontal: scale(8),
    textAlign: 'justify',
  },
});
