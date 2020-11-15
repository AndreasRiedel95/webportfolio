import { writable } from 'svelte/store';
export const lastActiveRoute = writable({});
export const filterClick = writable(false);
export const isDragging = writable(false);
