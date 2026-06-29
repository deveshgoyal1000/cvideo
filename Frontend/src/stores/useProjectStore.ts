import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectData, GlobalStyle, Word } from '../types';

interface ProjectState {
    projectData: ProjectData | null;
    videoUrl: string;
    finalVideoUrl: string;
    loading: boolean;
    rendering: boolean;
    loadingStatus: string;
    activeTab: "captions" | "design" | "layout";
    
    // Video Playback State
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    
    // Actions
    setProjectData: (data: ProjectData | null) => void;
    setVideoUrl: (url: string) => void;
    setFinalVideoUrl: (url: string) => void;
    setLoading: (loading: boolean, status?: string) => void;
    setRendering: (rendering: boolean, status?: string) => void;
    setActiveTab: (tab: "captions" | "design" | "layout") => void;
    
    // Video Actions
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setIsPlaying: (playing: boolean) => void;
    
    // Fine-grained mutations
    updateProjectField: (field: keyof ProjectData, value: any) => void;
    updateGlobalStyle: (field: keyof GlobalStyle, value: any) => void;
    updateWord: (captionIndex: number, wordIndex: number, field: keyof Word, value: any) => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            projectData: null,
            videoUrl: "",
            finalVideoUrl: "",
            loading: false,
            rendering: false,
            loadingStatus: "",
            activeTab: "captions",
            currentTime: 0,
            duration: 0,
            isPlaying: false,

            setProjectData: (data) => set({ projectData: data }),
            setVideoUrl: (url) => set({ videoUrl: url }),
            setFinalVideoUrl: (url) => set({ finalVideoUrl: url }),
            
            setLoading: (loading, status = "") => set({ loading, loadingStatus: status }),
            setRendering: (rendering, status = "") => set({ rendering, loadingStatus: status }),
            setActiveTab: (tab) => set({ activeTab: tab }),

            setCurrentTime: (time) => set({ currentTime: time }),
            setDuration: (duration) => set({ duration: duration }),
            setIsPlaying: (playing) => set({ isPlaying: playing }),

            updateProjectField: (field, value) => set((state) => {
                if (!state.projectData) return state;
                const newData = { ...state.projectData, [field]: value };
                return { projectData: newData };
            }),

            updateGlobalStyle: (field, value) => set((state) => {
                if (!state.projectData) return state;
                const newData = { ...state.projectData };
                if (!newData.global_style) {
                    newData.global_style = { font_family: "Arial", font_size: 48, primary_color: "#FFFFFF", outline_color: "#000000", back_color: "#000000", alignment: 2, margin_v: 150, margin_l: 10, margin_r: 10 };
                }
                newData.global_style = { ...newData.global_style, [field]: value };
                return { projectData: newData };
            }),

            updateWord: (captionIndex, wordIndex, field, value) => set((state) => {
                if (!state.projectData) return state;
                const newData = { ...state.projectData };
                const captions = [...newData.captions];
                const caption = { ...captions[captionIndex] };
                const words = [...caption.words];
                const word = { ...words[wordIndex], [field]: value };
                
                words[wordIndex] = word;
                caption.words = words;
                captions[captionIndex] = caption;
                newData.captions = captions;
                
                return { projectData: newData };
            })
        }),
        {
            name: 'studio-project-storage',
            partialize: (state) => ({ projectData: state.projectData }),
        }
    )
);
