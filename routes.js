// routes.js
const express = require('express');
const pool = require('./db'); // 引入 db.js 中的連線池
const { getLabelIds } = require('./utils'); // 引入輔助函數
const router = express.Router();

// #region ================使用者================

// 註冊功能
router.post('/users', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO registers (username, password) VALUES ($1, $2) RETURNING *',
      [username, password]
    );
    res.status(201).json(result.rows[0]); // 回傳新增的使用者資料
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// 更新使用者密碼
router.put('/users/:id/password', async (req, res) => {
  const { id } = req.params; // 使用者的 ID
  const { newPassword } = req.body; // 新密碼
  
  try {
    // 更新密碼
    const result = await pool.query(
      'UPDATE registers SET password = $1 WHERE uid = $2 RETURNING *',
      [newPassword, id]
    );

    // 如果找不到該使用者
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Password updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// 刪除全部使用者
router.delete('/users', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM registers RETURNING *');

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No users found to delete' });
    }

    res.status(200).json({
      message: 'All users deleted successfully',
      deletedUsers: result.rows, // 可選：回傳被刪除的使用者資料
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// 刪除特定使用者
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params; // 從 URL 獲取使用者 ID
  try {
    const result = await pool.query('DELETE FROM registers WHERE uid = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' }); // 如果找不到使用者
    }

    res.status(200).json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// 查詢所有使用者
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registers');
    res.json(result.rows); // 回傳 JSON 格式的資料
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// 查詢特定使用者
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM registers WHERE uid = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// #endregion

// #region ================發文================

// 發起投票
router.post('/posts', async (req, res) => {
  const {
    uid,
    title,
    problem_content,
    option_a_content,
    option_b_content,
    anonymous_flag,
    labels, // 傳入的標籤 ID 陣列，例如 [1, 2]
  } = req.body;
  
  try {
    // 1. 插入投票問題到 post 表
    const postResult = await pool.query(
      `INSERT INTO post (uid, title, problem_content, option_a_content, option_b_content, anonymous_flag)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uid, title, problem_content, option_a_content, option_b_content, anonymous_flag]
    );
    
    const post = postResult.rows[0]; // 新增的投票問題

    // 2. 獲取 labels 的 lid
    const labelIds = await getLabelIds(labels, pool);
    console.log('Resolved label IDs:', labelIds);

    // 3. 插入標籤關聯到 post_label 表
    const postLabelQueries = labelIds.map((lid) =>
      pool.query('INSERT INTO post_label (pid, lid) VALUES ($1, $2)', [post.pid, lid])
    );
    await Promise.all(postLabelQueries);

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// 查詢所有投票
router.get('/posts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         p.pid,
         p.title,
         p.problem_content,
         p.option_a_content,
         p.option_b_content,
         p.anonymous_flag,
         p.create_time,
         u.username AS author,
         ARRAY_AGG(l.labelname) AS labels
       FROM post p
       JOIN registers u ON p.uid = u.uid
       LEFT JOIN post_label pl ON p.pid = pl.pid
       LEFT JOIN label l ON pl.lid = l.lid
       GROUP BY p.pid, u.username
       ORDER BY p.create_time DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching posts with labels:', error.message);
    res.status(500).send('Server Error');
  }
});

// 查詢特定投票
router.get('/posts/:id', async (req, res) => {
  const { id } = req.params; // 獲取路徑中的 pid
  try {
    const result = await pool.query(
      `SELECT 
         p.pid,
         p.title,
         p.problem_content,
         p.option_a_content,
         p.option_b_content,
         p.anonymous_flag,
         p.create_time,
         u.username AS author,
         ARRAY_AGG(l.labelname) AS labels
       FROM post p
       JOIN registers u ON p.uid = u.uid
       LEFT JOIN post_label pl ON p.pid = pl.pid
       LEFT JOIN label l ON pl.lid = l.lid
       WHERE p.pid = $1
       GROUP BY p.pid, u.username`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching post with labels:', error.message);
    res.status(500).send('Server Error');
  }
});

// 刪除所有投票
router.delete('/posts', async (req, res) => {
  try {
    // 刪除所有投票和關聯數據
    await pool.query('TRUNCATE TABLE post CASCADE');
    res.status(200).json({ message: 'All posts and related data have been deleted.' });
  } catch (error) {
    console.error('Error deleting all posts:', error.message);
    res.status(500).send('Server Error');
  }
});

// 刪除指定 pid 的投票
router.delete('/posts/:pid', async (req, res) => {
  const { pid } = req.params; // 獲取路徑中的 pid
  try {
    // 刪除投票
    const result = await pool.query('DELETE FROM post WHERE pid = $1 RETURNING *', [pid]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Post with pid ${pid} not found.` });
    }

    res.status(200).json({ message: `Post with pid ${pid} has been deleted.` });
  } catch (error) {
    console.error('Error deleting post:', error.message);
    res.status(500).send('Server Error');
  }
});

// #endregion

// #region  ================投票================

// 進行投票
router.post('/votes', async (req, res) => {
  const { uid, pid, side } = req.body; // 接收投票者 ID, 投票 ID, 和選擇的選項 (true 或 false)

  try {
    // 檢查該用戶是否已對該投票投過票
    const existingVote = await pool.query(
      'SELECT * FROM vote_history WHERE uid = $1 AND pid = $2',
      [uid, pid]
    );

    if (existingVote.rowCount > 0) {
      return res.status(400).json({ message: 'User has already voted for this post.' });
    }

    // 插入投票記錄
    const result = await pool.query(
      'INSERT INTO vote_history (uid, pid, side) VALUES ($1, $2, $3) RETURNING *',
      [uid, pid, side]
    );

    res.status(201).json({ message: 'Vote recorded successfully', vote: result.rows[0] });
  } catch (error) {
    console.error('Error recording vote:', error.message);
    res.status(500).send('Server Error');
  }
});

// #endregion

// #region  ================紀錄================

// 根據 pid 查詢所有投票記錄
router.get('/votes/posts/:pid', async (req, res) => {
  const { pid } = req.params; // 獲取路徑中的 pid
  try {
    // 查詢指定 pid 的所有投票記錄
    const result = await pool.query(
      `SELECT 
         v.vhid, 
         v.uid, 
         v.pid, 
         v.side, 
         v.create_time, 
         r.username AS voter_name
       FROM vote_history v
       JOIN registers r ON v.uid = r.uid
       WHERE v.pid = $1
       ORDER BY v.create_time ASC`,
      [pid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No votes found for pid ${pid}.` });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching vote history:', error.message);
    res.status(500).send('Server Error');
  }
});

// 根據 uid 查詢所有投票記錄
router.get('/votes/users/:uid', async (req, res) => {
  const { uid } = req.params; // 獲取路徑中的 uid
  try {
    // 查詢指定 uid 的所有投票記錄
    const result = await pool.query(
      `SELECT 
         v.vhid,
         v.uid,
         v.pid,
         v.side,
         v.create_time,
         p.title AS post_title,
         p.problem_content AS post_content
       FROM vote_history v
       JOIN post p ON v.pid = p.pid
       WHERE v.uid = $1
       ORDER BY v.create_time DESC`,
      [uid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No vote history found for uid ${uid}.` });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching vote history by uid:', error.message);
    res.status(500).send('Server Error');
  }
});

// 根據 uid 查詢所有發文紀錄
router.get('/posts/user/:uid', async (req, res) => {
  const { uid } = req.params; // 獲取路徑中的 uid
  try {
    // 查詢指定 uid 的所有發文
    const result = await pool.query(
      `SELECT 
         p.pid,
         p.title,
         p.problem_content,
         p.option_a_content,
         p.option_b_content,
         p.anonymous_flag,
         p.create_time,
         ARRAY_AGG(l.labelname) AS labels
       FROM post p
       LEFT JOIN post_label pl ON p.pid = pl.pid
       LEFT JOIN label l ON pl.lid = l.lid
       WHERE p.uid = $1
       GROUP BY p.pid
       ORDER BY p.create_time DESC`,
      [uid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No posts found for uid ${uid}.` });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching posts by uid:', error.message);
    res.status(500).send('Server Error');
  }
});

// 根據 username 查詢所有發文紀錄
router.get('/posts/user/:username', async (req, res) => {
  const { username } = req.params; // 獲取路徑中的 username
  try {
    const result = await pool.query(
      `SELECT 
         p.pid,
         p.title,
         p.problem_content,
         p.option_a_content,
         p.option_b_content,
         p.anonymous_flag,
         p.create_time,
         u.username AS author,
         ARRAY_AGG(l.labelname) AS labels
       FROM post p
       JOIN registers u ON p.uid = u.uid
       LEFT JOIN post_label pl ON p.pid = pl.pid
       LEFT JOIN label l ON pl.lid = l.lid
       WHERE u.username = $1
       GROUP BY p.pid, u.username
       ORDER BY p.create_time DESC`,
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No posts found for username: ${username}` });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching posts by username:', error.message);
    res.status(500).send('Server Error');
  }
});

// #endregion

module.exports = router;