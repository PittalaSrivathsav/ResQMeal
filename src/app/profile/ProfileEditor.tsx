"use client";

import { useState, useActionState, useEffect } from "react";
import { UserCircle, Edit3, Check, X, Building2, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";
import { updateProfileAction, type ProfileFormState } from "./actions";
import { LOCALITY_NAMES } from "@/lib/localities";

const ROLE_LABELS: Record<string, string> = {
  RESTAURANT: "Restaurant Partner",
  NGO: "Verified NGO",
  VOLUNTEER: "Rescue Volunteer",
  ADMIN: "Administrator",
};

type ProfileEditorProps = {
  user: {
    displayName: string;
    email: string;
    phone?: string | null;
    role: string;
  };
  organisation?: {
    name: string;
    publicLocality: string;
    type?: string;
  } | null;
  volunteer?: {
    serviceLocalities: string[];
  } | null;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#138A36] focus:bg-white focus:ring-2 focus:ring-[#138A36]/15";

export function ProfileEditor({ user, organisation, volunteer }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    {}
  );

  const initialLocality =
    organisation?.publicLocality || volunteer?.serviceLocalities?.[0] || LOCALITY_NAMES[0];

  const [displayName, setDisplayName] = useState(user.displayName);
  const [phone, setPhone] = useState(user.phone || "");
  const [organisationName, setOrganisationName] = useState(organisation?.name || "");
  const [publicLocality, setPublicLocality] = useState(initialLocality);

  useEffect(() => {
    if (state.ok) {
      setIsEditing(false);
    }
  }, [state]);

  const currentLocality =
    organisation?.publicLocality || volunteer?.serviceLocalities?.[0] || "India Network";

  return (
    <div className="space-y-6">
      {state.message && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-[#138A36] flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>{state.message}</span>
          </span>
        </div>
      )}

      {state.error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-bold text-rose-700 shadow-sm">
          <span>{state.error}</span>
        </div>
      )}

      <div className="rounded-3xl bg-white p-7 shadow-[0_10px_30px_rgba(7,91,42,0.05)] border border-slate-200/80">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F7EA] text-[#138A36] text-2xl font-black shadow-sm ring-4 ring-[#E8F7EA]/50">
              {organisation?.name
                ? organisation.name.charAt(0).toUpperCase()
                : user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {organisation?.name || user.displayName}
                </h2>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-black text-[#138A36]">
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Owner / Manager: <span className="text-slate-800">{user.displayName}</span>
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#138A36] hover:bg-[#F4FBF5] hover:text-[#138A36]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* View Mode */}
        {!isEditing ? (
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <dt className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Building2 className="h-4 w-4 text-[#138A36]" />
                <span>Organisation Name</span>
              </dt>
              <dd className="mt-1 text-sm font-black text-slate-900">
                {organisation?.name || user.displayName}
              </dd>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <dt className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <UserCircle className="h-4 w-4 text-[#138A36]" />
                <span>Contact Person / Owner</span>
              </dt>
              <dd className="mt-1 text-sm font-black text-slate-900">{user.displayName}</dd>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <dt className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Mail className="h-4 w-4 text-[#138A36]" />
                <span>Email Address</span>
              </dt>
              <dd className="mt-1 text-sm font-black text-slate-900">{user.email}</dd>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <dt className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Phone className="h-4 w-4 text-[#138A36]" />
                <span>Phone Number</span>
              </dt>
              <dd className="mt-1 text-sm font-black text-slate-900">
                {user.phone || "Not provided"}
              </dd>
            </div>

            <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <dt className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <MapPin className="h-4 w-4 text-[#138A36]" />
                <span>Operating Locality / Hub</span>
              </dt>
              <dd className="mt-1 text-sm font-black text-slate-900">{currentLocality}</dd>
            </div>
          </dl>
        ) : (
          /* Edit Mode Form */
          <form action={formAction} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Organisation Name (for Restaurant & NGO) */}
              {user.role !== "VOLUNTEER" && (
                <div className="sm:col-span-2">
                  <label htmlFor="organisationName" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Organisation / Restaurant Name *
                  </label>
                  <input
                    id="organisationName"
                    name="organisationName"
                    type="text"
                    required
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. My Kitchen, Spice Garden Restaurant"
                  />
                </div>
              )}

              {/* Owner / Contact Name */}
              <div>
                <label htmlFor="displayName" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Owner / Contact Name *
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Kanna, Rahul"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 9876543210"
                />
              </div>

              {/* Operating Locality */}
              <div className="sm:col-span-2">
                <label htmlFor="publicLocality" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Operating Locality / Nearest Area *
                </label>
                <select
                  id="publicLocality"
                  name="publicLocality"
                  value={publicLocality}
                  onChange={(e) => setPublicLocality(e.target.value)}
                  className={inputClass}
                >
                  {LOCALITY_NAMES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-[#138A36] px-6 py-2 text-xs font-extrabold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:shadow-lg disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
