import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseHunt, type HuntState } from "./hunt";

const KEY = "find-a-spoon-v1";

export async function loadHunt(): Promise<HuntState> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseHunt(raw);
}

export async function saveHunt(state: HuntState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
