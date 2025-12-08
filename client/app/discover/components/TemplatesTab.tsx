"use client";

import React from "react";

interface Template {
  id: string;
  title: string;
  destination: string;
  duration: number;
  image: string;
  description: string;
}

const MOCK_TEMPLATES: Template[] = [
  {
    id: "1",
    title: "Tropical Paradise",
    destination: "Bali, Indonesia",
    duration: 7,
    image: "https://images.unsplash.com/photo-1537225228614-b9b7e29fda9d?w=500&h=300&fit=crop",
    description: "Relax on pristine beaches and explore temples",
  },
  {
    id: "2",
    title: "Mountain Adventure",
    destination: "Swiss Alps",
    duration: 5,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
    description: "Hiking, skiing, and breathtaking alpine views",
  },
  {
    id: "3",
    title: "Urban Explorer",
    destination: "Tokyo, Japan",
    duration: 4,
    image: "https://images.unsplash.com/photo-1540959375944-7049f642e9f1?w=500&h=300&fit=crop",
    description: "Modern cities, traditional temples, and street food",
  },
  {
    id: "4",
    title: "Safari Experience",
    destination: "Kenya Safari",
    duration: 6,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&h=300&fit=crop",
    description: "Wildlife viewing and African culture",
  },
  {
    id: "5",
    title: "Mediterranean Escape",
    destination: "Greece",
    duration: 8,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
    description: "Islands, history, and delicious cuisine",
  },
  {
    id: "6",
    title: "Amazon Expedition",
    destination: "Peru",
    duration: 10,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop",
    description: "Rainforest adventure and indigenous culture",
  },
];

export default function TemplatesTab() {
  const handleSelectTemplate = (template: Template) => {
    console.log("Selected template:", template);
    alert(`Template: ${template.title}\nComing soon: View plan details`);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Popular Templates</h2>
        <p className="text-gray-600 mt-2 text-sm">
          Choose a template to get started with your next adventure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group border border-gray-200"
          >
            <div className="relative h-48 overflow-hidden bg-gray-200">
              <img
                src={template.image}
                alt={template.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-base">
                {template.title}
              </h3>
              <p className="text-blue-600 text-sm font-semibold mt-1">
                {template.destination}
              </p>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                {template.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  {template.duration} days
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors">
                  View Plan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
