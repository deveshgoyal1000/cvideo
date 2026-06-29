import { render, screen } from '@testing-library/react';
import BottomTimeline from '../BottomTimeline';
import { useProjectStore } from '../../../stores/useProjectStore';

// Mock the Zustand store
jest.mock('../../../stores/useProjectStore', () => ({
    useProjectStore: jest.fn()
}));

describe('BottomTimeline Component', () => {
    beforeEach(() => {
        // Reset mock
        (useProjectStore as unknown as jest.Mock).mockReset();
    });

    it('renders empty state when no projectData is provided', () => {
        (useProjectStore as unknown as jest.Mock).mockReturnValue({
            projectData: null,
            currentTime: 0,
            duration: 0,
            setCurrentTime: jest.fn(),
            isPlaying: false,
            setIsPlaying: jest.fn()
        });

        render(<BottomTimeline />);
        expect(screen.getByText('Timeline requires an active project.')).toBeInTheDocument();
    });

    it('renders timeline track and captions when projectData exists', () => {
        const mockProjectData = {
            captions: [
                {
                    id: 1,
                    start: 0,
                    end: 1,
                    words: [{ text: 'Testing' }]
                }
            ]
        };

        (useProjectStore as unknown as jest.Mock).mockReturnValue({
            projectData: mockProjectData,
            currentTime: 0,
            duration: 10,
            setCurrentTime: jest.fn(),
            isPlaying: false,
            setIsPlaying: jest.fn()
        });

        render(<BottomTimeline />);
        
        // Should show the timestamp marker
        expect(screen.getByText('0.00s / 10.00s')).toBeInTheDocument();
        // Should render the caption block
        expect(screen.getByText('Testing')).toBeInTheDocument();
    });
});
