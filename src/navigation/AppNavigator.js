import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase/firebaseConfig';

import AuthScreen from '../screens/AuthScreen';
import UserHomeScreen from '../screens/UserHomeScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import NewFeedbackScreen from '../screens/NewFeedbackScreen';
import FeedbackDetailScreen from '../screens/FeedbackDetailScreen';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        setUserRole(userDoc.exists() ? userDoc.data().role : null);
        setUser(currentUser);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary}/>
      </View>
    );
  }

  const UserStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="UserHome" component={UserHomeScreen} options={{ title: 'Geri Bildirimlerim' }} />
      <Stack.Screen name="NewFeedback" component={NewFeedbackScreen} options={{ title: 'Yeni Geri Bildirim' }} />
      <Stack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} options={{ title: 'Geri Bildirim Detayı' }} />
    </Stack.Navigator>
  );

  const AdminStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Tüm Geri Bildirimler' }} />
      <Stack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} options={{ title: 'Geri Bildirim Detayı' }} />
    </Stack.Navigator>
  );

  return (
    <NavigationContainer>
      {user ? (
        userRole === 'admin' ? <AdminStack /> : <UserStack />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  }
});

export default AppNavigator;