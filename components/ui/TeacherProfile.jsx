import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

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
  const router = useRouter();
  const { logout, user } = useAuth();

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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noClassesText: {
    fontSize: 16,
    fontFamily: 'Outfitsemibold',
    color: '#666',
    marginTop: 10,
  },
});