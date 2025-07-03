import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  InputAccessoryView,
  Button,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { auth, db } from "../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useHeaderHeight } from "@react-navigation/elements";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const passwordInputRef = useRef(null);
  const inputAccessoryViewID = "authAccessoryView";
  const headerHeight = useHeaderHeight();

  const userRole = selectedIndex === 0 ? "user" : "admin";
  const actionText = isLogin ? "Giriş Yap" : "Kayıt Ol";
  const roleText = userRole === "user" ? "Kullanıcı" : "Yönetici";

  const handleAuthAction = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleLogin = () => {
    Keyboard.dismiss();
    const roleToLogin = selectedIndex === 0 ? "user" : "admin";

    if (email.trim() === "" || password.trim() === "") {
      Alert.alert("Hata", "E-posta ve şifre alanları boş bırakılamaz.");
      return;
    }
    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(async userCredentials => {
        const user = userCredentials.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const actualRole = userDoc.data().role;
          if (actualRole !== roleToLogin) {
            await signOut(auth);
            Alert.alert(
              "Hatalı Giriş",
              `Bu bir '${actualRole}' hesabıdır. Lütfen '${
                actualRole.charAt(0).toUpperCase() + actualRole.slice(1)
              }' sekmesinden giriş yapın.`
            );
          }
        } else {
          await signOut(auth);
          Alert.alert("Hata", "Kullanıcı verisi bulunamadı.");
        }
      })
      .catch(error => {
        Alert.alert("Giriş Başarısız", "E-posta veya şifre hatalı.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRegister = () => {
    Keyboard.dismiss();
    if (email.trim() === "" || password.trim() === "") {
      Alert.alert("Hata", "E-posta ve şifre alanları boş bırakılamaz.");
      return;
    }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        setDoc(doc(db, "users", userCredentials.user.uid), {
          role: userRole,
          email: userCredentials.user.email,
        });
      })
      .catch(error => {
        if (error.code === "auth/email-already-in-use") {
          Alert.alert("Kayıt Hatası", "Bu e-posta adresi zaten kullanılıyor.");
        } else if (error.code === "auth/weak-password") {
          Alert.alert("Kayıt Hatası", "Şifre en az 6 karakter olmalıdır.");
        } else {
          Alert.alert("Kayıt Hatası", error.message);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Ionicons
            name="people-outline"
            size={80}
            color={COLORS.primary}
            style={styles.logo}
          />
          <Text style={styles.title}>{`${roleText} ${actionText}`}</Text>

          <SegmentedControl
            values={["Kullanıcı", "Yönetici"]}
            selectedIndex={selectedIndex}
            onChange={event =>
              setSelectedIndex(event.nativeEvent.selectedSegmentIndex)
            }
            style={styles.segmentedControl}
            activeSegmentBackgroundColor={COLORS.primary}
            tintColor={COLORS.blue}
          />

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={22}
              color={COLORS.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="E-posta Adresiniz"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
              inputAccessoryViewID={inputAccessoryViewID}
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={COLORS.gray}
              style={styles.inputIcon}
            />
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="Şifreniz"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleAuthAction}
              inputAccessoryViewID={inputAccessoryViewID}
              textContentType="oneTimeCode"
            />
          </View>

          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleAuthAction}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.mainButtonText}>{actionText}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {isLogin
                ? "Hesabınız yok mu? Kayıt Olun"
                : "Zaten bir hesabınız var mı? Giriş Yapın"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessory}>
            <Button onPress={() => Keyboard.dismiss()} title="Kapat" />
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.blue },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logo: { alignSelf: "center", marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  segmentedControl: { marginBottom: 30 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: "100%",
    height: 55,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#333" },
  mainButton: {
    backgroundColor: COLORS.primary,
    width: "100%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 55,
  },
  mainButtonText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },
  toggleButton: { marginTop: 20 },
  toggleText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  accessory: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    padding: 5,
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#dedede",
  },
});

export default AuthScreen;
