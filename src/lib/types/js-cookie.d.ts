declare module 'js-cookie' {
  export type SameSite = 'strict' | 'lax' | 'none';

  export interface CookieAttributes {
    path?: string;
    domain?: string;
    expires?: number | Date;
    secure?: boolean;
    sameSite?: SameSite;
  }

  export interface CookiesStatic {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: CookieAttributes): string | undefined;
    remove(name: string, options?: CookieAttributes): void;
  }

  const Cookies: CookiesStatic;

  export default Cookies;
}
