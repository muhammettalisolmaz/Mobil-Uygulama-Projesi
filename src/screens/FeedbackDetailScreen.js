import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  InputAccessoryView, // EKLENDİ
} from "react-native";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { COLORS } from "../constants/colors";

const FeedbackDetailScreen = ({ route, navigation }) => {
  const { item, userRole } = route.params;
  const [adminReply, setAdminReply] = useState(item.adminReply || "");
  const [loading, setLoading] = useState(false);
  const inputAccessoryViewID = "replyInputAccessory"; // EKLENDİ

  const handleReplySubmit = async () => {
    Keyboard.dismiss();
    if (adminReply.trim() === "") {
      Alert.alert("Hata", "Cevap metni boş olamaz.");
      return;
    }
    setLoading(true);
    const feedbackRef = doc(db, "feedback", item.id);
    try {
      await updateDoc(feedbackRef, {
        adminReply: adminReply,
        status: "answered",
        repliedAt: serverTimestamp(),
      });
      Alert.alert("Başarılı", "Cevabınız kaydedildi.");
      navigation.goBack();
    } catch (error) {
      console.error("Cevap gönderilirken hata:", error);
      Alert.alert("Hata", "Cevap gönderilirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = timestamp => {
    if (!timestamp) return "N/A";
    return timestamp.toDate().toLocaleString("tr-TR");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.lightGray }}
      keyboardVerticalOffset={90}>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Kategori:</Text>
          <Text style={styles.value}>{item.category}</Text>
          <Text style={styles.label}>Gönderen:</Text>
          <Text style={styles.value}>{item.email}</Text>
          <Text style={styles.label}>Gönderim Tarihi:</Text>
          <Text style={styles.value}>{formatDate(item.createdAt)}</Text>
          <View style={styles.separator} />
          <Text style={styles.label}>Şikayet Metni:</Text>
          <Text style={styles.complaintText}>{item.complaintText}</Text>
        </View>

        {item.status === "answered" && (
          <View style={[styles.card, styles.replyCard]}>
            <Text style={styles.label}>Yönetici Cevabı:</Text>
            <Text style={styles.complaintText}>{item.adminReply}</Text>
            <Text style={[styles.label, { marginTop: 16 }]}>Cevap Tarihi:</Text>
            <Text style={styles.value}>{formatDate(item.repliedAt)}</Text>
          </View>
        )}

        {userRole === "admin" && item.status === "new" && (
          <View style={styles.card}>
            <Text style={styles.label}>Cevap Yaz:</Text>
            <TextInput
              style={styles.replyInput}
              multiline
              placeholder="Cevabınızı buraya yazın..."
              value={adminReply}
              onChangeText={setAdminReply}
              inputAccessoryViewID={inputAccessoryViewID}
            />
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Button
                title="Cevabı Gönder"
                onPress={handleReplySubmit}
                color={COLORS.primary}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* BU BLOK EKLENDİ */}
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessory}>
            <Button onPress={() => Keyboard.dismiss()} title="Kapat" />
          </View>
        </InputAccessoryView>
      )}
    </KeyboardAvoidingView>
  );
};

export default FeedbackDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.blue,
  },
  complaintText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.blue,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.blue,
    marginVertical: 16,
  },
  replyCard: {
    backgroundColor: "#32e3a2",
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  replyInput: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 22,
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
