import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import axios from 'axios'; // Import axios

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SemesterBadge = ({ semester, index, onEdit, onRemove }) => {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.semesterBadge, animatedStyle]}>
      <Text style={styles.semesterBadgeText}>{semester}</Text>
      <View style={styles.semesterBadgeActions}>
        <TouchableOpacity
          onPress={() => onEdit(semester, index)}
          style={styles.semesterBadgeAction}
        >
          <Ionicons name="pencil" size={16} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRemove(index)}
          style={styles.semesterBadgeAction}
        >
          <Ionicons name="close" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function AddCourseScreen() {
  const [courseName, setCourseName] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSemester, setCurrentSemester] = useState('');
  const [editingSemesterId, setEditingSemesterId] = useState(null);

  const inputRef = useRef(null);

  const buttonScale = useSharedValue(1);
  const formHeight = useSharedValue(1);
  const addButtonRotation = useSharedValue(0);

  const handleAddSemester = () => {
    if (currentSemester.trim()) {
      const semesterNames = currentSemester
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name !== "");

      if (editingSemesterId !== null) {
        setSemesters(
          semesters.map((sem, index) =>
            index === editingSemesterId ? semesterNames[0] : sem
          )
        );
        setEditingSemesterId(null);

        // Add any additional semesters after the edited one
        if (semesterNames.length > 1) {
          setSemesters((prevSemesters) => [...prevSemesters, ...semesterNames.slice(1)]);
        }
      } else {
        setSemesters((prevSemesters) => [...prevSemesters, ...semesterNames]);
      }

      setCurrentSemester("");
      addButtonRotation.value = withSequence(
        withTiming(45, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );
    }
  };

  const handleEditSemester = (semester, index) => {
    setCurrentSemester(semester);
    setEditingSemesterId(index);
    inputRef.current?.focus();
  };

  const handleRemoveSemester = (index) => {
    setSemesters(semesters.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Replace with your actual API endpoint
    const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL; // Replace with your actual base URL

    axios
      .post(`${BASE_URL}/api/courses`, {
        course: courseName,
        semesters,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsSubmitting(false);
        // Reset form
        setCourseName('');
        setSemesters([]);
        setCurrentSemester('');
        // Animate form reset
        formHeight.value = withSequence(
          withTiming(0.8, { duration: 300 }),
          withTiming(1, { duration: 300 })
        );
      });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleY: formHeight.value }],
    };
  });

  const addButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${addButtonRotation.value}deg` }],
    };
  });

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <Text style={styles.title}>Add New Course</Text>
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              value={courseName}
              onChangeText={setCourseName}
            />
            <View style={styles.semesterSection}>
              <Text style={styles.sectionTitle}>Semesters</Text>
              <View style={styles.semesterInputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.semesterInput}
                  placeholder="Add Semester(s) (comma-separated)"
                  value={currentSemester}
                  onChangeText={setCurrentSemester}
                  onSubmitEditing={handleAddSemester}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddSemester}>
                  <Animated.View style={addButtonAnimatedStyle}>
                    <Ionicons name="add-circle" size={24} color="#3B82F6" />
                  </Animated.View>
                </TouchableOpacity>
              </View>
              <View style={styles.semesterBadgesContainer}>
                {semesters.map((semester, index) => (
                  <SemesterBadge
                    key={index}
                    semester={semester}
                    index={index}
                    onEdit={handleEditSemester}
                    onRemove={handleRemoveSemester}
                  />
                ))}
              </View>
            </View>
            <AnimatedTouchableOpacity
              style={[styles.submitButton, buttonAnimatedStyle]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Course'}
              </Text>
            </AnimatedTouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  semesterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  semesterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  semesterInput: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  addButton: {
    padding: 8,
  },
  semesterBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  semesterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  semesterBadgeText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  semesterBadgeActions: {
    flexDirection: 'row',
  },
  semesterBadgeAction: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});