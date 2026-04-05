import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    nav: { brand: 'Railway Booking', home: 'Search Trains', myTickets: 'My Tickets', admin: 'Admin', login: 'Login', logout: 'Logout' },
    search: {
      heroTitle: 'Book Your Journey', heroSubtitle: 'Fast, secure, and comfortable train travel starts here.',
      from: 'From', fromPlaceholder: 'Origin City', to: 'To', toPlaceholder: 'Destination City', date: 'Date',
      searchBtn: 'Search Trains', searchingBtn: 'Searching...', recommendedTitle: 'Recommended For You', bookAiPick: 'Book AI Pick',
      availableTrains: 'Available Trains', seatsAvailable: 'Seats Available', bookNow: 'Book Now', soldOut: 'Sold Out',
      noTrains: 'No trains found for this route or date.', noFilters: 'No trains match your filters. Try increasing price or duration limit.',
      filters: { maxPrice: 'Max Price', maxDuration: 'Max Duration', departure: 'Departure', trainClass: 'Train Class', all: 'All', morning: 'Morning (AM)', evening: 'Evening (PM)', superfast: 'Superfast', express: 'Express' }
    }
  },
  hi: {
    nav: { brand: 'रेलवे बुकिंग', home: 'ट्रेन खोजें', myTickets: 'मेरे टिकट', admin: 'एडमिन', login: 'लॉग इन करें', logout: 'लॉग आउट' },
    search: {
      heroTitle: 'अपनी यात्रा बुक करें', heroSubtitle: 'तेज, सुरक्षित और आरामदायक ट्रेन यात्रा यहां से शुरू होती है।',
      from: 'कहाँ से', fromPlaceholder: 'प्रस्थान शहर', to: 'कहाँ तक', toPlaceholder: 'गंतव्य शहर', date: 'तारीख',
      searchBtn: 'ट्रेन खोजें', searchingBtn: 'खोजा जा रहा है...', recommendedTitle: 'आपके लिए अनुशंसित', bookAiPick: 'एआई पिक बुक करें',
      availableTrains: 'उपलब्ध ट्रेनें', seatsAvailable: 'सीटें उपलब्ध हैं', bookNow: 'अभी बुक करें', soldOut: 'बिक गया',
      noTrains: 'इस मार्ग या तिथि के लिए कोई ट्रेन नहीं मिली।', noFilters: 'आपके फ़िल्टर से कोई ट्रेन मेल नहीं खाती। सीमाएँ बढ़ाएँ।',
      filters: { maxPrice: 'अधिकतम मूल्य', maxDuration: 'अधिकतम अवधि', departure: 'प्रस्थान', trainClass: 'ट्रेन श्रेणी', all: 'सभी', morning: 'सुबह (AM)', evening: 'शाम (PM)', superfast: 'सुपरफास्ट', express: 'एक्सप्रेस' }
    }
  },
  ta: {
    nav: { brand: 'ரயில் முன்பதிவு', home: 'ரயில்களை தேடு', myTickets: 'என் போக்குவரத்து', admin: 'நிர்வாகி', login: 'உள்நுழை', logout: 'வெளியேறு' },
    search: {
      heroTitle: 'பயணத்தை பதிவு செய்', heroSubtitle: 'விரைவான, பாதுகாப்பான ரயில் பயணம் இங்கே தொடங்குகிறது.',
      from: 'இருந்து', fromPlaceholder: 'புறப்படும் நகரம்', to: 'வரை', toPlaceholder: 'சேரும் நகரம்', date: 'தேதி',
      searchBtn: 'ரயில்களை தேடு', searchingBtn: 'தேடுகிறது...', recommendedTitle: 'உங்களுக்காக பரிந்துரைக்கப்பட்டது', bookAiPick: 'AI தேர்வை பதிவு செய்',
      availableTrains: 'உள்ள ரயில்கள்', seatsAvailable: 'இருக்கைகள் உள்ளன', bookNow: 'பதிவு செய்', soldOut: 'விற்றுத்தீர்ந்தது',
      noTrains: 'ரயில்கள் கிடைக்கவில்லை.', noFilters: 'வடிகட்டிகளுக்கு ரயில்கள் இல்லை.',
      filters: { maxPrice: 'அதிகபட்ச விலை', maxDuration: 'அதிகபட்ச நேரம்', departure: 'புறப்பாடு', trainClass: 'ரயில் வகுப்பு', all: 'அனைத்து', morning: 'காலை(AM)', evening: 'மாலை(PM)', superfast: 'சூப்பர்பாஸ்ட்', express: 'எக்ஸ்பிரஸ்' }
    }
  },
  ml: {
    nav: { brand: 'റെയിൽ ബുക്കിംഗ്', home: 'ട്രെയിനുകൾ തിരയുക', myTickets: 'എന്റെ ടിക്കറ്റുകൾ', admin: 'അഡ്മിൻ', login: 'ലോഗിൻ', logout: 'ലോഗൗട്ട്' },
    search: {
      heroTitle: 'യാത്ര ബുക്ക് ചെയ്യുക', heroSubtitle: 'വേഗവും സുരക്ഷിതവുമായ യാത്ര ഇവിടെ ആരംഭിക്കുന്നു.',
      from: 'നിന്ന്', fromPlaceholder: 'പുറപ്പെടുന്ന നഗരം', to: 'വരെ', toPlaceholder: 'എത്തിച്ചേരുന്ന നഗരം', date: 'തീയതി',
      searchBtn: 'ട്രെയിനുകൾ തിരയുക', searchingBtn: 'തിരയുന്നു...', recommendedTitle: 'നിങ്ങൾക്കായി ശുപാർശ ചെയ്യുന്നത്', bookAiPick: 'AI ചോയ്സ് ബുക്ക് ചെയ്യുക',
      availableTrains: 'ലഭ്യമായ ട്രെയിനുകൾ', seatsAvailable: 'സീറ്റുകൾ ലഭ്യമാണ്', bookNow: 'ബുക്ക് ചെയ്യുക', soldOut: 'തീർന്നുപോയി',
      noTrains: 'ട്രെയിനുകളൊന്നും കണ്ടെത്തിയില്ല.', noFilters: 'ഫിൽട്ടറുകൾ പൊരുത്തപ്പെടുന്നില്ല.',
      filters: { maxPrice: 'പരമാവധി വില', maxDuration: 'പരമാവധി സമയം', departure: 'പുറപ്പെടൽ', trainClass: 'ട്രെയിൻ ക്ലാസ്', all: 'എല്ലാം', morning: 'രാവിലെ(AM)', evening: 'വൈകുന്നേരം(PM)', superfast: 'സൂപ്പർഫാസ്റ്റ്', express: 'എക്സ്പ്രസ്സ്' }
    }
  },
  te: {
    nav: { brand: 'రైలు బుకింగ్', home: 'రైళ్లను వెతకండి', myTickets: 'నా టిక్కెట్లు', admin: 'అడ్మిన్', login: 'లాగిన్', logout: 'లాగ్అవుట్' },
    search: {
      heroTitle: 'ప్రయాణాన్ని బుక్ చేయండి', heroSubtitle: 'వేగవంతమైన, సురక్షితమైన రైలు ప్రయాణం లాంటివి ఇక్కడ మొదలవుతాయి.',
      from: 'నుండి', fromPlaceholder: 'బయలుదేరు నగరం', to: 'వరకు', toPlaceholder: 'చేరుకునే నగరం', date: 'తేదీ',
      searchBtn: 'రైళ్లను వెతకండి', searchingBtn: 'వెతుకుతోంది...', recommendedTitle: 'మీ కోసం సిఫార్సు చేయబడినవి', bookAiPick: 'AI ఎంపికను బుక్ చేయండి',
      availableTrains: 'అందుబాటులో ఉన్న రైళ్లు', seatsAvailable: 'సీట్లు అందుబాటులో ఉన్నాయి', bookNow: 'బుక్ చేయండి', soldOut: 'అమ్ముడయ్యాయి',
      noTrains: 'రైళ్లు కనుగొనబడలేదు.', noFilters: 'ఫిల్టర్‌లకు రైళ్లు లేవు.',
      filters: { maxPrice: 'గరిష్ట ధర', maxDuration: 'గరిష్ట సమయం', departure: 'బయలుదేరు', trainClass: 'రైలు తరగతి', all: 'అన్నీ', morning: 'ఉదయం(AM)', evening: 'సాయంత్రం(PM)', superfast: 'సూపర్‌ఫాస్ట్', express: 'ఎక్స్‌ప్రెస్' }
    }
  }
};

const i18n = createI18n({
  locale: 'en', 
  fallbackLocale: 'en',
  messages
});

export default i18n;
