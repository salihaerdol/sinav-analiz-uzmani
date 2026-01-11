import { readFile } from 'node:fs/promises';
import { Client } from 'pg';

const loadDbUrlFromEnvFile = async () => {
  try {
    const envPath = new URL('../.env', import.meta.url);
    const content = await readFile(envPath, 'utf8');
    const match = content.match(/^SUPABASE_DB_URL=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
};

const ADMIN_EMAILS = ['turhanhamza@gmail.com', 'salihaerdol11@gmail.com'];

const QUESTIONS_5 = [
  { id: 1, order: 1, maxScore: 10, outcome: { code: 'M.5.1.1', description: 'En cok dokuz basamakli dogal sayilari okur ve yazar.' } },
  { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.5.1.2', description: 'Dogal sayilarin boluk ve basamak degerlerini belirtir.' } },
  { id: 3, order: 3, maxScore: 15, outcome: { code: 'M.5.1.3', description: 'Verilen kurala gore oruntu adimlarini olusturur.' } },
  { id: 4, order: 4, maxScore: 20, outcome: { code: 'M.5.1.4', description: 'Dogal sayilarla toplama ve cikarma islemi yapar.' } },
  { id: 5, order: 5, maxScore: 20, outcome: { code: 'M.5.1.5', description: 'Toplama ve cikarma islemlerinin sonucunu tahmin eder.' } },
  { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.5.1.6', description: 'Zihinden toplama ve cikarma islemleri yapar.' } }
];

const QUESTIONS_6 = [
  { id: 1, order: 1, maxScore: 15, outcome: { code: 'M.6.1.1', description: 'Uslu ifadeleri anlar ve degerini hesaplar.' } },
  { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.6.1.2', description: 'Islem onceligini dikkate alarak dort islem yapar.' } },
  { id: 3, order: 3, maxScore: 15, outcome: { code: 'M.6.1.3', description: 'Dogal sayilarin carpanlarini ve katlarini belirler.' } },
  { id: 4, order: 4, maxScore: 20, outcome: { code: 'M.6.1.4', description: 'Bolunebilme kurallarini anlar ve kullanir.' } },
  { id: 5, order: 5, maxScore: 15, outcome: { code: 'M.6.1.5', description: 'Asal sayilari ozellikleriyle belirler.' } },
  { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.6.1.6', description: 'Ortak carpan ve ortak katlari belirler.' } }
];

const QUESTIONS_7 = [
  { id: 1, order: 1, maxScore: 15, outcome: { code: 'M.7.1.1', description: 'Tam sayilarla toplama ve cikarma islemleri yapar.' } },
  { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.7.1.2', description: 'Tam sayilarla carpma ve bolme islemleri yapar.' } },
  { id: 3, order: 3, maxScore: 20, outcome: { code: 'M.7.1.3', description: 'Uslu nicelik kavramini aciklar ve uygular.' } },
  { id: 4, order: 4, maxScore: 15, outcome: { code: 'M.7.1.4', description: 'Rasyonel sayilari tanir ve sayi dogrusunda gosterir.' } },
  { id: 5, order: 5, maxScore: 15, outcome: { code: 'M.7.1.5', description: 'Rasyonel sayilari ondalik gosterimle ifade eder.' } },
  { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.7.2.1', description: 'Birinci dereceden bir bilinmeyenli denklemleri cozer.' } }
];

const QUESTIONS_8 = [
  { id: 1, order: 1, maxScore: 15, outcome: { code: 'M.8.1.1', description: 'Pozitif tam sayilarin carpanlarini bulur.' } },
  { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.8.1.2', description: 'Tam sayilarin kuvvetlerini hesaplar.' } },
  { id: 3, order: 3, maxScore: 20, outcome: { code: 'M.8.1.3', description: 'Uslu ifadelerle ilgili temel kurallari uygular.' } },
  { id: 4, order: 4, maxScore: 15, outcome: { code: 'M.8.1.4', description: 'Tam kare sayilarin karekoklerini iliskilendirir.' } },
  { id: 5, order: 5, maxScore: 15, outcome: { code: 'M.8.1.5', description: 'Tam kare olmayan sayilarin araligini belirler.' } },
  { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.8.2.1', description: 'Cebirsel ifadeleri carpanlara ayirir.' } }
];

const DEMO_CLASSES = [
  {
    key: '5A',
    metadata: {
      grade: '5',
      subject: 'Matematik',
      scenario: '1',
      schoolName: 'Cumhuriyet Ortaokulu',
      teacherName: 'Saliha Erdol',
      academicYear: '2025-2026',
      className: '5A',
      date: '2025-12-15',
      term: '1',
      examNumber: '1',
      examType: 'Yazılı'
    },
    questions: QUESTIONS_5,
    studentCount: 25,
    scoreBase: 0.55
  },
  {
    key: '6A',
    metadata: {
      grade: '6',
      subject: 'Matematik',
      scenario: '1',
      schoolName: 'Ataturk Ortaokulu',
      teacherName: 'Ertugrul Gulter',
      academicYear: '2025-2026',
      className: '6A',
      date: '2025-12-10',
      term: '1',
      examNumber: '1',
      examType: 'Yazılı'
    },
    questions: QUESTIONS_6,
    studentCount: 20,
    scoreBase: 0.62
  },
  {
    key: '7A',
    metadata: {
      grade: '7',
      subject: 'Matematik',
      scenario: '1',
      schoolName: 'Fatih Ortaokulu',
      teacherName: 'Ali Yaltogil',
      academicYear: '2025-2026',
      className: '7A',
      date: '2025-12-12',
      term: '1',
      examNumber: '1',
      examType: 'Yazılı'
    },
    questions: QUESTIONS_7,
    studentCount: 22,
    scoreBase: 0.58
  },
  {
    key: '8A',
    metadata: {
      grade: '8',
      subject: 'Matematik',
      scenario: '1',
      schoolName: 'Mevlana Ortaokulu',
      teacherName: 'Mine Tas',
      academicYear: '2025-2026',
      className: '8A',
      date: '2025-12-14',
      term: '1',
      examNumber: '1',
      examType: 'Yazılı'
    },
    questions: QUESTIONS_8,
    studentCount: 18,
    scoreBase: 0.68
  }
];

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Ali', 'Ayse', 'Fatma', 'Zeynep', 'Mustafa', 'Emine',
  'Huseyin', 'Hatice', 'Can', 'Ece', 'Burak', 'Selin', 'Mert', 'Derya',
  'Deniz', 'Omer', 'Elif', 'Yusuf', 'Arda', 'Buse', 'Cem', 'Damla',
  'Enes', 'Gizem', 'Hakan', 'Irem', 'Kaan', 'Lale'
];

const LAST_NAMES = [
  'Yilmaz', 'Kaya', 'Demir', 'Celik', 'Sahin', 'Yildiz', 'Ozturk', 'Aydin',
  'Ozdemir', 'Arslan', 'Dogan', 'Kilic', 'Aslan', 'Cetin', 'Kara', 'Koc',
  'Kurt', 'Ozkan', 'Simsek', 'Polat', 'Ozcan', 'Korkmaz', 'Cakir', 'Erdogan',
  'Yavuz', 'Aksoy', 'Sari', 'Avci', 'Guler', 'Gunes'
];

const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];

const buildStudents = (questions, count, scoreBase, prefix) => {
  const students = [];
  for (let i = 0; i < count; i += 1) {
    const scores = {};
    questions.forEach((q) => {
      const factor = Math.min(1, Math.max(0, scoreBase + (Math.random() * 0.4 - 0.2)));
      scores[q.id] = Math.round(q.maxScore * factor);
    });
    students.push({
      id: `${prefix}-${i + 1}`,
      student_number: `${prefix}${100 + i}`,
      name: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
      scores
    });
  }
  return students;
};

const calculateAnalysis = (questions, students) => {
  const totalMaxScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

  const studentStats = students.map((s) => {
    const totalScore = Object.values(s.scores).reduce((a, b) => a + b, 0);
    return {
      studentId: s.id,
      totalScore,
      percentage: totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
    };
  });

  const classAverage = studentStats.reduce((sum, s) => sum + s.percentage, 0) / (students.length || 1);

  const questionStats = questions.map((q) => {
    const scores = students.map((s) => s.scores[q.id] || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / (students.length || 1);
    const successRate = q.maxScore > 0 ? (avg / q.maxScore) * 100 : 0;
    return {
      questionId: q.id,
      averageScore: avg,
      successRate,
      outcome: q.outcome
    };
  });

  const outcomeMap = new Map();
  questionStats.forEach((qs) => {
    if (!qs.outcome.code) return;
    const current = outcomeMap.get(qs.outcome.code) || {
      totalRate: 0,
      count: 0,
      desc: qs.outcome.description
    };
    outcomeMap.set(qs.outcome.code, {
      totalRate: current.totalRate + qs.successRate,
      count: current.count + 1,
      desc: current.desc
    });
  });

  const outcomeStats = Array.from(outcomeMap.entries()).map(([code, data]) => ({
    code,
    description: data.desc,
    successRate: data.totalRate / data.count,
    isFailed: data.totalRate / data.count < 50
  }));

  return {
    questionStats,
    outcomeStats,
    studentStats,
    classAverage,
    averageSuccess: classAverage,
    totalQuestions: questions.length
  };
};

const applySchema = async (client) => {
  const schemaPath = new URL('../supabase/CORE_SCHEMA.sql', import.meta.url);
  const sql = await readFile(schemaPath, 'utf8');
  await client.query(sql);
};

const ensureAdminProfiles = async (client) => {
  await client.query(
    `
      INSERT INTO public.user_profiles (id, email, full_name, is_admin, role)
      SELECT id, email, raw_user_meta_data->>'full_name', true, 'admin'
      FROM auth.users
      WHERE email = ANY($1)
      ON CONFLICT (id) DO UPDATE
      SET is_admin = true, role = 'admin', email = EXCLUDED.email;
    `,
    [ADMIN_EMAILS]
  );
};

const loadAdminUsers = async (client) => {
  const { rows } = await client.query(
    'SELECT id, email FROM auth.users WHERE email = ANY($1);',
    [ADMIN_EMAILS]
  );
  return rows;
};

const ensureStudentList = async (client, userId, metadata, studentCount) => {
  const { rows } = await client.query(
    `SELECT id FROM public.student_lists
     WHERE user_id = $1 AND name = $2 AND academic_year = $3
     LIMIT 1;`,
    [userId, metadata.className, metadata.academicYear]
  );

  if (rows.length > 0) {
    return rows[0].id;
  }

  const insert = await client.query(
    `INSERT INTO public.student_lists
      (user_id, name, grade, academic_year, subject, school_name, total_students)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id;`,
    [
      userId,
      metadata.className,
      metadata.grade,
      metadata.academicYear,
      metadata.subject,
      metadata.schoolName,
      studentCount
    ]
  );

  return insert.rows[0].id;
};

const seedStudents = async (client, listId, students) => {
  const existing = await client.query(
    'SELECT id FROM public.students WHERE student_list_id = $1 LIMIT 1;',
    [listId]
  );
  if (existing.rows.length > 0) {
    return;
  }

  const values = [];
  const params = [];
  let index = 1;

  students.forEach((student) => {
    values.push(`($${index++}, $${index++}, $${index++}, $${index++})`);
    params.push(listId, student.student_number, student.name, true);
  });

  await client.query(
    `INSERT INTO public.students (student_list_id, student_number, full_name, is_active)
     VALUES ${values.join(', ')};`,
    params
  );
};

const seedAnalysisHistory = async (client, userId, metadata, analysis, questions, students) => {
  const existing = await client.query(
    `SELECT id FROM public.analysis_history
     WHERE user_id = $1 AND class_name = $2 AND subject = $3 AND exam_date = $4
     LIMIT 1;`,
    [userId, metadata.className, metadata.subject, metadata.date]
  );

  if (existing.rows.length > 0) {
    return false;
  }

  await client.query(
    `INSERT INTO public.analysis_history
      (user_id, school_name, teacher_name, class_name, grade, subject, scenario,
       exam_date, term, exam_number, exam_type, academic_year, class_average,
       total_students, total_questions, analysis_data, questions_data, students_data,
       ai_summary, ai_recommendations, tags, notes, is_archived)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11, $12, $13,
       $14, $15, $16, $17, $18,
       $19, $20, $21, $22, $23);`,
    [
      userId,
      metadata.schoolName,
      metadata.teacherName,
      metadata.className,
      metadata.grade,
      metadata.subject,
      metadata.scenario,
      metadata.date,
      metadata.term,
      metadata.examNumber,
      metadata.examType,
      metadata.academicYear,
      analysis.classAverage,
      students.length,
      questions.length,
      JSON.stringify(analysis),
      JSON.stringify(questions),
      JSON.stringify(students),
      null,
      null,
      [],
      null,
      false
    ]
  );

  return true;
};

const seedDemoData = async (client) => {
  await ensureAdminProfiles(client);
  const admins = await loadAdminUsers(client);

  if (admins.length === 0) {
    console.warn('No admin users found yet. Create users first, then rerun seed.');
    return;
  }

  let seededCount = 0;

  for (const admin of admins) {
    for (const demo of DEMO_CLASSES) {
      const students = buildStudents(demo.questions, demo.studentCount, demo.scoreBase, demo.key.toLowerCase());
      const analysis = calculateAnalysis(demo.questions, students);

      const listId = await ensureStudentList(client, admin.id, demo.metadata, demo.studentCount);
      await seedStudents(client, listId, students);

      const seeded = await seedAnalysisHistory(
        client,
        admin.id,
        demo.metadata,
        analysis,
        demo.questions,
        students
      );

      if (seeded) {
        seededCount += 1;
      }
    }
  }

  console.log(`Seeded ${seededCount} analysis records.`);
};

const run = async () => {
  const dbUrl = process.env.SUPABASE_DB_URL || await loadDbUrlFromEnvFile();

  if (!dbUrl) {
    console.error('Missing SUPABASE_DB_URL environment variable.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    await applySchema(client);
    await seedDemoData(client);
  } finally {
    await client.end();
  }
};

run().catch((err) => {
  console.error('DB bootstrap failed:', err);
  process.exit(1);
});
