/**
 * SUPABASE SERVICE - ADVANCED
 * Comprehensive data management for education analytics platform
 */

import { createClient } from '@supabase/supabase-js';

// Read from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  school_name?: string;
  role?: 'teacher' | 'admin' | 'coordinator';
  is_admin?: boolean;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface StudentList {
  id?: string;
  user_id?: string;
  name: string;
  grade: string;
  section?: string;
  academic_year: string;
  subject?: string;
  school_name?: string;
  total_students?: number;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id?: string;
  student_list_id: string;
  student_number?: string;
  full_name: string;
  gender?: 'M' | 'F' | 'Other';
  date_of_birth?: string;
  contact_email?: string;
  parent_phone?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Exam {
  id?: string;
  user_id?: string;
  student_list_id?: string;
  title: string;
  subject: string;
  grade: string;
  exam_date: string;
  term: string;
  exam_number: string;
  exam_type: string;
  scenario_id?: string;
  total_points?: number;
  duration_minutes?: number;
  status?: 'draft' | 'published' | 'archived';
  is_template?: boolean;
  class_average?: number;
  participation_count?: number;
  completion_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExamQuestion {
  id?: string;
  exam_id: string;
  question_number: number;
  max_score: number;
  outcome_code?: string;
  outcome_description?: string;
  question_text?: string;
  question_image_url?: string;
  answer_key?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  cognitive_level?: string;
  created_at?: string;
}

export interface ExamScore {
  id?: string;
  exam_id: string;
  student_id: string;
  exam_question_id: string;
  score: number;
  max_score: number;
  attempted?: boolean;
  time_spent_seconds?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExamAnalytics {
  id?: string;
  exam_id: string;
  class_average?: number;
  median_score?: number;
  std_deviation?: number;
  min_score?: number;
  max_score?: number;
  score_distribution?: Record<string, number>;
  question_stats?: any[];
  outcome_stats?: any[];
  top_performers?: any[];
  struggling_students?: any[];
  ai_summary?: string;
  recommendations?: any[];
  generated_at?: string;
}

// Legacy types (kept for backward compatibility)
export interface ClassList {
  id?: number;
  grade: string;
  subject: string;
  className: string;
  schoolName: string;
  teacherName: string;
  academicYear: string;
  students?: string[];
  createdAt?: string;
}

export interface Achievement {
  id?: number;
  code: string;
  description: string;
  grade: string;
  subject: string;
  source?: 'meb' | 'custom';
  cognitive_level?: string;
  difficulty_estimate?: string;
  createdAt?: string;
  updated_at?: string;
}

export interface Scenario {
  id?: number;
  grade: string;
  subject: string;
  scenarioNumber: string;
  title?: string;
  pdfUrl?: string;
  achievements?: string[];
  createdAt?: string;
}

// =====================================================
// USER PROFILE SERVICES
// =====================================================

export const userProfileService = {
  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    return true;
  }
};

// =====================================================
// STUDENT LIST SERVICES
// =====================================================

export const studentListService = {
  async getAll(): Promise<StudentList[]> {
    const { data, error } = await supabase
      .from('student_lists')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student lists:', error);
      return [];
    }
    return data || [];
  },

  async getByGrade(grade: string): Promise<StudentList[]> {
    const { data, error } = await supabase
      .from('student_lists')
      .select('*')
      .eq('grade', grade)
      .eq('is_archived', false)
      .order('name');

    if (error) {
      console.error('Error fetching student lists by grade:', error);
      return [];
    }
    return data || [];
  },

  async create(list: StudentList): Promise<StudentList | null> {
    const { data, error } = await supabase
      .from('student_lists')
      .insert(list)
      .select()
      .single();

    if (error) {
      console.error('Error creating student list:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<StudentList>): Promise<boolean> {
    const { error } = await supabase
      .from('student_lists')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating student list:', error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('student_lists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting student list:', error);
      return false;
    }
    return true;
  },

  async archive(id: string): Promise<boolean> {
    return this.update(id, { is_archived: true });
  }
};

// =====================================================
// STUDENT SERVICES
// =====================================================

export const studentService = {
  async getByList(listId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_list_id', listId)
      .eq('is_active', true)
      .order('full_name');

    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    return data || [];
  },

  async create(student: Student): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      return null;
    }
    return data;
  },

  async bulkCreate(students: Student[]): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .insert(students)
      .select();

    if (error) {
      console.error('Error bulk creating students:', error);
      return [];
    }
    return data || [];
  },

  async update(id: string, updates: Partial<Student>): Promise<boolean> {
    const { error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating student:', error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      return false;
    }
    return true;
  }
};

