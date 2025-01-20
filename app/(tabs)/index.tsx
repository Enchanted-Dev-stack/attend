import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Image, Modal, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Link } from "expo-router";

const screenWidth = Dimensions.get('window').width;

export default function Page() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('jan');
  const [selectedSession, setSelectedSession] = useState('2024-25');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [availablePeriods, setAvailablePeriods] = useState({ months: [], sessions: [] });

  const fetchAvailablePeriods = async () => {
    if (!user?._id) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/attendance/available-periods/${user._id}`
      );
      const data = await response.json();

      if (response.ok) {
        setAvailablePeriods(data);
        
        // If current selection is not in available options, select first available
        if (data.months.length > 0 && !data.months.some(m => m.value === selectedMonth)) {
          setSelectedMonth(data.months[0].value);
        }
        if (data.sessions.length > 0 && !data.sessions.some(s => s.value === selectedSession)) {
          setSelectedSession(data.sessions[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/attendance/analytics/teacher/${user._id}?month=${selectedMonth}&session=${selectedSession}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setAnalyticsData(data.analytics);
      } else {
        console.error('Error fetching analytics:', data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAvailablePeriods(),
        fetchAnalytics()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAvailablePeriods();
  }, [user?._id]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedSession, user?._id]);

  const PeriodSelector = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select Period</Text>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Session</Text>
            <View style={styles.optionsContainer}>
              {availablePeriods.sessions.map((session) => (
                <TouchableOpacity
                  key={session.value}
                  style={[
                    styles.optionButton,
                    selectedSession === session.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    setSelectedSession(session.value);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    selectedSession === session.value && styles.selectedOptionText
                  ]}>
                    {session.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Month</Text>
            <View style={styles.optionsContainer}>
              {availablePeriods.months.map((month) => (
                <TouchableOpacity
                  key={month.value}
                  style={[
                    styles.optionButton,
                    selectedMonth === month.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    setSelectedMonth(month.value);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    selectedMonth === month.value && styles.selectedOptionText
                  ]}>
                    {month.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const renderStats = () => {
    if (!analyticsData?.summary) return null;

    const { summary, trends } = analyticsData;
    const selectedMonthLabel = availablePeriods.months.find(m => m.value === selectedMonth)?.label || selectedMonth;

    // Prepare chart data
    const chartData = trends?.dateWiseStrength?.map(day => ({
      date: new Date(day.date).getDate(),
      percentage: day.percentage
    })) || [];

    return (
      <View style={styles.statsContainer}>
        {/* <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{user?.displayName?.[0] || 'D'}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.displayName || "Divyansh dwivedi"}</Text>
              <Text style={styles.periodText} onPress={() => setModalVisible(true)}>
                {selectedSession} • {selectedMonth} ▼
              </Text>
            </View>
          </View>
        </View> */}

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Weekly Stats</Text>
          <Pressable onPress={() => router.push('/(analytics)')}>
            <Text style={styles.advancedLink}>Advanced</Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons name="people" size={20} color="#007AFF" />
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <Text style={styles.statValue}>{summary.totalStudentsMarked}</Text>
            <View style={styles.statChange}>
              <Text style={styles.statChangeText}>
                {summary.studentChange ? `↑ ${summary.studentChange}%` : '-'}
              </Text>
              <Text style={styles.statChangeLabel}>vs last month</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons name="check-circle" size={20} color="#34C759" />
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <Text style={styles.statValue}>
              {Math.round(parseFloat(summary.averageAttendance.replace('%', '')))}%
            </Text>
            <View style={styles.statChange}>
              <Text style={styles.statChangeText}>
                {summary.presentChange ? `↑ ${summary.presentChange}%` : '-'}
              </Text>
              <Text style={styles.statChangeLabel}>vs last month</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons name="schedule" size={20} color="#FF9500" />
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <Text style={styles.statValue}>{summary.totalAttendanceRecords}</Text>
            <View style={styles.statChange}>
              <Text style={styles.statChangeText}>
                {summary.classesChange ? `↑ ${summary.classesChange}%` : '-'}
              </Text>
              <Text style={styles.statChangeLabel}>vs last month</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <MaterialIcons name="trending-up" size={20} color="#AF52DE" />
              <Text style={styles.statLabel}>Engagement</Text>
            </View>
            <Text style={styles.statValue}>{((summary.totalPresent / summary.totalStudentsMarked) * 100).toFixed(1)}%</Text>
            <View style={styles.statChange}>
              <Text style={styles.statChangeText}>
                {summary.engagementChange ? `↑ ${summary.engagementChange}%` : '-'}
              </Text>
              <Text style={styles.statChangeLabel}>vs last month</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Reports</Text>
          <View style={styles.reportsGrid}>
            <Pressable 
              style={styles.reportCard}
              onPress={() => router.push('/(analytics)/class')}
            >
              <MaterialIcons name="class" size={24} color="#007AFF" />
              <Text style={styles.reportTitle}>Classwise Report</Text>
              <Text style={styles.reportDesc}>View detailed analytics by class</Text>
            </Pressable>

            <Pressable style={styles.reportCard}>
              <MaterialIcons name="trending-up" size={24} color="#34C759" />
              <Text style={styles.reportTitle}>Overall Analytics</Text>
              <Text style={styles.reportDesc}>Complete attendance insights</Text>
            </Pressable>

            <Pressable style={styles.reportCard}>
              <MaterialIcons name="person" size={24} color="#AF52DE" />
              <Text style={styles.reportTitle}>Student Report</Text>
              <Text style={styles.reportDesc}>Individual student analysis</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8EFFF', '#E8EFFF', '#F8FBFF']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        >
          <PeriodSelector />
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
          ) : (
            renderStats()
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 8,
  },
  statsContainer: {
    padding: 16,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Ralewaysemibold',
    color: '#000',
    marginBottom: 4,
  },
  periodText: {
    fontSize: 15,
    fontFamily: 'Ralewayregular',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Ralewaybold',
    color: '#000',
    marginBottom: 16,
    flex: 1,
  },
  advancedLink: {
    color: '#007AFF',
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    paddingLeft: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#666',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 32,
    fontFamily: 'Ralewaybold',
    color: '#000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChangeText: {
    color: '#22C55E',
    fontSize: 13,
    fontFamily: 'Ralewaymedium',
  },
  statChangeLabel: {
    color: '#666',
    fontSize: 13,
    fontFamily: 'Ralewayregular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    margin: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  reportCard: {
    width: '48%',
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: 'Ralewaysemibold',
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 13,
    fontFamily: 'Ralewayregular',
    color: '#666',
  },
});