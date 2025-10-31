export interface ApplicationOptions {
 name: string;
 framework?: string;
 ngrx?: boolean;
 i18n?: boolean;
 seo?: boolean;
 seoType?: 'basic' | 'ssg' | 'ssr';
 enableLinting?: boolean;
 lintingStyle?: string;
 husky?: boolean;
 appDir?: string;
 [key: string]: any;
}