import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Period {
  label: string;
  value: string;
}

interface TeacherClass {
  course: string;
  semesterData: {
    sem: string;
    subjects: string[];
  };
}

interface AnalyticsSelectorProps {
  selectedMonth: string;
  selectedSession: string;
  selectedCourse?: string;
  selectedSemester?: string;
  onMonthChange: (month: string) => void;
  onSessionChange: (session: string) => void;
  onCourseChange?: (course: string, semester: string) => void;
  showClassSelection?: boolean;
}

export default function AnalyticsSelector({
  selectedMonth,
  selectedSession,
  selectedCourse,
  selectedSemester,
  onMonthChange,
  onSessionChange,
  onCourseChange,
  showClassSelection = false,
}: AnalyticsSelectorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState<Period[]>([]);
  const [availableSessions, setAvailableSessions] = useState<Period[]>([]);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);

  useEffect(() => {
    const fetchAvailablePeriods = async () => {
      if (!user?._id) return;

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/attendance/available-periods/${user._id}`
        );
        const data = await response.json();

        if (response.ok) {
          setAvailableMonths(data.months);
          setAvailableSessions(data.sessions);
          
          if (data.months.length > 0 && !data.months.some(m => m.value === selectedMonth)) {
            onMonthChange(data.months[0].value);
          }
          if (data.sessions.length > 0 && !data.sessions.some(s => s.value === selectedSession)) {
            onSessionChange(data.sessions[0].value);
          }
        } else {
          setError('Failed to fetch available periods');
        }
      } catch (err) {
        setError('Error loading available periods');
        console.error('Error fetching periods:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailablePeriods();
  }, [user?._id]);

  useEffect(() => {
    if (showClassSelection && user?._id) {
      fetchTeacherClasses();
    }
  }, [user?._id, showClassSelection]);

  const fetchTeacherClasses = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/teachers/id/${user?._id}`);
      const data = await response.json();
      if (response.ok && data.classes) {
        setTeacherClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
    }
  };

  const selectedMonthLabel = availableMonths.find(m => m.value === selectedMonth)?.label || selectedMonth;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.selectorContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.selector} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.periodText}>
            {selectedSession} • {selectedMonthLabel}
            {showClassSelection && selectedCourse && ` • ${selectedCourse} (${selectedSemester})`} ▼
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Period</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </Pressable>
            </View>
            
            <View style={styles.optionSection}>
              <Text style={styles.sectionTitle}>Session</Text>
              <View style={styles.optionsGrid}>
                {availableSessions.map((session) => (
                  <TouchableOpacity
                    key={session.value}
                    style={[
                      styles.optionButton,
                      selectedSession === session.value && styles.selectedOption
                    ]}
                    onPress={() => {
                      onSessionChange(session.value);
                      setModalVisible(false);
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

            <View style={styles.optionSection}>
              <Text style={styles.sectionTitle}>Month</Text>
              <View style={styles.optionsGrid}>
                {availableMonths.map((month) => (
                  <TouchableOpacity
                    key={month.value}
                    style={[
                      styles.optionButton,
                      selectedMonth === month.value && styles.selectedOption
                    ]}
                    onPress={() => {
                      onMonthChange(month.value);
                      setModalVisible(false);
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

            {showClassSelection && teacherClasses.length > 0 && (
              <View style={styles.optionSection}>
                <Text style={styles.sectionTitle}>Class</Text>
                <View style={styles.optionsGrid}>
                  {teacherClasses.map((classData, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedCourse === classData.course && 
                        selectedSemester === classData.semesterData.sem && 
                        styles.selectedOption
                      ]}
                      onPress={() => onCourseChange?.(
                        classData.course, 
                        classData.semesterData.sem
                      )}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedCourse === classData.course &&
                        selectedSemester === classData.semesterData.sem &&
                        styles.selectedOptionText
                      ]}>
                        {classData.course} - {classData.semesterData.sem}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  selector: {
    flex: 1,
    alignItems: 'flex-end',
  },
  periodText: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#666',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontFamily: 'Ralewaymedium',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Ralewaybold',
    color: '#000',
  },
  optionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#666',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FF',
    margin: 6,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Ralewaymedium',
    color: '#000',
  },
  selectedOptionText: {
    color: '#fff',
  },
});
