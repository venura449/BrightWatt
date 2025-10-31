import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Lesson } from '../../lib/api';
import { getBackendUrl } from '../../lib/helpers.js';

interface LessonDetailScreenProps {
  route: {
    params: {
      lessonId: string;
    };
  };
}

const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({ route }) => {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      
      

      const response = await fetch(`${getBackendUrl()}/api/lessons/${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLesson(data.data.lesson);
        } else {
          setError(data.message || 'Failed to fetch lesson');
        }
      } else {
        setError('Failed to fetch lesson');
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenYouTube = () => {
    if (lesson?.youtubeUrl) {
      Linking.openURL(lesson.youtubeUrl);
    }
  };

  const handleOpenResource = (url: string) => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={40} color="#ef4444" />
        <Text style={styles.errorText}>Error: {error || 'Lesson not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLesson}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.thumbnail}>{lesson.thumbnail}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{lesson.title}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, styles[`difficulty${lesson.difficulty}`]]}>
              <Text style={styles.difficultyText}>{lesson.difficulty}</Text>
            </View>
            <Text style={styles.duration}>{lesson.duration}</Text>
            <Text style={styles.category}>{lesson.category}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{lesson.description}</Text>
      </View>

      {/* Learning Objectives */}
      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Objectives</Text>
          {lesson.learningObjectives.map((objective, index) => (
            <View key={index} style={styles.objectiveItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.objectiveText}>{objective}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Prerequisites */}
      {lesson.prerequisites && lesson.prerequisites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prerequisites</Text>
          {lesson.prerequisites.map((prereq, index) => (
            <View key={index} style={styles.prereqItem}>
              <Text style={styles.prereqTitle}>{prereq.title}</Text>
              <Text style={styles.prereqDescription}>{prereq.description}</Text>
              <View style={[styles.difficultyBadge, styles[`difficulty${prereq.difficulty}`]]}>
                <Text style={styles.difficultyText}>{prereq.difficulty}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Tags */}
      {lesson.tags && lesson.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {lesson.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* YouTube Video */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Video Lesson</Text>
        <TouchableOpacity style={styles.youtubeButton} onPress={handleOpenYouTube}>
          <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
        </TouchableOpacity>
      </View>

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          {lesson.resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceItem}
              onPress={() => handleOpenResource(resource.url)}
            >
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceType}>{resource.type}</Text>
              </View>
              <Text style={styles.resourceLink}>Open →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quiz Section */}
      {lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiz</Text>
          <Text style={styles.quizInfo}>
            This lesson includes a {lesson.quiz.questions.length}-question quiz to test your knowledge.
          </Text>
          <TouchableOpacity style={styles.quizButton}>
            <Text style={styles.quizButtonText}>Take Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  thumbnail: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 8,
  },
  difficultyBeginner: {
    backgroundColor: '#d4edda',
  },
  difficultyIntermediate: {
    backgroundColor: '#fff3cd',
  },
  difficultyAdvanced: {
    backgroundColor: '#f8d7da',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  objectiveItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  prereqItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  prereqTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  prereqDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  youtubeButton: {
    backgroundColor: '#ff0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  youtubeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  resourceType: {
    fontSize: 12,
    color: '#666',
  },
  resourceLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  quizInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  quizButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LessonDetailScreen;
