import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {Container} from '../../component/Container/Container';
import {COLORS} from '../../Theme/Colors';
import CustomHeader from '../../component/header/CustomHeader';
import { Fonts } from '../../Theme/Fonts';
import { scale } from '../../utils/Scaling';

export default function PrivacyPolicy({navigation}) {
  return (
    <Container
      statusBarStyle={'dark-content'}
      statusBarBackgroundColor={COLORS.white}
      backgroundColor={COLORS.white}>
      <CustomHeader title="Privacy Policy" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
       

        <Text style={styles.subHeading}>Introduction</Text>
        <Text style={styles.text}>
          Welcome to the Pathology App. Your privacy is very important to us.
          This privacy policy explains how we collect, use, and protect your
          personal information when you use our services to book lab tests
          online.
        </Text>

        <Text style={styles.subHeading}>Information Collection</Text>
        <Text style={styles.text}>
          We collect the following types of information:
          {'\n'}1. Personal Information: Name, contact details, email, and other
          details you provide during account creation.
          {'\n'}2. Health Data: Information related to the health tests you
          book, including lab test results and medical history.
          {'\n'}3. Device Information: Information such as your device’s
          operating system, app version, and usage statistics.
        </Text>

        <Text style={styles.subHeading}>How We Use Your Information</Text>
        <Text style={styles.text}>
          Your information is used to provide the following services:
          {'\n'}1. Process and schedule your lab tests and medical services.
          {'\n'}2. Contact you with important information related to your health
          tests and app usage.
          {'\n'}3. Improve and personalize the app experience.
          {'\n'}4. Comply with legal requirements and ensure the security of
          your data.
        </Text>

        <Text style={styles.subHeading}>Data Protection</Text>
        <Text style={styles.text}>
          We take the security of your personal and health information
          seriously. We implement industry-standard security measures to protect
          your data from unauthorized access, alteration, or disclosure.
        </Text>

        <Text style={styles.subHeading}>Third-Party Services</Text>
        <Text style={styles.text}>
          We do not share your personal or health information with third-party
          services unless necessary for the operation of the app, such as with
          lab providers for processing your tests.
        </Text>

        <Text style={styles.subHeading}>Your Rights</Text>
        <Text style={styles.text}>
          You have the right to:
          {'\n'}1. Access the information we hold about you.
          {'\n'}2. Correct any inaccuracies in your personal data.
          {'\n'}3. Request the deletion of your account and personal data,
          subject to legal obligations.
        </Text>

        <Text style={styles.subHeading}>Changes to This Privacy Policy</Text>
        <Text style={styles.text}>
          We may update our Privacy Policy from time to time. Any changes will
          be posted here, and the updated version will be effective immediately
          upon publication.
        </Text>

        <Text style={styles.subHeading}>Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at:
          {'\n'}Email: support@pathologyapp.com
          {'\n'}Phone: +123 456 7890
        </Text>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
  },
  heading: {
    fontSize: 18,
    fontFamily:Fonts.Bold,
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 18,
    fontFamily:Fonts.Light,
    color: COLORS.black,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal:scale(15)
  },
  text: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 22,
    fontFamily:Fonts.Regular,
    textAlign:"justify",
    marginHorizontal:scale(15)

  },
});
