# my-portfolio-v2

Personal portfolio for Vishal Gupta. Built with React + Vite.

## Stack
- React (Vite) — frontend
- CSS-in-JS inline styles — no external CSS libraries
- GitHub Pages — deployment via dist/ folder

## Design
- Background: #0f0f0f
- Primary text: #e8e6e0
- Secondary text: #888888
- Section labels: #555555
- Card background: #161616
- Accent: #a78bfa
- Style goal: clean and minimal, like mhouge.dk

## Structure
src/components/ — one file per section (Nav, Hero, Projects, About, Contact)
App.jsx — imports and renders all components

## Rules
- Always set colors explicitly on every text element — no color inheritance
- No external CSS libraries
- Run npm run build before deploying to verify it compiles
