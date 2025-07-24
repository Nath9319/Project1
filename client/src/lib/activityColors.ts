// Color coding system for different activity types
export const ACTIVITY_TYPES = {
  note: {
    label: "General Note",
    color: "#6366F1", // Indigo
    bgColor: "#EEF2FF",
    textColor: "#4338CA",
    borderColor: "#C7D2FE",
    icon: "📝"
  },
  emotional_trigger: {
    label: "Emotional Trigger",
    color: "#EF4444", // Red
    bgColor: "#FEF2F2",
    textColor: "#DC2626",
    borderColor: "#FECACA",
    icon: "💭"
  },
  group_insight: {
    label: "Group Insight",
    color: "#10B981", // Emerald
    bgColor: "#ECFDF5",
    textColor: "#059669",
    borderColor: "#A7F3D0",
    icon: "💡"
  },
  reflection: {
    label: "Personal Reflection",
    color: "#8B5CF6", // Violet
    bgColor: "#F5F3FF",
    textColor: "#7C3AED",
    borderColor: "#DDD6FE",
    icon: "🤔"
  },
  milestone: {
    label: "Milestone",
    color: "#F59E0B", // Amber
    bgColor: "#FFFBEB",
    textColor: "#D97706",
    borderColor: "#FDE68A",
    icon: "🎯"
  }
} as const;

export type ActivityType = keyof typeof ACTIVITY_TYPES;

export function getActivityTypeConfig(type: string) {
  return ACTIVITY_TYPES[type as ActivityType] || ACTIVITY_TYPES.note;
}

export function getActivityTypeOptions() {
  return Object.entries(ACTIVITY_TYPES).map(([key, config]) => ({
    value: key,
    label: config.label,
    icon: config.icon,
    color: config.color
  }));
}