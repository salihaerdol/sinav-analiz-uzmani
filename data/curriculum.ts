import { QuestionConfig } from '../types';

// --- MASTER DATABASE: 5th Grade English Outcomes (Tüm Müfredat) ---
// Bu liste MEB müfredatındaki standart kazanımları içerir.
// Kullanıcı kod yazdığında (örn: E5.1.S1) buradan açıklama çeker.

export const GRADE_5_ENGLISH_MASTER_LIST: Record<string, string> = {
  // UNIT 1: HELLO
  "E5.1.L1": "Students will be able to understand simple personal information.",
  "E5.1.S1": "Students will be able to introduce themselves and meet other people.",
  "E5.1.S2": "Students will be able to exchange simple personal information.",
  "E5.1.R1": "Students will be able to read and understand picture stories, short and simple texts about greeting and meeting people.",

  // UNIT 2: MY TOWN
  "E5.2.L1": "Students will be able to understand simple directions to get from one place to another.",
  "E5.2.S1": "Students will be able to ask for and give simple directions.",
  "E5.2.S2": "Students will be able to talk about the locations of things and people.",
  "E5.2.R1": "Students will be able to understand short and simple texts about the location of things and people.",

  // UNIT 3: GAMES AND HOBBIES
  "E5.3.L1": "Students will be able to recognize likes and dislikes.",
  "E5.3.S1": "Students will be able to express likes and dislikes.",
  "E5.3.S2": "Students will be able to ask people about their likes and dislikes.",
  "E5.3.R1": "Students will be able to understand short and simple texts about likes and dislikes.",

  // UNIT 4: MY DAILY ROUTINE
  "E5.4.L1": "Students will be able to understand simple oral texts about daily routines.",
  "E5.4.S1": "Students will be able to describe their daily routines.",
  "E5.4.S2": "Students will be able to ask people about their daily routines.",
  "E5.4.R1": "Students will be able to understand short and simple texts about daily routines.",

  // UNIT 5: HEALTH
  "E5.5.L1": "Students will be able to understand simple suggestions concerning illnesses/needs.",
  "E5.5.S1": "Students will be able to ask for and give information about illnesses/needs.",
  "E5.5.S2": "Students will be able to make simple suggestions concerning illnesses/needs.",
  "E5.5.R1": "Students will be able to understand short and simple texts about illnesses/needs.",

  // UNIT 6: MOVIES
  "E5.6.L1": "Students will be able to understand phrases and simple sentences about movies/movie characters.",
  "E5.6.S1": "Students will be able to express likes and dislikes about movies/movie types.",
  "E5.6.S2": "Students will be able to state the time.",
  "E5.6.R1": "Students will be able to understand short and simple texts about movies/movie characters.",

  // UNIT 7: PARTY TIME
  "E5.7.L1": "Students will be able to understand simple oral texts about parties.",
  "E5.7.S1": "Students will be able to ask for and give permission.",
  "E5.7.S2": "Students will be able to express and ask for basic needs.",
  "E5.7.R1": "Students will be able to understand short and simple invitation cards and texts.",

  // UNIT 8: FITNESS
  "E5.8.L1": "Students will be able to understand simple suggestions.",
  "E5.8.S1": "Students will be able to make simple suggestions.",
  "E5.8.S2": "Students will be able to accept or refuse suggestions.",
  "E5.8.R1": "Students will be able to understand short and simple texts about fitness.",

  // UNIT 9: ANIMAL SHELTER
  "E5.9.L1": "Students will be able to understand simple expressions about what people/animals are doing at the moment.",
  "E5.9.S1": "Students will be able to ask and answer questions about what people/animals are doing at the moment.",
  "E5.9.R1": "Students will be able to understand short and simple texts about what people/animals are doing at the moment.",

  // UNIT 10: FESTIVALS
  "E5.10.L1": "Students will be able to understand simple texts about festivals.",
  "E5.10.S1": "Students will be able to talk about numbers from 100 to 1000.",
  "E5.10.R1": "Students will be able to understand short and simple texts about festivals."
};

// --- SCENARIO TEMPLATES (Örnek Senaryolar) ---

