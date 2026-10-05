# Production Design QA Checklist Web App

An interactive, shareable Production QA checklist built for IBM Brand & Design teams following IBM Design Language (IDL) and IBM Editorial Style guidelines.

## Features
- **Interactive Checkbox Tracking**: Progress bar and category completion counters update in real time.
- **Compact URL Sharing**: Generates short URLs with checked items encoded into query tokens (e.g. `?c=1a`).
- **Markdown Link Support**: Embedded links directly to IBM Design Language, Plex typography, 2x Grid, Color, and Box notes.
- **Checklist Editor**: In-browser customizer to adjust categories, add project-specific items, or tailor the sign-off criteria.
- **Zero-Dependency Static App**: Pure HTML5, CSS3, and JavaScript — no build steps, backend databases, or external frameworks required.

---

## Deployment Options

### Option 1: GitHub Pages (Public GitHub or IBM Enterprise GitHub)

1. Create a repository on GitHub (e.g. `https://github.com/your-org/production-design-checklist` or `https://github.ibm.com/your-org/production-design-checklist`).
2. Clone or push this project to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Production Design QA checklist"
   git branch -M main
   git remote add origin <YOUR_REPO_URL>
   git push -u origin main
   ```
3. Enable GitHub Pages:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select `Deploy from a branch`.
   - Select `main` branch and `/ (root)` folder, then click **Save**.
4. Your live link will be available at:
   - Public: `https://<username>.github.io/<repo-name>/production-design-qa-checklist.html` (or `index.html`)
   - IBM Enterprise: `https://pages.github.ibm.com/<org>/<repo-name>/production-design-qa-checklist.html`

---

### Option 2: IBM Cloud Code Engine (Static Web Hosting)

1. Log in with the IBM Cloud CLI:
   ```bash
   ibmcloud login --sso
   ibmcloud target -g Default
   ```
2. Create and deploy a Code Engine application using standard Nginx or static file serving:
   ```bash
   ibmcloud ce project create --name design-qa-tools
   ibmcloud ce project select --name design-qa-tools
   ibmcloud ce app create --name qa-checklist --src . --port 80
   ```

---

### Option 3: Local Testing / Team Network

To run locally and preview on your network:
```bash
python3 -m http.server 3000
```
Access at:
```text
http://localhost:3000/production-design-qa-checklist.html
```
