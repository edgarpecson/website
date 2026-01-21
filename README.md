# Edgar Pecson Portfolio Website

## Project Overview

This project is a full-stack personal portfolio website showcasing expertise in database engineering, AWS cloud infrastructure, and full-stack development. The frontend is built with React and Vite, featuring responsive design with React Router for navigation, a hamburger menu on mobile, and interactive demos. The backend is a FastAPI application that integrates with AWS services (EC2, SSM, boto3) to manage an Oracle 19c demo instance, simulate RMAN backups, fetch real-time instance status, and execute safe console commands (df, uptime, free, top, ls_home).

Key features:
- Home page with RMAN backup demo simulation.
- Portfolio page with AWS EC2 automation: start/stop instance, status polling every 8 seconds, activity log, and console output for system commands.
- About and Contact pages.
- Responsive design: hamburger menu on mobile, fluid font sizes, padding, and layout using clamp() and media queries.
- CORS middleware for frontend-backend communication.
- Environment variables for AWS credentials and API base URL.
- Favicon and dynamic browser tab titles.

The project was developed through troubleshooting deployment on Render, including resolving dependency conflicts, build failures, start command errors, module imports, 404 errors, responsive CSS for hamburger menu and portfolio resizing, and AWS integration issues.

## Prerequisites

- Python 3.13 (or 3.12 for better compatibility with dependencies like pyzmq, pandas, lxml).
- Node.js 22+ for frontend.
- AWS account with:
  - EC2 instance set up for Oracle 19c demo.
  - IAM user with permissions for EC2 (start/stop, describe) and SSM (send command, get invocation).
  - Credentials: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, EC2_INSTANCE_ID.
- Git for cloning the repository.
- Render account for deployment (free tier sufficient).
- Browser with dev tools for testing (e.g., Chrome for Network/Console tabs).

## Installation/Setup

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/edgarpecson/website.git
   cd website
   ```

2. **Backend Setup**:
   - Navigate to backend:
     ```
     cd backend
     ```
   - Create and activate virtual environment:
     ```
     python -m venv .venv
     source .venv/bin/activate  # Windows: .venv\Scripts\activate
     ```
   - Install dependencies:
     ```
     pip install --upgrade pip setuptools wheel
     pip install -r requirements.txt
     ```
   - Add boto3 if missing:
     ```
     pip install boto3>=1.35.0
     ```
   - Create `.env` file in backend/:
     ```
     AWS_ACCESS_KEY_ID=your-access-key
     AWS_SECRET_ACCESS_KEY=your-secret-key
     AWS_REGION=us-west-1
     EC2_INSTANCE_ID=your-instance-id
     ```
   - Run backend:
     ```
     uvicorn main:app --reload --host 0.0.0.0 --port 8000
     ```
   - Test backend: Open http://localhost:8000/docs for Swagger UI.

3. **Frontend Setup**:
   - Navigate to frontend:
     ```
     cd ../frontend
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Create `.env` in frontend/:
     ```
     VITE_API_URL=http://localhost:8000
     ```
   - Run frontend:
     ```
     npm run dev
     ```
   - Open http://localhost:5173 in browser.

### Deployment Setup on Render

1. Create two services on Render, connected to the GitHub repo.

   **Frontend (Static Site)**:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-backend-name.onrender.com
     ```
   - Redirects/Rewrites: Add rule:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: Rewrite

   **Backend (Web Service)**:
   - Root Directory: `backend`
   - Build Command: `pip install --upgrade pip setuptools wheel && pip install -r requirements.txt`
   - Start Command: `.venv/bin/uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables:
     ```
     PYTHON_VERSION=3.12
     AWS_ACCESS_KEY_ID=your-access-key
     AWS_SECRET_ACCESS_KEY=your-secret-key
     AWS_REGION=us-west-1
     EC2_INSTANCE_ID=your-instance-id
     ```

2. Deploy both services. Use "Clear build cache & deploy" for any changes.

3. Test deployed site:
   - Frontend: https://your-frontend.onrender.com
   - Backend: https://your-backend.onrender.com/docs