// Senaryo 1: Dinleme ve Konuşma ağırlıklı (Örnek)
export const GRADE_5_ENGLISH_SCENARIO_1: QuestionConfig[] = [
  { id: 1, order: 1, maxScore: 10, outcome: { code: "E5.1.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.1.S1"] } },
  { id: 2, order: 2, maxScore: 10, outcome: { code: "E5.1.S2", description: GRADE_5_ENGLISH_MASTER_LIST["E5.1.S2"] } },
  { id: 3, order: 3, maxScore: 10, outcome: { code: "E5.2.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.2.S1"] } },
  { id: 4, order: 4, maxScore: 10, outcome: { code: "E5.2.S2", description: GRADE_5_ENGLISH_MASTER_LIST["E5.2.S2"] } },
  { id: 5, order: 5, maxScore: 10, outcome: { code: "E5.3.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.3.S1"] } },
  { id: 6, order: 6, maxScore: 10, outcome: { code: "E5.3.S2", description: GRADE_5_ENGLISH_MASTER_LIST["E5.3.S2"] } },
  { id: 7, order: 7, maxScore: 10, outcome: { code: "E5.4.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.4.S1"] } },
  { id: 8, order: 8, maxScore: 10, outcome: { code: "E5.4.S2", description: GRADE_5_ENGLISH_MASTER_LIST["E5.4.S2"] } },
  { id: 9, order: 9, maxScore: 10, outcome: { code: "E5.5.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.5.S1"] } },
  { id: 10, order: 10, maxScore: 10, outcome: { code: "E5.5.S2", description: GRADE_5_ENGLISH_MASTER_LIST["E5.5.S2"] } },
];

// Senaryo 2: Okuma ve Yazma ağırlıklı (Örnek)
export const GRADE_5_ENGLISH_SCENARIO_2: QuestionConfig[] = [
  { id: 1, order: 1, maxScore: 15, outcome: { code: "E5.1.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.1.R1"] } },
  { id: 2, order: 2, maxScore: 15, outcome: { code: "E5.2.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.2.R1"] } },
  { id: 3, order: 3, maxScore: 15, outcome: { code: "E5.3.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.3.R1"] } },
  { id: 4, order: 4, maxScore: 15, outcome: { code: "E5.4.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.4.R1"] } },
  { id: 5, order: 5, maxScore: 20, outcome: { code: "E5.5.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.5.R1"] } },
  { id: 6, order: 6, maxScore: 20, outcome: { code: "E5.2.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.2.S1"] } }, // Karma beceri
];

// Senaryo 3: Dengeli (Örnek)
export const GRADE_5_ENGLISH_SCENARIO_3: QuestionConfig[] = [
  { id: 1, order: 1, maxScore: 10, outcome: { code: "E5.1.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.1.S1"] } },
  { id: 2, order: 2, maxScore: 10, outcome: { code: "E5.1.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.1.R1"] } },
  { id: 3, order: 3, maxScore: 10, outcome: { code: "E5.2.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.2.S1"] } },
  { id: 4, order: 4, maxScore: 10, outcome: { code: "E5.2.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.2.R1"] } },
  { id: 5, order: 5, maxScore: 10, outcome: { code: "E5.3.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.3.S1"] } },
  { id: 6, order: 6, maxScore: 10, outcome: { code: "E5.3.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.3.R1"] } },
  { id: 7, order: 7, maxScore: 10, outcome: { code: "E5.4.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.4.S1"] } },
  { id: 8, order: 8, maxScore: 10, outcome: { code: "E5.4.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.4.R1"] } },
  { id: 9, order: 9, maxScore: 10, outcome: { code: "E5.5.S1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.5.S1"] } },
  { id: 10, order: 10, maxScore: 10, outcome: { code: "E5.5.R1", description: GRADE_5_ENGLISH_MASTER_LIST["E5.5.R1"] } },
];


// Helper to look up outcome description by code
export const getOutcomeDescription = (code: string): string => {
  // Case insensitive lookup
  const upperCode = code.toUpperCase().trim();
  return GRADE_5_ENGLISH_MASTER_LIST[upperCode] || "";
};

// Helper to get data based on selection
export const getScenarioData = (grade: string, subject: string, scenario: string): QuestionConfig[] => {
  // 5. Sınıf İngilizce Senaryoları
  if (grade === "5" && subject === "İngilizce") {
    if (scenario === "1") return GRADE_5_ENGLISH_SCENARIO_1;
    if (scenario === "2") return GRADE_5_ENGLISH_SCENARIO_2;
    if (scenario === "3") return GRADE_5_ENGLISH_SCENARIO_3;
  }
  
  // Custom / Default Template (Generic - Empty)
  return Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    order: i + 1,
    maxScore: 10,
    outcome: { code: "", description: "" }
  }));
};