import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function ModernDashboard() {

  const { user } = useAuth();

  const days = [
    { day: 'Thu', date: '06', isSelected: false },
    { day: 'Fri', date: '07', isSelected: false },
    { day: 'Sat', date: '08', isSelected: false },
    { day: 'Sun', date: '09', isSelected: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.dateSelector}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dateItem, day.isSelected && styles.selectedDate]}
            >
              <Text style={[styles.dayText, day.isSelected && styles.selectedDateText]}>{day.day}</Text>
              <Text style={[styles.dateText, day.isSelected && styles.selectedDateText]}>{day.date}</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        <View style={styles.attendanceContainer}>
        <Text style={styles.sectionTitle}>Attendence Analytics lorem</Text>

          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceItem}>
              <View style={styles.attendanceIconContainer}>
                <Ionicons name="log-in-outline" size={24} color="#4A6CF7" />
              </View>
              <View>
                <Text style={styles.attendanceLabel}>Total</Text>
                <Text style={styles.attendanceValue}>62</Text>
              </View>
            </View>
            <View style={styles.attendanceItem}>
              <View style={styles.attendanceIconContainer}>
                <Ionicons name="log-out-outline" size={24} color="#4A6CF7" />
              </View>
              <View>
                <Text style={styles.attendanceLabel}>Taken</Text>
                <Text style={styles.attendanceValue}>57</Text>
              </View>
            </View>
            <View style={styles.attendanceItem}>
              <View style={styles.attendanceIconContainer}>
                <Ionicons name="time-outline" size={24} color="red" />
              </View>
              <View>
                <Text style={styles.attendanceLabel}>Missed</Text>
                <Text style={styles.attendanceValue}>5</Text>
              </View>
            </View>
            <View style={styles.attendanceItem}>
              <View style={styles.attendanceIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#4A6CF7" />
              </View>
              <View>
                <Text style={styles.attendanceLabel}>Avg Present</Text>
                <Text style={styles.attendanceValue}>71%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.activityContainer}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Your Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="log-in-outline" size={24} color="#4A6CF7" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Check In</Text>
              <Text style={styles.activityDate}>April 17, 2023</Text>
            </View>
            <Text style={styles.activityTime}>10:00 am</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <Ionicons name="cafe-outline" size={24} color="#4A6CF7" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Break In</Text>
              <Text style={styles.activityDate}>April 17, 2023</Text>
            </View>
            <Text style={styles.activityTime}>12:30 pm</Text>
          </View>
        </View>
      </ScrollView>
{/* 
      <TouchableOpacity style={styles.checkInButton}>
        <Ionicons name="arrow-forward-outline" size={24} color="#FFF" style={styles.checkInIcon} />
        <Text style={styles.checkInText}>Swipe to Check In</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    color: '#666',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  dateItem: {
    alignItems: 'center',
    padding: 10,
  },
  selectedDate: {
    backgroundColor: '#4A6CF7',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: '#FFF',
  },
  attendanceContainer: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontFamily: 'Rubik',
  },
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attendanceItem: {
    elevation: 1,
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceIconContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  attendanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  attendanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendanceSubtext: {
    fontSize: 12,
    color: '#666',
  },
  activityContainer: {
    padding: 10,
    paddingVertical: 0,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#4A6CF7',
    fontSize: 14,
  },
  activityItem: {
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  activityIconContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Rubik',
  },
  activityTime: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6CF7',
    borderRadius: 30,
    padding: 15,
    margin: 20,
  },
  checkInIcon: {
    marginRight: 10,
  },
  checkInText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});