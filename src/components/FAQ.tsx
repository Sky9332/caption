"use dom";

import "@/globals.css";
import { useRouter } from "expo-router";

interface FAQProps {
  dom: import("expo/dom").DOMProps;
}

const faqData = [
  { icon: "📖", text: "Help Center" },
  { icon: "🔍", text: "Search for an answer" },
  { icon: "💳", text: "Subscriptions & Plans" },
  { icon: "👤", text: "AI Creator" },
  { icon: "✨", text: "AI Edit" },
  { icon: "💬", text: "Caption & Dub" },
];

export default function FAQ({ dom }: FAQProps) {
  const router = useRouter();

  const handleItemClick = (item: { icon: string; text: string }) => {
    console.log(`Clicked: ${item.text}`);
  };

  return (
    <div className="bg-gradient-to-b from-black to-white w-full font-sans">
      <div className="p-4 pt-8 text-white">
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center space-x-1">
            <button
              className="ml-2 font-light text-2xl"
              onClick={() => router.dismiss()}
            >
              x
            </button>
          </div>
        </div>
        <h1 className="font-semibold text-3xl">Hi 👋</h1>
        <h2 className="mb-4 font-semibold text-3xl">How can we help?</h2>
      </div>

      <div className="bg-white shadow-md m-2.5 p-2.5 rounded-lg">
        <div className="flex justify-between items-center bg-white shadow-sm mb-2.5 p-4 border border-gray-200 rounded-md">
          <span className="font-medium text-black text-base">Messages</span>
          <span className="text-base">💬</span>
        </div>
        <div className="bg-white shadow-sm p-0 border border-gray-200 rounded-md">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="flex items-center p-4 border-gray-200 border-b last:border-b-0 cursor-pointer"
              onClick={() => handleItemClick(item)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleItemClick(item);
                }
              }}
            >
              <span className="mr-2.5 text-lg">{item.icon}</span>
              <span className="flex-grow text-gray-700 text-base">
                {item.text}
              </span>
              <span className="text-gray-400 text-base">↗</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center bg-white shadow-md m-2.5 p-4 border border-gray-200 rounded-md h-24">
        <span className="mb-2 text-gray-700 text-base">
          Have a feature request?
        </span>
        <button className="bg-black px-4 py-1.5 rounded-lg w-full font-semibold text-white text-sm">
          Submit Feature Request
        </button>
      </div>
    </div>
  );
}
