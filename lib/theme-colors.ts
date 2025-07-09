export const themeColors = {
  primary: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  cream: {
    50: "#fefdfb",
    100: "#fef7ed",
    200: "#fef2e2",
    300: "#fde8cc",
    400: "#fbd9a5",
    500: "#f7c373",
    600: "#f1a545",
    700: "#e8842a",
    800: "#d16420",
    900: "#a8501a",
  },
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  diamond: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
    case "active":
    case "live":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "pending":
      return "bg-primary-100 text-primary-800 border-primary-200"
    case "cancelled":
    case "inactive":
      return "bg-secondary-100 text-secondary-800 border-secondary-200"
    case "stored":
      return "bg-diamond-100 text-diamond-800 border-diamond-200"
    default:
      return "bg-secondary-100 text-secondary-800 border-secondary-200"
  }
}

export const getCategoryGradient = (category: string) => {
  switch (category) {
    case "Gold":
      return "from-primary-400 to-primary-600"
    case "Silver":
      return "from-secondary-400 to-secondary-600"
    case "Diamond":
      return "from-diamond-400 to-diamond-600"
    default:
      return "from-emerald-400 to-emerald-600"
  }
}
