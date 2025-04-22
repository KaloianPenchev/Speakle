import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../services';

const voiceOptions = [
  { id: 0, name: 'Alloy (Balanced)', description: 'An all-purpose voice with a neutral tone' },
  { id: 1, name: 'Echo (Warm)', description: 'A voice with a warm and resonant quality' },
  { id: 2, name: 'Fable (Expressive)', description: 'A dynamic voice with a wide range of expression' },
  { id: 3, name: 'Onyx (Deep)', description: 'A voice with depth and rich tones' },
  { id: 4, name: 'Nova (Cheerful)', description: 'An upbeat and positive sounding voice' },
  { id: 5, name: 'Shimmer (Clear)', description: 'A crisp and clear voice with excellent diction' }
];

// Comprehensive list of languages supported by Whisper
const languageOptions = [
  { code: 'af', name: 'Afrikaans', description: 'Afrikaans language support' },
  { code: 'am', name: 'Amharic', description: 'Amharic (አማርኛ) language support' },
  { code: 'ar', name: 'Arabic', description: 'Arabic (العربية) language support' },
  { code: 'as', name: 'Assamese', description: 'Assamese (অসমীয়া) language support' },
  { code: 'az', name: 'Azerbaijani', description: 'Azerbaijani (Azərbaycan) language support' },
  { code: 'ba', name: 'Bashkir', description: 'Bashkir (Башҡорт) language support' },
  { code: 'be', name: 'Belarusian', description: 'Belarusian (Беларуская) language support' },
  { code: 'bg', name: 'Bulgarian', description: 'Bulgarian (Български) language support' },
  { code: 'bn', name: 'Bengali', description: 'Bengali (বাংলা) language support' },
  { code: 'bo', name: 'Tibetan', description: 'Tibetan (བོད་སྐད་) language support' },
  { code: 'bs', name: 'Bosnian', description: 'Bosnian (Bosanski) language support' },
  { code: 'ca', name: 'Catalan', description: 'Catalan (Català) language support' },
  { code: 'cs', name: 'Czech', description: 'Czech (Čeština) language support' },
  { code: 'cy', name: 'Welsh', description: 'Welsh (Cymraeg) language support' },
  { code: 'da', name: 'Danish', description: 'Danish (Dansk) language support' },
  { code: 'de', name: 'German', description: 'German (Deutsch) language support' },
  { code: 'el', name: 'Greek', description: 'Greek (Ελληνικά) language support' },
  { code: 'en', name: 'English', description: 'English language support' },
  { code: 'es', name: 'Spanish', description: 'Spanish (Español) language support' },
  { code: 'et', name: 'Estonian', description: 'Estonian (Eesti) language support' },
  { code: 'eu', name: 'Basque', description: 'Basque (Euskara) language support' },
  { code: 'fa', name: 'Persian', description: 'Persian (فارسی) language support' },
  { code: 'fi', name: 'Finnish', description: 'Finnish (Suomi) language support' },
  { code: 'fil', name: 'Filipino', description: 'Filipino language support' },
  { code: 'fr', name: 'French', description: 'French (Français) language support' },
  { code: 'ga', name: 'Irish', description: 'Irish (Gaeilge) language support' },
  { code: 'gl', name: 'Galician', description: 'Galician (Galego) language support' },
  { code: 'gu', name: 'Gujarati', description: 'Gujarati (ગુજરાતી) language support' },
  { code: 'ha', name: 'Hausa', description: 'Hausa (هَوُسَ) language support' },
  { code: 'he', name: 'Hebrew', description: 'Hebrew (עברית) language support' },
  { code: 'hi', name: 'Hindi', description: 'Hindi (हिन्दी) language support' },
  { code: 'hr', name: 'Croatian', description: 'Croatian (Hrvatski) language support' },
  { code: 'ht', name: 'Haitian Creole', description: 'Haitian Creole (Kreyòl ayisyen) language support' },
  { code: 'hu', name: 'Hungarian', description: 'Hungarian (Magyar) language support' },
  { code: 'hy', name: 'Armenian', description: 'Armenian (Հայերեն) language support' },
  { code: 'id', name: 'Indonesian', description: 'Indonesian (Bahasa Indonesia) language support' },
  { code: 'is', name: 'Icelandic', description: 'Icelandic (Íslenska) language support' },
  { code: 'it', name: 'Italian', description: 'Italian (Italiano) language support' },
  { code: 'ja', name: 'Japanese', description: 'Japanese (日本語) language support' },
  { code: 'jw', name: 'Javanese', description: 'Javanese (Basa Jawa) language support' },
  { code: 'ka', name: 'Georgian', description: 'Georgian (ქართული) language support' },
  { code: 'kk', name: 'Kazakh', description: 'Kazakh (Қазақ) language support' },
  { code: 'km', name: 'Khmer', description: 'Khmer (ខ្មែរ) language support' },
  { code: 'kn', name: 'Kannada', description: 'Kannada (ಕನ್ನಡ) language support' },
  { code: 'ko', name: 'Korean', description: 'Korean (한국어) language support' },
  { code: 'la', name: 'Latin', description: 'Latin language support' },
  { code: 'lb', name: 'Luxembourgish', description: 'Luxembourgish (Lëtzebuergesch) language support' },
  { code: 'lo', name: 'Lao', description: 'Lao (ລາວ) language support' },
  { code: 'lt', name: 'Lithuanian', description: 'Lithuanian (Lietuvių) language support' },
  { code: 'lv', name: 'Latvian', description: 'Latvian (Latviešu) language support' },
  { code: 'mg', name: 'Malagasy', description: 'Malagasy language support' },
  { code: 'mi', name: 'Maori', description: 'Maori (Te Reo Māori) language support' },
  { code: 'mk', name: 'Macedonian', description: 'Macedonian (Македонски) language support' },
  { code: 'ml', name: 'Malayalam', description: 'Malayalam (മലയാളം) language support' },
  { code: 'mn', name: 'Mongolian', description: 'Mongolian (Монгол) language support' },
  { code: 'mr', name: 'Marathi', description: 'Marathi (मराठी) language support' },
  { code: 'ms', name: 'Malay', description: 'Malay (Bahasa Melayu) language support' },
  { code: 'mt', name: 'Maltese', description: 'Maltese (Malti) language support' },
  { code: 'my', name: 'Burmese', description: 'Burmese (မြန်မာဘာသာ) language support' },
  { code: 'ne', name: 'Nepali', description: 'Nepali (नेपाली) language support' },
  { code: 'nl', name: 'Dutch', description: 'Dutch (Nederlands) language support' },
  { code: 'no', name: 'Norwegian', description: 'Norwegian (Norsk) language support' },
  { code: 'pa', name: 'Punjabi', description: 'Punjabi (ਪੰਜਾਬੀ) language support' },
  { code: 'pl', name: 'Polish', description: 'Polish (Polski) language support' },
  { code: 'ps', name: 'Pashto', description: 'Pashto (پښتو) language support' },
  { code: 'pt', name: 'Portuguese', description: 'Portuguese (Português) language support' },
  { code: 'ro', name: 'Romanian', description: 'Romanian (Română) language support' },
  { code: 'ru', name: 'Russian', description: 'Russian (Русский) language support' },
  { code: 'sd', name: 'Sindhi', description: 'Sindhi (سنڌي) language support' },
  { code: 'si', name: 'Sinhala', description: 'Sinhala (සිංහල) language support' },
  { code: 'sk', name: 'Slovak', description: 'Slovak (Slovenčina) language support' },
  { code: 'sl', name: 'Slovenian', description: 'Slovenian (Slovenščina) language support' },
  { code: 'sn', name: 'Shona', description: 'Shona (ChiShona) language support' },
  { code: 'so', name: 'Somali', description: 'Somali (Soomaali) language support' },
  { code: 'sq', name: 'Albanian', description: 'Albanian (Shqip) language support' },
  { code: 'sr', name: 'Serbian', description: 'Serbian (Српски) language support' },
  { code: 'su', name: 'Sundanese', description: 'Sundanese (Basa Sunda) language support' },
  { code: 'sv', name: 'Swedish', description: 'Swedish (Svenska) language support' },
  { code: 'sw', name: 'Swahili', description: 'Swahili (Kiswahili) language support' },
  { code: 'ta', name: 'Tamil', description: 'Tamil (தமிழ்) language support' },
  { code: 'te', name: 'Telugu', description: 'Telugu (తెలుగు) language support' },
  { code: 'tg', name: 'Tajik', description: 'Tajik (Тоҷикӣ) language support' },
  { code: 'th', name: 'Thai', description: 'Thai (ไทย) language support' },
  { code: 'tl', name: 'Tagalog', description: 'Tagalog language support' },
  { code: 'tr', name: 'Turkish', description: 'Turkish (Türkçe) language support' },
  { code: 'tt', name: 'Tatar', description: 'Tatar (Татар) language support' },
  { code: 'uk', name: 'Ukrainian', description: 'Ukrainian (Українська) language support' },
  { code: 'ur', name: 'Urdu', description: 'Urdu (اردو) language support' },
  { code: 'uz', name: 'Uzbek', description: 'Uzbek (O\'zbek) language support' },
  { code: 'vi', name: 'Vietnamese', description: 'Vietnamese (Tiếng Việt) language support' },
  { code: 'yi', name: 'Yiddish', description: 'Yiddish (ייִדיש) language support' },
  { code: 'yo', name: 'Yoruba', description: 'Yoruba (Èdè Yorùbá) language support' },
  { code: 'zh', name: 'Chinese', description: 'Chinese (中文) language support' },
  { code: 'zu', name: 'Zulu', description: 'Zulu (isiZulu) language support' }
];

