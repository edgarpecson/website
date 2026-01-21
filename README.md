# Edgar Pecson Portfolio Website

## Project Overview

This project is a full-stack personal portfolio website showcasing Edgar Pecson's expertise in database engineering, AWS cloud infrastructure, and full-stack development. The frontend is built with React and Vite, featuring responsive design, React Router for navigation, and interactive components for demos. The backend is a FastAPI application that integrates with AWS services to control an EC2 instance running Oracle 19c, simulate RMAN backups, and execute safe console commands via SSM.

Key features:
- Hero section with profile and skills overview.
- Portfolio page with interactive AWS EC2 demo (start/stop instance, status polling, activity log).
- EC2 console for real-time command outputs (df, uptime, free, top, ls).
- RMAN backup simulation demo on Home page.
- Responsive hamburger menu on mobile.
- About and Contact pages.

The project was developed through troubleshooting deployment issues on Render, including dependency conflicts, build failures, start command errors, and responsive CSS adjustments.

## Prerequisites

- Python 3.13 (or 3.12 for better compatibility with dependencies like pyzmq and pandas).
- Node.js 22+ for frontend.
- AWS account with EC2 instance (Oracle 19c demo), SSM permissions, and credentials (access key, secret key, region, instance ID).
- Git for cloning the repository.
- Render account for deployment (free tier sufficient for basic use).

## Installation/Setup

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/edgarpecson/website.git
   cd website
   ```

2. **Backend Setup**:
   ```
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
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

3. **Frontend Setup**:
   ```
   cd ../frontend
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

1. Create two services on Render (connect to GitHub repo):

   **Frontend (Static Site)**:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-backend-name.onrender.com
     ```
   - Redirects/Rewrites: Add rule for React Router (`/*` → `/index.html` as Rewrite).

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

2. Deploy both services (clear build cache if issues).

## Usage

### Local Usage

- Backend: http://localhost:8000/docs (Swagger UI for API testing).
- Frontend: http://localhost:5173.
- Portfolio page: Interact with EC2 demo (start/stop, status, log, console commands).
- Home page: Run RMAN Demo for simulation.

### Deployed Usage

- Frontend: https://your-frontend.onrender.com (e.g., website-react-ew8e.onrender.com).
- Backend API: https://your-backend.onrender.com/docs.
- Use Portfolio for EC2 demo.
- Note: Cold start delay on free tier.

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

### Frontend - Polling EC2 Status (App.jsx)

```javascript
useEffect(() => {
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ec2-status`);
      const data = await res.json();
      const newStatus = data.status || 'error';
      if (newStatus !== ec2Status) {
        // ... update log and status
      }
    } catch (err) {
      // ... handle error
    }
  };

  fetchStatus();
  const interval = setInterval(fetchStatus, 8000);
  return () => clearInterval(interval);
}, [ec2Status, BASE_URL]);
```

### Responsive Hamburger Menu (App.jsx + App.css)

```javascript
// App.jsx
<button className="hamburger" onClick={toggleMenu}>
  <div className={`hamburger-lines ${isMenuOpen ? 'open' : ''}`}>
    <span></span>
    <span></span>
    <span></span>
  </div>
</button>
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

## Troubleshooting

- **Dependency Conflicts**: Downgrade to Python 3.12, loosen pins (e.g., `anyio>=3.7,<4`), upgrade packages (`pyzmq>=27.1.0`, `pandas>=2.2.3`).
- **Uvicorn Not Found**: Use `.venv/bin/uvicorn` in start command.
- **ModuleNotFoundError (boto3)**: Add `boto3>=1.35.0` to requirements.txt.
- **404 on Frontend Paths**: Add Rewrite rule in Render.
- **API Calls to localhost**: Set `VITE_API_URL` in frontend env vars.
- **Hamburger Menu Not Showing**: Ensure media query at bottom of App.css.
- **Responsive Issues (jumbled headings, large image)**: Use clamp() and media queries; clear browser cache.

## Contributing

Fork, make changes, submit PR. For issues, open GitHub issue.

## License

MIT License

Copyright (c) 2026 Edgar Pecson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
