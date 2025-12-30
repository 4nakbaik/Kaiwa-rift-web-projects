// Tipe untuk Kartu Flashcard
export interface Flashcard {
    id: number;
    kanji: string;
    kana: string;
    romaji: string;
    meaning: string;
    example_sentence?: string; // Tanda tanya artinya opsional (bisa ada atau tidak nya)
}

// Tipe untuk Stats User
export interface UserStats {
    total_learned: number;
    ingat_count: number;
    ragu_count: number;
    lupa_count: number;
    n5_mastery: number;
    is_unlocked_n4: boolean;
}

// Tipe untuk Soal Kaiwa
export interface KaiwaQuestion {
    id: number;
    level: number;
    type: 'dialogue';
    question: string;
    options: string[];
    correctAnswer?: string; 
}

// Tipe untuk Response API standar
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}