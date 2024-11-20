import logo from './logo.svg';
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VotePage from "./pages/VotePage";
import HomePage from './pages/HomePage';
import VoteCreatePage from './pages/VoteCreatePage';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/home" element={<HomePage />} /> 
      <Route path="/vote" element={<VotePage />} />
      <Route path="/votecreate" element={<VoteCreatePage />} />
    </Routes>
  </Router>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
