import React from "react";
import { Event } from "@/interface/TripEvent";
import { MapPin, AlignLeft, Image as ImageIcon } from "lucide-react";

interface EventDetailsProps {
  data: Partial<Event>;
  isEditing: boolean;
  onChange: (field: keyof Event, value: any) => void;
}

export default function EventDetails({ data, isEditing, onChange }: EventDetailsProps) {
  return (
    <div className="p-6 pt-2 flex flex-col gap-6">
      
      {/* Location Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
          <MapPin size={16} /> Location
        </div>
        <div className="pl-6 space-y-2">
            {isEditing ? (
              <>
                 <input
                  type="text"
                  placeholder="Address"
                  value={data.address || ""}
                  onChange={(e) => onChange("address", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={data.city || ""}
                    onChange={(e) => onChange("city", e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                  />
                   <input
                    type="text"
                    placeholder="Country"
                    value={data.country || ""}
                    onChange={(e) => onChange("country", e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                  />
                </div>
              </>
            ) : (
               <div className="text-sm text-gray-600">
                  {data.address ? (
                    <p>{data.address}</p>
                  ) : <span className="text-gray-400 italic">No address provided</span>}
                  
                  {(data.city || data.country) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {[data.city, data.country].filter(Boolean).join(", ")}
                    </p>
                  )}
               </div>
            )}
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
          <AlignLeft size={16} /> Description
        </div>
        <div className="pl-6">
          {isEditing ? (
            <textarea
              rows={4}
              placeholder="Add notes, details, or booking numbers..."
              value={data.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-gray-50"
            />
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {data.description || <span className="text-gray-400 italic">No description added.</span>}
            </p>
          )}
        </div>
      </div>

       {/* Image Section */}
       <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
          <ImageIcon size={16} /> Cover Image
        </div>
        <div className="pl-6">
          {isEditing ? (
             <input
             type="text"
             placeholder="Image URL"
             value={data.image || ""}
             onChange={(e) => onChange("image", e.target.value)}
             className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400 mb-2"
           />
          ) : null}

          {data.image ? (
            <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-video bg-gray-100">
              <img 
                src={data.image} 
                alt={data.title} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            !isEditing && <div className="h-24 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">No Image</div>
          )}
        </div>
      </div>

    </div>
  );
}