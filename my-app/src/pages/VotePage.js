import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import chickImage from "../chick.png";
import "./VotePage.css"; // 引入樣式檔案

const VotePage = () => {
  const navigate = useNavigate(); // 初始化 useNavigate
  const [posts] = useState([
    { id: 1, title: "投票標題 1：你喜歡貓還是狗？" },
    { id: 2, title: "投票標題 2：最喜歡的季節？" },
    { id: 3, title: "投票標題 3：你覺得早餐應該吃什麼？" },
    { id: 4, title: "投票標題 4：你最愛的運動是什麼？" },
    { id: 5, title: "投票標題 5：最想去的旅遊地點？" },
    { id: 5, title: "投票標題 5：最想去的旅遊地點？" },
    { id: 5, title: "投票標題 5：最想去的旅遊地點？" },
    { id: 5, title: "投票標題 5：最想去的旅遊地點？" },
    { id: 5, title: "投票標題 5：最想去的旅遊地點？" },
  ]);

  const handleVote = (postId, choice) => {
    alert(`你在投票 ID 為 ${postId} 的文章中選擇了 ${choice}`);
  };

  return (
    <div className="votepage">
      {/* 中央框框 */}
      <div className="frame">
        {/* 左上角 Username */}
        <div className="header">
          <span className="username">Username</span>
          <img src={chickImage} alt="Settings" className="settings-icon" />
        </div>
        {/* 中間滾動文章區域 */}
        <div className="content">
          {posts.map((post) => (
            <div className="post" key={post.id}>
              <h3>{post.title}</h3>
              <div className="buttons">
                <button onClick={() => handleVote(post.id, "A")}>選擇 A</button>
                <button onClick={() => handleVote(post.id, "B")}>選擇 B</button>
              </div>
            </div>
          ))}
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

export default VotePage;
