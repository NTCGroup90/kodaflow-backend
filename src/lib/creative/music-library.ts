// Music Library for Video Shorts
// Royalty-free music tracks organized by mood

export interface MusicTrack {
    id: string;
    name: string;
    artist: string;
    duration: number; // seconds
    mood: 'energetic' | 'calm' | 'corporate' | 'trendy' | 'inspiring';
    url: string;
    previewUrl?: string;
}

// Using Pixabay royalty-free music (free for commercial use)
export const MUSIC_LIBRARY: MusicTrack[] = [
    // Energetic
    {
        id: 'energy_1',
        name: 'Upbeat Funk',
        artist: 'AudioCoffee',
        duration: 120,
        mood: 'energetic',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2cf06ce8f8.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2cf06ce8f8.mp3'
    },
    {
        id: 'energy_2',
        name: 'Electronic Groove',
        artist: 'SoundGallery',
        duration: 90,
        mood: 'energetic',
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6e7a02f.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6e7a02f.mp3'
    },

    // Corporate / Professional
    {
        id: 'corp_1',
        name: 'Corporate Motivational',
        artist: 'BestPro',
        duration: 150,
        mood: 'corporate',
        url: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_507f4da9be.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_507f4da9be.mp3'
    },
    {
        id: 'corp_2',
        name: 'Business Innovation',
        artist: 'MusicBox',
        duration: 120,
        mood: 'corporate',
        url: 'https://cdn.pixabay.com/download/audio/2021/11/13/audio_b4d97a573a.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2021/11/13/audio_b4d97a573a.mp3'
    },

    // Trendy / Social Media
    {
        id: 'trendy_1',
        name: 'TikTok Vibes',
        artist: 'Trending Beats',
        duration: 60,
        mood: 'trendy',
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
    },
    {
        id: 'trendy_2',
        name: 'Social Pop',
        artist: 'HitMakers',
        duration: 45,
        mood: 'trendy',
        url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3'
    },

    // Inspiring / Emotional
    {
        id: 'inspire_1',
        name: 'Inspiring Cinematic',
        artist: 'EpicSound',
        duration: 180,
        mood: 'inspiring',
        url: 'https://cdn.pixabay.com/download/audio/2022/01/13/audio_04af295ee1.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/13/audio_04af295ee1.mp3'
    },
    {
        id: 'inspire_2',
        name: 'Emotional Piano',
        artist: 'ClassicVibes',
        duration: 90,
        mood: 'inspiring',
        url: 'https://cdn.pixabay.com/download/audio/2021/08/08/audio_0625c1e0c8.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2021/08/08/audio_0625c1e0c8.mp3'
    },

    // Calm / Relaxed
    {
        id: 'calm_1',
        name: 'Ambient Chill',
        artist: 'RelaxZone',
        duration: 120,
        mood: 'calm',
        url: 'https://cdn.pixabay.com/download/audio/2022/02/23/audio_1e01dc3a31.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2022/02/23/audio_1e01dc3a31.mp3'
    },
    {
        id: 'calm_2',
        name: 'Lo-Fi Beats',
        artist: 'ChillHop',
        duration: 90,
        mood: 'calm',
        url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_e7a64e53cb.mp3',
        previewUrl: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_e7a64e53cb.mp3'
    }
];

export const getMusicByMood = (mood: MusicTrack['mood']): MusicTrack[] => {
    return MUSIC_LIBRARY.filter(track => track.mood === mood);
};

export const getMusicById = (id: string): MusicTrack | undefined => {
    return MUSIC_LIBRARY.find(track => track.id === id);
};

export const getRecommendedForBrand = (toneOfVoice: string[]): MusicTrack[] => {
    // Match brand tone to music mood
    const moodMap: Record<string, MusicTrack['mood']> = {
        'chuyên nghiệp': 'corporate',
        'professional': 'corporate',
        'năng động': 'energetic',
        'dynamic': 'energetic',
        'trẻ trung': 'trendy',
        'youthful': 'trendy',
        'sang trọng': 'inspiring',
        'elegant': 'inspiring',
        'thân thiện': 'calm',
        'friendly': 'calm'
    };

    const moods: Set<MusicTrack['mood']> = new Set();
    toneOfVoice.forEach(tone => {
        const lower = tone.toLowerCase();
        for (const [key, mood] of Object.entries(moodMap)) {
            if (lower.includes(key)) {
                moods.add(mood);
            }
        }
    });

    if (moods.size === 0) {
        return MUSIC_LIBRARY.slice(0, 4); // Return default selection
    }

    return MUSIC_LIBRARY.filter(track => moods.has(track.mood));
};
