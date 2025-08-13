import {create} from "zustand";

type ScrollState = {
    scrollLeft: number;
    lastSource?: string;
    setScrollLeft: (scrollLeft: number, sourceId?: string) => void;
};

export const useScrollStore = create<ScrollState>((set) => ({
    scrollLeft: 0,
    lastSource: undefined,
    setScrollLeft: (scrollLeft, sourceId) => set({scrollLeft, lastSource: sourceId})
}));
