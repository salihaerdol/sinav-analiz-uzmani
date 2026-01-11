// =====================================================
// MODÜL: ULUSLARARASILAŞTIRMA (i18n) - İNGİLİZCE ÇEVİRİLER
// =====================================================

import { Translations } from '../types';

export const en: Translations = {
    common: {
        // General
        appName: 'Exam Analysis Expert',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',

        // Actions
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        download: 'Download',
        upload: 'Upload',
        print: 'Print',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        confirm: 'Confirm',

        // Status
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        completed: 'Completed',
        draft: 'Draft',

        // Time
        today: 'Today',
        yesterday: 'Yesterday',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',

        // Pagination
        page: 'Page',
        of: 'of',
        showing: 'Showing',
        items: 'items',
        noResults: 'No results found'
    },

    auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        forgotPassword: 'Forgot Password',
        resetPassword: 'Reset Password',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        rememberMe: 'Remember Me',
        loginSuccess: 'Successfully logged in',
        loginError: 'Login failed',
        logoutSuccess: 'Successfully logged out',
        sessionExpired: 'Session expired',
        unauthorized: 'Unauthorized access',
        forbidden: 'You do not have permission'
    },

    dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        overview: 'Overview',
        statistics: 'Statistics',
        recentActivity: 'Recent Activity',
        quickActions: 'Quick Actions',

        // KPIs
        totalStudents: 'Total Students',
        totalExams: 'Total Exams',
        averageScore: 'Average Score',
        passRate: 'Pass Rate',
        riskStudents: 'At-Risk Students',

        // Charts
        performanceTrend: 'Performance Trend',
        subjectComparison: 'Subject Comparison',
        bloomDistribution: 'Bloom Distribution',
        difficultyAnalysis: 'Difficulty Analysis'
    },

    exam: {
        title: 'Exam',
        exams: 'Exams',
        newExam: 'New Exam',
        editExam: 'Edit Exam',
        deleteExam: 'Delete Exam',
        examDetails: 'Exam Details',

        // Fields
        examName: 'Exam Name',
        subject: 'Subject',
        grade: 'Grade',
        date: 'Date',
        duration: 'Duration',
        questions: 'Questions',
        students: 'Students',
        score: 'Score',

        // Analysis
        analyze: 'Analyze',
        analysis: 'Analysis',
        results: 'Results',
        statistics: 'Statistics',

        // Status
        notStarted: 'Not Started',
        inProgress: 'In Progress',
        completed: 'Completed'
    },

    student: {
        title: 'Student',
        students: 'Students',
        studentDetails: 'Student Details',
        studentProgress: 'Student Progress',

        // Fields
        name: 'Full Name',
        studentNumber: 'Student Number',
        className: 'Class',
        parent: 'Parent',

        // Analysis
        strongPoints: 'Strong Points',
        weakPoints: 'Weak Points',
        recommendations: 'Recommendations',
        riskLevel: 'Risk Level'
    },

    report: {
        title: 'Report',
        reports: 'Reports',
        newReport: 'New Report',
        generateReport: 'Generate Report',
        exportReport: 'Export Report',

        // Types
        classReport: 'Class Report',
        studentReport: 'Student Report',
        examReport: 'Exam Report',
        progressReport: 'Progress Report',

        // Options
        includeCharts: 'Include Charts',
        includeRecommendations: 'Include Recommendations',
        includeAIAnalysis: 'Include AI Analysis'
    },

    benchmark: {
        title: 'Benchmark',
        pisaComparison: 'PISA Comparison',
        timssComparison: 'TIMSS Comparison',
        nationalAverage: 'National Average',
        oecdAverage: 'OECD Average',
        yourScore: 'Your Score',
        level: 'Level',
        benchmark: 'Benchmark',
        aboveAverage: 'Above Average',
        belowAverage: 'Below Average',
        onTarget: 'On Target'
    }
};
