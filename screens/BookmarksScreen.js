// screens/BookmarksScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView
} from 'react-native';
import { useBookmarks } from '../context/BookmarkContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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

const BookmarksScreen = ({ navigation }) => {
  const { bookmarks, removeBookmark } = useBookmarks();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
    
    // Set up header styling for the screen
    navigation.setOptions({
      headerShown: false // Hide the navigation header since we'll use our custom header
    });
  }, []);
  
  const confirmRemoveBookmark = (jobId) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this job from your bookmarks?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeBookmark(jobId)
        }
      ]
    );
  };
  
  const renderBookmarkItem = ({ item, index }) => {
    const itemFade = Animated.multiply(
      fadeAnim,
      new Animated.Value(1 - index * 0.1 > 0 ? 1 - index * 0.1 : 0.1)
    );
    
    return (
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: itemFade,
            transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(index + 1)) }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('JobDetails', { job: item })}
        >
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
            <View style={styles.jobTitleContainer}>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {typeof item.title === 'object' ? JSON.stringify(item.title) : item.title}
              </Text>
              <Text style={styles.companyName} numberOfLines={1}>
                {typeof item.company_name === 'object' ? JSON.stringify(item.company_name) : item.company_name || 'Company Name'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.bookmarkButton} 
              onPress={() => confirmRemoveBookmark(item.id)}
            >
              <Ionicons name="bookmark" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="location-on" size={16} color="#fff" />
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>
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
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.primary_details && item.primary_details.Salary ? 
                  (typeof item.primary_details.Salary === 'object' 
                    ? JSON.stringify(item.primary_details.Salary) 
                    : item.primary_details.Salary) 
                  : 'Salary not specified'}
              </Text>
            </View>
            
            <View style={styles.jobTypeContainer}>
              <Text style={styles.jobTypeText}>
                {item.primary_details && item.primary_details.Job_Type ? 
                  (typeof item.primary_details.Job_Type === 'object' 
                    ? JSON.stringify(item.primary_details.Job_Type) 
                    : item.primary_details.Job_Type) 
                  : 'Full-time'}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => navigation.navigate('JobDetails', { job: item })}
            >
              <LinearGradient
                colors={THEME_COLORS.gradient}
                style={styles.viewDetailsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <LinearGradient
        colors={THEME_COLORS.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <Text style={styles.headerSubtitle}>
            {bookmarks.length} {bookmarks.length === 1 ? 'job' : 'jobs'} saved
          </Text>
        </View>
      </LinearGradient>
      
      {bookmarks.length === 0 ? (
        <Animated.View 
          style={[
            styles.noBookmarksContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.emptyStateIconContainer}>
            <Ionicons name="bookmark-outline" size={80} color="#ccc" />
          </View>
          <Text style={styles.noBookmarksText}>No Saved Jobs</Text>
          <Text style={styles.noBookmarksSubText}>
            Jobs you bookmark will appear here for easy access
          </Text>
          <TouchableOpacity 
            style={styles.browseJobsButton}
            onPress={() => navigation.navigate('JobsStack')}
          >
            <Text style={styles.browseJobsText}>Browse Jobs</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookmarkItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  animatedContainer: {
    width: '100%',
  },
  listContent: {
    padding: 16,
    paddingTop: 5,
    paddingBottom: 30,
  },
  card: {
    marginTop: 15,
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 16,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 7,
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
    alignItems: 'center',
  },
  logoContainer: {
    borderRadius: 12,
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
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  jobTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
    marginVertical: 12,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#555',
    marginLeft: 0,
    flex: 1,
    fontWeight: '500',
  },
  jobTypeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.2)',
  },
  jobTypeText: {
    fontSize: 12,
    color: THEME_COLORS.primary,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  viewDetailsButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  viewDetailsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginRight: 6,
  },
  noBookmarksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(74, 110, 224, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noBookmarksText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noBookmarksSubText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseJobsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
  },
  browseJobsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default BookmarksScreen;
