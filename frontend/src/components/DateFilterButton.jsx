import React, { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import DatePicker from "./DatePicker";

/**
 * Date filter button component with dropdown date picker
 * @param {Object} props - Component props
 * @param {Date|null} props.selectedDate - Currently selected date
 * @param {Function} props.onDateChange - Callback when date changes
 * @param {Function} props.onClearDate - Callback when date filter is cleared
 * @param {string} props.buttonClassName - Optional additional class for the button
 */
const DateFilterButton = ({
  selectedDate,
  onDateChange,
  onClearDate,
  buttonClassName = "",
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateSelect = (date) => {
    onDateChange(date);
    setShowDatePicker(false);
  };

  const getFormattedDate = () => {
    if (!selectedDate) return "Filter by Date";

    return selectedDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <button
        onClick={toggleDatePicker}
        className={`flex items-center gap-2 px-4 py-2 rounded-md border bg-yellow-500 text-white border-yellow-600 transition-colors duration-200 hover:cursor-pointer hover:bg-yellow-600 ${buttonClassName}`}
      >
        <FaCalendarAlt className="w-5 h-5" />
        {getFormattedDate()}
        {selectedDate && (
          <FaTimes
            className="ml-1 w-4 h-4 hover:text-yellow-200"
            onClick={(e) => {
              e.stopPropagation();
              onClearDate();
            }}
          />
        )}
      </button>

      {showDatePicker && (
        <div className="absolute right-0 mt-2 bg-white rounded-md shadow-lg z-10 border border-yellow-200 overflow-hidden">
          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      )}
    </div>
  );
};

export default DateFilterButton;
