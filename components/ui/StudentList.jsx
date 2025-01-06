import { Entypo, AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const initialStudents = [
  // { id: '01', name: 'Akash Gupta', isPresent: true },
  // { id: '02', name: 'Brijesh Gupta', isPresent: false },
  // { id: '03', name: 'Cajeton D\'souza', isPresent: true },
  // { id: '04', name: 'Danish Shaikh', isPresent: true },
  // { id: '05', name: 'Daniel Walter', isPresent: true },
  // { id: '06', name: 'Faisal Khan', isPresent: true },
];

const AnimatedCheckmark = ({ isPresent }) => {
  const scaleValue = useRef(new Animated.Value(isPresent ? 1 : 0)).current;
  const rotateValue = useRef(new Animated.Value(isPresent ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: isPresent ? 1 : 0,
        useNativeDriver: true,
        friction: 6,
        tension: 40
      }),
      Animated.timing(rotateValue, {
        toValue: isPresent ? 1 : 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  }, [isPresent]);

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg']
  });

  return (
    <Animated.View
      style={[
        styles.checkmarkContainer,
        {
          transform: [
            { scale: scaleValue },
            { rotate: rotation }
          ],
          opacity: scaleValue
        }
      ]}
    >
      <View style={styles.checkmark} />
    </Animated.View>
  );
};