## Usage

### Local Usage

- Backend: Access Swagger UI at http://localhost:8000/docs to test endpoints (e.g., /ec2-status, /start-ec2, /stop-ec2, /console/{cmd_key}).
- Frontend: Open http://localhost:5173.
  - Home: Click "Run RMAN Demo" to simulate backend call.
  - Portfolio: Start/Stop EC2 instance, view status and log updates, select console command for output.
  - Resize browser to test responsive hamburger menu.

### Deployed Usage

- Frontend: Navigate pages, interact with demos on Portfolio.
- Backend: Use Swagger at /docs for API testing.
- Note: Free tier may have cold start delays; high traffic incurs query costs.

## Code Examples

### Backend - EC2 Status Endpoint (main.py)

```python
@app.get("/ec2-status")
async def get_ec2_status():
    try:
        response = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
        state = response['Reservations'][0]['Instances'][0]['State']['Name']
        return {"status": state}
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

This endpoint fetches the current state of the EC2 instance.

### Frontend - EC2 Status Polling (App.jsx)

```javascriptreact
useEffect(() => {
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ec2-status`);
      const data = await res.json();
      const newStatus = data.status || 'error';
      if (newStatus !== ec2Status) {
        // Log message logic...
        addLog(logMessage);
        setEc2Status(newStatus);
      }
    } catch (err) {
      // Error logic...
    }
  };

  fetchStatus();
  const interval = setInterval(fetchStatus, 8000);
  return () => clearInterval(interval);
}, [ec2Status, BASE_URL]);
```

This hook polls the backend for EC2 status and updates the log.

### Responsive Hamburger Menu (App.jsx + App.css)

```javascriptreact
// App.jsx
<button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
  <div className={`hamburger-lines ${isMenuOpen ? 'open' : ''}`}>
    <span></span>
    <span></span>
    <span></span>
  </div>
</button>

<div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
  <Link to="/" onClick={closeMenu}>Home</Link>
  <Link to="/about" onClick={closeMenu}>About</Link>
  <Link to="/portfolio" onClick={closeMenu}>Portfolio</Link>
  <Link to="/contact" onClick={closeMenu}>Contact</Link>
</div>
```

```css
/* App.css */
@media (max-width: 768px) {
  .desktop-links {
    display: none !important;
  }
  .hamburger {
    display: flex !important;
  }
}
```

### Responsive Profile Image (App.css)

```css
.profile-img {
  width: 100%;
  max-width: clamp(280px, 35vw, 420px);
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 4px solid white;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.profile-img:hover {
  transform: scale(1.03);
}
```

## Troubleshooting

- **Dependency Conflicts**: Downgrade to Python 3.12, loosen pins (e.g., `anyio>=3.7,<4`), upgrade (`pyzmq>=27.1.0`, `pandas>=2.2.3`, `lxml>=5.3.0`).
- **Build Failures on Render**: Clear build cache, fix syntax in vite.config.js, set correct Publish Directory (`dist` for Vite).
- **Uvicorn Not Found**: Use `.venv/bin/uvicorn` or set Root Directory to `backend`.
- **ModuleNotFoundError (boto3)**: Add `boto3>=1.35.0` to requirements.txt.
- **404 on Frontend**: Add Rewrite rule `/*` → `/index.html` in Render.
- **API Calls to localhost**: Set `VITE_API_URL` env var on frontend, use custom build command `VITE_API_URL=https://... npm install && npm run build`.
- **Hamburger Menu Not Showing**: Ensure media query at bottom of App.css, check class names, use !important if conflicts.
- **Jumbled Layout on Mobile**: Use clamp() for sizes, add media queries for max-width: 768px/480px.
- **Large Profile Image on Desktop**: Use clamp() with max 420px.
- **EC2 Commands Fail**: Verify AWS env vars, check backend logs for boto3 errors.

## Contributing

Fork the repo, create a feature branch, commit changes, push, and open a pull request. For issues, open a GitHub issue with details.

## License

MIT License

Copyright (c) 2026 Edgar Pecson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
