// App.js
import React from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JobsScreen from './screens/JobsScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import JobDetailsScreen from './screens/JobDetailsScreen';
import { BookmarkProvider } from './context/BookmarkContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const THEME_COLORS = {
  primary: '#4a6ee0',
  secondary: '#6e8eff',
  gradient: ['#4a6ee0', '#6e8eff'],
  background: '#f4f7ff',
  card: '#ffffff',
  text: '#333333',
  accent: '#00c6ff'
};

function JobsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: THEME_COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Jobs" component={JobsScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="JobDetails" 
        component={JobDetailsScreen} 
        options={{ 
          title: 'Job Details',
          headerBackTitle: 'Back',
          animation: 'slide_from_right'
        }} 
      />
    </Stack.Navigator>
  );
}

function BookmarksStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: THEME_COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="SavedJobs" 
        component={BookmarksScreen} 
        options={{ 
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="JobDetails" 
        component={JobDetailsScreen} 
        options={{ 
          title: 'Job Details',
          headerBackTitle: 'Back',
          animation: 'slide_from_right'
        }} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <BookmarkProvider>
      <StatusBar barStyle="light-content" backgroundColor={THEME_COLORS.primary} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size, focused }) => {
              let iconName = route.name === 'JobsStack' ? 'briefcase' : 'BookmarksStack';
              iconName = route.name === 'JobsStack' ? 'briefcase' : 'bookmark';
              if (focused) {
                iconName = route.name === 'JobsStack' ? 'briefcase-sharp' : 'bookmark-sharp';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: THEME_COLORS.primary,
            tabBarInactiveTintColor: '#9e9e9e',
            tabBarStyle: { 
              height: 60, 
              paddingBottom: 8,
              borderTopWidth: 0,
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600'
            },
            headerStyle: {
              backgroundColor: THEME_COLORS.primary,
              elevation: 0,
              shadowOpacity: 0
            },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' }
          })}
        >
          <Tab.Screen 
            name="JobsStack" 
            component={JobsStack} 
            options={{ 
              title: 'Jobs Portal',
              headerShown: false
            }} 
          />
          <Tab.Screen 
            name="BookmarksStack" 
            component={BookmarksStack} 
            options={{
              title: 'Bookmarks',
              headerShown: false
            }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </BookmarkProvider>
  );
}
