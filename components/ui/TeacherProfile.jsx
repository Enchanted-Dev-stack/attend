import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const scheduleData = {
  'Mon': [
    { time: '10:00 AM', subject: 'Math', teacher: 'Sarah' },
    { time: '1:30 PM', subject: 'Biology', teacher: 'Andrew' },
  ],
  'Wed': [
    { time: '11:00 AM', subject: 'Math', teacher: 'Sarah' },
    { time: '2:00 PM', subject: 'Computer Science', teacher: 'John' },
  ],
  'Fri': [
    { time: '9:30 AM', subject: 'Physics', teacher: 'Emma' },
    { time: '1:00 PM', subject: 'Chemistry', teacher: 'Michael' },
  ],
};

export default function TeacherProfile() {
  const [selectedDay, setSelectedDay] = useState('Wed');
  const router = useRouter();

  const {logout, user} = useAuth();

  const renderScheduleItem = (item) => (
    <View key={item.time} style={styles.scheduleItem}>
      <View style={styles.scheduleTime}>
        <Text style={styles.scheduleTimeText}>{item.time}</Text>
      </View>
      <View style={styles.scheduleDetails}>
        <Text style={styles.scheduleSubject}>{item.subject}</Text>
        <Text style={styles.scheduleTeacher}>with {item.teacher}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {user.name}</Text>
          {/* <Text style={styles.subtitle}>Learn something new today</Text> */}
        </View>

        <View style={styles.teacherCard}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=47' }}
            style={styles.teacherImage}
          />
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName} numberOfLines={1}>{user.name}</Text>
            <Text style={styles.teacherRole}>{user.role || 'Teacher'}</Text>
          </View>
          <TouchableOpacity style={styles.messageButton} onPress={() => {logout()}}>
            <AntDesign name="logout" size={20} color={Colors.original.text} />
          </TouchableOpacity>
          {user.role.toLowerCase() === 'hod' && (
            <TouchableOpacity style={[styles.messageButton, { marginLeft: 7 }]} onPress={() => {router.push('/(admin)')}}>
            <MaterialIcons name="admin-panel-settings" size={20} color={Colors.original.text} />
          </TouchableOpacity>
          )}
        </View>

        <View style={styles.scheduleContainer}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
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
              <Text style={styles.noClassesText}>No classes scheduled for this day.</Text>
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
    padding: 20,
  },
  welcomeText: {
    color: '#333',
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 5,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 20,
    marginVertical: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teacherImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  teacherInfo: {
    marginLeft: 15,
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  teacherRole: {
    fontSize: 14,
    color: '#666',
  },
  messageButton: {
    backgroundColor: Colors.original.bg,
    borderRadius: 20,
    padding: 10,
  },
  scheduleContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dateSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    marginVertical: 5,
    marginLeft: 2,
    width: 70,
    height: 70,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  selectedDateItem: {
    backgroundColor: Colors.original.bg,
  },
  dateDay: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'SpaceMono',
  },
  dateNumber: {
    fontSize: 24,
    // fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Ralewaybold',
  },
  selectedDateText: {
    color: '#fff',
  },
  scheduleList: {
    marginTop: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    elevation: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  scheduleTime: {
    backgroundColor: '#E0FFFF',
    borderRadius: 8,
    padding: 8,
    marginRight: 15,
  },
  scheduleTimeText: {
    fontSize: 12,
    color: '#20B2AA',
    fontFamily: 'SpaceMono',
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleSubject: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Ralewaybold',
  },
  scheduleTeacher: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Outfitregular',
  },
  noClassesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Outfitsemibold',
  },
});