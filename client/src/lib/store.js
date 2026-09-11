import * as api from "./api";
import * as supabaseStore from "./supabaseStore";
import { isSupabaseConfigured } from "./supabase";

export const usesSupabase = isSupabaseConfigured;

const impl = usesSupabase ? supabaseStore : api;

export const listReadings = impl.listReadings;
export const createReading = impl.createReading;
export const updateReading = impl.updateReading;
export const deleteReading = impl.deleteReading;
export const getActiveShareLink = impl.getActiveShareLink;
export const saveShareLink = impl.saveShareLink;
export const revokeShareLink = impl.revokeShareLink;
export const fetchSharedLists = impl.fetchSharedLists;
export { readingToFormData } from "./api";
