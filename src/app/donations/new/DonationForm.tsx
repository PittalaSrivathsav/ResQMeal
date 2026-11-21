"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { createDonation, type DonationFormState } from "./actions";
import { Calendar, Clock, Sparkles } from "lucide-react";

const initialState: DonationFormState = { ok: false, errors: {} };

const FOOD_TYPES = ["Vegetarian", "Non-vegetarian", "Vegan", "Bakery", "Mixed"];

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#138A36] focus:bg-white focus:ring-2 focus:ring-[#138A36]/15";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}

export function DonationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Empty inputs by default as requested
  const [title, setTitle] = useState(searchParams?.get("title") ?? "");
  const [foodCategory, setFoodCategory] = useState(searchParams?.get("category") ?? "Vegetarian");
  const [quantityValue, setQuantityValue] = useState(searchParams?.get("quantity") ?? "");
  const [storageInfo, setStorageInfo] = useState(searchParams?.get("storage") ?? "");
  const [allergens, setAllergens] = useState(searchParams?.get("allergens") ?? "");

  const [state, formAction, pending] = useActionState(createDonation, initialState);
  const errors: Record<string, string> = state.ok ? {} : state.errors;

  useEffect(() => {
    if (state.ok) {
      router.push(`/donations/${state.id}`);
    }
  }, [state, router]);

  // Format today's date formatted for datetime-local
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const defaultPreparedAt = `${todayDateStr}T19:00`;
  const defaultPickupDeadline = `${todayDateStr}T21:00`;

  return (
    <form action={formAction} className="space-y-5">
      {errors.form ? (
        <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {errors.form}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Food Name * */}
        <Field id="title" label="Food Name *" error={errors.title}>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Veg Biryani"
          />
        </Field>

        {/* Food Type * */}
        <Field id="foodCategory" label="Food Type *" error={errors.foodCategory}>
          <select
            id="foodCategory"
            name="foodCategory"
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value)}
            className={inputClass}
          >
            {FOOD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        {/* Quantity * */}
        <Field id="quantityValue" label="Quantity *" error={errors.quantityValue}>
          <div className="flex gap-2">
            <input
              id="quantityValue"
              name="quantityValue"
              type="number"
              min="1"
              required
              value={quantityValue}
              onChange={(e) => setQuantityValue(e.target.value)}
              className={inputClass}
              placeholder="50"
            />
            <select
              name="quantityUnit"
              defaultValue="SERVINGS"
              className="rounded-2xl border border-slate-200 bg-slate-50/60 px-3 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="SERVINGS">meal packets</option>
              <option value="KG">kg</option>
            </select>
          </div>
        </Field>

        {/* Unit & Estimated servings hidden helper */}
        <input type="hidden" name="estimatedServings" value={quantityValue} />
        <input
          type="hidden"
          name="isVegetarian"
          value={
            foodCategory === "Non-vegetarian"
              ? "false"
              : foodCategory === "Vegetarian" || foodCategory === "Vegan"
              ? "true"
              : "false"
          }
        />
        <input type="hidden" name="storageType" value="AMBIENT" />
        <input type="hidden" name="pickupWindowStart" value={defaultPreparedAt} />
        <input type="hidden" name="consumeBy" value={`${todayDateStr}T23:00`} />
        <input type="hidden" name="noKnownAllergens" value={allergens ? "false" : "true"} />

        {/* Prepared At * */}
        <Field id="preparedAt" label="Prepared At *" error={errors.preparedAt}>
          <div className="relative">
            <input
              id="preparedAt"
              name="preparedAt"
              type="datetime-local"
              defaultValue={defaultPreparedAt}
              required
              className={inputClass}
            />
          </div>
        </Field>

        {/* Pickup By * */}
        <Field id="pickupDeadline" label="Pickup By *" error={errors.pickupDeadline}>
          <div className="relative">
            <input
              id="pickupDeadline"
              name="pickupDeadline"
              type="datetime-local"
              defaultValue={defaultPickupDeadline}
              required
              className={inputClass}
            />
          </div>
        </Field>

        {/* Storage and Handling Info * */}
        <div className="sm:col-span-2">
          <Field
            id="storageInstructions"
            label="Storage/Handling Info *"
            error={errors.storageInstructions}
          >
            <input
              id="storageInstructions"
              name="storageInstructions"
              type="text"
              required
              value={storageInfo}
              onChange={(e) => setStorageInfo(e.target.value)}
              className={inputClass}
              placeholder="Keep in sealed containers. Consume within 4 hours."
            />
            <input type="hidden" name="handlingInstructions" value={storageInfo} />
          </Field>
        </div>

        {/* Allergens */}
        <div className="sm:col-span-2">
          <Field id="allergens" label="Allergens (if any)" error={errors.allergens}>
            <input
              id="allergens"
              name="allergens"
              type="text"
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
              className={inputClass}
              placeholder="Contains dairy"
            />
          </Field>
        </div>
      </div>

      {/* Form Action Buttons matching Screen 4 */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Link
          href="/restaurant"
          className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-extrabold text-slate-600 hover:bg-slate-50 transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-[#138A36] to-[#075B2A] px-7 py-2.5 text-sm font-extrabold text-white shadow-md shadow-[#138A36]/25 hover:shadow-lg hover:scale-[1.01] active:scale-95 transition disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post Donation"}
        </button>
      </div>
    </form>
  );
}
