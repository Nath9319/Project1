export type TranslationKey = 
  // Navigation
  | 'nav.journal'
  | 'nav.groups' 
  | 'nav.insights'
  | 'nav.profile'
  | 'nav.settings'
  | 'nav.logout'
  
  // Mode indicators
  | 'mode.personal'
  | 'mode.public'
  | 'mode.personalDescription'
  | 'mode.publicDescription'
  
  // Dashboard/Journal
  | 'journal.title'
  | 'journal.placeholder'
  | 'journal.submit'
  | 'journal.reflect'
  | 'journal.addReflection'
  | 'journal.empty'
  | 'journal.emptyDescription'
  
  // Groups
  | 'groups.title'
  | 'groups.create'
  | 'groups.join'
  | 'groups.members'
  | 'groups.invite'
  | 'groups.manage'
  | 'groups.leave'
  | 'groups.admin'
  | 'groups.coAdmin'
  | 'groups.member'
  | 'groups.creator'
  | 'groups.empty'
  | 'groups.emptyDescription'
  | 'groups.shareWithGroup'
  
  // Partner
  | 'partner.title'
  | 'partner.create'
  | 'partner.invite'
  | 'partner.description'
  | 'partner.empty'
  | 'partner.emptyDescription'
  | 'partner.shareWithPartner'
  
  // Entry actions
  | 'entry.edit'
  | 'entry.delete'
  | 'entry.like'
  | 'entry.comment'
  | 'entry.share'
  
  // Common
  | 'common.loading'
  | 'common.error'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.confirm'
  | 'common.back'
  | 'common.next'
  | 'common.welcome'
  | 'common.language'
  
  // Auth
  | 'auth.login'
  | 'auth.logout'
  | 'auth.loginRequired'
  | 'auth.loggingIn'
  
  // Settings
  | 'settings.title'
  | 'settings.theme'
  | 'settings.light'
  | 'settings.dark'
  | 'settings.system'
  | 'settings.language'
  | 'settings.notifications'
  
  // Insights
  | 'insights.title'
  | 'insights.moodOverTime'
  | 'insights.topMoods'
  | 'insights.entryCount'
  | 'insights.reflectionCount';

export type Translations = Record<TranslationKey, string>;