// =====================================================
// EXAM SERVICES
// =====================================================

export const examService = {
  async getAll(status?: string): Promise<Exam[]> {
    let query = supabase
      .from('exams')
      .select('*, student_lists(name, grade)')
      .order('exam_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exams:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Exam | null> {
    const { data, error } = await supabase
      .from('exams')
      .select('*, student_lists(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching exam:', error);
      return null;
    }
    return data;
  },

  async create(exam: Exam): Promise<Exam | null> {
    const { data, error } = await supabase
      .from('exams')
      .insert(exam)
      .select()
      .single();

    if (error) {
      console.error('Error creating exam:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<Exam>): Promise<boolean> {
    const { error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating exam:', error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting exam:', error);
      return false;
    }
    return true;
  }
};

// =====================================================
// EXAM QUESTION SERVICES
// =====================================================

export const examQuestionService = {
  async getByExam(examId: string): Promise<ExamQuestion[]> {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('question_number');

    if (error) {
      console.error('Error fetching exam questions:', error);
      return [];
    }
    return data || [];
  },

  async bulkCreate(questions: ExamQuestion[]): Promise<ExamQuestion[]> {
    const { data, error } = await supabase
      .from('exam_questions')
      .insert(questions)
      .select();

    if (error) {
      console.error('Error bulk creating questions:', error);
      return [];
    }
    return data || [];
  },

  async update(id: string, updates: Partial<ExamQuestion>): Promise<boolean> {
    const { error } = await supabase
      .from('exam_questions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating question:', error);
      return false;
    }
    return true;
  }
};

// =====================================================
// EXAM SCORE SERVICES
// =====================================================

export const examScoreService = {
  async getByExam(examId: string): Promise<ExamScore[]> {
    const { data, error } = await supabase
      .from('exam_scores')
      .select('*, students(full_name), exam_questions(question_number, max_score)')
      .eq('exam_id', examId);

    if (error) {
      console.error('Error fetching exam scores:', error);
      return [];
    }
    return data || [];
  },

  async bulkUpsert(scores: ExamScore[]): Promise<boolean> {
    const { error } = await supabase
      .from('exam_scores')
      .upsert(scores, { onConflict: 'exam_id,student_id,exam_question_id' });

    if (error) {
      console.error('Error upserting scores:', error);
      return false;
    }
    return true;
  }
};

// =====================================================
// EXAM ANALYTICS SERVICES
// =====================================================

export const examAnalyticsService = {
  async getByExam(examId: string): Promise<ExamAnalytics | null> {
    const { data, error } = await supabase
      .from('exam_analytics')
      .select('*')
      .eq('exam_id', examId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching analytics:', error);
      return null;
    }
    return data;
  },

  async save(analytics: ExamAnalytics): Promise<boolean> {
    const { error } = await supabase
      .from('exam_analytics')
      .upsert(analytics, { onConflict: 'exam_id' });

    if (error) {
      console.error('Error saving analytics:', error);
      return false;
    }
    return true;
  }
};

// =====================================================
// LEGACY SERVICES (Backward Compatibility)
// =====================================================

export const classListService = {
  async getAll(): Promise<ClassList[]> {
    const { data, error } = await supabase
      .from('class_lists')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching class lists:', error);
      return [];
    }
    return data || [];
  },

  async create(classList: ClassList): Promise<ClassList | null> {
    const { data, error } = await supabase
      .from('class_lists')
      .insert(classList)
      .select()
      .single();

    if (error) {
      console.error('Error creating class list:', error);
      return null;
    }
    return data;
  }
};

export const achievementService = {
  async search(grade: string, subject: string, searchTerm?: string): Promise<Achievement[]> {
    let query = supabase
      .from('achievements')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject);

    if (searchTerm) {
      query = query.or(`code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error searching achievements:', error);
      return [];
    }
    return data || [];
  },

  async create(achievement: Achievement): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievement)
      .select()
      .single();

    if (error) {
      console.error('Error creating achievement:', error);
      return null;
    }
    return data;
  }
};

export const scenarioService = {
  async getByGradeSubject(grade: string, subject: string): Promise<Scenario[]> {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('grade', grade)
      .eq('subject', subject)
      .order('scenarioNumber');

    if (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }
    return data || [];
  }
};