const MyVoiceScreen = () => {
  const navigation = useNavigation();
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profile = await profileService.getProfile();
        if (profile && profile.voice !== undefined) {
          setSelectedVoice(profile.voice);
        }
        if (profile && profile.language !== undefined) {
          setSelectedLanguage(profile.language);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load voice settings');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveVoice = async () => {
    try {
      setSaving(true);
      
      // Save voice preference
      await profileService.updateVoice(selectedVoice);
      
      // Save language preference
      await profileService.updateLanguage(selectedLanguage);
      
      Alert.alert('Success', 'Voice and language preferences updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to save preferences');
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
          </View>
        ) : (
          <>
            <View style={styles.voiceSection}>
              <Text style={styles.sectionTitle}>Select Voice</Text>
              <Text style={styles.sectionDescription}>
                Choose the voice that will be used for text-to-speech functionality in the app.
              </Text>
              
              <View style={styles.voiceCardContainer}>
                <View style={styles.voiceCard}>
                  <Ionicons 
                    name="volume-high-outline" 
                    size={24} 
                    color="#4285F4" 
                    style={styles.voiceIcon}
                  />
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedVoice}
                      onValueChange={(itemValue) => setSelectedVoice(itemValue)}
                      style={styles.picker}
                    >
                      {voiceOptions.map((voice) => (
                        <Picker.Item
                          key={voice.id}
                          label={voice.name}
                          value={voice.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
              
              {selectedVoice !== null && (
                <View style={styles.selectedVoiceInfo}>
                  <Text style={styles.selectedVoiceTitle}>
                    {voiceOptions.find(v => v.id === selectedVoice)?.name || 'Voice'}
                  </Text>
                  <Text style={styles.selectedVoiceDescription}>
                    {voiceOptions.find(v => v.id === selectedVoice)?.description || ''}
                  </Text>
                </View>
              )}
              
              <Text style={[styles.sectionTitle, {marginTop: 24}]}>Select Language</Text>
              <Text style={styles.sectionDescription}>
                Choose the language that will be used for both speech recognition and text-to-speech.
              </Text>
              
              <View style={styles.voiceCardContainer}>
                <View style={styles.voiceCard}>
                  <Ionicons 
                    name="language-outline" 
                    size={24} 
                    color="#4285F4" 
                    style={styles.voiceIcon}
                  />
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedLanguage}
                      onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                      style={styles.picker}
                    >
                      {languageOptions.map((language) => (
                        <Picker.Item
                          key={language.code}
                          label={language.name}
                          value={language.code}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
              
              {selectedLanguage !== null && (
                <View style={styles.selectedVoiceInfo}>
                  <Text style={styles.selectedVoiceTitle}>
                    {languageOptions.find(l => l.code === selectedLanguage)?.name || 'Language'}
                  </Text>
                  <Text style={styles.selectedVoiceDescription}>
                    {languageOptions.find(l => l.code === selectedLanguage)?.description || ''}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveVoice}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Preferences</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
  },
  voiceCardContainer: {
    marginBottom: 24,
  },
  voiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceIcon: {
    marginRight: 16,
  },
  pickerContainer: {
    flex: 1,
    height: 50,
  },
  picker: {
    flex: 1,
  },
  selectedVoiceInfo: {
    backgroundColor: 'rgba(66, 133, 244, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  selectedVoiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285F4',
    marginBottom: 8,
  },
  selectedVoiceDescription: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyVoiceScreen; 