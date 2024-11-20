import React from "react";
import { useNavigate } from "react-router-dom";
import chickImage from "../chick.png";
import "./HomePage.css"; // 引入樣式檔


const HomePage = () => {
    const navigate = useNavigate(); // 初始化 useNavigate
    return (
      <div className="homepage">
        {/* 中央框框 */}
        <div className="frame">
          {/* 左上角 Username */}
          <div className="header">
            <span className="username">Username</span>
            <img
              src={chickImage}
              alt="Settings"
              className="settings-icon"
            />
          </div>
          {/* 中間大 Logo */}
          <div className="logo">
            <img
              src={chickImage}
              alt="Logo"
              className="logo-image"
            />
          </div>
          {/* 底部按鈕 */}
          <div className="footer">
          <button className="button" onClick={() => navigate("/vote")}>查看投票</button>
            <button className="button" onClick={() => navigate("/votecreate")}>提出投票</button>
            <button className="button">投票歷史紀錄</button>
            <button className="button">發起的歷史紀錄</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default HomePage;