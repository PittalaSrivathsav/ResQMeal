"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send, Sparkles, ArrowRight, Check, MapPin, Clock } from "lucide-react";
import { RobotAssistant3D, FoodThumbnailCard } from "@/components/illustrations-3d";

interface SuggestionCard {
  title: string;
  quantity: string;
  category: string;
  pickupBy: string;
  storage: string;
  receivers: { name: string; dist: string }[];
}

export function AssistantForm() {
  const router = useRouter();

  // Chat message history initialized to match Screen 9 exactly
  const [messages, setMessages] = useState<
    {
      sender: "user" | "bot";
      text?: string;
      card?: SuggestionCard;
    }[]
  >([
    {
      sender: "user",
      text: "We have around 50 vegetarian meal packets (Veg Biryani) left from today's dinner. It should be picked up within 2 hours.",
    },
    {
      sender: "bot",
      text: "Great! Here's a suggested donation listing:",
      card: {
        title: "Veg Biryani",
        quantity: "50 meal packets",
        category: "Vegetarian",
        pickupBy: "Today, within 2 hours",
        storage: "Keep in sealed containers. Consume within 4 hours.",
        receivers: [
          { name: "Hope Foundation", dist: "1.2 km" },
          { name: "Kukatpally Community Kitchen", dist: "2.8 km" },
        ],
      },
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSend(textToSend?: string) {
    const userText = textToSend ?? input;
    if (!userText.trim()) return;

    // Add user message
    const newMsgs = [...messages, { sender: "user" as const, text: userText }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      // Natural language extraction logic
      const isIdli = userText.toLowerCase().includes("idli");
      const isDal = userText.toLowerCase().includes("dal") || userText.toLowerCase().includes("rice");
      const isVeg = !userText.toLowerCase().includes("chicken") && !userText.toLowerCase().includes("meat");

      // Extract number if present
      const matchNum = userText.match(/\d+/);
      const qty = matchNum ? `${matchNum[0]} meal packets` : "40 meal packets";

      const dishTitle = isIdli ? "Idli & Sambar" : isDal ? "Rice & Dal" : "Veg Biryani";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot" as const,
          text: "Great! Here's a suggested donation listing:",
          card: {
            title: dishTitle,
            quantity: qty,
            category: isVeg ? "Vegetarian" : "Non-vegetarian",
            pickupBy: "Today, within 2 hours",
            storage: "Keep in sealed containers. Consume within 4 hours.",
            receivers: [
              { name: "Hope Foundation", dist: "1.2 km" },
              { name: "Kukatpally Community Kitchen", dist: "2.8 km" },
            ],
          },
        },
      ]);
      setLoading(false);
    }, 600);
  }

  function handleUseThis(card: SuggestionCard) {
    const qtyVal = card.quantity.replace(/\D/g, "") || "50";
    router.push(
      `/donations/new?title=${encodeURIComponent(card.title)}&quantity=${qtyVal}&category=${encodeURIComponent(
        card.category
      )}&storage=${encodeURIComponent(card.storage)}`
    );
  }

  return (
    <div className="flex flex-col h-[650px] rounded-3xl border border-white/90 bg-white/95 p-6 shadow-[0_20px_50px_rgba(7,91,42,0.06)] backdrop-blur">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.sender === "user" ? (
              /* User Bubble (Right-aligned, green tint matching Screen 9) */
              <div className="flex justify-end">
                <div className="max-w-xl rounded-3xl rounded-tr-md bg-[#D9F2DE] border border-[#BDE8C6] px-5 py-3.5 text-sm font-semibold text-[#17251C] shadow-sm">
                  {msg.text}
                </div>
              </div>
            ) : (
              /* Bot Response (Left-aligned, 3D Robot Avatar + Suggestion Card matching Screen 9) */
              <div className="flex items-start gap-3.5 max-w-2xl">
                <div className="shrink-0 animate-bounce duration-[4000ms]">
                  <RobotAssistant3D size={54} />
                </div>

                <div className="space-y-3 flex-1">
                  {msg.text && (
                    <div className="inline-block rounded-2xl bg-slate-100/80 px-4 py-2.5 text-sm font-bold text-slate-800">
                      {msg.text}
                    </div>
                  )}

                  {msg.card && (
                    <div className="rounded-3xl border border-slate-200/90 bg-[#F4FBF5] p-5 shadow-sm space-y-4">
                      {/* Dish Summary Row */}
                      <div className="flex items-center gap-4">
                        <FoodThumbnailCard dish={msg.card.title} size={76} />
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900">
                            {msg.card.title}
                          </h4>
                          <div className="mt-1 space-y-0.5 text-xs font-bold text-slate-600">
                            <p>Quantity: <span className="text-slate-900">{msg.card.quantity}</span></p>
                            <p>Type: <span className="text-[#138A36]">{msg.card.category}</span></p>
                            <p>Pickup by: <span className="text-slate-900">{msg.card.pickupBy}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Storage instruction */}
                      <div className="rounded-xl bg-white p-3 text-xs font-semibold text-slate-600 border border-slate-200/60">
                        <span className="font-bold text-slate-800">Storage:</span> {msg.card.storage}
                      </div>

                      {/* Recommended Receivers */}
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                          Recommended receivers nearby:
                        </p>
                        <ul className="space-y-1 text-xs font-bold text-slate-600">
                          {msg.card.receivers.map((rec) => (
                            <li key={rec.name} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#138A36]" />
                              <span>{rec.name}</span>
                              <span className="text-slate-400">({rec.dist})</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* "Use This" button matching Screen 9 */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleUseThis(msg.card!)}
                          className="rounded-full bg-[#138A36] px-6 py-2.5 text-xs font-extrabold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:scale-[1.02] active:scale-95"
                        >
                          Use This
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <RobotAssistant3D size={44} />
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 animate-pulse">
              ResQ Assistant is drafting your donation listing…
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="pt-3 pb-2 flex flex-wrap gap-2 text-xs">
        <span className="font-bold text-slate-400 self-center">Try:</span>
        <button
          type="button"
          onClick={() =>
            handleSend(
              "We have around 50 vegetarian meal packets (Veg Biryani) left from today's dinner. It should be picked up within 2 hours."
            )
          }
          className="rounded-full bg-slate-100 hover:bg-[#E8F7EA] hover:text-[#138A36] px-3 py-1 font-bold text-slate-600 transition"
        >
          🍛 50 Veg Biryani Packets
        </button>
        <button
          type="button"
          onClick={() =>
            handleSend(
              "We have 80 packets of Idli & Sambar freshly made in Kukatpally. Ready for pickup within 3 hours."
            )
          }
          className="rounded-full bg-slate-100 hover:bg-[#E8F7EA] hover:text-[#138A36] px-3 py-1 font-bold text-slate-600 transition"
        >
          🥣 80 Idli & Sambar Packets
        </button>
      </div>

      {/* Chat Input Bar matching Screen 9 */}
      <div className="relative pt-2 border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type a message..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#138A36] focus:bg-white focus:ring-2 focus:ring-[#138A36]/15"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          aria-label="Send Message"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#138A36] text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
