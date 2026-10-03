import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { foundLabel, hasProgress, huntText, markItem, resetHunt, roomLabel, type HuntState } from "./src/hunt";
import { loadHunt, saveHunt } from "./src/store";

export default function App() {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<HuntState | null>(null);
  const [note, setNote] = useState("Look in the kitchen.");
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    loadHunt()
      .then((loaded) => {
        setState(loaded);
        setNote(loaded.done ? "All rooms done." : hasProgress(loaded) ? "Saved hunt loaded." : "Look in the kitchen.");
      })
      .catch(() => {
        setState(null);
        setNote("Could not read the hunt.");
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !state) return;
    saveHunt(state).catch(() => setNote("Could not save the hunt."));
  }, [ready, state]);

  if (!ready || !state) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <Text style={styles.loading}>Loading the hunt</Text>
        </View>
      </SafeAreaView>
    );
  }

  function onMark(kind: "found" | "skip") {
    const result = markItem(state!, kind);
    setState(result.state);
    setNote(result.note);
    setConfirmNew(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        <Text style={styles.title}>Find a Spoon</Text>
        <Text style={styles.note}>{note}</Text>
        <Text style={styles.room}>{roomLabel(state)}</Text>
        <Text style={styles.line}>{huntText(state)}</Text>
        <Text style={styles.found}>{foundLabel(state)}</Text>
        <View style={styles.row}>
          <BigButton label="Found it" filled inRow onPress={() => onMark("found")} />
          <BigButton label="Not here" inRow onPress={() => onMark("skip")} />
        </View>
        {confirmNew ? (
          <View style={styles.row}>
            <BigButton label="Confirm new" filled inRow onPress={onConfirmNew} />
            <BigButton label="Cancel new" inRow onPress={onCancelNew} />
          </View>
        ) : (
          <BigButton label="New hunt" onPress={() => setConfirmNew(true)} />
        )}
      </View>
    </SafeAreaView>
  );

  function onConfirmNew() {
    const result = resetHunt();
    setState(result.state);
    setConfirmNew(false);
    setNote(result.note);
  }

  function onCancelNew() {
    setConfirmNew(false);
    setNote("New hunt canceled.");
  }
}

function BigButton({
  label,
  onPress,
  filled,
  inRow,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  inRow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, inRow && styles.buttonRow, filled && styles.buttonFilled]}
    >
      <Text style={[styles.buttonText, filled && styles.buttonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FBF3E4" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 28, fontWeight: "800", color: "#3F2A1D" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  title: { fontSize: 32, fontWeight: "800", color: "#3F2A1D" },
  note: { fontSize: 18, color: "#6B4A32", minHeight: 28 },
  room: { fontSize: 28, fontWeight: "800", color: "#3F2A1D" },
  line: { fontSize: 44, fontWeight: "800", color: "#C46A2B", lineHeight: 52, minHeight: 120 },
  found: { fontSize: 22, fontWeight: "700", color: "#3F2A1D" },
  row: { flexDirection: "row", gap: 8 },
  button: {
    minHeight: 68,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#3F2A1D",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: { flex: 1 },
  buttonFilled: { backgroundColor: "#3F2A1D" },
  buttonText: { fontSize: 22, fontWeight: "800", color: "#3F2A1D", textAlign: "center" },
  buttonTextFilled: { color: "#FFFFFF" },
});
