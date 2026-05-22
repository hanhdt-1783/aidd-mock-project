export type Language = 'vi' | 'en';

export const LANGUAGES: readonly Language[] = ['vi', 'en'] as const;
export const DEFAULT_LANGUAGE: Language = 'vi';
export const LANG_COOKIE = 'lang';

export const dictionary = {
  vi: {
    // Login
    'login.welcome.line1': 'Bắt đầu hành trình của bạn cùng SAA 2025.',
    'login.welcome.line2': 'Đăng nhập để khám phá!',
    'login.button.google': 'Đăng nhập bằng Google',
    'login.button.loading': 'Đang đăng nhập…',
    'login.footer.copyright': 'Bản quyền thuộc về Sun* © 2025',
    'login.logo.alt': 'Sun* Annual Awards 2025',
    'login.error.oauth': 'Đăng nhập thất bại. Vui lòng thử lại.',
    // Language
    'language.vi.label': 'VN',
    'language.en.label': 'EN',
    // Home — meta
    'home.meta.title': 'Sun* Annual Awards 2025',
    'home.meta.description': 'Root Further — Sun* Annual Awards 2025',
    // Home — header nav
    'home.nav.about': 'About SAA 2025',
    'home.nav.awards': 'Awards Information',
    'home.nav.kudos': 'Sun* Kudos',
    // Home — header account menu
    'home.header.notification.label': 'Thông báo',
    'home.header.notification.empty': 'Không có thông báo mới.',
    'home.header.account.label': 'Tài khoản',
    'home.header.account.profile': 'Hồ sơ',
    'home.header.account.dashboard': 'Admin Dashboard',
    'home.header.account.signout': 'Đăng xuất',
    // Home — hero
    'home.hero.coming.soon': 'Coming soon',
    'home.hero.event.date.label': 'Ngày:',
    'home.hero.event.time.label': 'Thời gian:',
    'home.hero.event.location.label': 'Địa điểm:',
    'home.hero.days': 'DAYS',
    'home.hero.hours': 'HOURS',
    'home.hero.minutes': 'MINUTES',
    'home.hero.event.date': '26/12/2025',
    'home.hero.event.time': '18h30',
    'home.hero.event.location': 'Âu Cơ Art Center',
    'home.hero.event.livestream': 'Tường thuật trực tiếp qua sóng Livestream',
    'home.hero.cta.about': 'ABOUT AWARDS',
    'home.hero.cta.kudos': 'ABOUT KUDOS',
    // Home — root further content
    'home.root.body1': 'Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI và yêu cầu ngày càng cao từ khách hàng, Sun* lựa chọn chiến lược đa dạng hóa năng lực để không chỉ nỗ lực trở thành tinh anh trong lĩnh vực của mình, mà còn hướng đến một cái đích cao hơn, nơi mọi Sunner đều là "problem-solver" - chuyên gia trong việc giải quyết mọi vấn đề, tìm lời giải cho mọi bài toán của dự án, khách hàng và xã hội.\nLấy cảm hứng từ sự đa dạng năng lực, khả năng phát triển linh hoạt cùng tinh thần đào sâu để bứt phá trong kỷ nguyên AI, "Root Further" đã được chọn để trở thành chủ đề chính thức của Lễ trao giải Sun* Annual Awards 2025.\nVượt ra khỏi nét nghĩa bề mặt, "Root Further" chính là hành trình chúng ta không ngừng vươn xa hơn, cắm rễ mạnh hơn, chạm đến những tầng "địa chất" ẩn sâu để tiếp tục tồn tại, vươn lên và nuôi dưỡng đam mê kiến tạo giá trị luôn cháy bỏng của người Sun*. Mượn hình ảnh bộ rễ liên tục đâm sâu vào lòng đất, mạnh mẽ len lỏi qua từng lớp "trầm tích" để thẩm thấu những gì tinh tuý nhất, người Sun* cũng đang "hấp thụ" dưỡng chất từ thời đại và những thử thách của thị trường để làm mới mình mỗi ngày, mở rộng năng lực và mạnh mẽ "bén rễ" vào kỷ nguyên AI - một tầng "địa chất" hoàn toàn mới, phức tạp và khó đoán, nhưng cũng hội tụ vô vàn tiềm năng cùng cơ hội.',
    'home.root.quote': '"A tree with deep roots fears no storm"\n (Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)',
    'home.root.body2': 'Trước giông bão, chỉ những tán cây có bộ rễ đủ mạnh mới có thể trụ vững. Một tổ chức với những cá nhân tự tin vào năng lực đa dạng, sẵn sàng kiến tạo và đón nhận thử thách, làm chủ sự thay đổi là tổ chức không chỉ vững vàng trước biến động, mà còn khai thác được mọi lợi thế, chinh phục các thách thức của thời cuộc. Không đơn thuần là tên gọi của chương mới trên hành trình phát triển tổ chức, "Root Further" còn như một lời cổ vũ, động viên mỗi chúng ta hãy dám tin vào bản thân, dám đào sâu, khai mở mọi tiềm năng, dám phá bỏ giới hạn, dám trở thành phiên bản đa nhiệm và xuất sắc nhất của mình. Bởi trong thời đại AI, đa dạng năng lực và tận dụng sức mạnh thời cuộc chính là điều kiện tiên quyết để trường tồn.\nKhông ai biết trước ẩn sâu trong "lòng đất" của ngành công nghệ và thị trường hiện đại còn biết bao tầng "địa chất" bí ẩn. Chỉ biết rằng khi "Root Further" đã trở thành tinh thần cội rễ, chúng ta sẽ không sợ hãi, mà càng thấy háo hức trước bất cứ vùng vô định nào trên hành trình tiến về phía trước. Vì ta luôn tin rằng, trong chính những miền vô tận đó, là bao điều kỳ diệu và cơ hội vươn mình đang chờ ta.',
    // Home — awards
    'home.awards.caption': 'Sun* annual awards 2025',
    'home.awards.title': 'Hệ thống giải thưởng',
    'home.awards.description': 'Vinh danh những cá nhân và tập thể xuất sắc nhất của Sun*',
    'home.awards.detail.link': 'Chi tiết',
    'home.awards.top-talent.title': 'Top Talent',
    'home.awards.top-talent.description': 'Vinh danh top cá nhân xuất sắc trên mọi phương diện',
    'home.awards.top-project.title': 'Top Project',
    'home.awards.top-project.description': 'Vinh danh dự án xuất sắc nhất của năm',
    'home.awards.top-project-leader.title': 'Top Project Leader',
    'home.awards.top-project-leader.description': 'Vinh danh nhà lãnh đạo dự án xuất sắc',
    'home.awards.best-manager.title': 'Best Manager',
    'home.awards.best-manager.description': 'Vinh danh người quản lý xuất sắc nhất',
    'home.awards.signature-2025-creator.title': 'Signature 2025 - Creator',
    'home.awards.signature-2025-creator.description': 'Vinh danh cá nhân sáng tạo tiêu biểu năm 2025',
    'home.awards.mvp.title': 'MVP',
    'home.awards.mvp.description': 'Vinh danh cá nhân có đóng góp giá trị nhất',
    // Home — kudos
    'home.kudos.label': 'Phong trào ghi nhận',
    'home.kudos.title': 'Sun* Kudos',
    'home.kudos.highlight': 'ĐIỂM MỚI CỦA SAA 2025',
    'home.kudos.description': 'Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng 11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải.',
    'home.kudos.cta': 'Chi tiết',
    // Home — footer
    'home.footer.copyright': 'Bản quyền thuộc về Sun* © 2025',
    'home.footer.nav.about': 'About SAA 2025',
    'home.footer.nav.awards': 'Awards Information',
    'home.footer.nav.kudos': 'Sun* Kudos',
    'home.footer.nav.standards': 'Tiêu chuẩn chung',
    // Home — widget
    'home.widget.label': 'Viết Kudos',
  },
  en: {
    // Login
    'login.welcome.line1': 'Start your journey with SAA 2025.',
    'login.welcome.line2': 'Log in to explore!',
    'login.button.google': 'Sign in with Google',
    'login.button.loading': 'Signing in…',
    'login.footer.copyright': 'Copyright © Sun* 2025',
    'login.logo.alt': 'Sun* Annual Awards 2025',
    'login.error.oauth': 'Login failed. Please try again.',
    // Language
    'language.vi.label': 'VN',
    'language.en.label': 'EN',
    // Home — meta
    'home.meta.title': 'Sun* Annual Awards 2025',
    'home.meta.description': 'Root Further — Sun* Annual Awards 2025',
    // Home — header nav
    'home.nav.about': 'About SAA 2025',
    'home.nav.awards': 'Awards Information',
    'home.nav.kudos': 'Sun* Kudos',
    // Home — header account menu
    'home.header.notification.label': 'Notifications',
    'home.header.notification.empty': 'No new notifications.',
    'home.header.account.label': 'Account',
    'home.header.account.profile': 'Profile',
    'home.header.account.dashboard': 'Admin Dashboard',
    'home.header.account.signout': 'Sign out',
    // Home — hero
    'home.hero.coming.soon': 'Coming soon',
    'home.hero.event.date.label': 'Date:',
    'home.hero.event.time.label': 'Time:',
    'home.hero.event.location.label': 'Location:',
    'home.hero.days': 'DAYS',
    'home.hero.hours': 'HOURS',
    'home.hero.minutes': 'MINUTES',
    'home.hero.event.date': '26/12/2025',
    'home.hero.event.time': '18h30',
    'home.hero.event.location': 'Âu Cơ Art Center',
    'home.hero.event.livestream': 'Live stream on Facebook Group Sun* Family',
    'home.hero.cta.about': 'ABOUT AWARDS',
    'home.hero.cta.kudos': 'ABOUT KUDOS',
    // Home — root further content
    'home.root.body1': 'Facing the stormy changes of the AI era and increasingly high demands from customers, Sun* chooses to diversify its capabilities — not only striving to become elite in its field, but aiming for a higher goal where every Sunner is a "problem-solver".',
    'home.root.quote': '"A tree with deep roots fears no storm"',
    'home.root.body2': 'Before the storm, only trees with deep enough roots can stand firm. An organization with individuals who are confident in their diverse abilities, ready to create and embrace challenges, and who master change — is an organization that is not only firm in the face of upheaval, but also exploits every advantage and conquers the challenges of the times.',
    // Home — awards
    'home.awards.caption': 'Sun* annual awards 2025',
    'home.awards.title': 'Award System',
    'home.awards.description': 'Honoring the most outstanding individuals and teams at Sun*',
    'home.awards.detail.link': 'Detail',
    'home.awards.top-talent.title': 'Top Talent',
    'home.awards.top-talent.description': 'Honoring the most outstanding individuals across all aspects',
    'home.awards.top-project.title': 'Top Project',
    'home.awards.top-project.description': 'Honoring the most outstanding project of the year',
    'home.awards.top-project-leader.title': 'Top Project Leader',
    'home.awards.top-project-leader.description': 'Honoring the most outstanding project leader',
    'home.awards.best-manager.title': 'Best Manager',
    'home.awards.best-manager.description': 'Honoring the most outstanding manager',
    'home.awards.signature-2025-creator.title': 'Signature 2025 - Creator',
    'home.awards.signature-2025-creator.description': 'Honoring the most creative individual of 2025',
    'home.awards.mvp.title': 'MVP',
    'home.awards.mvp.description': 'Honoring the most valuable contributor',
    // Home — kudos
    'home.kudos.label': 'Recognition Movement',
    'home.kudos.title': 'Sun* Kudos',
    'home.kudos.highlight': 'NEW IN SAA 2025',
    'home.kudos.description': 'A recognition activity for colleagues — happening for the first time for all Sunners. Launching in November 2025, encouraging Sun* members to share words of appreciation and gratitude on the official platform.',
    'home.kudos.cta': 'Detail',
    // Home — footer
    'home.footer.copyright': 'Copyright © Sun* 2025',
    'home.footer.nav.about': 'About SAA 2025',
    'home.footer.nav.awards': 'Awards Information',
    'home.footer.nav.kudos': 'Sun* Kudos',
    'home.footer.nav.standards': 'General Standards',
    // Home — widget
    'home.widget.label': 'Write Kudos',
  },
} as const satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof typeof dictionary['vi'];

export function t(lang: Language, key: TranslationKey): string {
  return dictionary[lang][key] ?? dictionary[DEFAULT_LANGUAGE][key] ?? key;
}
