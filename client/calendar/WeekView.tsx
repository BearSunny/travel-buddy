import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks, 
  isSameDay,
  startOfDay,
  differenceInMinutes
} from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { Event } from '@/interface/TripEvent';
import { useTripContext } from '@/context/TripContext';
import { useEvents } from '@/hooks/useTripEvents';
import EventCard from '@/components/SideBar/events/EventCard';

type SlotProps = {
  className?: string;
  type?: "blank";
  weekend?: boolean;
  quantity?: "none";
  monthView?: "false";
};

function Slot({ className, weekend = false }: SlotProps) {
  return <div 
    id={ !weekend ? "node-206_1803" : "node-206_1804" } 
    className={className} 
  />;
}

type ColumnProps = {
  className?: string;
  weekend?: boolean;
  type?: "Generic";
  today?: "Default";
};

function Column({ className, weekend = false }: ColumnProps) {
  const slots = [];
  for ( let i = 0; i < 24; i++ ) {
    slots.push(
      <Slot key={i} className={ "border border-[#dadce0] border-solid flex-[1_0_0] min-h-px min-w-px w-full h-[50px] bg-white" } />
    );
  }
  const weekendSlots = [];
  for ( let j = 0; j < 24; j++ ) {
    weekendSlots.push(
      <Slot key={j} className={ "border border-[#dadce0] border-solid flex-[1_0_0] min-h-px min-w-px w-full h-[50px] bg-[#f2f2f2]" } weekend={true} />
    );
  }

  return (
    <div id={!weekend ? "node-206_1843" : weekend ? "node-206_1868" : ""} className={className}>
      {!weekend && ( <> {slots} </> )}
      {weekend && ( <> {weekendSlots} </> )}
    </div>
  );
}

type LabelTypeProps = {
  className?: string;
  side?: boolean;
  top?: "true";
  time?: number;
  day?: boolean;
};

function LabelType({ className, time }: LabelTypeProps) {
  return (
    <div data-node-id="206:1385" className={className}>
      <div data-node-id="206:1386" className="content-stretch flex h-[14px] items-start relative shrink-0" data-name="Typography">
        <p data-node-id="I206:1386;2:85492" className={`font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#333] text-[12px]`}>
          {`${time}:00`}
        </p>
      </div>
    </div>
  );
}

type LabelLeftGroupProps = {
  className?: string;
  property1?: "Default";
};

