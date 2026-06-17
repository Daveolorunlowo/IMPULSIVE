// @ts-ignore
import disposableDomains from 'disposable-email-domains';

/**
 * Checks if the given email address domain is a known temporary or disposable email provider.
 * @param email - The email address to check.
 * @returns true if the email domain is disposable, false otherwise.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];
  if (!domain) return false;

  // Use a Set for O(1) domain matching
  const domainSet = new Set(disposableDomains as string[]);

  // 1. Direct match check (e.g. mailinator.com)
  if (domainSet.has(domain)) {
    return true;
  }

  // 2. Subdomain check (e.g. sub.mailinator.com should also be blocked if mailinator.com is blocked)
  const domainParts = domain.split('.');
  for (let i = 0; i < domainParts.length - 1; i++) {
    const parentDomain = domainParts.slice(i).join('.');
    if (domainSet.has(parentDomain)) {
      return true;
    }
  }

  return false;
}
