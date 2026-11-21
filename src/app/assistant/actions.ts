"use server";

import { requireRole } from "@/lib/roles";
import { parseDonationText, type DonationDraft } from "./parse";

export type DraftState = { draft?: DonationDraft; error?: string };

export async function draftDonation(_prev: unknown, formData: FormData): Promise<DraftState> {
  await requireRole("RESTAURANT");
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Please describe your surplus food" };
  return { draft: parseDonationText(text) };
}
