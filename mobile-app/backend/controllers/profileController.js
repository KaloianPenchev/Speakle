const supabase = require('../config/supabase');
const supabaseAdmin = require('../utils/supabaseAdmin');

const ensureProfileExists = async (userId) => {
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Error checking profile: ${error.message}`);
  }
  
  
  if (!data || data.length === 0) {
    console.log(`No profile found for user ${userId}, creating one...`);
    
    
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          user_id: userId,
          username: `user_${userId.substring(0, 8)}`,
          voice: 0,
          language: 'en',
          created_at: new Date()
        }
      ]);
      
    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }
    
    
    const { data: newProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId);
      
    if (fetchError || !newProfile || newProfile.length === 0) {
      throw new Error('Profile was created but could not be retrieved');
    }
    
    return newProfile[0];
  }
  
  
  return data[0];
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      
      const profile = await ensureProfileExists(userId);
      res.status(200).json(profile);
    } catch (profileError) {
      console.error('Error ensuring profile exists:', profileError);
      return res.status(400).json({ message: profileError.message });
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    
    try {
      await ensureProfileExists(userId);
    } catch (profileError) {
      console.error('Error ensuring profile exists:', profileError);
      return res.status(400).json({ message: profileError.message });
    }
    
    const { username, voice, language } = req.body;
    
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (voice !== undefined) updates.voice = voice;
    if (language !== undefined) updates.language = language;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Profile update failed' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateVoice = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Ensure profile exists first
    try {
      await ensureProfileExists(userId);
    } catch (profileError) {
      console.error('Error ensuring profile exists:', profileError);
      return res.status(400).json({ message: profileError.message });
    }
    
    const { voice } = req.body;
    
    if (voice === undefined) {
      return res.status(400).json({ message: 'Voice parameter is required' });
    }
    
    const voiceValue = parseInt(voice, 10);
    if (isNaN(voiceValue)) {
      return res.status(400).json({ message: 'Voice must be a number' });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ voice: voiceValue })
      .eq('user_id', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Profile not found or update failed' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating voice preference:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLanguage = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Ensure profile exists first
    try {
      await ensureProfileExists(userId);
    } catch (profileError) {
      console.error('Error ensuring profile exists:', profileError);
      return res.status(400).json({ message: profileError.message });
    }
    
    const { language } = req.body;
    
    if (language === undefined) {
      return res.status(400).json({ message: 'Language parameter is required' });
    }
    
    
    const validLanguages = [
      'af', 'am', 'ar', 'as', 'az', 'ba', 'be', 'bg', 'bn', 'bo', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 
      'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fil', 'fr', 'ga', 'gl', 'gu', 'ha', 'he', 'hi', 'hr', 
      'ht', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'jw', 'ka', 'kk', 'km', 'kn', 'ko', 'la', 'lb', 'lo', 
      'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'no', 'pa', 'pl', 
      'ps', 'pt', 'ro', 'ru', 'sd', 'si', 'sk', 'sl', 'sn', 'so', 'sq', 'sr', 'su', 'sv', 'sw', 'ta', 
      'te', 'tg', 'th', 'tl', 'tr', 'tt', 'uk', 'ur', 'uz', 'vi', 'yi', 'yo', 'zh', 'zu'
    ];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ message: 'Invalid language code' });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ language: language })
      .eq('user_id', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Profile not found or update failed' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating language preference:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};