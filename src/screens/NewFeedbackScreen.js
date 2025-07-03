import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  Keyboard,
  InputAccessoryView,
  KeyboardAvoidingView, // EKLENDİ
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const NewFeedbackScreen = ({ navigation }) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Teslimat");
  const [items, setItems] = useState([
    { label: "Teslimat", value: "Teslimat" },
    { label: "Ürün Kalitesi", value: "Ürün Kalitesi" },
    { label: "Müşteri Hizmetleri", value: "Müşteri Hizmetleri" },
    { label: "Fatura & Ödeme", value: "Fatura & Ödeme" },
    { label: "Diğer", value: "Diğer" },
  ]);

  const [complaintText, setComplaintText] = useState("");
  const inputAccessoryViewID = "doneButton";

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (complaintText.trim() === "") {
      Alert.alert("Hata", "Şikayet metni boş bırakılamaz.");
      return;
    }

    try {
      await addDoc(collection(db, "feedback"), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        category: category,
        complaintText: complaintText,
        status: "new",
        createdAt: serverTimestamp(),
        adminReply: "",
        repliedAt: null,
      });

      Alert.alert("Başarılı", "Şikayetiniz bize ulaştı.", [
        { text: "Tamam", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Şikayet gönderilirken hata: ", error);
      Alert.alert("Hata", "Şikayetiniz gönderilirken bir sorun oluştu.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <View style={{ zIndex: 1 }}>
        <Text style={styles.label}>Kategori</Text>
        <DropDownPicker
          open={open}
          value={category}
          items={items}
          setOpen={setOpen}
          setValue={setCategory}
          setItems={setItems}
          placeholder="Bir kategori seçin"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          onOpen={() => Keyboard.dismiss()}
          listMode="SCROLLVIEW"
        />
      </View>

      <Text style={styles.label}>Şikayet / Geri Bildiriminiz</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Lütfen şikayetinizi detaylı bir şekilde yazın..."
        value={complaintText}
        onChangeText={setComplaintText}
        inputAccessoryViewID={inputAccessoryViewID}
      />

      <View style={styles.buttonWrapper}>
        <Button title="Gönder" onPress={handleSubmit} />
      </View>

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={styles.accessory}>
            <Button onPress={() => Keyboard.dismiss()} title="Tamam" />
          </View>
        </InputAccessoryView>
      )}
    </KeyboardAvoidingView>
  );
};

export default NewFeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#8b00ff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "blue",
  },
  dropdown: {
    borderColor: "gray",
    marginBottom: 10,
  },
  dropdownContainer: {
    borderColor: "gray",
  },
  input: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    textAlignVertical: "top",
    marginTop: 20,
    backgroundColor: "#fff",
    minHeight: 150,
  },
  buttonWrapper: {
    marginTop: 20,
    paddingBottom: 10,
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