export default function StudentAttendanceList({ 
  students: propStudents,
  selectedDate,
  course,
  semester,
  subject,
  teacherId
}) {
  const [students, setStudents] = useState(propStudents || initialStudents);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const showSuccessMessage = () => {
    setSuccessModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hideSuccessMessage = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setSuccessModalVisible(false);
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
    });
  };

  // Get current year and generate session options
  const currentYear = new Date().getFullYear();
  const sessionOptions = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];

  useEffect(() => {
    if (propStudents) {
      setStudents(propStudents);
    }
  }, [propStudents]);

  const toggleAttendance = (rollNo) => {
    setStudents(prevStudents => 
      prevStudents.map(student =>
        (student['Roll Number'] === rollNo || student.rollNo === rollNo)
          ? { ...student, isPresent: !student.isPresent }
          : student
      )
    );
  };

  const handleSubmit = async (session) => {
    if (!course || !semester || !subject || !teacherId || !session) {
      Alert.alert(
        'Missing Information',
        'Please ensure all fields (course, semester, subject, and session) are selected.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const attendanceData = {
        teacherId,
        course,
        semester,
        subject,
        date: selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString(),
        session,
        attendanceData: students.map(student => ({
          studentId: student.sid || student['Roll Number'] || student.rollNo,
          rollNo: student['Roll Number'] || student.rollNo,
          studentName: student.firstname && student.lastname 
            ? `${student.firstname} ${student.lastname}`
            : student.Name || student.name || 'Unknown',
          isPresent: student.isPresent || false
        }))
      };

      console.log('Submitting attendance data:', JSON.stringify(attendanceData, null, 2));
      console.log('API URL:', `${process.env.EXPO_PUBLIC_BASE_URL}/api/attendance`);

      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(attendanceData)
      });

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (response.status === 409) {
        // Duplicate entry found
        setExistingRecord(responseData.existingRecord);
        Alert.alert(
          'Duplicate Entry',
          'There\'s already an attendance record for this subject. Do you want to update it?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: () => {
                setSessionModalVisible(false);
                setExistingRecord(null);
              }
            },
            {
              text: 'Yes',
              onPress: async () => {
                try {
                  const updateResponse = await fetch(
                    `${process.env.EXPO_PUBLIC_BASE_URL}/api/attendance/${responseData.existingRecord._id}`,
                    {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                      },
                      body: JSON.stringify({
                        teacherId,
                        attendanceData: attendanceData.attendanceData
                      })
                    }
                  );

                  if (updateResponse.ok) {
                    setSessionModalVisible(false);
                    showSuccessMessage();
                    setTimeout(() => {
                      hideSuccessMessage();
                    }, 2000);
                  } else {
                    throw new Error('Failed to update attendance');
                  }
                } catch (updateError) {
                  console.error('Error updating attendance:', updateError);
                  Alert.alert(
                    'Error',
                    'Failed to update attendance. Please try again.',
                    [{ text: 'OK' }]
                  );
                }
              }
            }
          ]
        );
        return;
      }

      if (response.status >= 200 && response.status < 300) {
        setSessionModalVisible(false);
        showSuccessMessage();
        setTimeout(() => {
          hideSuccessMessage();
        }, 2000);
      } else {
        throw new Error(responseData.error || 'Failed to submit attendance');
      }

    } catch (error) {
      console.error('Error submitting attendance:', error);
      console.error('Error details:', error.message);
      Alert.alert(
        'Error',
        'Failed to submit attendance. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {students.length > 0 ? (
        <View style={styles.container}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.nameCell]}>Name</Text>
              <Text style={[styles.headerCell, styles.rollNoCell]}>Roll No</Text>
              <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
            </View>
            <ScrollView style={styles.scrollView}>
              {students.map((student) => (
                <Pressable
                  key={student['Roll Number'] || student.rollNo}
                  style={styles.tableRow}
                  onPress={() => toggleAttendance(student['Roll Number'] || student.rollNo)}
                >
                  <Text style={[styles.cell, styles.nameCell]}>
                    {student.Name || 
                     student.name || 
                     student.fullName || 
                     (student.firstname && student.lastname ? `${student.firstname} ${student.lastname}` : 'No Name')}
                  </Text>
                  <View style={[styles.cell, styles.rollNoCell]}>
                    <Text style={styles.rollNoText}>{student['Roll Number'] || student.rollNo}</Text>
                  </View>
                  <View style={[styles.cell, styles.statusCell]}>
                    <AnimatedCheckmark isPresent={student.isPresent} />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={() => setSessionModalVisible(true)}
          >
            <Entypo name="check" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LottieView
          source={require('../../assets/lottie/attendanceList.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
          <Text style={{ fontSize: 18, fontFamily: 'SpaceMono', textAlign: 'center', marginBottom: 20 }}>Seems like no one is here</Text>
          {/* <Text style={{ fontSize: 16, fontFamily: 'Montserrat', textAlign: 'center' }}>Where the students have wandered off?</Text> */}
        </View>
      )}

      {/* Session Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sessionModalVisible}
        onRequestClose={() => setSessionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#E3EFFF', '#F8FBFF']}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Select Session</Text>
            <View style={styles.sessionOptions}>
              {sessionOptions.map((session) => (
                <TouchableOpacity
                  key={session}
                  style={styles.sessionOption}
                  onPress={() => handleSubmit(session)}
                >
                  <Text style={styles.sessionOptionText}>{session}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSessionModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        transparent={true}
        visible={successModalVisible}
        onRequestClose={hideSuccessMessage}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.successModal,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <LottieView
              source={require('../../assets/lottie/attendancesuccess.json')}
              autoPlay
              loop={false}
              style={styles.successAnimation}
            />
            <Text style={styles.successText}>Attendance submitted successfully!</Text>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 16,
  },
  lottie: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  table: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerCell: {
    padding: 12,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2196F3',
  },
  scrollView: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  cell: {
    padding: 12,
    justifyContent: 'center',
  },
  nameCell: {
    flex: 2,
  },
  rollNoCell: {
    flex: 1,
    alignItems: 'center',
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
  },
  rollNoText: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 16,
    color: '#2196F3',
    textAlign: 'center',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#2196F3', 
    transform: [{ rotate: '-45deg' }, { translateY: -2 }],
  },
  submitButton: {
    position: 'absolute',
    bottom: 100,
    right: 5,
    backgroundColor: '#2196F3',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 15,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Ralewaybold',
  },
  sessionOptions: {
    width: '100%',
    gap: 10,
  },
  sessionOption: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  sessionOptionText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Outfitlight',
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Outfitregular',
  },
  successModal: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '85%',
  },
  successAnimation: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
});