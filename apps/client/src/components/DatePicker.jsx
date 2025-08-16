import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/**
 * Date picker component
 * @param {Object} props - Component props
 * @param {Date|null} props.selectedDate - Currently selected date
 * @param {Function} props.onDateSelect - Callback when a date is selected
 */
const DatePicker = ({ selectedDate, onDateSelect }) => {
  const initialDate = selectedDate || new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isSelectedDate = (day) => {
    if (!selectedDate) return false;

    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const monthName = new Date(currentYear, currentMonth).toLocaleString(
      "default",
      { month: "long" }
    );

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDateClick(day)}
          className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer text-sm
            ${
              isSelectedDate(day)
                ? "bg-yellow-500 text-white"
                : isToday(day)
                ? "bg-yellow-100 text-yellow-800"
                : "hover:bg-yellow-100"
            }`}
        >
          {day}
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-full hover:bg-yellow-100"
          >
            <FaChevronLeft className="text-yellow-600" />
          </button>
          <div className="font-semibold text-gray-800">
            {`${monthName} ${currentYear}`}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-yellow-100"
          >
            <FaChevronRight className="text-yellow-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, index) => (
            <div
              key={`header-${index}`}
              className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  return (
    <div className="p-4 w-72">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-yellow-800">Select Date</h3>
      </div>
      {renderCalendar()}
    </div>
  );
};

export default DatePicker;
