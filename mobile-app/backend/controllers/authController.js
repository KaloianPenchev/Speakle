const supabase = require('../utils/supabaseAdmin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
  try {
    const { email, password, name, voice } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    let voiceValue = 0;
    if (voice !== undefined && voice !== null) {
      const parsedVoice = Number(voice);
      if (!isNaN(parsedVoice)) {
        voiceValue = parsedVoice;
      }
    }

    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    if (existingUsers) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    const profileResult = await supabase
      .from('profiles')
      .insert([
        {
          user_id: authData.user.id,
          username: name,
          voice: voiceValue,
          created_at: new Date()
        }
      ]);
    
    const profileError = profileResult.error;

    if (profileError) {
      return res.status(400).json({ 
        error: 'User created but profile creation failed', 
        details: profileError.message,
        user_id: authData.user.id
      });
    }

    return res.status(200).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: name,
        voice: voiceValue
      },
      session: authData.session
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during signup', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    res.status(200).json({ 
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 