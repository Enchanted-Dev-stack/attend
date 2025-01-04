import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import DropDownPicker from 'react-native-dropdown-picker';
import StudentAttendanceList from "@/components/ui/StudentList";
import { useAuth } from "@/context/AuthContext";

const generateDates = () => {
  const dates = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Generate dates from 2 days before to 5 days after
  for (let i = -2; i < 6; i++) {
    const currentDate = new Date('2025-01-03'); // Using the provided current date
    currentDate.setDate(currentDate.getDate() + i);
    
    dates.push({
      date: currentDate.toISOString().split('T')[0],
      day: daysOfWeek[currentDate.getDay()]
    });
  }
  
  return dates;
};

const dates = generateDates();

export default function Attendence() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState(new Date('2025-01-03').toISOString().split('T')[0]);
  const [teacherData, setTeacherData] = React.useState<any>(null);
  const [studentsList, setStudentsList] = useState([]);

  // Class dropdown states
  const [openClass, setOpenClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classOptions, setClassOptions] = useState([
    { label: "Select Class", value: null }
  ]);


  // Semester dropdown states
  const [openSemester, setOpenSemester] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // Subject dropdown states
  const [openSubject, setOpenSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!user?._id) return;
        const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/teachers/id/${user._id}`);
        const data = await response.json();
        setTeacherData(data);
        
        if (data.classes) {
          const classOpts = [
            { label: "Select Class", value: null },
            ...data.classes.map((c: any) => ({
              label: c.course,
              value: c.course
            }))
          ];
          setClassOptions(classOpts);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };

    fetchTeacherData();
  }, [user?._id]);

  // Update semester options when class changes
  const handleClassChange = (value: string) => {
    setSelectedSemester(null);
    setSelectedSubject(null);
    setStudentsList([]); // Clear students list when class changes
    
    if (!value || !teacherData?.classes) {
      setSemesterOptions([]);
      setSubjectOptions([]);
      return;
    }

    const selectedClassData = teacherData.classes.find(
      (c: any) => c.course === value
    );

    if (selectedClassData) {
      setSemesterOptions([
        {
          label: selectedClassData.semesterData.sem,
          value: selectedClassData.semesterData.sem
        }
      ]);
    }
  };

  // Update subject options when semester changes
  const handleSemesterChange = async (value: string) => {
    setSelectedSubject(null);

    if (!value || !teacherData?.classes) {
      setSubjectOptions([]);
      setStudentsList([]);
      return;
    }

    const selectedClassData = teacherData.classes.find(
      (c: any) => c.course === selectedClass && c.semesterData.sem === value
    );

    if (selectedClassData) {
      setSubjectOptions(
        selectedClassData.semesterData.subjects.map((subject: string) => ({
          label: subject,
          value: subject
        }))
      );

      // Fetch students data when both class and semester are selected
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/students/byCourse?course=${selectedClass}&semester=${value}`
        );
        const data = await response.json();
        
        // Check if the response is an array (success) or has an error message
        if (Array.isArray(data)) {
          const studentsWithAttendance = data.map(student => ({
            ...student,
            isPresent: false
          }));
          setStudentsList(studentsWithAttendance);
        } else {
          console.log('API Response:', data);
          setStudentsList([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudentsList([]);
      }
    }
  };

  // useEffect(() => {
  //   console.log(studentsList);
  // }, [studentsList]);

  // Ensure dropdowns don't open simultaneously
  const handleOpenClass = () => {
    setOpenSemester(false);
    setOpenSubject(false);
  };

  const handleOpenSemester = () => {
    setOpenClass(false);
    setOpenSubject(false);
  };

  const handleOpenSubject = () => {
    setOpenClass(false);
    setOpenSemester(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dropdownsContainer}>
        <View style={styles.topDropdowns}>
          <DropDownPicker
            open={openClass}
            value={selectedClass}
            items={classOptions}
            setOpen={setOpenClass}
            setValue={setSelectedClass}
            setItems={setClassOptions}
            onChangeValue={handleClassChange}
            onOpen={handleOpenClass}
            placeholder="Select Class"
            style={styles.dropdown}
            containerStyle={[styles.dropdownContainer, { flex: 1 }]}
            textStyle={styles.dropdownText}
            zIndex={3000}
          />
          
          <DropDownPicker
            open={openSemester}
            value={selectedSemester}
            items={semesterOptions}
            setOpen={setOpenSemester}
            setValue={setSelectedSemester}
            setItems={setSemesterOptions}
            onChangeValue={handleSemesterChange}
            onOpen={handleOpenSemester}
            placeholder="Select Semester"
            style={[
              styles.dropdown,
              !selectedClass && styles.dropdownDisabled
            ]}
            containerStyle={[styles.dropdownContainer, { flex: 1, marginLeft: 8 }]}
            textStyle={styles.dropdownText}
            disabled={!selectedClass}
            disabledStyle={styles.dropdownDisabled}
            zIndex={2000}
          />
        </View>

        <DropDownPicker
          open={openSubject}
          value={selectedSubject}
          items={subjectOptions}
          setOpen={setOpenSubject}
          setValue={setSelectedSubject}
          setItems={setSubjectOptions}
          onOpen={handleOpenSubject}
          placeholder="Select Subject"
          style={[
            styles.dropdown,
            (!selectedClass || !selectedSemester) && styles.dropdownDisabled
          ]}
          containerStyle={[styles.dropdownContainer, { marginTop: 8 }]}
          textStyle={styles.dropdownText}
          disabled={!selectedClass || !selectedSemester}
          disabledStyle={styles.dropdownDisabled}
          zIndex={1000}
        />
      </View>

      <ScrollView
        style={styles.dates}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {dates.map((date, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDate(date.date)}
            style={[
              styles.dateItemsContainer,
              date.date === selectedDate ? { backgroundColor: "#3085fd" } : {},
            ]}
          >
            <Text
              style={[
                styles.dateDay,
                date.date === selectedDate ? { color: "white" } : {},
              ]}
            >
              {date.date.split("-")[2]}
            </Text>
            <Text
              style={[
                styles.dateItems,
                date.date === selectedDate ? { color: "white" } : {},
              ]}
            >
              {date.day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <StudentAttendanceList 
        students={studentsList}
        selectedDate={selectedDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  dropdownsContainer: {
    marginBottom: 10,
  },
  topDropdowns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownContainer: {
    height: 40,
  },
  dropdown: {
    borderColor: "#ddd",
    borderRadius: 8,
    minHeight: 40,
  },
  dropdownDisabled: {
    opacity: 0.6,
    backgroundColor: "#f5f5f5",
  },
  dropdownText: {
    fontSize: 14,
  },
  dates: {
    flexGrow: 0,
  },
  dateItemsContainer: {
    aspectRatio: 1,
    width: 70,
    borderRadius: 13,
    backgroundColor: "white",
    marginRight: 5,
    marginLeft: 2,
    marginVertical: 1,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1,
  },
  dateItems: {
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "Ralewaymedium",
    fontSize: 12,
  },
  dateDay: {
    fontSize: 30,
    fontFamily: "Ralewaybold",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
