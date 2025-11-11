import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const clampToStartOfDay = (value) => {
  const date = startOfDay(value);
  return date;
};

export default function DateRangePicker({
  checkIn,
  checkOut,
  minDate = new Date(),
  onSelect,
}) {
  const parsedCheckIn = checkIn ? new Date(checkIn) : null;
  const parsedCheckOut = checkOut ? new Date(checkOut) : null;
  const initialMonth = parsedCheckIn ?? minDate;
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialMonth));

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const minSelectableDate = clampToStartOfDay(minDate);

  const handleDaySelect = (day) => {
    const normalizedDay = clampToStartOfDay(day);
    if (isBefore(normalizedDay, minSelectableDate)) {
      return;
    }

    if (!parsedCheckIn || (parsedCheckIn && parsedCheckOut)) {
      onSelect({
        checkIn: format(normalizedDay, "yyyy-MM-dd"),
        checkOut: "",
      });
      return;
    }

    if (isBefore(normalizedDay, parsedCheckIn) || isSameDay(normalizedDay, parsedCheckIn)) {
      onSelect({
        checkIn: format(normalizedDay, "yyyy-MM-dd"),
        checkOut: "",
      });
      return;
    }

    onSelect({
      checkIn: format(parsedCheckIn, "yyyy-MM-dd"),
      checkOut: format(normalizedDay, "yyyy-MM-dd"),
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-40"
          aria-label="Previous month"
          disabled={
            currentMonth.getFullYear() === minSelectableDate.getFullYear() &&
            currentMonth.getMonth() === minSelectableDate.getMonth()
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-semibold">{format(currentMonth, "MMMM yyyy")}</p>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground gap-2">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {calendarDays.map((day) => {
          const isDisabled = isBefore(clampToStartOfDay(day), minSelectableDate);
          const isSelectedStart =
            parsedCheckIn && isSameDay(day, parsedCheckIn);
          const isSelectedEnd =
            parsedCheckOut && isSameDay(day, parsedCheckOut);
          const isInRange =
            parsedCheckIn &&
            parsedCheckOut &&
            isWithinInterval(day, {
              start: parsedCheckIn,
              end: parsedCheckOut,
            }) &&
            !isSelectedStart &&
            !isSelectedEnd;

          return (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => handleDaySelect(day)}
              disabled={isDisabled}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-colors border border-transparent",
                !isSameMonth(day, currentMonth) && "text-muted-foreground/50",
                isDisabled && "cursor-not-allowed opacity-30",
                isInRange && "bg-primary/10 text-primary",
                (isSelectedStart || isSelectedEnd) &&
                  "bg-primary text-primary-foreground font-semibold",
                !isSelectedStart &&
                  !isSelectedEnd &&
                  !isInRange &&
                  !isDisabled &&
                  "hover:bg-muted"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
