"use client";
interface Place {
  id: number;
  name: string;
  cost: string;
  timeRange: string;
  image: string;
  travelTime?: string;
  distance?: string;
}

interface DayPlan {
  date: string;
  dayName: string; // e.g., "Saturday"
  monthDay: string; // e.g., "November 1st"
  places: Place[];
}

// --- Mock Data ---
const MOCK_DATA: DayPlan[] = [
  {
    date: "2025-11-01",
    dayName: "Saturday",
    monthDay: "November 1st",
    places: [
      {
        id: 1,
        name: "Independence Palace",
        cost: "₫999,999",
        timeRange: "3:00 AM - 6:00 AM",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Dinh_Doc_Lap_2019.jpg/640px-Dinh_Doc_Lap_2019.jpg",
        travelTime: "1m",
        distance: "1000 km",
      },
      {
        id: 2,
        name: "Puc's House",
        cost: "₫5,000",
        timeRange: "9:00 PM - 12:00 PM",
        image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/467786066.jpg?k=ad77252203d96c97a213988e0031897d266e746405c1975b9f7a75567b545464&o=&hp=1",
      },
    ],
  },
  {
    date: "2025-11-02",
    dayName: "Sunday",
    monthDay: "November 2nd",
    places: [],
  },
];

export default function ObjectView() {
  return (
    <div className="flex-1 overflow-y-auto pr-1 mt-4 scrollbar-hide">
      {MOCK_DATA.map((day, dayIndex) => (
        <div key={day.date} className="mb-8">
          <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white z-10 py-2">
            <svg
              className="text-gray-700"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">
              {day.dayName}, {day.monthDay}
            </h2>
          </div>

          <div className="relative pl-4 ml-2">
            {/* Continuous Vertical Line for the Day */}
            <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-[#e0e0e0]"></div>

            {day.places.map((place, index) => {
              const isLast = index === day.places.length - 1;
              return (
                <div key={place.id} className="relative mb-6">
                  {/* Timeline Connector Line (Active Cyan) */}
                  {!isLast && (
                     <div className="absolute left-[-5px] top-8 h-[calc(100%+24px)] w-[2px] bg-[#29b6f6] z-0"></div>
                  )}

                  {/* Numbered Node */}
                  <div className="absolute -left-[14px] top-3 w-6 h-6 rounded-full bg-[#29b6f6] text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm border-2 border-white">
                    {place.id}
                  </div>

                  {/* Card */}
                  <div className="bg-[#f3f4f6] rounded-xl p-3 flex gap-3 shadow-sm hover:shadow-md transition-shadow relative group border border-transparent hover:border-gray-200">
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                         <h3 className="font-bold text-gray-900 text-sm truncate mr-2">
                          {place.name}
                        </h3>
                        {/* Edit Icon */}
                        <button className="text-gray-400 hover:text-gray-600">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="bg-[#e3f2fd] text-[#1e88e5] text-[10px] font-semibold px-2 py-0.5 rounded">
                          {place.cost}
                        </span>
                        <span className="bg-[#f3e5f5] text-[#8e24aa] text-[10px] font-semibold px-2 py-0.5 rounded">
                          {place.timeRange}
                        </span>
                      </div>

                       {/* Info Icon Button (Bottom Right) */}
                       <div className="flex justify-end mt-2">
                           <button className="text-gray-400 hover:text-gray-600">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                           </button>
                       </div>
                    </div>

                    {/* Thumbnail Image */}
                    <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-300">
                        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Travel Info (Below Card) */}
                  {(place.travelTime || place.distance) && !isLast && (
                    <div className="ml-2 mt-2 flex flex-col gap-1 text-[10px] text-gray-500 font-medium pl-2 border-l-2 border-[#29b6f6]">
                      {place.travelTime && (
                         <div className="flex items-center gap-2">
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                             {place.travelTime}
                         </div>
                      )}
                      {place.distance && (
                         <div className="flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17h2"/><path d="M15 17h2"/></svg>
                             {place.distance}
                         </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Place Input Section */}
            {day.places.length > 0 && (
                <div className="relative mt-4">
                     {/* Connector from last item */}
                    <div className="absolute left-[-5px] -top-6 h-10 w-[2px] bg-[#e0e0e0] z-0"></div>
                    
                    <div className="bg-[#f3f4f6] rounded-lg p-2 flex flex-wrap items-center gap-2 border border-transparent shadow-sm">
                        <div className="flex items-center justify-center text-gray-400 pl-1">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Add a place" 
                            className="bg-transparent text-xs font-medium text-gray-700 placeholder-gray-500 flex-1 focus:outline-none min-w-[80px]" 
                        />
                        
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        
                        <div className="flex items-center gap-1">
                            <input type="text" placeholder="From" className="bg-transparent text-[10px] w-8 text-center focus:outline-none placeholder-gray-400" />
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            <input type="text" placeholder="To" className="bg-transparent text-[10px] w-6 text-center focus:outline-none placeholder-gray-400" />
                        </div>

                         <div className="h-4 w-px bg-gray-300 mx-1"></div>

                        <div className="flex items-center gap-1 text-gray-500">
                             <span className="text-[10px]">Budget</span>
                             <div className="w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center text-[8px]">$</div>
                        </div>

                        <button className="ml-auto w-6 h-6 bg-[#4caf50] hover:bg-green-600 rounded text-white flex items-center justify-center transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}