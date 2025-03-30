// screens/JobsScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  TextInput,
  SafeAreaView,
  Dimensions,
  Animated,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBookmarks } from '../context/BookmarkContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const THEME_COLORS = {
  primary: '#4361ee',
  secondary: '#4895ef',
  gradient: ['#4361ee', '#4895ef'],
  background: '#f5f7fa',
  card: '#ffffff',
  text: '#333333',
  accent: '#3f37c9',
  success: '#4cc9f0',
  muted: '#8d99ae'
};

const JobsScreen = ({ navigation }) => {
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const fetchJobs = async (reset = false) => {
    try {
      if (reset) {
        setJobs([]);
        setPage(1);
      }
      
      console.log("Fetching jobs...");
      const response = await fetch(`https://testapi.getlokalapp.com/common/jobs?page=${reset ? 1 : page}`);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);

      if (Array.isArray(data.results)) {
        if (reset) {
          setJobs(data.results);
        } else {
          setJobs(prevJobs => [...prevJobs, ...data.results]);
        }
      } else {
        console.error("Unexpected API response format:", data);
        setError("Unexpected response format.");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs(true);
  };

  const toggleBookmark = async (job) => {
    try {
      const storedJobs = await AsyncStorage.getItem('bookmarkedJobs');
      const currentBookmarks = storedJobs ? JSON.parse(storedJobs) : [];
      let updatedBookmarks;

      if (currentBookmarks.some(bookmarkedJob => bookmarkedJob.id === job.id)) {
        updatedBookmarks = currentBookmarks.filter(bookmarkedJob => bookmarkedJob.id !== job.id);
        removeBookmark(job.id);
      } else {
        updatedBookmarks = [...currentBookmarks, job];
        addBookmark(job);
      }

      await AsyncStorage.setItem('bookmarkedJobs', JSON.stringify(updatedBookmarks));
      setBookmarkedJobs(updatedBookmarks);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  useEffect(() => {
    const loadBookmarkedJobs = async () => {
      try {
        const storedJobs = await AsyncStorage.getItem('bookmarkedJobs');
        if (storedJobs) {
          setBookmarkedJobs(JSON.parse(storedJobs));
        }
      } catch (error) {
        console.error('Error loading bookmarked jobs:', error);
      }
    };
    loadBookmarkedJobs();
    
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchJobs();
  }, [page]);

  const isBookmarked = (job) => bookmarks.some(bookmarkedJob => bookmarkedJob.id === job.id);

  const hasValidDetails = (job) => job && (job.title || job.primary_details || job.whatsapp_no || job.views || job.shares);

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return hasValidDetails(job);
    const query = searchQuery.toLowerCase();
    return (
      (job.title && job.title.toLowerCase().includes(query)) ||
      (job.primary_details && job.primary_details.Place && 
       job.primary_details.Place.toLowerCase().includes(query)) ||
      (job.primary_details && job.primary_details.Salary && 
       job.primary_details.Salary.toLowerCase().includes(query))
    );
  });

  const renderJobItem = ({ item, index }) => {
    const isJobBookmarked = isBookmarked(item);
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0]
    });
    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });
    
    return (
      <Animated.View
        style={[
          { transform: [{ translateY }], opacity },
          { transitionDelay: index * 100 }
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('JobDetails', { job: item })}
        >
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(67, 97, 238, 0.05)', 'rgba(72, 149, 239, 0.1)']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.cardHeader}>
              <View style={styles.logoContainer}>
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>
                    {item.company_name ? item.company_name.charAt(0).toUpperCase() : "J"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.bookmarkButton} 
                onPress={() => toggleBookmark(item)}
              >
                <Ionicons 
                  name={isJobBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={isJobBookmarked ? THEME_COLORS.primary : THEME_COLORS.muted} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.jobTitle}>{typeof item.title === 'object' ? JSON.stringify(item.title) : item.title}</Text>
              
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{typeof item.company_name === 'object' ? JSON.stringify(item.company_name) : item.company_name || 'Company Name'}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {item.primary_details && item.primary_details.Job_Type ? 
                      (typeof item.primary_details.Job_Type === 'object' 
                        ? JSON.stringify(item.primary_details.Job_Type) 
                        : item.primary_details.Job_Type) 
                      : 'Full-time'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="location-on" size={16} color="#fff" />
                  </View>
                  <Text style={styles.detailValue}>
                    {item.primary_details && item.primary_details.Place ? 
                      (typeof item.primary_details.Place === 'object' 
                        ? JSON.stringify(item.primary_details.Place) 
                        : item.primary_details.Place) 
                      : 'Location not specified'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="attach-money" size={16} color="#fff" />
                  </View>
                  <Text style={styles.detailValue}>
                    {item.primary_details && item.primary_details.Salary ? 
                      (typeof item.primary_details.Salary === 'object' 
                        ? JSON.stringify(item.primary_details.Salary) 
                        : item.primary_details.Salary) 
                      : 'Salary not specified'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="phone" size={16} color="#fff" />
                  </View>
                  <Text style={styles.detailValue}>
                    {typeof item.whatsapp_no === 'object' 
                      ? JSON.stringify(item.whatsapp_no) 
                      : item.whatsapp_no || 'Contact not available'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="visibility" size={16} color={THEME_COLORS.muted} />
                    <Text style={styles.statText}>{typeof item.views === 'object' ? JSON.stringify(item.views) : item.views || '0'} views</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons name="share" size={16} color={THEME_COLORS.muted} />
                    <Text style={styles.statText}>{typeof item.shares === 'object' ? JSON.stringify(item.shares) : item.shares || '0'} shares</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.applyButton}>
                  <LinearGradient
                    colors={THEME_COLORS.gradient}
                    style={styles.applyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.applyButtonText}>Apply Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={THEME_COLORS.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Job Portal</Text>
          <Text style={styles.headerSubtitle}>Find your dream job today</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs by title, location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading && filteredJobs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="red" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (jobs.length > 0 && !searchQuery) {
              setJobs(prevJobs => [...prevJobs, ...prevJobs]);
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME_COLORS.primary]}
              tintColor={THEME_COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery ? "No jobs found matching your search" : "No jobs available at the moment"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.15)',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  logoContainer: {
    borderRadius: 14,
    padding: 3,
    backgroundColor: 'white',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.1)',
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookmarkButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.1)',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.2)',
  },
  statusText: {
    fontSize: 12,
    color: THEME_COLORS.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(67, 97, 238, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    color: THEME_COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  applyButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  }
});

export default JobsScreen;
