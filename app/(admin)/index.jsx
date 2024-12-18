import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const AdminOption = ({ icon, title, onPress, color, notifications }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.optionContainer, animatedStyle]}>
      <TouchableOpacity
        style={styles.option}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.iconBackground, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.optionText}>{title}</Text>
        {notifications && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const QuickStat = ({ title, value, color }) => (
  <View style={styles.quickStat}>
    <View style={[styles.quickStatIconBackground, { backgroundColor: color }]}>
      <Text style={styles.quickStatValue}>{value}</Text>
    </View>
    <Text style={styles.quickStatTitle}>{title}</Text>
  </View>
);

export default function AdminPanelScreen() {
  const handleNavigation = (screen) => {
    router.push(`${screen}`);
  };

  const menuItems = [
    { icon: 'people', title: 'Students', color: '#EC4899', notifications: 5, route: '/(admin)/addstudents' },
    { icon: 'school', title: 'Teachers', color: '#8B5CF6', route: '/(admin)/teachers' },
    { icon: 'book', title: 'Courses', color: '#3B82F6', notifications: 2, route: '/(admin)/courses' },
    { icon: 'calendar', title: 'Attendance', color: '#10B981', route: 'Attendance' },
    { icon: 'stats-chart', title: 'Reports', color: '#F59E0B', route: '/login' },
    { icon: 'time', title: 'Schedules', color: '#EF4444', route: 'Schedules' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fff', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerText}>Admin Dashboard</Text>
        <Text style={styles.subHeaderText}>Manage your educational platform with ease</Text>
      </LinearGradient>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.optionsGrid}>
          {menuItems.map((item, index) => (
            <AdminOption
              key={index}
              icon={item.icon}
              title={item.title}
              color={item.color}
              notifications={item.notifications}
              onPress={() => handleNavigation(item.route)}
            />
          ))}
        </View>
        <View style={styles.quickStatsContainer}>
          <Text style={styles.quickStatsHeader}>Quick Stats</Text>
          <View style={styles.quickStatsGrid}>
            <QuickStat title="Total Students" value="1,234" color="#3B82F6" />
            <QuickStat title="Active Courses" value="56" color="#10B981" />
            <QuickStat title="Avg. Attendance" value="92%" color="#F59E0B" />
            <QuickStat title="Teacher Ratio" value="1:18" color="#8B5CF6" />
          </View>
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionContainer: {
    width: cardWidth,
    marginBottom: 16,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickStatsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStat: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickStatIconBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatTitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

