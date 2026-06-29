import { useProjectStore } from '../useProjectStore';
import { ProjectData } from '../../types';

describe('useProjectStore', () => {
    // Reset store before each test
    beforeEach(() => {
        useProjectStore.setState({
            projectData: null,
            videoUrl: '',
            finalVideoUrl: '',
            loading: false,
            rendering: false,
            loadingStatus: '',
            activeTab: 'captions',
            currentTime: 0,
            duration: 0,
            isPlaying: false,
        });
    });

    const mockProjectData: ProjectData = {
        template_id: 'modern',
        global_style: {
            font_family: 'Arial',
            font_size: 48,
            primary_color: '#FFFFFF',
            outline_color: '#000000',
            back_color: '#000000',
            alignment: 2,
            margin_v: 150,
            margin_l: 10,
            margin_r: 10,
        },
        captions: [
            {
                start: 0.0,
                end: 2.0,
                words: [
                    {
                        text: 'Hello',
                        start: 0.0,
                        end: 1.0,
                        style: { color: '#FFFFFF' },
                        animations: []
                    },
                    {
                        text: 'World',
                        start: 1.0,
                        end: 2.0,
                        style: { color: '#FFFFFF' },
                        animations: []
                    }
                ]
            }
        ]
    };

    it('should initialize with default state', () => {
        const state = useProjectStore.getState();
        expect(state.projectData).toBeNull();
        expect(state.currentTime).toBe(0);
        expect(state.isPlaying).toBe(false);
    });

    it('should set project data correctly', () => {
        useProjectStore.getState().setProjectData(mockProjectData);
        const state = useProjectStore.getState();
        expect(state.projectData).toEqual(mockProjectData);
    });

    it('should update global style fields', () => {
        useProjectStore.getState().setProjectData(mockProjectData);
        useProjectStore.getState().updateGlobalStyle('font_size', 72);
        
        const state = useProjectStore.getState();
        expect(state.projectData?.global_style?.font_size).toBe(72);
        // Ensure other fields remain untouched
        expect(state.projectData?.global_style?.font_family).toBe('Arial');
    });

    it('should update individual word fields deeply', () => {
        useProjectStore.getState().setProjectData(mockProjectData);
        // Change "Hello" to "Hi"
        useProjectStore.getState().updateWord(0, 0, 'text', 'Hi');
        
        const state = useProjectStore.getState();
        expect(state.projectData?.captions[0].words[0].text).toBe('Hi');
        // Ensure "World" is untouched
        expect(state.projectData?.captions[0].words[1].text).toBe('World');
    });

    it('should sync video playback state', () => {
        useProjectStore.getState().setCurrentTime(5.5);
        useProjectStore.getState().setIsPlaying(true);
        useProjectStore.getState().setDuration(10.0);

        const state = useProjectStore.getState();
        expect(state.currentTime).toBe(5.5);
        expect(state.isPlaying).toBe(true);
        expect(state.duration).toBe(10.0);
    });
});
