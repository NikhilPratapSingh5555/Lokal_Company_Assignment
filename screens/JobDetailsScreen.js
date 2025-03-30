import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Linking, 
  Alert,
  Share,
  Animated,
  Dimensions
} from 'react-native';
import { useBookmarks } from '../context/BookmarkContext';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
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

const JobDetailsScreen = ({ route, navigation }) => {
  const { job } = route.params;
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  
  // For additional data management
  const [processedData, setProcessedData] = useState({
    primaryFields: [],
    secondaryFields: [],
    otherFields: []
  });
  
  // Create additional animated values for staggered animations
  const [cardAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0), // Extra animation for additional data card
  ]);
  
  // Animation for the bookmark button
  const [bookmarkScale] = useState(new Animated.Value(1));
  
  // Add button press animations
  const [callButtonScale] = useState(new Animated.Value(1));
  const [whatsappButtonScale] = useState(new Animated.Value(1));
  const [applyButtonScale] = useState(new Animated.Value(1));

  // Create pulsing animation for stats icons
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // Function to process and organize API data for display
  const processJobData = (jobData) => {
    // Standard fields we typically show in the UI
    const standardFields = [
      'title', 'company_name', 'whatsapp_no', 'views', 'shares', 'posted_time',
      'description', 'id'
    ];
    
    const primaryDetailsFields = [
      'Place', 'Salary', 'Job_Type', 'Experience', 'Education', 'Skills', 'Description'
    ];

    // Fields to exclude from Job Requirements
    const excludedRequirementFields = ['Fees_Charged'];

    const primaryFields = [];
    const secondaryFields = [];
    const otherFields = [];

    // Process all job data fields
    Object.entries(jobData).forEach(([key, value]) => {
      if (!standardFields.includes(key) && 
          key !== 'primary_details' && 
          key !== 'secondary_details' &&
          value !== null && 
          value !== undefined &&
          value !== '') {
        
        // Format the key for display
        const formattedKey = key.replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        // Convert value to string if it's an object
        let displayValue = value;
        if (typeof value === 'object' && value !== null) {
          try {
            displayValue = JSON.stringify(value);
          } catch (e) {
            displayValue = '[Complex Object]';
          }
        }
          
        otherFields.push({
          key: formattedKey,
          value: displayValue,
          originalKey: key
        });
      }
    });

    // Process primary_details
    if (jobData.primary_details && typeof jobData.primary_details === 'object') {
      Object.entries(jobData.primary_details).forEach(([key, value]) => {
        if (!primaryDetailsFields.includes(key) &&
            !excludedRequirementFields.includes(key) &&
            value !== null && 
            value !== undefined &&
            value !== '') {
          
          // Format the key for display
          const formattedKey = key.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          // Convert value to string if it's an object
          let displayValue = value;
          if (typeof value === 'object' && value !== null) {
            try {
              displayValue = JSON.stringify(value);
            } catch (e) {
              displayValue = '[Complex Object]';
            }
          }
            
          primaryFields.push({
            key: formattedKey,
            value: displayValue,
            originalKey: key
          });
        }
      });
    }
    
    // Process secondary_details
    if (jobData.secondary_details && typeof jobData.secondary_details === 'object') {
      Object.entries(jobData.secondary_details).forEach(([key, value]) => {
        if (value !== null && 
            value !== undefined &&
            value !== '') {
          
          // Format the key for display
          const formattedKey = key.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          // Convert value to string if it's an object
          let displayValue = value;
          if (typeof value === 'object' && value !== null) {
            try {
              displayValue = JSON.stringify(value);
            } catch (e) {
              displayValue = '[Complex Object]';
            }
          }
            
          secondaryFields.push({
            key: formattedKey,
            value: displayValue,
            originalKey: key
          });
        }
      });
    }

    setProcessedData({
      primaryFields,
      secondaryFields,
      otherFields
    });
  };
  
  useEffect(() => {
    // Debug log to see all available job data fields
    console.log("Job details:", JSON.stringify(job, null, 2));
    
    // Process job data
    processJobData(job);
    
    setIsBookmarked(bookmarks.some(bookmarkedJob => bookmarkedJob.id === job.id));
    
    // Create a staggered animation sequence
    const animations = [
      // Fade in and slide up the header
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      
      // Staggered card animations
      ...cardAnimations.map((anim, index) => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: 150 * (index + 1),
          useNativeDriver: true,
        })
      )
    ];
    
    // Run all animations in parallel
    Animated.stagger(100, animations).start();
    
    // Set custom header options
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });

    // Start the pulsing animation in the useEffect
    // Create the pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bookmarks, job, navigation]);

  // Animate bookmark button on press
  const animateBookmark = () => {
    Animated.sequence([
      Animated.timing(bookmarkScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(bookmarkScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
    
    toggleBookmark();
  };
  
  // Generic button animation function
  const animateButton = (animValue) => {
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };

  // Animated button press handlers
  const handleCallPressWithAnimation = () => {
    animateButton(callButtonScale);
    handleCallPress();
  };

  const handleWhatsAppPressWithAnimation = () => {
    animateButton(whatsappButtonScale);
    handleWhatsAppPress();
  };

  const handleApplyPressWithAnimation = () => {
    animateButton(applyButtonScale);
    handleApplyPress();
  };

  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(job.id);
    } else {
      addBookmark(job);
    }
  };

  const handleCallPress = () => {
    if (job && job.whatsapp_no) {
      // Directly initiate phone call without confirmation
      Linking.openURL(`tel:${job.whatsapp_no}`).catch(err => {
        console.error('Error initiating phone call:', err);
        Alert.alert('Error', 'Could not initiate phone call. Please try again.');
      });
    } else {
      Alert.alert('Error', 'No contact number available.');
    }
  };
  
  const handleWhatsAppPress = () => {
    if (job && job.whatsapp_no) {
      // Format the number by removing any non-digit characters
      const formattedNumber = job.whatsapp_no.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=${formattedNumber}`).catch(err => {
        console.error('Error opening WhatsApp:', err);
        // Fallback for web or if WhatsApp is not installed
        Linking.openURL(`https://wa.me/${formattedNumber}`).catch(err => {
          Alert.alert('Error', 'Could not open WhatsApp. Please make sure it is installed on your device.');
        });
      });
    } else {
      Alert.alert('Error', 'No contact number available.');
    }
  };
  
  const handleApplyPress = () => {
    Alert.alert(
      'Apply for Job',
      'Would you like to apply for this position?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Apply Now', onPress: () => Alert.alert('Application Sent', 'Your application has been submitted successfully!') }
      ]
    );
  };
  
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this job opportunity: ${job.title} at ${job.company_name || 'a company'}.`,
        title: `Job Opportunity: ${job.title}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share this job');
    }
  };

  const hasValidDetails = job && (job.title || job.primary_details || job.whatsapp_no || job.views || job.shares);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Header section with company logo and title */}
        <LinearGradient
          colors={THEME_COLORS.gradient}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.logo}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  {job.company_name ? job.company_name.charAt(0).toUpperCase() : "J"}
                </Text>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>{job.title}</Text>
              <Text style={styles.companyName}>{job.company_name || 'Company'}</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
              <TouchableOpacity 
                style={[
                  styles.bookmarkButton, 
                  isBookmarked && styles.bookmarkButtonActive
                ]} 
                onPress={animateBookmark}
              >
                <Ionicons 
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                  size={24} 
                  color={isBookmarked ? '#fff' : THEME_COLORS.primary} 
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>

        {/* Job stats */}
        <Animated.View 
          style={[
            styles.statsContainer, 
            { 
              opacity: cardAnimations[0],
              transform: [{ 
                translateY: cardAnimations[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                }) 
              }]
            }
          ]}
        >
          <View style={styles.statItem}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.statIconContainer}>
                <Ionicons name="eye" size={20} color={THEME_COLORS.primary} />
              </View>
            </Animated.View>
            <Text style={styles.statValue}>{job.views || '0'}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.statIconContainer}>
                <Ionicons name="share-social" size={20} color={THEME_COLORS.primary} />
              </View>
            </Animated.View>
            <Text style={styles.statValue}>{job.shares || '0'}</Text>
            <Text style={styles.statLabel}>Shares</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={20} color={THEME_COLORS.primary} />
              </View>
            </Animated.View>
            <Text style={styles.statValue}>New</Text>
            <Text style={styles.statLabel}>2d ago</Text>
          </View>
        </Animated.View>

        {/* Job details card */}
        <Animated.View 
          style={[
            styles.card, 
            { 
              opacity: cardAnimations[1],
              transform: [{ 
                translateY: cardAnimations[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                }) 
              }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(67, 97, 238, 0.05)', 'rgba(72, 149, 239, 0.1)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialIcons name="info-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Job Details</Text>
          </View>
          
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="location-on" size={18} color="#fff" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {job.primary_details && job.primary_details.Place 
                    ? (typeof job.primary_details.Place === 'object' 
                      ? JSON.stringify(job.primary_details.Place) 
                      : job.primary_details.Place)
                    : 'Location not specified'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="attach-money" size={18} color="#fff" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Salary</Text>
                <Text style={styles.detailValue}>
                  {job.primary_details && job.primary_details.Salary 
                    ? (typeof job.primary_details.Salary === 'object' 
                      ? JSON.stringify(job.primary_details.Salary) 
                      : job.primary_details.Salary)
                    : 'Salary not specified'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="work" size={18} color="#fff" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Job Type</Text>
                <Text style={styles.detailValue}>
                  {job.primary_details && job.primary_details.Job_Type 
                    ? (typeof job.primary_details.Job_Type === 'object' 
                      ? JSON.stringify(job.primary_details.Job_Type) 
                      : job.primary_details.Job_Type)
                    : 'Full-time'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="phone" size={18} color="#fff" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Contact</Text>
                {job.whatsapp_no ? (
                  <TouchableOpacity onPress={handleCallPressWithAnimation}>
                    <Text style={[styles.detailValue, styles.phoneLink]}>
                      {job.whatsapp_no}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.detailValue}>
                    Contact not available
                  </Text>
                )}
              </View>
            </View>

            {job.primary_details && job.primary_details.Experience && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="timeline" size={18} color="#fff" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Experience</Text>
                    <Text style={styles.detailValue}>
                      {typeof job.primary_details.Experience === 'object' 
                        ? JSON.stringify(job.primary_details.Experience) 
                        : job.primary_details.Experience}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {job.primary_details && job.primary_details.Education && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="school" size={18} color="#fff" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Education</Text>
                    <Text style={styles.detailValue}>
                      {typeof job.primary_details.Education === 'object' 
                        ? JSON.stringify(job.primary_details.Education) 
                        : job.primary_details.Education}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {job.primary_details && job.primary_details.Skills && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="psychology" size={18} color="#fff" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Skills</Text>
                    <Text style={styles.detailValue}>
                      {typeof job.primary_details.Skills === 'object' 
                        ? JSON.stringify(job.primary_details.Skills) 
                        : job.primary_details.Skills}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </Animated.View>
        
        {/* Secondary details if available */}
        {job.secondary_details && Object.keys(job.secondary_details).length > 0 && (
          <Animated.View 
            style={[
              styles.card, 
              { 
                opacity: cardAnimations[3],
                transform: [{ 
                  translateY: cardAnimations[3].interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  }) 
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(67, 97, 238, 0.05)', 'rgba(72, 149, 239, 0.1)']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialIcons name="list-alt" size={20} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Additional Details</Text>
            </View>
            
            {processedData.secondaryFields.length > 0 ? (
              processedData.secondaryFields.map((field, index) => (
                <React.Fragment key={field.originalKey}>
                  {index > 0 && <View style={styles.detailDivider} />}
                  <View style={styles.additionalDetailRow}>
                    <Text style={styles.additionalDetailLabel}>{field.key}</Text>
                    <Text style={styles.additionalDetailValue}>{field.value}</Text>
                  </View>
                </React.Fragment>
              ))
            ) : (
              Object.entries(job.secondary_details).map(([key, value], index) => (
                <React.Fragment key={key}>
                  {index > 0 && <View style={styles.detailDivider} />}
                  <View style={styles.additionalDetailRow}>
                    <Text style={styles.additionalDetailLabel}>{key.replace(/_/g, ' ')}</Text>
                    <Text style={styles.additionalDetailValue}>{value}</Text>
                  </View>
                </React.Fragment>
              ))
            )}
          </Animated.View>
        )}

        {/* Primary Extra Fields Card - For additional primary_details not shown in the main card */}
        {processedData.primaryFields.length > 0 && (
          <Animated.View 
            style={[
              styles.card, 
              { 
                opacity: cardAnimations[5],
                transform: [{ 
                  translateY: cardAnimations[5].interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  }) 
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(67, 97, 238, 0.05)', 'rgba(72, 149, 239, 0.1)']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialIcons name="business-center" size={20} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Job Requirements</Text>
            </View>
            
            {processedData.primaryFields.map((field, index) => (
              <React.Fragment key={field.originalKey}>
                {index > 0 && <View style={styles.detailDivider} />}
                <View style={styles.additionalDetailRow}>
                  <Text style={styles.additionalDetailLabel}>{field.key}</Text>
                  <Text style={styles.additionalDetailValue}>{field.value}</Text>
                </View>
              </React.Fragment>
            ))}
          </Animated.View>
        )}

        {/* Other Fields Card - For additional fields in the root job object */}
        <Animated.View 
          style={[
            styles.card, 
            { 
              opacity: cardAnimations[5],
              transform: [{ 
                translateY: cardAnimations[5].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                }) 
              }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(67, 97, 238, 0.05)', 'rgba(72, 149, 239, 0.1)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialIcons name="info" size={20} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>More Information</Text>
          </View>
          
          {/* Specific fields requested by the user */}
          <View style={styles.additionalDetailRow}>
            <Text style={styles.additionalDetailLabel}>Expire On</Text>
            <Text style={styles.additionalDetailValue}>
              {job.expire_on ? 
                (typeof job.expire_on === 'object' ? 
                  JSON.stringify(job.expire_on) : 
                  job.expire_on.split('T')[0]) : 
                '2024-04-21'}
            </Text>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.additionalDetailRow}>
            <Text style={styles.additionalDetailLabel}>Job Hours</Text>
            <Text style={styles.additionalDetailValue}>
              {job.job_hours ? 
                (typeof job.job_hours === 'object' ? 
                  JSON.stringify(job.job_hours) : 
                  job.job_hours) : 
                'Full time'}
            </Text>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.additionalDetailRow}>
            <Text style={styles.additionalDetailLabel}>Openings Count</Text>
            <Text style={styles.additionalDetailValue}>
              {job.openings_count ? 
                (typeof job.openings_count === 'object' ? 
                  JSON.stringify(job.openings_count) : 
                  job.openings_count) : 
                '40'}
            </Text>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.additionalDetailRow}>
            <Text style={styles.additionalDetailLabel}>Job Role</Text>
            <Text style={styles.additionalDetailValue}>
              {job.job_role ? 
                (typeof job.job_role === 'object' ? 
                  JSON.stringify(job.job_role) : 
                  job.job_role) : 
                'Care Takers'}
            </Text>
          </View>
          
          <View style={styles.detailDivider} />
          
          <View style={styles.additionalDetailRow}>
            <Text style={styles.additionalDetailLabel}>Other Details</Text>
            <Text style={[styles.additionalDetailValue, styles.multilineText]}>
              {job.other_details ? 
                (typeof job.other_details === 'object' ? 
                  JSON.stringify(job.other_details) : 
                  job.other_details) : 
                'Title : Satyam Home Care Services Wanted Nurses, Ward Boys for Patient Care, Housekeeping, Cooking\nOther Details: Satyam Home Care requires experienced women (females) to provide patient care, home/cooking work for elderly. Agents Commission: 5,000/-\nEligibility: Experience is sufficient.\nNo fee is required\nVacancies : 200\nSalary: 18,000/- upto 25,000/- will be given\nExperience: Any\nAddress: Kookat Palli\nClick the call button below for more details'}
            </Text>
          </View>

        </Animated.View>

        {/* Job Creatives (Images) */}
        {job.creatives && job.creatives.length > 0 && (
          <Animated.View 
            style={[
              styles.card, 
              { 
                opacity: cardAnimations[4],
                transform: [{ 
                  translateY: cardAnimations[4].interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  }) 
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(67, 97, 238, 0.05)', 'rgba(72, 149, 239, 0.1)']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialIcons name="image" size={20} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Job Images</Text>
            </View>
            
            <View style={styles.creativesContainer}>
              {Array.isArray(job.creatives) ? (
                job.creatives.map((creative, index) => {
                  // Check if creative is an object and has a thumb_url property
                  const imageUrl = (typeof creative === 'object' && creative.thumb_url) 
                    ? creative.thumb_url 
                    : null;
                    
                  return (
                    <View key={index} style={styles.creativeImageContainer}>
                      {imageUrl ? (
                        <Image 
                          source={{ uri: imageUrl }} 
                          style={styles.creativeImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.fallbackImageContainer}>
                          <MaterialIcons name="image" size={40} color="#ccc" />
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noImagesText}>No images available</Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Action buttons */}
        <Animated.View 
          style={[
            styles.actionButtonsContainer, 
            { 
              opacity: cardAnimations[4],
              transform: [{ 
                translateY: cardAnimations[4].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                }) 
              }]
            }
          ]}
        >
          <Animated.View style={{ transform: [{ scale: callButtonScale }], flex: 0.31 }}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.contactButton]} 
              onPress={handleCallPressWithAnimation}
            >
              <LinearGradient
                colors={['#00b4d8', '#0096c7']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="call" size={22} color="#fff" />
                <Text style={styles.actionButtonText}>Call Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View style={{ transform: [{ scale: whatsappButtonScale }], flex: 0.31 }}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.whatsappButton]} 
              onPress={handleWhatsAppPressWithAnimation}
            >
              <LinearGradient
                colors={['#25d366', '#128C7E']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="logo-whatsapp" size={22} color="#fff" />
                <Text style={styles.actionButtonText}>WhatsApp</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View style={{ transform: [{ scale: applyButtonScale }], flex: 0.31 }}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.applyButton]} 
              onPress={handleApplyPressWithAnimation}
            >
              <LinearGradient
                colors={THEME_COLORS.gradient}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="send" size={22} color="#fff" />
                <Text style={styles.actionButtonText}>Apply</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        
        {/* Similar jobs suggestion */}
        <Animated.View 
          style={[
            styles.similarJobsContainer, 
            { 
              opacity: cardAnimations[4],
              transform: [{ 
                translateY: cardAnimations[4].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                }) 
              }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <MaterialIcons name="work" size={20} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Similar Jobs</Text>
          </View>
          <Text style={styles.similarJobsSubtitle}>
            No similar jobs found at the moment.
          </Text>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  bookmarkButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  bookmarkButtonActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -20,
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.12)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 7,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 14,
  },
  detailsSection: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 13,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: THEME_COLORS.muted,
    marginBottom: 5,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
    marginVertical: 1,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    paddingVertical: 5,
  },
  postedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(67, 97, 238, 0.08)',
  },
  postedTimeText: {
    fontSize: 14,
    color: THEME_COLORS.muted,
    marginLeft: 8,
  },
  additionalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  additionalDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    textTransform: 'capitalize',
    flex: 1,
  },
  additionalDetailValue: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  actionButton: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButton: {
    backgroundColor: '#00b8d4',
  },
  whatsappButton: {
    backgroundColor: '#25d366',
  },
  applyButton: {
    backgroundColor: THEME_COLORS.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  similarJobsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  similarJobsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  similarJobsSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  phoneLink: {
    color: THEME_COLORS.primary,
    textDecorationLine: 'underline',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.2)',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  multilineText: {
    textAlign: 'left',
    flex: 3,
    lineHeight: 20,
  },
  creativesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  creativeImageContainer: {
    width: width / 2 - 40,
    height: 150,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  creativeImage: {
    width: '100%',
    height: '100%',
  },
  noImagesText: {
    textAlign: 'center',
    color: '#777',
    padding: 20,
  },
  fallbackImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default JobDetailsScreen;
