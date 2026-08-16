import * as api from "./api";
import * as local from "./localStore";
import * as supabaseStore from "./supabaseStore";
import { isSupabaseConfigured } from "./supabase";

export const usesLocalData = import.meta.env.VITE_DATA_SOURCE === "local";
export const usesSupabase = !usesLocalData && isSupabaseConfigured;

const impl = usesLocalData ? local : usesSupabase ? supabaseStore : api;

export const listReadings = impl.listReadings;
export const createReading = impl.createReading;
export const updateReading = impl.updateReading;
export const deleteReading = impl.deleteReading;
export { readingToFormData } from "./api";
