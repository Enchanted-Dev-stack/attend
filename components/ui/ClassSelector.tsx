import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ClassSelectorProps {
  selectedClass: string | null;
  selectedSemester: string | null;
  selectedSubject: string | null;
  classOptions: Array<{ course: string; semesterData: any }>;
  onSelect: (course: string, semester: string, subject: string) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedClass,
  selectedSemester,
  selectedSubject,
  classOptions,
  onSelect,
}) => {
  const groupedClasses = classOptions.reduce((acc, { course, semesterData }) => {
    if (!acc[course]) {
      acc[course] = [];
    }
    acc[course].push(semesterData);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <View style={styles.container}>
      {Object.entries(groupedClasses).map(([course, semesters]) => (
        <View key={course} style={styles.classSection}>
          <Text style={styles.className}>{course}</Text>
          {semesters.map((semesterData) => (
            <View key={semesterData.sem}>
              <Text style={styles.semesterName}>{semesterData.sem}</Text>
              <View style={styles.subjectsContainer}>
                {semesterData.subjects.map((subject: string) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectButton,
                      selectedClass === course &&
                      selectedSemester === semesterData.sem &&
                      selectedSubject === subject &&
                      styles.selectedSubject,
                    ]}
                    onPress={() => onSelect(course, semesterData.sem, subject)}
                  >
                    <Text style={[
                      styles.subjectText,
                      selectedClass === course &&
                      selectedSemester === semesterData.sem &&
                      selectedSubject === subject &&
                      styles.selectedSubjectText,
                    ]}>
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  classSection: {
    marginBottom: 16,
  },
  className: {
    fontSize: 18,
    fontFamily: 'Ralewaymedium',
    color: '#000',
    marginBottom: 4,
  },
  semesterName: {
    fontSize: 14,
    fontFamily: 'Ralewaymedium',
    color: '#666',
    marginBottom: 12,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 100,
  },
  selectedSubject: {
    backgroundColor: '#007AFF',
  },
  subjectText: {
    fontSize: 13,
    fontFamily: 'Ralewaymedium',
    color: '#333',
  },
  selectedSubjectText: {
    color: '#fff',
  },
});

export default ClassSelector;
