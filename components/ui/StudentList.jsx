import { Entypo } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable } from 'react-native';

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

export default function StudentAttendanceList( props ) {
  const [students, setStudents] = useState(props.students || initialStudents);

  useEffect(() => {
    // console.log('Props Students:', props.students);
    if (props.students) {
      setStudents(props.students);
    }
  }, [props.students]);

  const toggleAttendance = (rollNo) => {
    setStudents(prevStudents => 
      prevStudents.map(student =>
        (student['Roll Number'] === rollNo || student.rollNo === rollNo)
          ? { ...student, isPresent: !student.isPresent }
          : student
      )
    );
  };

  const submitAttendance = () => {
    console.log('Submitting attendance:', students.map(student => ({
      rollNo: student['Roll Number'] || student.rollNo,
      isPresent: student.isPresent
    })));
  };

  return (
    students.length > 0 ? (
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
        <TouchableOpacity style={styles.submitButton} onPress={submitAttendance}>
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
    )
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
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});