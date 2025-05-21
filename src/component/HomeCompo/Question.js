import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../Theme/Colors';
import {scale, verticalScale, moderateScale} from '../../utils/Scaling';
import { Fonts } from '../../Theme/Fonts';
import strings from '../../../localization';
import {useSelector} from 'react-redux';


export default function Question() {
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const language = useSelector((state) => state.Common.language);

  const handleQuestionPress = questionId => {
    setExpandedQuestion(prev => (prev === questionId ? null : questionId));
  };

  return (
    <View style={styles.FAQContainer}>
      <Text style={styles.FAQHeader}>{strings.FrequentlyAskedQuestions}</Text>
      <View style={styles.QuestionView}>
        <TouchableOpacity
          style={styles.FAQQuestion}
          onPress={() => handleQuestionPress('q1')}>
          <Text style={styles.FAQQuestionText}>{strings.HowToBookLabTest}</Text>
          <Ionicons
            name={expandedQuestion === 'q1' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.DODGERBLUE}
          />
        </TouchableOpacity>
        {expandedQuestion === 'q1' && (
          <Text style={styles.FAQAnswer}>
             {strings.BookLabTestInfo}
          </Text>
        )}
      </View>
      <View style={styles.QuestionView}>
        <TouchableOpacity
          style={styles.FAQQuestion}
          onPress={() => handleQuestionPress('q2')}>
          <Text style={styles.FAQQuestionText}>
           {strings.PaymentMethodsAccepted}
          </Text>
          <Ionicons
            name={expandedQuestion === 'q2' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.DODGERBLUE}
          />
        </TouchableOpacity>
        {expandedQuestion === 'q2' && (
          <Text style={styles.FAQAnswer}>
            {strings.PaymentMethodsInfo}
          </Text>
        )}
      </View>
      <View style={styles.QuestionView}>
        <TouchableOpacity
          style={styles.FAQQuestion}
          onPress={() => handleQuestionPress('q3')}>
          <Text style={styles.FAQQuestionText}>
            {strings.WhatIsHomeSampleCollection}
          </Text>
          <Ionicons
            name={expandedQuestion === 'q3' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.DODGERBLUE}
          />
        </TouchableOpacity>
        {expandedQuestion === 'q3' && (
          <Text style={styles.FAQAnswer}>
            {strings.HomeSampleCollectionInfo}
          </Text>
        )}
      </View>
      <View style={styles.QuestionView}>
        <TouchableOpacity
          style={styles.FAQQuestion}
          onPress={() => handleQuestionPress('q4')}>
          <Text style={styles.FAQQuestionText}>
            {strings.BenefitsOfOnlineTesting}
          </Text>
          <Ionicons
            name={expandedQuestion === 'q4' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.DODGERBLUE}
          />
        </TouchableOpacity>
        {expandedQuestion === 'q4' && (
          <Text style={styles.FAQAnswer}>
           {strings.OnlineTestingBenefitsInfo}
          </Text>
        )}
      </View>
      <View style={styles.QuestionView}>
        <TouchableOpacity
          style={styles.FAQQuestion}
          onPress={() => handleQuestionPress('q5')}>
          <Text style={styles.FAQQuestionText}>
            {strings.UseWalletToBookLab}
          </Text>
          <Ionicons
            name={expandedQuestion === 'q5' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.DODGERBLUE}
          />
        </TouchableOpacity>
        {expandedQuestion === 'q5' && (
          <Text style={styles.FAQAnswer}>
           {strings.UseWalletInfo}  
          </Text>
        )}
      </View>
      <View style={styles.QuestionView}>
        <TouchableOpacity
          style={styles.FAQQuestion}
          onPress={() => handleQuestionPress('q6')}>
          <Text style={styles.FAQQuestionText}>
            {strings.CancelLabBooking}
          </Text>
          <Ionicons
            name={expandedQuestion === 'q6' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.DODGERBLUE}
          />
        </TouchableOpacity>
        {expandedQuestion === 'q6' && (
          <Text style={styles.FAQAnswer}>{strings.CancelLabBookingInfo}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  FAQContainer: {
    marginTop: verticalScale(20),
    paddingHorizontal: scale(15),
  },
  FAQHeader: {
    fontSize: moderateScale(20),
    fontFamily:Fonts.Medium,
    color: COLORS.ARSENIC,
    marginBottom: verticalScale(10),
  },
  QuestionView: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    marginHorizontal: scale(15),
    marginVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    elevation: 2,
  },
  FAQQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(15),
  },
  FAQQuestionText: {
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    width: scale(250),
    fontFamily:Fonts.Medium,
  },
  FAQAnswer: {
    fontSize: moderateScale(14),
    color: COLORS.ARSENIC,
    marginTop: verticalScale(5),
    paddingHorizontal: scale(10),
    fontFamily:Fonts.Regular,
  },
});
