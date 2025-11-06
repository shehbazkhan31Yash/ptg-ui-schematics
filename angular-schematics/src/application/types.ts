export interface ApplicationOptions {
 name: string;
 framework?: string;
 ngrx?: boolean;
 i18n?: boolean;
 seo?: boolean;
 seoType?: 'none' | 'basic' | 'ssg' | 'ssr';
 authentication?: 'none' | 'msal' | 'okta' | 'custom';
 enableLinting?: boolean;
 lintingStyle?: 'none' | 'airbnb' | 'standard' | 'custom';
 husky?: boolean;
 appDir?: string;
 [key: string]: any;
}