import LocalizedStrings from 'react-native-localization';

const strings = new LocalizedStrings({
  en: {
    welcome: 'Welcome',
    Login: 'Login',
    Email: 'Email',
    EnterYourEmail: 'Enter your email',
    Password: 'Password',
    EnterYourPassword: 'Enter your password',
    EmailRequired: 'Email is required',
    MobileRequired: 'Mobile number is required',
    MobileInvalid: 'Mobile number must be 10 digits',
    AddressRequired: 'Address is required',
    InvalidEmail: 'Invalid email format',
    NameRequired: 'Name is required',
    PasswordRequired: 'Password is required',
    Signup: 'Signup',
    Name: 'Name',
    EnterYourName: 'Enter your name',
    Mobile: 'Mobile',
    EnterYourMobile: 'Enter your mobile No',
    Address: 'Address',
    EnterYourAddress: 'Enter your address',
    DontHaveAccount: "Don't have an account?",
    AlreadyHaveAccount: 'Already have an account?',
    OnlineDoctorConsultations: 'Online Doctor Consultations',
    SmartCard: 'Smart Card',
    LabTestsAndScans: 'Lab Tests & Scans',
    Reports: 'Reports',
    Submit: 'Submit',
    OrderMedicines: 'Order Medicines',
    ChangeLanguage: 'Change Language',
    ChoosePreferredLanguage: 'Choose your Preferred Language',
    MyAppointment: 'My Appointment',
    OrderHistory: 'Order History',
    PasswordManager: 'Password Manager',
    CurrentPassword: 'Current Password',
    EnterCurrentPassword: 'Enter your current password',
    CurrentPasswordRequired: 'Current Password is required',
    NewPassword: 'New Password',
    EnterNewPassword: 'Enter new password',
    NewPasswordRequired: 'New Password is required',
    ConfirmNewPassword: 'Confirm New Password',
    EnterConfirmNewPassword: 'Confirm your new password',
    PasswordsDoNotMatch: 'Passwords do not match',
    ForgotPassword: 'Forgot Password',
    HelpCenter: 'Help Center',
    CallHistory: 'Call History',
    PrivacyPolicy: 'Privacy Policy',
    Logout: 'Logout',
    Home: 'Home',
    Cart: 'Cart',
    Wallet: 'Wallet',
    Profile: 'Profile',
    BookLabTests: 'Book Lab Tests with Safe and Trusted Diagnostic Centres',
    SamplePickupInfo:
      'Home sample pickup and Hospital / Diagnostic Centres visit available',

    FrequentlyAskedQuestions: 'Frequently Asked Questions',

    FAQ1Question: 'Can I purchase medicines directly through the app?',
    FAQ1Answer:
      'Yes, you can. Just go to the ‘Medicine’ section, search for the required medicines, add them to your cart, and proceed with online payment. The medicines will be delivered to your doorstep.',

    FAQ2Question: 'How do I book a doctor’s appointment?',
    FAQ2Answer:
      'You can go to the "Doctor Consultation" section, choose your doctor and preferred time slot, and confirm your appointment.',

    FAQ3Question: 'Can I consult a doctor online through the app?',
    FAQ3Answer:
      'Yes, we offer video and chat consultations with certified doctors. You can choose your preferred time and connect with a doctor without leaving your home.',

    FAQ4Question: 'How can I upload my prescription?',
    FAQ4Answer:
      'While ordering medicines, you’ll see an option to ‘Upload Prescription’. You can either upload an image from your gallery or take a photo using your phone’s camera.',

    FAQ5Question: 'Are there discounts on medicines?',
    FAQ5Answer:
      'Yes, we offer special discounts and offers regularly. New users can avail welcome discounts, and returning users benefit from loyalty programs and coupon codes.',

    FAQ6Question:
      'What if I want to cancel or reschedule my doctor appointment?',
    FAQ6Answer:
      'You can go to the ‘My Appointments’ section and choose to either reschedule or cancel your appointment. If canceled within the allowed time, a full or partial refund will be processed.',

    FAQ7Question: 'Is my personal and medical data secure?',
    FAQ7Answer:
      'Absolutely. We use industry-standard encryption to ensure that your medical history, prescriptions, and personal information are stored securely. Your privacy and safety are our top priorities.',

    FAQ8Question: 'Can I order medicines without a prescription?',
    FAQ8Answer:
      'Some general wellness and over-the-counter products do not require a prescription. However, for prescription-based drugs, a valid prescription is mandatory as per government regulations.',

    FAQ9Question: 'What payment methods are supported?',
    FAQ9Answer:
      'We support credit/debit cards, UPI, net banking, and wallet payments like Paytm, Google Pay, etc., for your convenience.',

    FAQ10Question: 'Do you offer home sample collection for lab tests?',
    FAQ10Answer:
      'Yes, you can book diagnostic tests via the app and choose home sample collection at your preferred time. Reports will be shared digitally through the app.',
  },
  hi: {
    welcome: 'स्वागत है',
    Login: 'लॉगिन',
    Email: 'ईमेल',
    EnterYourEmail: 'अपना ईमेल दर्ज करें',
    Password: 'पासवर्ड',
    EnterYourPassword: 'अपना पासवर्ड दर्ज करें',
    EmailRequired: 'ईमेल आवश्यक है',
    MobileRequired: 'मोबाइल नंबर आवश्यक है',
    MobileInvalid: 'मोबाइल नंबर 10 अंकों का होना चाहिए',
    AddressRequired: 'पता आवश्यक है',
    InvalidEmail: 'अमान्य ईमेल प्रारूप',
    PasswordRequired: 'पासवर्ड आवश्यक है',
    NameRequired: 'नाम आवश्यक है',
    Signup: 'साइन अप करें',
    Name: 'नाम',
    EnterYourName: 'अपना नाम दर्ज करें',
    Mobile: 'मोबाइल',
    EnterYourMobile: 'अपना मोबाइल नंबर दर्ज करें',
    Address: 'पता',
    EnterYourAddress: 'अपना पता दर्ज करें',
    DontHaveAccount: 'क्या आपके पास खाता नहीं है?',
    AlreadyHaveAccount: 'क्या आपके पास पहले से खाता है?',
    OnlineDoctorConsultations: 'ऑनलाइन डॉक्टर परामर्श',
    SmartCard: 'स्मार्ट कार्ड',
    LabTestsAndScans: 'लैब जांच और स्कैन',
    Reports: 'रिपोर्ट्स',
    Submit: 'सबमिट करें',
    OrderMedicines: 'दवाएं ऑर्डर करें',
    ChangeLanguage: 'भाषा बदलें',
    ChoosePreferredLanguage: 'अपनी पसंदीदा भाषा चुनें',
    MyAppointment: 'मेरी अपॉइंटमेंट',
    OrderHistory: 'ऑर्डर इतिहास',
    PasswordManager: 'पासवर्ड मैनेजर',
    CurrentPassword: 'वर्तमान पासवर्ड',
    EnterCurrentPassword: 'अपना वर्तमान पासवर्ड दर्ज करें',
    CurrentPasswordRequired: 'वर्तमान पासवर्ड आवश्यक है',
    NewPassword: 'नया पासवर्ड',
    EnterNewPassword: 'नया पासवर्ड दर्ज करें',
    NewPasswordRequired: 'नया पासवर्ड आवश्यक है',
    ConfirmNewPassword: 'नए पासवर्ड की पुष्टि करें',
    EnterConfirmNewPassword: 'अपने नए पासवर्ड की पुष्टि करें',
    PasswordsDoNotMatch: 'पासवर्ड मेल नहीं खाते',
    ForgotPassword: 'पासवर्ड भूल गए?',

    HelpCenter: 'हेल्प सेंटर',
    CallHistory: 'कॉल हिस्ट्री',
    PrivacyPolicy: 'गोपनीयता नीति',
    Logout: 'लॉगआउट',
    Home: 'होम',
    Cart: 'कार्ट',
    Wallet: 'वॉलेट',
    Profile: 'प्रोफ़ाइल',
    BookLabTests:
      'सुरक्षित और विश्वसनीय डायग्नोस्टिक सेंटर्स के साथ लैब टेस्ट बुक करें',
    SamplePickupInfo:
      'होम सैंपल पिकअप और अस्पताल/डायग्नोस्टिक सेंटर विजिट उपलब्ध हैं',

    FrequentlyAskedQuestions: 'अक्सर पूछे जाने वाले प्रश्न',

    FAQ1Question: 'क्या मैं सीधे ऐप के माध्यम से दवाएं खरीद सकता हूँ?',
    FAQ1Answer:
      'हाँ, आप खरीद सकते हैं। "Medicine" सेक्शन में जाएं, अपनी ज़रूरत की दवाएं खोजें, उन्हें कार्ट में जोड़ें और ऑनलाइन पेमेंट करें। दवाएं आपके दरवाज़े तक पहुंचा दी जाएंगी।',

    FAQ2Question: 'मैं डॉक्टर की अपॉइंटमेंट कैसे बुक करूं?',
    FAQ2Answer:
      'आप "Doctor Consultation" सेक्शन में जाकर डॉक्टर और समय चुन सकते हैं और अपॉइंटमेंट कन्फर्म कर सकते हैं।',

    FAQ3Question: 'क्या मैं ऐप के जरिए डॉक्टर से ऑनलाइन सलाह ले सकता हूँ?',
    FAQ3Answer:
      'हाँ, हम प्रमाणित डॉक्टरों के साथ वीडियो और चैट परामर्श प्रदान करते हैं। आप अपनी सुविधा अनुसार समय चुन सकते हैं और घर बैठे डॉक्टर से जुड़ सकते हैं।',

    FAQ4Question: 'मैं अपना प्रिस्क्रिप्शन कैसे अपलोड करूं?',
    FAQ4Answer:
      'दवाएं ऑर्डर करते समय आपको "Upload Prescription" का विकल्प मिलेगा। आप गैलरी से इमेज चुन सकते हैं या कैमरे से फोटो लेकर अपलोड कर सकते हैं।',

    FAQ5Question: 'क्या दवाओं पर छूट मिलती है?',
    FAQ5Answer:
      'हाँ, हम नियमित रूप से विशेष छूट और ऑफर्स देते हैं। नए यूज़र्स को वेलकम डिस्काउंट और पुराने यूज़र्स को लॉयल्टी प्रोग्राम्स और कूपन कोड मिलते हैं।',

    FAQ6Question:
      'अगर मैं डॉक्टर की अपॉइंटमेंट कैंसिल या रिस्केड्यूल करना चाहूं तो क्या करूं?',
    FAQ6Answer:
      '"My Appointments" सेक्शन में जाएं और वहां से अपॉइंटमेंट को रिस्केड्यूल या कैंसिल करें। अगर समय के अंदर कैंसिल किया जाए तो पूरा या आंशिक रिफंड दिया जाएगा।',

    FAQ7Question: 'क्या मेरी व्यक्तिगत और मेडिकल जानकारी सुरक्षित है?',
    FAQ7Answer:
      'बिल्कुल। हम इंडस्ट्री स्टैंडर्ड एन्क्रिप्शन का उपयोग करते हैं ताकि आपकी मेडिकल हिस्ट्री, प्रिस्क्रिप्शन और व्यक्तिगत जानकारी सुरक्षित रहे। आपकी प्राइवेसी हमारी प्राथमिकता है।',

    FAQ8Question: 'क्या मैं बिना प्रिस्क्रिप्शन के दवाएं ऑर्डर कर सकता हूँ?',
    FAQ8Answer:
      'कुछ सामान्य वेलनेस और ओवर-द-काउंटर प्रोडक्ट्स के लिए प्रिस्क्रिप्शन की जरूरत नहीं होती। लेकिन प्रिस्क्रिप्शन आधारित दवाओं के लिए मान्य प्रिस्क्रिप्शन आवश्यक होता है।',

    FAQ9Question: 'कौन-कौन से पेमेंट विकल्प उपलब्ध हैं?',
    FAQ9Answer:
      'हम क्रेडिट/डेबिट कार्ड, UPI, नेट बैंकिंग और वॉलेट पेमेंट (जैसे Paytm, Google Pay आदि) को सपोर्ट करते हैं।',

    FAQ10Question: 'क्या लैब टेस्ट के लिए होम सैंपल कलेक्शन की सुविधा है?',
    FAQ10Answer:
      'हाँ, आप ऐप से डायग्नोस्टिक टेस्ट बुक कर सकते हैं और सुविधाजनक समय पर होम सैंपल कलेक्शन चुन सकते हैं। रिपोर्ट्स ऐप के जरिए डिजिटल रूप में मिल जाएंगी।',
  },
});

export default strings;
