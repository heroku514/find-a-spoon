export const ROOMS = [
  {
    name: "Kitchen",
    items: ["A wooden spoon.", "A white cup.", "A round plate."],
  },
  {
    name: "Living room",
    items: ["A soft cushion.", "A tall lamp.", "A paper book."],
  },
  {
    name: "Bedroom",
    items: ["A warm blanket.", "A small clock.", "A pair of slippers."],
  },
] as const;

const FOUND_WORDS = [
  "None found",
  "One found",
  "Two found",
  "Three found",
  "Four found",
  "Five found",
  "Six found",
  "Seven found",
  "Eight found",
  "Nine found",
] as const;

export type HuntState = {
  roomIndex: number;
  itemIndex: number;
  found: number;
  skipped: number;
  done: boolean;
};

export const EMPTY_HUNT: HuntState = {
  roomIndex: 0,
  itemIndex: 0,
  found: 0,
  skipped: 0,
  done: false,
};

export function roomLabel(state: HuntState): string {
  if (state.done) return "Done";
  return ROOMS[state.roomIndex]?.name ?? ROOMS[0].name;
}

export function huntText(state: HuntState): string {
  if (state.done) return "All rooms done.";
  const room = ROOMS[state.roomIndex] ?? ROOMS[0];
  return room.items[state.itemIndex] ?? room.items[0];
}

export function foundLabel(state: HuntState): string {
  return FOUND_WORDS[Math.min(state.found, FOUND_WORDS.length - 1)] ?? "None found";
}

export function hasProgress(state: HuntState): boolean {
  return state.done || state.roomIndex > 0 || state.itemIndex > 0 || state.found > 0 || state.skipped > 0;
}

export function parseHunt(raw: string | null): HuntState {
  if (!raw) return EMPTY_HUNT;
  try {
    const data = JSON.parse(raw) as Partial<HuntState>;
    const roomIndex = typeof data.roomIndex === "number" && data.roomIndex >= 0 && data.roomIndex < ROOMS.length
      ? data.roomIndex
      : 0;
    const room = ROOMS[roomIndex];
    const itemIndex = typeof data.itemIndex === "number" && data.itemIndex >= 0 && data.itemIndex < room.items.length
      ? data.itemIndex
      : 0;
    const found = typeof data.found === "number" && data.found >= 0 && data.found <= 9 ? Math.floor(data.found) : 0;
    const skipped = typeof data.skipped === "number" && data.skipped >= 0 && data.skipped <= 9 ? Math.floor(data.skipped) : 0;
    const done = data.done === true;
    return { roomIndex, itemIndex: done ? 0 : itemIndex, found, skipped, done };
  } catch {
    return EMPTY_HUNT;
  }
}

export function markItem(state: HuntState, kind: "found" | "skip"): { state: HuntState; note: string } {
  if (state.done) return { state, note: "All rooms done." };
  const found = state.found + (kind === "found" ? 1 : 0);
  const skipped = state.skipped + (kind === "skip" ? 1 : 0);
  const room = ROOMS[state.roomIndex];
  if (state.itemIndex + 1 < room.items.length) {
    return {
      state: { ...state, itemIndex: state.itemIndex + 1, found, skipped },
      note: kind === "found" ? "Found it." : "Not in this room.",
    };
  }
  if (state.roomIndex + 1 < ROOMS.length) {
    const next = ROOMS[state.roomIndex + 1];
    return {
      state: { roomIndex: state.roomIndex + 1, itemIndex: 0, found, skipped, done: false },
      note: `${next.name}.`,
    };
  }
  return {
    state: { roomIndex: state.roomIndex, itemIndex: 0, found, skipped, done: true },
    note: "All rooms done.",
  };
}

export function resetHunt(): { state: HuntState; note: string } {
  return { state: EMPTY_HUNT, note: "Look in the kitchen." };
}