function LabelLeftGroup({ className }: LabelLeftGroupProps) {
  const labels = [];
  for ( let h = 0; h < 24; h++ ) {
    labels.push(<LabelType key={h} className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px px-[10px] py-0 relative shrink-0" time={h} />);
  }

  return (
    <div data-node-id="206:1894" className={className}>
      {labels}
    </div>
  );
}

type GridProps = {
  className?: string;
  fit?: "Cropped";
  type?: "Week";
  mobile?: "false";
};

function Grid({ className }: GridProps) {
  return (
    <div data-node-id="206:1951" className={className}>
      <LabelLeftGroup className="content-stretch flex flex-col h-full items-start relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" weekend={true} />
      <Column className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-h-px min-w-px relative shrink-0" weekend={true} />
    </div>
  );
}

type EventProps = {
  className: string;
  event: Event;
};

const GRID_HEIGHT = 1500;
const MINUTES_IN_DAY = 24 * 60;
const PIXELS_PER_MINUTE = GRID_HEIGHT / MINUTES_IN_DAY;

const getEventStyle = (start: Date, end: Date, dayOfWeek: number) => {
  const startOfDayDate = startOfDay(start);
  const startMinutes = differenceInMinutes(start, startOfDayDate);
  const durationMinutes = differenceInMinutes(end, start);

  return {
    top: `${startMinutes * PIXELS_PER_MINUTE}px`,
    height: `${durationMinutes * PIXELS_PER_MINUTE}px`,
    left: `${dayOfWeek * 57 + 50}px`
  };
};

function EventSlot( {className, event}: EventProps ) {
  return (
    <div className={
        className + (event.status === 'done' ? ' bg-[#55d28f] border-[#3ba86e]' : ' bg-[#f5a623] border-[#d48806]')
      } 
      data-name="Event" 
      data-node-id="207:2703"
    >
      <div className="content-stretch flex gap-[4px] flex-col items-start relative shrink-0 w-full" data-name="name time container" data-node-id="I207:2703;21:154376">

        {/* Event Title */}
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="name container" data-node-id="I207:2703;21:154377">
          <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="name" data-node-id="I207:2703;21:154379">
            <div className="flex flex-col font-[sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-black w-[100%]" data-node-id="I207:2703;21:154379;2:85526">
              <p className="leading-[normal] whitespace-nowrap">
                {event.title.slice(0, 7) + (event.title.length > 7 ? '...' : '')}
              </p>
            </div>
          </div>
        </div>

        {/* Event Time */}
        <div className="content-stretch flex items-start relative shrink-0" data-name="time" data-node-id="I207:2703;21:154380">
          <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-gray-800 whitespace-nowrap" data-node-id="I207:2703;21:154380;2:85524">
            <p className="leading-[normal]">
              {format(new Date(event.start_time), 'HH:mm')}
            </p>
            <ArrowDown className="w-3 h-3 text-gray-800 my-0.5 mx-auto" />
            <p className="leading-[normal]">
              {format(new Date(event.end_time), 'HH:mm')}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

interface WeekViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
} 

export default function WeekView( { currentDate, onDateChange }: WeekViewProps ) {
  // Calculate the 7 days of the currently viewed week (Sunday start)
  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const end = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start, end });

  // Navigation Handlers
  const handlePrevWeek = () => {
    onDateChange(startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 0 }));
  };

  const handleNextWeek = () => {
    onDateChange(startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 0 }));
  };

  // 'Now' Indicator 
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeTop = (now: Date, dayOfWeek: number) => {
    const startOfDayDate = startOfDay(now);
    const minutesPassed = differenceInMinutes(now, startOfDayDate);
    return {
      top: `${minutesPassed * PIXELS_PER_MINUTE}px`,
      left: `${dayOfWeek * 57 + 50}px`
    }
  };

  // Today Button 
  const handleToday = () => { onDateChange(new Date()); };

  const {
    activeTrip,
    eventIds,
    isLoading: isTripLoading,
    removeEventLocal,
    addEventLocal,
  } = useTripContext(); 

  const {
    events,
    isLoading: isEventsLoading,
    updateEvent,
  } = useEvents(eventIds, (action, payload) => {
    if (!activeTrip) return;

    if (action === "delete") {
      removeEventLocal(activeTrip.trip_id, payload as string);
    } else if (action === "create") {
      addEventLocal(activeTrip.trip_id, payload);
    }
  });

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const isTripCompleted = activeTrip?.completion_status === 'completed' || activeTrip?.completion_status === 'cancelled';

  const groupedEvents = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    const sorted = [...events].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    sorted.forEach((event) => {
      const d = new Date(event.start_time);
      const vnDate = new Date(
        d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      const dateKey = !isNaN(vnDate.getTime())
        ? vnDate.toISOString().split("T")[0]
        : "Unscheduled";

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });

    return groups;
  }, [events]);

  // My Plan Button 
  const handleMyPlan = () => {
    if ( !events || events.length === 0 ) return;
    const startTime = events.map(e => new Date(e.start_time).getTime());
    const firstEventTime = new Date(Math.min(...startTime));
    onDateChange(firstEventTime);
  }

  return (
    <div className="content-stretch flex flex-col items-center justify-start pl-px pr-0 py-0 relative h-full pt-2" data-name="WeekView" data-node-id="206:1986">
      {/* --- Header: Controls & Date Range --- */}
      <div className="bg-white border-[rgba(218,220,224,0.6)] border-b border-l-0 border-r-0 border-solid border-t content-stretch flex items-center justify-between relative shrink-0 w-full p-2" data-name="Title" data-node-id="206:1987">
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Left Content" data-node-id="I206:1987;1:785">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevWeek}
              className="rounded-full p-1 hover:bg-gray-100 active:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={handleNextWeek}
              className="rounded-full p-1 hover:bg-gray-100 active:bg-gray-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          {/* Date Range Display */}
          <div className="content-stretch flex items-start relative shrink-0" data-name="Typography" data-node-id="I206:1987;1:787">
            <div className="flex flex-col font-['Poppins:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[20px] whitespace-nowrap font-semibold" data-node-id="I206:1987;1:787;2:85504">
              <p className="leading-[normal]">
                <span>{format(start, 'dd')} - {format(end, 'dd MMM ')}</span>
                <span className="font-['Inter:Regular',sans-serif] not-italic text-gray-500">
                  {format(end, 'yyyy')}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-center relative shrink-0" data-name="Right Content">
          {/* My Plan Button */}
          <button
            onClick={handleMyPlan}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 mr-2"
          >
            My Plan
          </button>
          {/* Today Button */}
          <button 
            onClick={handleToday}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          >
            Today
          </button>
        </div>
      </div>
      {/* --- Weekday Headers --- */}
      <div className="border-[#dadce0] border-b border-l-0 border-r-0 border-solid border-t-0 content-stretch flex items-start relative shrink-0 w-[100%]" data-name="Weekday" data-node-id="206:1988">
        {/* Placeholder For Alignment */}
        <div className="bg-white h-[20px] shrink-0 w-[50px]" data-node-id="I206:1988;1:1368" />
        {/* Weekday  */}
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div 
              key={day.toISOString()} 
              className="content-stretch relative flex h-[46px] min-h-px min-w-px flex-[1_0_0] shrink-0 flex-col items-center justify-center border-l border-gray-100 py-1"
            >
              {/* Day Name (Mon, Tue) */}
              <span className={`text-[11px] font-medium uppercase ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                {format(day, 'EEE')}
              </span>
              
              {/* Date Number (05, 06) */}
              <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[14px] font-semibold ${
                isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700'
              }`}>
                {format(day, 'dd')}
              </div>
            </div>
          );
        })}
        {/* Placeholder for alignment */}
        <div className="bg-white h-[20px] shrink-0 w-[15px] border-gray-100 border-l h-full" data-node-id="I206:1988;1:1368" />
      </div>
      <div className="flex relative shrink-0 w-full h-full content-stretch overflow-y-scroll" data-name="CalendarGrid" data-node-id="206:1989">
        <Grid className="absolute content-stretch flex h-[1500px] items-start left-0 right-0 top-0" />
        {/* Event Card */}
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOfWeek = day.getDay();
          const dayEvents = groupedEvents[dateKey] || [];
          const isToday = isSameDay(day, now);

          return (
            <div key={day.toISOString()} >
              {/* 'Now' Indicator */}
              { isToday && (
                <div 
                  className="absolute left-[50px] right-0 z-20 flex items-center"
                  style={getCurrentTimeTop(now, dayOfWeek)}
                >
                  {/* The Red Dot (pulled left to sit on the border) */}
                  <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-red-500 shadow-sm ring-2 ring-white" />
                  {/* The Red Line */}
                  <div className="h-[2px] w-[57px] bg-red-500 shadow-[0_1px_3px_rgba(239,68,68,0.4)]" />
                </div>
              )}
              {/* Render Events */}
              {dayEvents.map((event) => {
                const style = getEventStyle(new Date(event.start_time), new Date(event.end_time), dayOfWeek);
                return (
                  <div
                    key={event.id}
                    className="absolute"
                    style={style}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <EventSlot event={event} className="h-full absolute border border-solid content-stretch flex flex-col gap-[4px] items-start p-[4px] rounded-[3px] w-[57px] cursor-pointer" />
                  </div> 
                );
              })}
            </div>
          )
        })}
      </div>

      <EventCard
        event={selectedEvent}
        isOpen={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onUpdate={updateEvent}
        isReadOnly={isTripCompleted}
      />
    </div>
  );
}