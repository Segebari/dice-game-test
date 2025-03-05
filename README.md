

```markdown
### Dice Game

A modern dice-rolling game built to demonstrate full-stack development skills using React, Node.js, MongoDB, and Tailwind CSS. The app features a unique loading screen, a sleek interface, and a secure backend.

## Features
- **Frontend**: Vite React app with Tailwind CSS for responsive, stylish UI.
- **Backend**: Node.js with Express, connected to MongoDB for data persistence.
- **Unique Loading Screen**: Custom-designed loading animation with dice graphics.
- **Dice Roll Mechanics**: Simulates dice rolls with client/server seed verification.
- **Hosting**: Frontend on Netlify, backend on Render.
- **Security**: Environment variables secured with `.env` and `.gitignore`.

## Tech Stack
- **Frontend**: Vite, React, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB (via Mongoose)
- **Deployment**: Netlify (frontend), Render (backend)
- **Tools**: Git, GitHub, dotenv

## Installation
1. **Clone the Repo**:
   ```bash
   git clone https://github.com/your-username/dice-game-test.git
   cd dice-game-test
   ```

2. **Frontend Setup**:
   ```bash
   npm install
   npm run dev
   ```
   - Runs on `http://localhost:5173` (Vite default).

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in `backend/` with:
     ```
     PORT=3001
     MONGO_URI=your-mongodb-uri
     NODE_ENV=development
     ```
   - Start the backend:
     ```bash
     node index.js
     ```

4. **Dependencies**: Ensure MongoDB is running locally or use a cloud URI (e.g., MongoDB Atlas).

## Deployment
- **Frontend (Netlify)**:
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
- **Backend (Render)**:
  - Build Command: `npm install`
  - Start Command: `node index.js`
  - Env Vars: `PORT`, `MONGO_URI`, `NODE_ENV`

## Usage
- Enter a bet amount, click "Roll Dice," and watch the animated progress bar reflect the result.
- View client/server seeds for transparency.

## Notes
- Web3 integration was not implemented due to time constraints.
- Focus was on showcasing MongoDB skills and a polished UI/UX.

## License
MIT
```

---
