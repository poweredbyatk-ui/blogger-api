export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const BLOG_ID = '5749811470026327914';
  const BASE = 'https://www.googleapis.com/blogger/v3';

  const { action, token, postId, title, content, labels, isDraft } = req.body || {};

  if (!token) return res.status(401).json({ error: 'Token required' });

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    let response, data;

    if (action === 'getPosts') {
      response = await fetch(`${BASE}/blogs/${BLOG_ID}/posts?maxResults=20&fetchBodies=false&status=live&status=draft`, { headers });
      data = await response.json();
      return res.json(data);
    }

    if (action === 'createPost') {
      response = await fetch(`${BASE}/blogs/${BLOG_ID}/posts/?isDraft=${isDraft||false}`, {
        method: 'POST', headers,
        body: JSON.stringify({ kind: 'blogger#post', blog: { id: BLOG_ID }, title, content, labels: labels||[] })
      });
      data = await response.json();
      return res.json(data);
    }

    if (action === 'updatePost') {
      response = await fetch(`${BASE}/blogs/${BLOG_ID}/posts/${postId}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ title, ...(content && { content }) })
      });
      data = await response.json();
      return res.json(data);
    }

    if (action === 'deletePost') {
      response = await fetch(`${BASE}/blogs/${BLOG_ID}/posts/${postId}`, { 
        method: 'DELETE', headers 
      });
      if (response.status === 204) return res.json({ success: true });
      data = await response.json();
      return res.json(data);
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}