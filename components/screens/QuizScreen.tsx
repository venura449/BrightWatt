import { getBackendUrl } from '@/lib/helpers';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { globalState } from '../../lib/globalState';

interface QuizQuestion {
  id: string;
  questionNumber: number;
  question: string;
  category: string;
  difficulty: string;
  points: number;
}

interface QuizAnswer {
  questionId: string;
  userAnswer: 'yes' | 'no';
}

const QuizScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'quiz' | 'results'>('setup');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [categories, setCategories] = useState([]);

  const [quizId, setQuizId] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getBackendUrl()}/api/quiz/categories`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load quiz categories');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      setQuizLoading(true);

      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
      if (selectedDifficulty !== 'all') queryParams.append('difficulty', selectedDifficulty);

      const response = await fetch(
        `${getBackendUrl()}/api/quiz/random?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${globalState.getToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setQuizId(data.data.quizId);
        setQuestions(data.data.questions);
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setStartTime(new Date());
        setCurrentStep('quiz');
      } else {
        Alert.alert('Error', data.message || 'Failed to start quiz');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      Alert.alert('Error', 'Failed to start quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const answerQuestion = (answer: 'yes' | 'no') => {
    const currentQuestion = questions[currentQuestionIndex];

    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);

    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex].userAnswer = answer;
    } else {
      newAnswers.push({
        questionId: currentQuestion.id,
        userAnswer: answer,
      });
    }

    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: QuizAnswer[]) => {
    try {
      setSubmitting(true);

      const endTime = new Date();
      const timeSpent = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;

      const response = await fetch(`${getBackendUrl()}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalState.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId,
          answers: finalAnswers,
          timeSpent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep('results');
      } else {
        Alert.alert('Error', data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSetup = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Solar Energy Quiz</Text>
        <Text style={styles.subtitle}>Test your knowledge and earn points!</Text>
      </View>

      <View style={styles.setupSection}>
        <Text style={styles.sectionTitle}>Choose Quiz Settings</Text>

        <View style={styles.optionGroup}>
          <Text style={styles.optionLabel}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === 'all' && styles.categoryButtonTextActive,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {categories.map((category: any) => (
              <TouchableOpacity
                key={category._id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category._id && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category._id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category._id && styles.categoryButtonTextActive,
                  ]}
                >
                  {category._id.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.startButton, quizLoading && styles.startButtonDisabled]}
          onPress={startQuiz}
          disabled={quizLoading}
        >
          {quizLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.startButtonText}>Start Quiz</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderQuiz = () => {
    if (questions.length === 0) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.quizHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Alert.alert(
                'Exit Quiz?',
                'Are you sure you want to exit? Your progress will be lost.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Exit', style: 'destructive', onPress: () => setCurrentStep('setup') },
                ]
              );
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerButton, styles.yesButton]}
              onPress={() => answerQuestion('yes')}
            >
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.answerButtonText}>YES</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerButton, styles.noButton]}
              onPress={() => answerQuestion('no')}
            >
              <Ionicons name="close-circle" size={32} color="#F44336" />
              <Text style={styles.answerButtonText}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {submitting && (
          <View style={styles.submittingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.submittingText}>Submitting your quiz...</Text>
          </View>
        )}
      </SafeAreaView>
    );
  };

  const renderResults = () => (
    <View style={styles.container}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>🎉 Quiz Complete!</Text>
        <Text style={styles.resultsSubtitle}>Great job! Check your results below.</Text>
      </View>

      <TouchableOpacity style={styles.retryButton} onPress={() => setCurrentStep('setup')}>
        <Text style={styles.retryButtonText}>Take Another Quiz</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading quiz categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentStep === 'setup' && renderSetup()}
      {currentStep === 'quiz' && renderQuiz()}
      {currentStep === 'results' && renderResults()}
    </View>
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  setupSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  optionGroup: {
    marginBottom: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minWidth: 120,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    lineHeight: 28,
    marginBottom: 40,
  },
  answerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 3,
  },
  yesButton: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  noButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  answerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  submittingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submittingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resultsHeader: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuizScreen;
