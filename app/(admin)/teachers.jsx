import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

const TeacherItem = ({ teacher }) => (
  <View style={styles.teacherItem}>
    <Image
      source={
        teacher.profilePic
          ? { uri: teacher.profilePic }
          : {}
      }
      style={styles.teacherImage}
    />
    <View style={styles.teacherInfo}>
      <Text style={styles.teacherName}>{teacher.name}</Text>
      <Text style={styles.teacherEmail}>{teacher.email}</Text>
      <View style={styles.classesContainer}>
        {teacher.classes.map((classItem, index) => (
          <View key={index} style={styles.classChip}>
            <Text style={styles.classChipText}>
              {`${classItem.course} ${classItem.semesterData?.sem || ''}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const AddTeacherForm = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [currentSubjects, setCurrentSubjects] = useState("");
  const [role, setRole] = useState("");
  const [Courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesterOptions, setSemesterOptions] = useState([]);

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/courses`)
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  useEffect(() => {
    console.log("Selected course:", Courses);
  }, [Courses]);

  const handleCourseChange = (value) => {
    setSelectedCourse(value);
    setSelectedSemester(""); // Reset semester when course changes

    // Find semesters for selected course
    const selectedCourseData = Courses.find((course) => course.course === value);
    if (selectedCourseData) {
      setSemesterOptions(selectedCourseData.semesters);
    } else {
      setSemesterOptions([]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const addClass = () => {
    if (selectedCourse && selectedSemester && currentSubjects) {
      // Convert comma-separated subjects into an array and trim whitespace
      const subjectsArray = currentSubjects.split(',').map(subject => subject.trim()).filter(subject => subject.length > 0);
      
      setClasses([
        ...classes,
        {
          course: selectedCourse,
          semesterData: {
            sem: selectedSemester,
            subjects: subjectsArray
          }
        }
      ]);
      setSelectedCourse("");
      setSelectedSemester("");
      setCurrentSubjects("");
      setSemesterOptions([]);
    }
  };

  const handleSubmit = () => {
    if (name && email && password && profilePic && classes.length > 0) {
      onAdd({ name, email, password, profilePic, classes, role });
      onClose();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.formContainer}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>Add New Teacher</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#3B82F6" />
              <Text style={styles.imagePickerText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Role : Teacher/Hod"
          value={role}
          onChangeText={setRole}
        />
        <View style={styles.classesContainer}>
          <Text style={styles.classesTitle}>Classes and Subjects</Text>
          {classes.map((item, index) => (
            <View key={index} style={styles.classItem}>
              <Text
                style={styles.classItemText}
              >{`${item.course} ${item.semesterData.sem}: ${item.semesterData.subjects.join(', ')}`}</Text>
            </View>
          ))}
          <View style={styles.addClassContainer}>
            <View style={styles.classInputContainer}>
              <View style={styles.pickerContainer}>
                <Picker
                  mode="dropdown"
                  selectedValue={selectedCourse}
                  onValueChange={handleCourseChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Course" value="" />
                  {Courses.map((course, index) => (
                    <Picker.Item
                      key={index}
                      label={course.course}
                      value={course.course}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  mode="dropdown"
                  selectedValue={selectedSemester}
                  onValueChange={setSelectedSemester}
                  style={styles.picker}
                  enabled={selectedCourse !== ""}
                >
                  <Picker.Item label="Select Semester" value="" />
                  {semesterOptions.map((semester, index) => (
                    <Picker.Item
                      key={index}
                      label={semester}
                      value={semester}
                    />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={[styles.input, styles.classInput]}
                placeholder="Subjects"
                value={currentSubjects}
                onChangeText={setCurrentSubjects}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.addClassButton,
                (!selectedCourse || !selectedSemester || !currentSubjects) &&
                  styles.addClassButtonDisabled,
              ]}
              onPress={addClass}
              disabled={!selectedCourse || !selectedSemester || !currentSubjects}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Teacher</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default function TeachersManagementScreen() {
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

  const [teachers, setTeachers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  const formAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      formScale.value,
      [0, 1],
      [0.8, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity: formOpacity.value,
    };
  });

  useEffect(() => {
    axios.get(`${BASE_URL}/api/teachers`).then((response) => {
      setTeachers(response.data);
    });
  }, []);

  const toggleAddForm = () => {
    if (showAddForm) {
      formScale.value = withSpring(0);
      formOpacity.value = withSpring(0);
      setTimeout(() => setShowAddForm(false), 300);
    } else {
      setShowAddForm(true);
      formScale.value = withSpring(1);
      formOpacity.value = withSpring(1);
    }
  };

  const addTeacher = (teacher) => {
    setTeachers([...teachers, teacher]);
    console.log(teacher);
    axios.post(`${BASE_URL}/api/teachers`, teacher).then((response) => {
      ToastAndroid.show("Teacher added successfully", ToastAndroid.SHORT);
    });
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.classes.some(
        (c) =>
          c.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.semesterData.sem.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.semesterData.subjects.some(subject => 
            subject.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
  );

  const renderTeacherItem = useCallback(
    ({ item }) => <TeacherItem teacher={item} />,
    []
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#3B82F6", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#64748B"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teachers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={toggleAddForm}>
          <Ionicons
            name={showAddForm ? "close" : "add"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </LinearGradient>
      <FlatList
        data={filteredTeachers}
        renderItem={renderTeacherItem}
        keyExtractor={(item) => item.email}
        contentContainerStyle={styles.listContainer}
      />
      {showAddForm && (
        <Animated.View style={[styles.formWrapper, formAnimatedStyle]}>
          <AddTeacherForm onClose={toggleAddForm} onAdd={addTeacher} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#3B82F6",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1E40AF",
    fontFamily: "SpaceMono",
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  listContainer: {
    padding: 14,
  },
  teacherItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 5,
  },
  teacherImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    color: "#00000",
    fontFamily: "Poppins",
  },
  teacherEmail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  teacherClasses: {
    fontSize: 12,
    color: "#3B82F6",
    fontFamily: "SpaceMono",
  },
  formWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    paddingHorizontal: 16,
    width: "97%",
    maxHeight: "90%",
  },
  formTitle: {
    fontSize: 24,
    fontFamily: "Montserratbold",
    color: "#1E40AF",
    marginBottom: 24,
    textAlign: "center",
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  imagePickerPlaceholder: {
    alignItems: "center",
  },
  imagePickerText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Ralewayregular",
    color: "#3B82F6",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  input: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontFamily: "Outfitregular",
  },
  classesContainer: {
    marginBottom: 24,
  },
  classesTitle: {
    fontSize: 18,
    fontFamily: "Outfitregular",
    color: "#1E40AF",
    marginBottom: 12,
  },
  classItem: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  classItemText: {
    fontSize: 14,
    color: "#1E40AF",
  },
  addClassContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  classInputContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
  },
  pickerContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  classInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  addClassButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addClassButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  classChip: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  classChipText: {
    fontSize: 14,
    color: "#1E40AF",
  },
});
