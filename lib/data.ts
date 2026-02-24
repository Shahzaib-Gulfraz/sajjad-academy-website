// ─── Utility data for the academy ───
// All course/class data is now fetched from the database via API.
// This file only contains shared UI constants.

export const categoryColors: Record<string, string> = {
  default: "from-teal-400 to-emerald-500",
  sciences: "from-orange-400 to-red-500",
  business: "from-blue-400 to-indigo-500",
  economics: "from-emerald-400 to-teal-500",
  humanities: "from-purple-400 to-pink-500",
  languages: "from-yellow-400 to-amber-500",
};

// Generate a color from a string (for dynamic class/course colors)
export function getColorForName(name: string): string {
  const colors = [
    "from-teal-400 to-emerald-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-orange-400 to-red-500",
    "from-yellow-400 to-amber-500",
    "from-cyan-400 to-blue-500",
    "from-rose-400 to-red-500",
    "from-green-400 to-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
