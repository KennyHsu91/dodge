import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VoteCreatePage.css";
import chickImage from "../chick.png";

const VoteCreatePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    // TODO: 將資料送至後端 API，發起投票
    // const data = { title, optionA, optionB, isAnonymous };
    // API 呼叫邏輯放在這裡

    // 模擬送出後，返回首頁
    navigate("/home");
  };

  return (
    <div className="vote-create-page">
      <div className="frame">
        {/* Header - Username 和 Settings */}
        <div className="header">
          <span className="username">Username</span>
          <img src={chickImage} alt="Settings" className="settings-icon" />
        </div>

        {/* 中央區域 */}
        <div className="title">發起投票</div>
        <div className="content">
          {/* 題目敘述 */}
          <label className="label">
            題目敘述
            <textarea
              className="input-textarea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入投票的題目"
            />
          </label>

          {/* 選項 A */}
          <label className="label">
            選項 A
            <input
              className="input"
              type="text"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              placeholder="請輸入選項 A"
            />
          </label>

          {/* 選項 B */}
          <label className="label">
            選項 B
            <input
              className="input"
              type="text"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              placeholder="請輸入選項 B"
            />
          </label>

          {/* 是否匿名 */}
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            是否匿名
            <button className="submit-button" onClick={handleSubmit}>送出</button>
          </label>
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

export default VoteCreatePage;