export const translations: Record<string, Translations> = {
  en: {
    // Navigation
    'nav.journal': 'Journal',
    'nav.groups': 'Groups',
    'nav.insights': 'Insights',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    
    // Mode indicators
    'mode.personal': 'Personal Mode',
    'mode.public': 'Public Mode',
    'mode.personalDescription': 'Your private sanctuary',
    'mode.publicDescription': 'Collaborative space',
    
    // Dashboard/Journal
    'journal.title': 'My Journal',
    'journal.placeholder': 'What\'s on your mind?',
    'journal.submit': 'Save Entry',
    'journal.reflect': 'Reflect',
    'journal.addReflection': 'Add Reflection',
    'journal.empty': 'Your journal is empty',
    'journal.emptyDescription': 'Start writing to capture your thoughts and feelings',
    
    // Groups
    'groups.title': 'My Groups',
    'groups.create': 'Create Group',
    'groups.join': 'Join Group',
    'groups.members': 'Members',
    'groups.invite': 'Invite Members',
    'groups.manage': 'Manage',
    'groups.leave': 'Leave Group',
    'groups.admin': 'Admin',
    'groups.coAdmin': 'Co-Admin',
    'groups.member': 'Member',
    'groups.creator': 'Creator',
    'groups.empty': 'No groups yet',
    'groups.emptyDescription': 'Create or join a group to start collaborating',
    'groups.shareWithGroup': 'Share with Group',
    
    // Partner
    'partner.title': 'Partner Space',
    'partner.create': 'Create Partner Space',
    'partner.invite': 'Invite Partner',
    'partner.description': 'A private space for you and your partner',
    'partner.empty': 'No partner space yet',
    'partner.emptyDescription': 'Create a partner space to start sharing with your significant other',
    'partner.shareWithPartner': 'Share with Partner',
    
    // Entry actions
    'entry.edit': 'Edit',
    'entry.delete': 'Delete',
    'entry.like': 'Like',
    'entry.comment': 'Comment',
    'entry.share': 'Share',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.welcome': 'Welcome',
    'common.language': 'Language',
    
    // Auth
    'auth.login': 'Log in',
    'auth.logout': 'Log out',
    'auth.loginRequired': 'You are logged out. Logging in again...',
    'auth.loggingIn': 'Logging in...',
    
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.system': 'System',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    
    // Insights
    'insights.title': 'Insights',
    'insights.moodOverTime': 'Mood Over Time',
    'insights.topMoods': 'Top Moods',
    'insights.entryCount': 'Total Entries',
    'insights.reflectionCount': 'Reflections Added',
  },
  
  zh: {
    // Navigation
    'nav.journal': '日记',
    'nav.groups': '群组',
    'nav.insights': '洞察',
    'nav.profile': '个人资料',
    'nav.settings': '设置',
    'nav.logout': '退出',
    
    // Mode indicators
    'mode.personal': '个人模式',
    'mode.public': '公开模式',
    'mode.personalDescription': '你的私人空间',
    'mode.publicDescription': '协作空间',
    
    // Dashboard/Journal
    'journal.title': '我的日记',
    'journal.placeholder': '你在想什么？',
    'journal.submit': '保存日记',
    'journal.reflect': '反思',
    'journal.addReflection': '添加反思',
    'journal.empty': '你的日记是空的',
    'journal.emptyDescription': '开始写作来记录你的想法和感受',
    
    // Groups
    'groups.title': '我的群组',
    'groups.create': '创建群组',
    'groups.join': '加入群组',
    'groups.members': '成员',
    'groups.invite': '邀请成员',
    'groups.manage': '管理',
    'groups.leave': '离开群组',
    'groups.admin': '管理员',
    'groups.coAdmin': '协管员',
    'groups.member': '成员',
    'groups.creator': '创建者',
    'groups.empty': '还没有群组',
    'groups.emptyDescription': '创建或加入群组开始协作',
    'groups.shareWithGroup': '分享到群组',
    
    // Entry actions
    'entry.edit': '编辑',
    'entry.delete': '删除',
    'entry.like': '喜欢',
    'entry.comment': '评论',
    'entry.share': '分享',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.confirm': '确认',
    'common.back': '返回',
    'common.next': '下一步',
    'common.welcome': '欢迎',
    'common.language': '语言',
    
    // Auth
    'auth.login': '登录',
    'auth.logout': '退出',
    'auth.loginRequired': '您已退出。正在重新登录...',
    'auth.loggingIn': '登录中...',
    
    // Settings
    'settings.title': '设置',
    'settings.theme': '主题',
    'settings.light': '浅色',
    'settings.dark': '深色',
    'settings.system': '系统',
    'settings.language': '语言',
    'settings.notifications': '通知',
    
    // Insights
    'insights.title': '洞察',
    'insights.moodOverTime': '情绪变化',
    'insights.topMoods': '主要情绪',
    'insights.entryCount': '日记总数',
    'insights.reflectionCount': '反思数量',
    
    // Partner
    'partner.title': '伴侣空间',
    'partner.create': '创建伴侣空间',
    'partner.invite': '邀请伴侣',
    'partner.description': '你和伴侣的私密空间',
    'partner.empty': '还没有伴侣空间',
    'partner.emptyDescription': '创建伴侣空间开始与你的另一半分享',
    'partner.shareWithPartner': '与伴侣分享',
  },
  
  es: {
    // Navigation
    'nav.journal': 'Diario',
    'nav.groups': 'Grupos',
    'nav.insights': 'Perspectivas',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',
    
    // Mode indicators
    'mode.personal': 'Modo Personal',
    'mode.public': 'Modo Público',
    'mode.personalDescription': 'Tu espacio privado',
    'mode.publicDescription': 'Espacio colaborativo',
    
    // Dashboard/Journal
    'journal.title': 'Mi Diario',
    'journal.placeholder': '¿Qué estás pensando?',
    'journal.submit': 'Guardar Entrada',
    'journal.reflect': 'Reflexionar',
    'journal.addReflection': 'Añadir Reflexión',
    'journal.empty': 'Tu diario está vacío',
    'journal.emptyDescription': 'Empieza a escribir para capturar tus pensamientos y sentimientos',
    
    // Groups
    'groups.title': 'Mis Grupos',
    'groups.create': 'Crear Grupo',
    'groups.join': 'Unirse a Grupo',
    'groups.members': 'Miembros',
    'groups.invite': 'Invitar Miembros',
    'groups.manage': 'Gestionar',
    'groups.leave': 'Abandonar Grupo',
    'groups.admin': 'Administrador',
    'groups.coAdmin': 'Co-Administrador',
    'groups.member': 'Miembro',
    'groups.creator': 'Creador',
    'groups.empty': 'Sin grupos aún',
    'groups.emptyDescription': 'Crea o únete a un grupo para empezar a colaborar',
    'groups.shareWithGroup': 'Compartir con el Grupo',
    
    // Entry actions
    'entry.edit': 'Editar',
    'entry.delete': 'Eliminar',
    'entry.like': 'Me gusta',
    'entry.comment': 'Comentar',
    'entry.share': 'Compartir',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.confirm': 'Confirmar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.welcome': 'Bienvenido',
    'common.language': 'Idioma',
    
    // Auth
    'auth.login': 'Iniciar sesión',
    'auth.logout': 'Cerrar sesión',
    'auth.loginRequired': 'Has cerrado sesión. Iniciando sesión de nuevo...',
    'auth.loggingIn': 'Iniciando sesión...',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.theme': 'Tema',
    'settings.light': 'Claro',
    'settings.dark': 'Oscuro',
    'settings.system': 'Sistema',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    
    // Insights
    'insights.title': 'Perspectivas',
    'insights.moodOverTime': 'Estado de Ánimo a lo Largo del Tiempo',
    'insights.topMoods': 'Estados de Ánimo Principales',
    'insights.entryCount': 'Total de Entradas',
    'insights.reflectionCount': 'Reflexiones Añadidas',
    
    // Partner
    'partner.title': 'Espacio de Pareja',
    'partner.create': 'Crear Espacio de Pareja',
    'partner.invite': 'Invitar Pareja',
    'partner.description': 'Un espacio privado para ti y tu pareja',
    'partner.empty': 'Sin espacio de pareja aún',
    'partner.emptyDescription': 'Crea un espacio de pareja para empezar a compartir con tu ser querido',
    'partner.shareWithPartner': 'Compartir con Pareja',
  },
  
  hi: {
    // Navigation
    'nav.journal': 'डायरी',
    'nav.groups': 'समूह',
    'nav.insights': 'अंतर्दृष्टि',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.logout': 'लॉग आउट',
    
    // Mode indicators
    'mode.personal': 'व्यक्तिगत मोड',
    'mode.public': 'सार्वजनिक मोड',
    'mode.personalDescription': 'आपका निजी स्थान',
    'mode.publicDescription': 'सहयोगी स्थान',
    
    // Dashboard/Journal
    'journal.title': 'मेरी डायरी',
    'journal.placeholder': 'आप क्या सोच रहे हैं?',
    'journal.submit': 'प्रविष्टि सहेजें',
    'journal.reflect': 'चिंतन करें',
    'journal.addReflection': 'चिंतन जोड़ें',
    'journal.empty': 'आपकी डायरी खाली है',
    'journal.emptyDescription': 'अपने विचारों और भावनाओं को रिकॉर्ड करने के लिए लिखना शुरू करें',
    
    // Groups
    'groups.title': 'मेरे समूह',
    'groups.create': 'समूह बनाएं',
    'groups.join': 'समूह में शामिल हों',
    'groups.members': 'सदस्य',
    'groups.invite': 'सदस्यों को आमंत्रित करें',
    'groups.manage': 'प्रबंधित करें',
    'groups.leave': 'समूह छोड़ें',
    'groups.admin': 'व्यवस्थापक',
    'groups.coAdmin': 'सह-व्यवस्थापक',
    'groups.member': 'सदस्य',
    'groups.creator': 'निर्माता',
    'groups.empty': 'अभी तक कोई समूह नहीं',
    'groups.emptyDescription': 'सहयोग शुरू करने के लिए समूह बनाएं या शामिल हों',
    'groups.shareWithGroup': 'समूह के साथ साझा करें',
    
    // Entry actions
    'entry.edit': 'संपादित करें',
    'entry.delete': 'हटाएं',
    'entry.like': 'पसंद',
    'entry.comment': 'टिप्पणी',
    'entry.share': 'साझा करें',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.confirm': 'पुष्टि करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.welcome': 'स्वागत है',
    'common.language': 'भाषा',
    
    // Auth
    'auth.login': 'लॉग इन करें',
    'auth.logout': 'लॉग आउट',
    'auth.loginRequired': 'आप लॉग आउट हैं। फिर से लॉग इन हो रहा है...',
    'auth.loggingIn': 'लॉग इन हो रहा है...',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.theme': 'थीम',
    'settings.light': 'लाइट',
    'settings.dark': 'डार्क',
    'settings.system': 'सिस्टम',
    'settings.language': 'भाषा',
    'settings.notifications': 'सूचनाएं',
    
    // Insights
    'insights.title': 'अंतर्दृष्टि',
    'insights.moodOverTime': 'समय के साथ मनोदशा',
    'insights.topMoods': 'मुख्य मनोदशाएं',
    'insights.entryCount': 'कुल प्रविष्टियां',
    'insights.reflectionCount': 'जोड़े गए चिंतन',
    
    // Partner
    'partner.title': 'साथी स्थान',
    'partner.create': 'साथी स्थान बनाएं',
    'partner.invite': 'साथी को आमंत्रित करें',
    'partner.description': 'आपके और आपके साथी के लिए निजी स्थान',
    'partner.empty': 'अभी तक कोई साथी स्थान नहीं',
    'partner.emptyDescription': 'अपने जीवनसाथी के साथ साझा करने के लिए साथी स्थान बनाएं',
    'partner.shareWithPartner': 'साथी के साथ साझा करें',
  },
  
  ar: {
    // Navigation
    'nav.journal': 'اليوميات',
    'nav.groups': 'المجموعات',
    'nav.insights': 'الرؤى',
    'nav.profile': 'الملف الشخصي',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    
    // Mode indicators
    'mode.personal': 'الوضع الشخصي',
    'mode.public': 'الوضع العام',
    'mode.personalDescription': 'مساحتك الخاصة',
    'mode.publicDescription': 'مساحة تعاونية',
    
    // Dashboard/Journal
    'journal.title': 'يومياتي',
    'journal.placeholder': 'ما الذي يدور في ذهنك؟',
    'journal.submit': 'حفظ المدخل',
    'journal.reflect': 'تأمل',
    'journal.addReflection': 'إضافة تأمل',
    'journal.empty': 'يومياتك فارغة',
    'journal.emptyDescription': 'ابدأ الكتابة لتسجيل أفكارك ومشاعرك',
    
    // Groups
    'groups.title': 'مجموعاتي',
    'groups.create': 'إنشاء مجموعة',
    'groups.join': 'الانضمام لمجموعة',
    'groups.members': 'الأعضاء',
    'groups.invite': 'دعوة الأعضاء',
    'groups.manage': 'إدارة',
    'groups.leave': 'مغادرة المجموعة',
    'groups.admin': 'مسؤول',
    'groups.coAdmin': 'مسؤول مساعد',
    'groups.member': 'عضو',
    'groups.creator': 'المنشئ',
    'groups.empty': 'لا توجد مجموعات بعد',
    'groups.emptyDescription': 'أنشئ أو انضم لمجموعة لبدء التعاون',
    'groups.shareWithGroup': 'مشاركة مع المجموعة',
    
    // Entry actions
    'entry.edit': 'تعديل',
    'entry.delete': 'حذف',
    'entry.like': 'إعجاب',
    'entry.comment': 'تعليق',
    'entry.share': 'مشاركة',
    
    // Common
    'common.loading': 'جار التحميل...',
    'common.error': 'خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.welcome': 'مرحباً',
    'common.language': 'اللغة',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.logout': 'تسجيل الخروج',
    'auth.loginRequired': 'لقد تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...',
    'auth.loggingIn': 'جاري تسجيل الدخول...',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.theme': 'المظهر',
    'settings.light': 'فاتح',
    'settings.dark': 'داكن',
    'settings.system': 'النظام',
    'settings.language': 'اللغة',
    'settings.notifications': 'الإشعارات',
    
    // Insights
    'insights.title': 'الرؤى',
    'insights.moodOverTime': 'المزاج عبر الوقت',
    'insights.topMoods': 'أهم المشاعر',
    'insights.entryCount': 'إجمالي المدخلات',
    'insights.reflectionCount': 'التأملات المضافة',
    
    // Partner
    'partner.title': 'مساحة الشريك',
    'partner.create': 'إنشاء مساحة الشريك',
    'partner.invite': 'دعوة الشريك',
    'partner.description': 'مساحة خاصة لك ولشريكك',
    'partner.empty': 'لا توجد مساحة شريك بعد',
    'partner.emptyDescription': 'أنشئ مساحة شريك لبدء المشاركة مع نصفك الآخر',
    'partner.shareWithPartner': 'مشاركة مع الشريك',
  },
  
  // I'll add just a few more languages to demonstrate, but you can expand this
  fr: {
    // Navigation
    'nav.journal': 'Journal',
    'nav.groups': 'Groupes',
    'nav.insights': 'Aperçus',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    
    // Mode indicators
    'mode.personal': 'Mode Personnel',
    'mode.public': 'Mode Public',
    'mode.personalDescription': 'Votre espace privé',
    'mode.publicDescription': 'Espace collaboratif',
    
    // Dashboard/Journal
    'journal.title': 'Mon Journal',
    'journal.placeholder': 'Qu\'avez-vous en tête?',
    'journal.submit': 'Enregistrer',
    'journal.reflect': 'Réfléchir',
    'journal.addReflection': 'Ajouter une Réflexion',
    'journal.empty': 'Votre journal est vide',
    'journal.emptyDescription': 'Commencez à écrire pour capturer vos pensées et sentiments',
    
    // Groups
    'groups.title': 'Mes Groupes',
    'groups.create': 'Créer un Groupe',
    'groups.join': 'Rejoindre un Groupe',
    'groups.members': 'Membres',
    'groups.invite': 'Inviter des Membres',
    'groups.manage': 'Gérer',
    'groups.leave': 'Quitter le Groupe',
    'groups.admin': 'Administrateur',
    'groups.coAdmin': 'Co-Administrateur',
    'groups.member': 'Membre',
    'groups.creator': 'Créateur',
    'groups.empty': 'Aucun groupe encore',
    'groups.emptyDescription': 'Créez ou rejoignez un groupe pour commencer à collaborer',
    'groups.shareWithGroup': 'Partager avec le Groupe',
    
    // Entry actions
    'entry.edit': 'Modifier',
    'entry.delete': 'Supprimer',
    'entry.like': 'J\'aime',
    'entry.comment': 'Commenter',
    'entry.share': 'Partager',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.confirm': 'Confirmer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.welcome': 'Bienvenue',
    'common.language': 'Langue',
    
    // Auth
    'auth.login': 'Se connecter',
    'auth.logout': 'Se déconnecter',
    'auth.loginRequired': 'Vous êtes déconnecté. Reconnexion en cours...',
    'auth.loggingIn': 'Connexion en cours...',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.theme': 'Thème',
    'settings.light': 'Clair',
    'settings.dark': 'Sombre',
    'settings.system': 'Système',
    'settings.language': 'Langue',
    'settings.notifications': 'Notifications',
    
    // Insights
    'insights.title': 'Aperçus',
    'insights.moodOverTime': 'Humeur au Fil du Temps',
    'insights.topMoods': 'Humeurs Principales',
    'insights.entryCount': 'Total des Entrées',
    'insights.reflectionCount': 'Réflexions Ajoutées',
    
    // Partner
    'partner.title': 'Espace Partenaire',
    'partner.create': 'Créer un Espace Partenaire',
    'partner.invite': 'Inviter Partenaire',
    'partner.description': 'Un espace privé pour vous et votre partenaire',
    'partner.empty': 'Pas encore d\'espace partenaire',
    'partner.emptyDescription': 'Créez un espace partenaire pour commencer à partager avec votre moitié',
    'partner.shareWithPartner': 'Partager avec Partenaire',
  },
};