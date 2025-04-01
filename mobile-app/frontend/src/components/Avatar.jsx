import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar as PaperAvatar } from 'react-native-paper';

const Avatar = ({ 
  size = 40, 
  user, 
  style, 
  label,
  color = '#6200EE'
}) => {
  
  if (user?.avatar) {
    return (
      <PaperAvatar.Image 
        source={{ uri: user.avatar }} 
        size={size}
        style={[styles.avatar, style]}
      />
    );
  }
  
  const initials = label || getUserInitials(user);
  
  return (
    <View style={[styles.container, style]}>
      <PaperAvatar.Text 
        label={initials} 
        size={size} 
        style={[styles.avatar, { backgroundColor: color }]}
      />
    </View>
  );
};

const getUserInitials = (user) => {
  if (!user) return '?';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  
  return '?';
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    elevation: 2,
  }
});

export default Avatar; 