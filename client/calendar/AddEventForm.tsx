'use client';

import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, Check } from 'lucide-react';
import SmartInput from './InputIcon';
import LocationAutocomplete from '@/components/map/LocationAutocomplete';
import { GeocodedLocation } from '@/utils/geocoding';

export default function AddEventForm() {
    const [newEvent, setNewEvent] = useState({
        title: "",
        date: "",
        // date: activeTrip?.start_date
        // ? new Date(activeTrip?.start_date).toISOString().split("T")[0]
        // : "",
        startTime: "",
        endTime: "",
        cost: "",
        location: "",
        status: "",
    });

    const handleInputChange = (field: string, value: any) => {
        setNewEvent(prev => ({ ...prev, [field]: value }));
    };

    const [selectedLocation, setSelectedLocation] = useState<GeocodedLocation | null>(null);

    const handleSubmit = () => {
        console.log("Submitting Event:", newEvent);
        // Add your API call or Context dispatch here
    };

    return (
        <div className="flex w-full flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            {/* --- Row 1: Location (Your Existing Component) --- */}
            <div className="flex w-full rounded-xl bg-gray-100">
                {/* Wrapper to ensure your existing component fits the style */}
                <div className="flex-1">
                    <LocationAutocomplete
                        value={newEvent.location}
                        onChange={(value: any, location: any) => {
                            // Adapting to your existing callback signature
                            handleInputChange("location", location);
                            setSelectedLocation(location);
                        }}
                        placeholder="Add a place"
                    // You might need to pass className props to your component 
                    // to match the 'bg-gray-100 rounded-xl p-3' style
                    />
                </div>
            </div>

            {/* --- Row 2: Day Picker --- */}
            <SmartInput
                type="date"
                placeholder="Day"
                value={newEvent.date}
                onChange={(val) => handleInputChange('date', val)}
                Icon={Calendar}
            />

            {/* --- Row 3: Time Range (Grid) --- */}
            <div className="grid grid-cols-2 gap-3">
                <SmartInput
                    type="time"
                    placeholder="From"
                    value={newEvent.startTime}
                    onChange={(val) => handleInputChange('startTime', val)}
                    Icon={Clock}
                />
                <SmartInput
                    type="time"
                    placeholder="To"
                    value={newEvent.endTime}
                    onChange={(val) => handleInputChange('endTime', val)}
                    Icon={Clock}
                />
            </div>

            {/* --- Row 4: Budget + Submit Action --- */}
            <div className="flex h-12 gap-3">
                {/* Budget Input */}
                <div className="relative flex flex-1 items-center rounded-xl bg-gray-100 px-4 hover:bg-gray-200">
                    <span className="text-sm font-medium text-gray-500">Budget</span>
                    <input
                        type="number"
                        placeholder=""
                        value={newEvent.cost}
                        onChange={(e) => handleInputChange('cost', e.target.value)}
                        className="w-full bg-transparent px-2 text-right text-sm font-medium text-gray-900 focus:outline-none"
                    />
                    <DollarSign className="ml-2 h-5 w-5 text-gray-500" />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="flex aspect-square h-full items-center justify-center rounded-xl bg-green-500 text-white transition-transform hover:scale-105 active:scale-95"
                >
                    <Check className="h-6 w-6" strokeWidth={3} />
                </button>
            </div>

        </div>
    );
}