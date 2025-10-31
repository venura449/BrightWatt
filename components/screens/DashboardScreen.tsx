import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lesson } from "../../lib/api";
import { globalState } from "../../lib/globalState";
import { getBackendUrl } from "../../lib/helpers.js";
import FilterDropdown from "../Dropdown";
import VideoModal from "../VideoModal";

// Tab Components
const HomeTab = ({ navigation, router }: { navigation: any; router: any }) => {
  const [user, setUser] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from global variables
    const storedUser = globalState.getUser();
    if (storedUser) {
      setUser(storedUser);
    }

    // Fetch lessons
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${getBackendUrl()}/api/lessons`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLessons(data.data.lessons || []);
        }
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const userName = user ? `${user.firstName}` : "User";

  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <FontAwesome name="sun-o" size={40} color="#f59e0b" />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>
              Welcome to BrightWatt, {userName}!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Your guide to solar energy
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <FontAwesome name="lightbulb-o" size={24} color="#10b981" />
          <Text style={styles.statNumber}>
            {loading ? "..." : lessons.length}
          </Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
        <View style={styles.statCard}>
          <FontAwesome name="trophy" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>
            {loading ? "..." : (user?.learningStats?.totalPoints || 0)}
          </Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <FontAwesome name="fire" size={24} color="#ef4444" />
          <Text style={styles.statNumber}>
            {loading ? "..." : (user?.learningStats?.currentStreak || 0)}
          </Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity onPress={() => router.push("/achievements")}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.achievementsPreview}>
          <View style={styles.achievementPreviewCard}>
            <Text style={styles.achievementIcon}>🏆</Text>
            <Text style={styles.achievementTitle}>First Steps</Text>
            <Text style={styles.achievementDesc}>Complete your first lesson</Text>
          </View>
          <View style={styles.achievementPreviewCard}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <Text style={styles.achievementTitle}>Consistent Learner</Text>
            <Text style={styles.achievementDesc}>3-day learning streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Learning</Text>
        <TouchableOpacity style={styles.featuredCard}>
          <View style={styles.featuredIcon}>
            <FontAwesome size={30} color="#10b981" />
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>Solar Panel Basics</Text>
            <Text style={styles.featuredDesc}>
              Learn how solar panels work and their benefits
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "60%" }]} />
            </View>
            <Text style={styles.progressText}>60% Complete</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quizCard}
          onPress={() => router.push('/quiz')}
        >
          <View style={styles.quizIcon}>
            <FontAwesome name="question-circle" size={30} color="#FF6B35" />
          </View>
          <View style={styles.quizContent}>
            <Text style={styles.quizTitle}>Test Your Knowledge</Text>
            <Text style={styles.quizDesc}>
              Take a quiz and earn points! 10 random questions
            </Text>
            <View style={styles.quizBadge}>
              <Text style={styles.quizBadgeText}>🎯 +Points</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Daily Solar Tip</Text>
        <View style={styles.tipCard}>
          <FontAwesome name="lightbulb-o" size={24} color="#f59e0b" />
          <Text style={styles.tipText}>
            "Solar panels work best when they face south and are tilted at an
            angle equal to your latitude."
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const LearnTab = ({ navigation, router }: { navigation: any; router: any }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchLessons();
  }, [selectedDifficulty, selectedCategory]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${getBackendUrl()}/api/lessons`;
      const params = new URLSearchParams();

      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }
      if (selectedDifficulty) {
        params.append("difficulty", selectedDifficulty); // ✅ make sure this line exists
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLessons(data.data.lessons || []);
        } else {
          setError(data.message || "Failed to fetch lessons");
        }
      } else {
        setError("Failed to fetch lessons");
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchLessons();
    }
  };

  const handleRefresh = () => {
    fetchLessons();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Will trigger useEffect to refetch
  };
  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    // Will trigger useEffect to refetch
    console.log("difficulty", difficulty);
  };
  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.youtubeUrl) {
      setCurrentVideo(lesson);
      setVideoModalVisible(true);
    }
  };

  const closeVideoModal = () => {
    setVideoModalVisible(false);
    setCurrentVideo(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "#10b981";
      case "Intermediate":
        return "#f59e0b";
      case "Advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const categories = [
    "All",
    "Solar Panels",
    "Home Installation",
    "Battery Storage",
    "Cost Analysis",
    "Maintenance",
    "Troubleshooting",
  ];

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={40} color="#ef4444" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLessons}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          colors={["#3b82f6"]}
        />
      }
    >
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={16} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search solar topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.categoriesSection}>
        {/* Top line: Title and Filter */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Learning Categories</Text>
          <FilterDropdown
            value={selectedDifficulty}
            onValueChange={handleDifficultyChange}
            items={[
              { label: "All", value: "" },
              { label: "Beginner", value: "Beginner" },
              { label: "Intermediate", value: "Intermediate" },
              { label: "Advanced", value: "Advanced" },
            ]}
            placeholder="Difficulty Filter"
            containerStyle={styles.filterIconStyle}
          />
        </View>

        {/* Next line: Categories ScrollView */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip,
              ]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category &&
                    styles.selectedCategoryChipText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.lessonsSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "All"
            ? "All Lessons"
            : `${selectedCategory} Lessons`}
          <Text style={styles.lessonCount}> ({lessons.length})</Text>
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading lessons...</Text>
          </View>
        ) : (
          lessons.map((lesson) => (
            <TouchableOpacity
              key={lesson._id}
              style={styles.lessonCard}
              onPress={() => handleLessonPress(lesson)}
            >
              <View style={styles.lessonThumbnail}>
                <Text style={styles.lessonThumbnailText}>
                  {lesson.thumbnail}
                </Text>
              </View>
              <View style={styles.lessonContent}>
                <View style={styles.lessonHeader}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor: getDifficultyColor(lesson.difficulty),
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {lesson.difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={styles.lessonDesc}>{lesson.description}</Text>
                <View style={styles.lessonMeta}>
                  <Text style={styles.lessonDuration}>
                    ⏱️ {lesson.duration}
                  </Text>
                  <Text style={styles.lessonCategory}>
                    📁 {lesson.category}
                  </Text>
                </View>
                {lesson.tags && lesson.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {lesson.tags.slice(0, 2).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.lessonAction}>
                <FontAwesome name="play-circle" size={24} color="#3b82f6" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Video Modal */}
      <VideoModal
        videoModalVisible={videoModalVisible}
        closeVideoModal={closeVideoModal}
        currentVideo={currentVideo}
      />
    </ScrollView>
  );
};

const CommunityTab = ({ navigation, router }: { navigation: any; router: any }) => {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [communityDesc, setCommunityDesc] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([]);

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    filterCommunities();
  }, [searchQuery, selectedFilter, communities]);

  const fetchCommunities = async () => {
    try {
      setLoadingCommunities(true);
      const response = await fetch(`${getBackendUrl()}/api/communities`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const communitiesData = Array.isArray(data.data)
            ? data.data
            : data.data.communities || [];
          setCommunities(communitiesData);
        }
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoadingCommunities(false);
    }
  };

  const openCreate = () => setIsCreateVisible(true);
  const closeCreate = () => setIsCreateVisible(false);

  const filterCommunities = () => {
    let filtered = communities;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (community) =>
          community.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          community.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter) {
      switch (selectedFilter) {
        case "recent":
          filtered = filtered.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );
          break;
        case "popular":
          filtered = filtered.sort(
            (a, b) => (b.membersCount || 0) - (a.membersCount || 0)
          );
          break;
        case "active":
          filtered = filtered.filter(
            (community) => community.isActive !== false
          );
          break;
        case "new":
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          filtered = filtered.filter(
            (community) => new Date(community.createdAt || 0) > oneWeekAgo
          );
          break;
      }
    }

    setFilteredCommunities(filtered);
  };

  const handleCreateCommunity = async () => {
    if (!communityName.trim()) {
      Alert.alert("Name required", "Please enter a community name.");
      return;
    }
    try {
      const response = await fetch(`${getBackendUrl()}/api/communities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(globalState.getToken()
            ? { Authorization: `Bearer ${globalState.getToken()}` }
            : {}),
        },
        body: JSON.stringify({
          name: communityName.trim(),
          description: communityDesc.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create community");
      }
      Alert.alert(
        "Community created",
        `“${data.data.community.name}” has been created.`
      );
      setCommunityName("");
      setCommunityDesc("");
      closeCreate();
      // Refresh the communities list
      fetchCommunities();
    } catch (err: any) {
      console.error("Create community error:", err);
      Alert.alert("Error", err.message || "Failed to create community");
    }
  };

  return (
    <>
      <ScrollView style={styles.tabContent}>
        <View style={styles.communityHeader}>
          <View style={styles.communityHeaderRow}>
            <Text style={styles.sectionTitle}>Solar Communities</Text>
            <TouchableOpacity
              style={styles.addCommunityButton}
              onPress={openCreate}
            >
              <FontAwesome name="plus" size={14} color="#fff" />
              <Text style={styles.addCommunityButtonText}>Add Community</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search and Filter Section */}
        <View style={styles.searchFilterSection}>
          <View style={styles.searchBar}>
            <FontAwesome name="search" size={16} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === "" && styles.selectedFilterChip,
              ]}
              onPress={() => setSelectedFilter("")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === "" && styles.selectedFilterChipText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === "recent" && styles.selectedFilterChip,
              ]}
              onPress={() => setSelectedFilter("recent")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === "recent" && styles.selectedFilterChipText,
                ]}
              >
                Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === "popular" && styles.selectedFilterChip,
              ]}
              onPress={() => setSelectedFilter("popular")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === "popular" && styles.selectedFilterChipText,
                ]}
              >
                Popular
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === "active" && styles.selectedFilterChip,
              ]}
              onPress={() => setSelectedFilter("active")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === "active" && styles.selectedFilterChipText,
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === "new" && styles.selectedFilterChip,
              ]}
              onPress={() => setSelectedFilter("new")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === "new" && styles.selectedFilterChipText,
                ]}
              >
                New
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Communities Section */}
        <View style={styles.communitiesSection}>
          {loadingCommunities ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading communities...</Text>
            </View>
          ) : filteredCommunities.length > 0 ? (
            filteredCommunities.map((community) => (
              <TouchableOpacity
                key={community._id || community.id}
                style={styles.communityCard}
                onPress={() =>
                        router.push({
                          pathname: "/CommunityChat",
                          params: {
                            _id: community._id || community.id,
                            name: community.name || "Unnamed Community",
                            description: community.description || "",
                            membersCount: community.membersCount || 1,
                            createdAt:
                              community.createdAt || new Date().toISOString(),
                            updatedAt:
                              community.updatedAt || new Date().toISOString(),
                            isActive:
                              community.isActive !== false ? "true" : "false",
                            isPrivate: community.isPrivate ? "true" : "false",
                            maxMembers: community.maxMembers || 1000,
                            members: JSON.stringify(community.members || []),
                            createdBy:
                              community.createdBy || community.creator || "",
                          },
                        })
                      }
              >
                <View style={styles.communityIcon}>
                  <FontAwesome name="users" size={24} color="#10b981" />
                </View>
                <View style={styles.communityContent}>
                  <View style={styles.communityHeaderRow}>
                    <Text style={styles.communityTitle}>
                      {community.name || "Unnamed Community"}
                    </Text>
                    {/* <TouchableOpacity
                      style={styles.chatButton}
                      onPress={() =>
                        router.push({
                          pathname: "/CommunityChat",
                          params: {
                            _id: community._id || community.id,
                            name: community.name || "Unnamed Community",
                            description: community.description || "",
                            membersCount: community.membersCount || 1,
                            createdAt:
                              community.createdAt || new Date().toISOString(),
                            updatedAt:
                              community.updatedAt || new Date().toISOString(),
                            isActive:
                              community.isActive !== false ? "true" : "false",
                            isPrivate: community.isPrivate ? "true" : "false",
                            maxMembers: community.maxMembers || 1000,
                            members: JSON.stringify(community.members || []),
                            createdBy:
                              community.createdBy || community.creator || "",
                          },
                        })
                      }
                    >
                      <FontAwesome name="comments" size={16} color="#3b82f6" />
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity> */}
                  </View>
                  {community.description && (
                    <Text style={styles.communityDesc}>
                      {community.description}
                    </Text>
                  )}
                  <View style={styles.communityMeta}>
                    <Text style={styles.communityMembers}>
                      {community.membersCount || 1} members
                    </Text>
                    <Text style={styles.communityDate}>
                      Created{" "}
                      {community.createdAt
                        ? new Date(community.createdAt).toLocaleDateString()
                        : "Recently"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCommunities}>
              <FontAwesome name="users" size={40} color="#9ca3af" />
              <Text style={styles.emptyCommunitiesText}>
                {searchQuery || selectedFilter
                  ? "No communities found"
                  : "No communities yet"}
              </Text>
              <Text style={styles.emptyCommunitiesSubtext}>
                {searchQuery || selectedFilter
                  ? "Try adjusting your search or filters"
                  : "Create your first community to get started!"}
              </Text>
            </View>
          )}
        </View>

        {/* Discover Communities Section */}
        <View style={styles.discoverSection}>
          <Text style={styles.sectionTitle}>Discover Communities</Text>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={() => router.push("/DiscoverCommunities")}
          >
            <FontAwesome name="search" size={16} color="#3b82f6" />
            <Text style={styles.discoverButtonText}>
              Browse All Communities
            </Text>
            <FontAwesome name="chevron-right" size={14} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.forumSection}>
          <Text style={styles.sectionTitle}>Discussion Forums</Text>

          <TouchableOpacity style={styles.forumCard}>
            <FontAwesome name="comments" size={24} color="#10b981" />
            <View style={styles.forumContent}>
              <Text style={styles.forumTitle}>Installation Questions</Text>
              <Text style={styles.forumDesc}>
                Get help with your solar installation
              </Text>
              <Text style={styles.forumStats}>24 posts • 156 replies</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forumCard}>
            <FontAwesome name="users" size={24} color="#3b82f6" />
            <View style={styles.forumContent}>
              <Text style={styles.forumTitle}>Success Stories</Text>
              <Text style={styles.forumDesc}>Share your solar journey</Text>
              <Text style={styles.forumStats}>18 posts • 89 replies</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>

          <TouchableOpacity style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>15</Text>
              <Text style={styles.eventMonth}>DEC</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Solar Workshop</Text>
              <Text style={styles.eventDesc}>
                Hands-on solar panel installation
              </Text>
              <Text style={styles.eventTime}>2:00 PM • Community Center</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>22</Text>
              <Text style={styles.eventMonth}>DEC</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Q&A Session</Text>
              <Text style={styles.eventDesc}>
                Ask solar experts your questions
              </Text>
              <Text style={styles.eventTime}>7:00 PM • Online</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.mentorSection}>
          <Text style={styles.sectionTitle}>Find a Mentor</Text>
          <TouchableOpacity style={styles.mentorCard}>
            <FontAwesome name="user-circle" size={40} color="#3b82f6" />
            <View style={styles.mentorContent}>
              <Text style={styles.mentorTitle}>Connect with Solar Experts</Text>
              <Text style={styles.mentorDesc}>
                Get personalized guidance from experienced professionals
              </Text>
              <TouchableOpacity style={styles.mentorButton}>
                <Text style={styles.mentorButtonText}>Find Mentor</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={isCreateVisible}
        animationType="fade"
        onRequestClose={closeCreate}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeCreate}
          style={styles.createModalOverlay}
        >
          <View style={styles.createModalContent}>
            <View style={styles.createModalHeader}>
              <Text style={styles.createModalTitle}>Create Community</Text>
              <TouchableOpacity
                onPress={closeCreate}
                style={styles.createModalClose}
              >
                <Text style={{ color: "#64748b", fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.createField}>
              <Text style={styles.createLabel}>Name</Text>
              <TextInput
                style={styles.createInput}
                placeholder="e.g. Solar DIY Enthusiasts"
                value={communityName}
                onChangeText={setCommunityName}
              />
            </View>

            <View style={styles.createField}>
              <Text style={styles.createLabel}>Description</Text>
              <TextInput
                style={[styles.createInput, styles.createTextarea]}
                placeholder="Describe your community's purpose"
                value={communityDesc}
                onChangeText={setCommunityDesc}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={styles.createActionButton}
              onPress={handleCreateCommunity}
            >
              <Text style={styles.createActionButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const ProfileTab = ({ navigation, router }: { navigation: any; router: any }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    loadUserData();
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/lessons`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLessons(data.data.lessons || []);
        }
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const loadUserData = async () => {
    try {
      // First try to get stored user data
      const storedUser = globalState.getUser();
      if (storedUser) {
        setUser(storedUser);
        setIsLoading(false);
        return;
      }

      // If no stored user, try to get from API
      const token = globalState.getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${getBackendUrl()}/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          globalState.setUser(data.data.user);
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const token = globalState.getToken();
            if (token) {
              await fetch(`${getBackendUrl()}/api/auth/logout`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
            }
          } catch (error) {
            console.error("Logout error:", error);
          } finally {
            // Clear stored data and redirect
            globalState.clearAll();
            router.push("/");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesome name="spinner" size={40} color="#3b82f6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={40} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load user data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profileData = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    energyProvider: user.energyProvider || "BrightWatt Energy",
    memberSince: new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    }),
    totalSavings: "$245.67", // This would come from energy data
    monthlyUsage: "850 kWh", // This would come from energy data
  };

  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <FontAwesome name="user-circle" size={60} color="#3b82f6" />
        </View>
        <Text style={styles.profileName}>{profileData.name}</Text>
        <Text style={styles.profileLocation}>Rural Village, Kenya</Text>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>{lessons.length}</Text>
            <Text style={styles.profileStatLabel}>Lessons</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>3</Text>
            <Text style={styles.profileStatLabel}>Certificates</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatNumber}>85%</Text>
            <Text style={styles.profileStatLabel}>Progress</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>

        <View style={styles.achievementCard}>
          <FontAwesome name="trophy" size={24} color="#f59e0b" />
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>Solar Basics Master</Text>
            <Text style={styles.achievementDesc}>
              Completed all beginner solar lessons
            </Text>
          </View>
        </View>

        <View style={styles.achievementCard}>
          <FontAwesome name="star" size={24} color="#10b981" />
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>Community Helper</Text>
            <Text style={styles.achievementDesc}>Helped 5 other learners</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome name="bell" size={20} color="#6b7280" />
          <Text style={styles.settingText}>Notifications</Text>
          <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome name="language" size={20} color="#6b7280" />
          <Text style={styles.settingText}>Language</Text>
          <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome name="download" size={20} color="#6b7280" />
          <Text style={styles.settingText}>Download Lessons</Text>
          <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome name="question-circle" size={20} color="#6b7280" />
          <Text style={styles.settingText}>Help & Support</Text>
          <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const DashboardScreen = ({ navigation }: { navigation: any }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, name: "Home", icon: "home", component: HomeTab },
    { id: 1, name: "Learn", icon: "graduation-cap", component: LearnTab },
    { id: 2, name: "Community", icon: "users", component: CommunityTab },
    { id: 3, name: "Profile", icon: "user", component: ProfileTab },
  ];

  const ActiveComponent = tabs[activeTab].component;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActiveComponent navigation={navigation} router={router} />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <FontAwesome
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? "#3b82f6" : "#9ca3af"}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },

  // Home Tab Styles
  welcomeSection: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeText: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  quickStats: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  featuredSection: {
    marginBottom: 20,
  },
  achievementsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  achievementsPreview: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementPreviewCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 15,
  },
  featuredCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredIcon: {
    marginRight: 15,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  featuredDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  quizCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 12,
  },
  quizIcon: {
    marginRight: 15,
  },
  quizContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  quizDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
  },
  quizBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  quizBadgeText: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginLeft: 15,
  },

  // Learn Tab Styles
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 10,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 16,
    color: "#9ca3af",
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterIconStyle: {
    marginRight: 0,
  },
  categoryScroll: {
    paddingVertical: 10,
  },
  categoryChip: {
    backgroundColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  selectedCategoryChip: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  selectedCategoryChipText: {
    color: "white",
  },
  lessonsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  lessonCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
  lessonCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonThumbnail: {
    width: 60,
    height: 60,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  lessonThumbnailText: {
    fontSize: 24,
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  lessonDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  lessonMeta: {
    flexDirection: "row",
    marginTop: 5,
  },
  lessonDuration: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
    marginRight: 15,
  },
  lessonCategory: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
  completionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5,
  },
  completionText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
    marginLeft: 5,
  },
  lessonAction: {
    marginLeft: 15,
  },
  tagsContainer: {
    flexDirection: "row",
    marginTop: 5,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },

  // Community Tab Styles
  communityHeader: {
    marginBottom: 20,
  },
  communityHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  communitySubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 5,
  },
  addCommunityButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCommunityButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  searchFilterSection: {
    marginBottom: 20,
  },
  filterScroll: {
    marginTop:20,
    paddingVertical: 5,
  },
  filterChip: {
    backgroundColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  selectedFilterChip: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  filterChipText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  selectedFilterChipText: {
    color: "white",
  },
  communitiesSection: {
    marginBottom: 20,
  },
  communityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communityIcon: {
    marginRight: 15,
  },
  communityContent: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  communityDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 20,
  },
  communityMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  communityMembers: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  communityDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyCommunities: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCommunitiesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCommunitiesSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  communityActions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3b82f6",
    marginLeft: 4,
  },
  discoverSection: {
    marginBottom: 20,
  },
  discoverButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  discoverButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginLeft: 12,
  },
  forumSection: {
    marginBottom: 20,
  },
  forumCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  forumContent: {
    flex: 1,
    marginLeft: 15,
  },
  forumTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  forumDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  forumStats: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  eventsSection: {
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventDate: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginRight: 15,
    minWidth: 50,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  eventMonth: {
    fontSize: 10,
    color: "white",
    fontWeight: "500",
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  eventDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  mentorSection: {
    marginBottom: 20,
  },
  mentorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mentorContent: {
    alignItems: "center",
    marginTop: 15,
  },
  mentorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 10,
    textAlign: "center",
  },
  mentorDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  mentorButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  mentorButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  createModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  createModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  createModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  createModalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  createField: {
    marginTop: 8,
    marginBottom: 10,
  },
  createLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
  },
  createInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  createTextarea: {
    height: 100,
    textAlignVertical: "top",
  },
  createActionButton: {
    backgroundColor: "#10b981",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  createActionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  // Profile Tab Styles
  profileHeader: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatar: {
    marginBottom: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: "row",
    gap: 30,
  },
  profileStat: {
    alignItems: "center",
  },
  profileStatNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 5,
  },
  profileStatLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  achievementsSection: {
    marginBottom: 20,
  },
  achievementCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementContent: {
    flex: 1,
    marginLeft: 15,
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    // Active state styling
  },
  tabLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});

export default DashboardScreen;
