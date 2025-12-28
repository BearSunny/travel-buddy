"use client";

import React from "react";
import { useState } from "react";
import MonthView from "@/calendar/MonthView";
import WeekView from "@/calendar/WeekView";
import AddEventForm from "@/calendar/AddEventForm";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  return (
    <div className="relative h-full">
      <WeekView
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />
    </div>
  );
}