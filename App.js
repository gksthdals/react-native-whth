import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { theme } from "./colors.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto, Entypo } from "@expo/vector-icons";
import { textDecorationColor } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";

const STORAGE_TODO_KEY = "@toDos";
const STORAGE_WORK_KEY = "@work";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(async () => {
    current_working = await AsyncStorage.getItem(STORAGE_WORK_KEY);
    if (current_working !== null) {
      setWorking(current_working === "true");
    }
    loadToDos();
  }, []);
  const travel = async () => {
    setWorking(false);
    await AsyncStorage.setItem(STORAGE_WORK_KEY, "false");
  };
  const work = async () => {
    setWorking(true);
    await AsyncStorage.setItem(STORAGE_WORK_KEY, "true");
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_TODO_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_TODO_KEY);
    if (s) {
      setToDos(JSON.parse(s));
    }
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    // save to do
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To do?");
      if (ok) {
        const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const editText = (key) => {};
  const setDone = async (key) => {
    const newToDos = { ...toDos };
    const doneType = newToDos[key].done;
    newToDos[key].done = !doneType;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View key={key} style={styles.toDo}>
              {toDos[key].done ? (
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: "line-through",
                  }}
                >
                  {toDos[key].text}
                </Text>
              ) : (
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
              )}
              <View style={styles.buttons}>
                <View style={styles.button}>
                  <TouchableOpacity onPress={() => editText(key)}>
                    <Entypo name="edit" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <View style={styles.button}>
                  <TouchableOpacity onPress={() => setDone(key)}>
                    <Fontisto name="check" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <View style={styles.button}>
                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <Fontisto name="trash" size={18} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 30,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 5,
  },
});
