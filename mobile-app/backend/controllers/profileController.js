const supabase = require('../config/supabase');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { username, voice } = req.body;
    
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (voice !== undefined) updates.voice = voice;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Dedicated handler for voice preference updates
exports.updateVoice = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get the voice value from request body
    const { voice } = req.body;
    
    if (voice === undefined) {
      return res.status(400).json({ message: 'Voice parameter is required' });
    }
    
    // Parse voice value to ensure it's a number
    const voiceValue = parseInt(voice, 10);
    if (isNaN(voiceValue)) {
      return res.status(400).json({ message: 'Voice must be a number' });
    }
    
    // Update only the voice field
    const { data, error } = await supabase
      .from('profiles')
      .update({ voice: voiceValue })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating voice preference:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};