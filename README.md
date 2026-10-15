# Maruti Chemicals — B2B catalogue

A JavaScript React + Tailwind storefront and Express API for Maruti Chemicals. The home page groups the company's publicly listed sectors into four product categories: Pharmaceutical Industry, Food Industry, Hospitals & Healthcare, and Clean Room Products. Each category shows ten product cards. Liquid Sampling Bags and Sterile Tape are the two products featured on the public company website; all other listings are explicitly labelled illustrative samples and must be verified before use or publication. The site includes category pages, navbar search, printable product briefs, a persistent multi-product enquiry list with manually entered quantities, and SMTP email notifications.

The company home page includes its published profile figures, a CSS-animated delivery process, six company value cards, and FAQs based on the public source site. The moving product visuals are original CSS illustrations; they are not photographs or product specifications.

Company contact details and public company-profile figures are based on [Maruti Chemicals' public website](https://maruti-chemicals.vercel.app/). Product availability, specifications, certifications and regulatory suitability must be confirmed directly with Maruti Chemicals before use or ordering. The public site describes the scale figures as 10+ years' experience, five sectors served, 250+ customers and 20+ product categories; only its two featured products are included here.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and enter SMTP credentials for an account authorized to send mail. Enquiry notifications are sent to `jadaunprinci11@gmail.com` by default; set `COMPANY_EMAIL` to use a different destination.
4. Run `npm run dev`.
5. Open `http://localhost:5173`. The API runs at `http://localhost:3000`.

The frontend calls `/api/enquiries`; in local development Vite proxies this endpoint to Express. In production, build the client and run the API with `NODE_ENV=production npm start`; Express serves the generated `dist` folder and the API from the same origin.

Email delivery needs a working SMTP service. The API returns an explicit configuration error when SMTP settings are missing and does not report a successful submission unless the email was accepted by the SMTP server. Never commit `.env` or real SMTP credentials.

## Before production

- Verify the displayed contact details, experience figures, customer figures and product-category count with Maruti Chemicals before publishing changes.
- Request and verify product specifications, sizes, certificates and regulatory documents with Maruti Chemicals; these product briefs are not product specifications.
- Add your approved privacy notice and terms, configure the production client origin, and use an authenticated, TLS-enabled SMTP service.
- Configure HTTPS and production hosting, monitoring and backups. For a larger operation, persist submitted enquiries in a database/CRM in addition to email.
