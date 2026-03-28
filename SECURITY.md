# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | Yes       |

## Reporting a Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Report privately by contacting the maintainer through the
[GitHub profile](https://github.com/gyanaprakashkhandual).

Please include:

- A clear description of the vulnerability
- Steps to reproduce
- Potential impact
- A suggested fix if available

You will receive an acknowledgement within 48 hours and a resolution or update within 7 days.

## Security Practices

This project follows standard frontend security practices:

- No sensitive data is stored in `localStorage` or `sessionStorage` without sanitisation
- All user input is handled through controlled React components
- Dependencies are kept up to date — run `npm audit` to check for known vulnerabilities
- No third-party scripts are loaded from untrusted sources
