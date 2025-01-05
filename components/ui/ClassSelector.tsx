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
  return (
    <View style={styles.container}>
      {classOptions.map((classOption) => (
        <View key={classOption.course} style={styles.classSection}>
          <Text style={styles.className}>{classOption.course}</Text>
          <Text style={styles.semesterName}>{classOption.semesterData.sem}</Text>
          <View style={styles.subjectsContainer}>
            {classOption.semesterData.subjects.map((subject: string) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectButton,
                  selectedClass === classOption.course &&
                  selectedSemester === classOption.semesterData.sem &&
                  selectedSubject === subject &&
                  styles.selectedSubject,
                ]}
                onPress={() => onSelect(classOption.course, classOption.semesterData.sem, subject)}
              >
                <Text style={[
                  styles.subjectText,
                  selectedClass === classOption.course &&
                  selectedSemester === classOption.semesterData.sem &&
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
