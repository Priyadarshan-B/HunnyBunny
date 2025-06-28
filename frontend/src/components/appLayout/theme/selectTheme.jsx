export const getSelectStyles = (isDarkMode) => ({
  control: (base) => ({
    ...base,
    backgroundColor: isDarkMode ? "#1f1f1f" : "#fff",
    color: isDarkMode ? "#e6e6e6" : "#191c24",
    borderColor: isDarkMode ? "#333" : "#d9d9d9",
    boxShadow: "none",
    "&:hover": {
      borderColor: isDarkMode ? "#555" : "#40a9ff",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: isDarkMode ? "#1f1f1f" : "#fff",
    zIndex: 9999,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected
      ? (isDarkMode ? "#178a84" : "#e6f7ff")
      : isFocused
      ? (isDarkMode ? "#333" : "#f5f5f5")
      : "transparent",
    color: isDarkMode ? "#e6e6e6" : "#191c24",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: isDarkMode ? "#e6e6e6" : "#191c24",
  }),
  input: (base) => ({
    ...base,
    color: isDarkMode ? "#e6e6e6" : "#191c24",
  }),
});
