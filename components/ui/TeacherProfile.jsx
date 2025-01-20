import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const scheduleData = {
  'Mon': [
    { time: '10:00 AM', subject: 'Math', teacher: 'Sarah', room: 'Room 101' },
    { time: '1:30 PM', subject: 'Biology', teacher: 'Andrew', room: 'Lab 2' },
  ],
  'Wed': [
    { time: '11:00 AM', subject: 'Math', teacher: 'Sarah', room: 'Room 103' },
    { time: '2:00 PM', subject: 'Computer Science', teacher: 'John', room: 'Lab 1' },
  ],
  'Fri': [
    { time: '9:30 AM', subject: 'Physics', teacher: 'Emma', room: 'Room 105' },
    { time: '1:00 PM', subject: 'Chemistry', teacher: 'Michael', room: 'Lab 3' },
  ],
};

export default function TeacherProfile() {
  const [selectedDay, setSelectedDay] = useState('Wed');
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');
  const router = useRouter();
  const { logout, user, updateUser } = useAuth();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setEditProfilePic(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setError('');
      
      if (!editName.trim() || !editEmail.trim()) {
        setError('Name and email are required');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      setLoading(true);
      const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
      
      // If there's a new profile picture, upload it first
      let profilePicUrl = editProfilePic;
      if (editProfilePic && editProfilePic !== user.profilePic) {
        // Here you would typically upload the image to your server or a cloud storage
        // For now, we'll just use the local URI
        profilePicUrl = editProfilePic;
      }

      console.log('Updating profile...', {
        teacherId: user._id,
        name: editName,
        email: editEmail,
        profilePic: profilePicUrl
      });

      const response = await axios.post(`${BASE_URL}/api/teachers/update-profile`, {
        teacherId: user._id,
        name: editName,
        email: editEmail,
        profilePic: profilePicUrl
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        // Update the user context with new data
        await updateUser({
          ...user,
          ...response.data.teacher
        });
        setShowEditProfileModal(false);
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setError('');
      
      // Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }

      setLoading(true);
      const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
      const response = await axios.post(`${BASE_URL}/api/teachers/change-password`, {
        teacherId: user._id,
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        // Clear form and close modal
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
        alert('Password changed successfully');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderScheduleItem = (item) => (
    <View key={item.time} style={styles.scheduleItem}>
      <View style={styles.scheduleTimeContainer}>
        <Text style={styles.scheduleTimeText}>{item.time}</Text>
      </View>
      <View style={styles.scheduleContent}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleSubject}>{item.subject}</Text>
          <Text style={styles.scheduleRoom}>{item.room}</Text>
        </View>
        <View style={styles.scheduleTeacherContainer}>
          <Feather name="user" size={14} color="#666" />
          <Text style={styles.scheduleTeacher}>{item.teacher}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#007AFF', '#E8F3FF']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/100?img=47' }}
                style={styles.teacherImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.teacherName} numberOfLines={1}>{user.name}</Text>
                <Text style={styles.teacherRole}>{user.role || 'Teacher'}</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => setShowSettings(true)}
              >
                <Ionicons name="settings-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={logout}>
                <AntDesign name="logout" size={20} color="#007AFF" />
              </TouchableOpacity>
              {user.role.toLowerCase() === 'hod' && (
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={() => router.push('/(admin)')}
                >
                  <MaterialIcons name="admin-panel-settings" size={20} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>432</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
        </View>

        <View style={styles.scheduleContainer}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dateSelector}
          >
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dateItem,
                  selectedDay === day && styles.selectedDateItem
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dateDay,
                  selectedDay === day && styles.selectedDateText
                ]}>{day}</Text>
                <Text style={[
                  styles.dateNumber,
                  selectedDay === day && styles.selectedDateText
                ]}>{16 + index}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.scheduleList}>
            {scheduleData[selectedDay] ? (
              scheduleData[selectedDay].map(renderScheduleItem)
            ) : (
              <View style={styles.noClassesContainer}>
                <Feather name="calendar" size={40} color="#666" />
                <Text style={styles.noClassesText}>No classes scheduled</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Settings</Text>
              <TouchableOpacity 
                onPress={() => setShowSettings(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.settingsList}>
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => {
                  setShowSettings(false);
                  setEditName(user.name);
                  setEditEmail(user.email);
                  setEditProfilePic(user.profilePic || '');
                  setShowEditProfileModal(true);
                }}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="person-outline" size={24} color="#007AFF" />
                  <Text style={styles.settingText}>Edit Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={24} color="#007AFF" />
                  <Text style={styles.settingText}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => {
                  setShowSettings(false);
                  setShowPasswordModal(true);
                }}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="lock-closed-outline" size={24} color="#007AFF" />
                  <Text style={styles.settingText}>Change Password</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="color-palette-outline" size={24} color="#007AFF" />
                  <Text style={styles.settingText}>Appearance</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
                  <Text style={styles.settingText}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showPasswordModal}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowPasswordModal(false);
                  setError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#666"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditProfileModal}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowEditProfileModal(false);
                  setError('');
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.formContainer}>
              <TouchableOpacity 
                style={styles.profileImageContainer} 
                onPress={pickImage}
              >
                <Image
                  source={{ 
                    uri: editProfilePic || 'https://i.pravatar.cc/100?img=47'
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.editImageOverlay}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Update Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.original.mainBg,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  teacherImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  teacherName: {
    fontSize: 24,
    fontFamily: 'Ralewaybold',
    color: '#fff',
  },
  teacherRole: {
    fontSize: 16,
    fontFamily: 'Outfitregular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 20,
    top: 10,
  },
  iconButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -25,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '30%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Ralewaybold',
    color: Colors.original.bg,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Outfitregular',
    color: '#666',
    marginTop: 4,
  },
  scheduleContainer: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Ralewaybold',
    color: '#333',
    marginBottom: 15,
  },
  dateSelector: {
    marginBottom: 20,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 80,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  selectedDateItem: {
    backgroundColor: Colors.original.bg,
  },
  dateDay: {
    fontSize: 14,
    fontFamily: 'Outfitregular',
    color: '#666',
  },
  dateNumber: {
    fontSize: 24,
    fontFamily: 'Ralewaybold',
    color: '#333',
    marginTop: 4,
  },
  selectedDateText: {
    color: '#fff',
  },
  scheduleList: {
    marginTop: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  scheduleTimeContainer: {
    backgroundColor: Colors.original.bg + '20',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  scheduleTimeText: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    color: Colors.original.bg,
  },
  scheduleContent: {
    flex: 1,
    marginLeft: 15,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleSubject: {
    fontSize: 16,
    fontFamily: 'Ralewaybold',
    color: '#333',
  },
  scheduleRoom: {
    fontSize: 14,
    fontFamily: 'Outfitregular',
    color: '#666',
  },
  scheduleTeacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTeacher: {
    fontSize: 14,
    fontFamily: 'Outfitregular',
    color: '#666',
    marginLeft: 6,
  },
  noClassesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  noClassesText: {
    fontSize: 16,
    fontFamily: 'Outfitsemibold',
    color: '#666',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Ralewaysemibold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  settingsList: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Ralewaymedium',
    color: '#1a1a1a',
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Ralewayregular',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#A8A8A8',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Ralewaymedium',
    color: '#fff',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});