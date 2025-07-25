import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

const UserHomeScreen = ({ navigation }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.currentUser) {
      const feedbackCollectionRef = collection(db, "feedback");
      const q = query(
        feedbackCollectionRef,
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, querySnapshot => {
        const feedbacks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeedbackList(feedbacks);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  const renderFeedbackItem = ({ item }) => {
    const feedbackDate = item.createdAt?.toDate().toLocaleDateString("tr-TR");
    const cardBorderColor =
      item.status === "new" ? COLORS.success : COLORS.warning;
    const statusBackgroundColor =
      item.status === "new" ? COLORS.success : COLORS.warning;

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: cardBorderColor }]}
        onPress={() =>
          navigation.navigate("FeedbackDetail", {
            item: item,
            userRole: "user",
          })
        }>
        <View style={styles.cardHeader}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <View
            style={[
              styles.statusContainer,
              { backgroundColor: statusBackgroundColor },
            ]}>
            <Ionicons
              name={
                item.status === "new"
                  ? "mail-unread-outline"
                  : "checkmark-done-outline"
              }
              size={14}
              color={COLORS.white}
            />
            <Text style={styles.statusText}>
              {item.status === "new" ? "Gönderildi" : "Cevaplandı"}
            </Text>
          </View>
        </View>
        <Text style={styles.cardText} numberOfLines={2}>
          {item.complaintText}
        </Text>
        <View style={styles.cardFooter}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
          <Text style={styles.cardDate}>{feedbackDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedbackList}
        renderItem={renderFeedbackItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Button
              title="Yeni Geri Bildirim Oluştur"
              onPress={() => navigation.navigate("NewFeedback")}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="mail-unread-outline"
              size={64}
              color={COLORS.white}
            />
            <Text style={styles.emptyText}>
              Henüz gönderilmiş bir geri bildiriminiz yok.
            </Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <View style={styles.footer}>
        <Button
          title="Çıkış Yap"
          onPress={() => signOut(auth)}
          color="#ff6347"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.blue },
  header: { padding: 16 },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardCategory: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cardDate: { fontSize: 12, color: COLORS.gray, marginLeft: 4 },
});

export default UserHomeScreen;
