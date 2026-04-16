import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import PromptList from './components/PromptList/PromptList';
import PromptDetail from './components/PromptDetail/PromptDetail';
import AddPrompt from './components/AddPrompt/AddPrompt';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🎨</span>
              <h1>AI Prompt Library</h1>
            </div>
            <nav className="nav">
              <NavLink
                to="/prompts"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Browse Prompts
              </NavLink>
              <NavLink
                to="/add-prompt"
                className={({ isActive }) => `nav-link nav-link-cta ${isActive ? 'active' : ''}`}
              >
                + Add Prompt
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/prompts" replace />} />
            <Route path="/prompts" element={<PromptList />} />
            <Route path="/prompts/:id" element={<PromptDetail />} />
            <Route path="/add-prompt" element={<AddPrompt />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;