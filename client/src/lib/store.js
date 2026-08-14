import * as api from "./api";
import * as local from "./localStore";

export const usesLocalData = import.meta.env.VITE_DATA_SOURCE === "local";

const impl = usesLocalData ? local : api;

export const listReadings = impl.listReadings;
export const createReading = impl.createReading;
export const updateReading = impl.updateReading;
export const deleteReading = impl.deleteReading;
export { readingToFormData } from "./api";
