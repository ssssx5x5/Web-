const express = require('express');
const app = express();
const crypto = require('crypto');

let users = [];       // { user, pass, token }
let links = [];

app.use(express.json());
app.use(express.static('.'));   // phục vụ file index.html

// Tạo token ngẫu nhiên
function generateToken() {
    return crypto.randomBytes(16).toString('hex');
}

// ĐĂNG KÝ
app.post('/api/register', (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.json({ success: false, msg: 'Thiếu thông tin' });

    // Kiểm tra tên đã tồn tại chưa
    if (users.find(u => u.user === user)) {
        return res.json({ success: false, msg: 'Tên người dùng đã tồn tại' });
    }

    users.push({ user, pass }); // chưa có token
    res.json({ success: true, msg: 'Đăng ký thành công, hãy đăng nhập' });
});

// ĐĂNG NHẬP
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    const found = users.find(u => u.user === user && u.pass === pass);
    if (!found) {
        return res.json({ success: false, msg: 'Sai tên hoặc mật khẩu' });
    }
    // Tạo mới token mỗi lần đăng nhập
    const token = generateToken();
    found.token = token;
    res.json({ success: true, token, user: found.user });
});

// ĐĂNG LINK (cần token)
app.post('/api/add-link', (req, res) => {
    const { title, url, token } = req.body;
    const user = users.find(u => u.token === token);
    if (!user) {
        return res.json({ success: false, msg: 'Vui lòng đăng nhập lại' });
    }
    if (!title || !url) return res.json({ success: false, msg: 'Thiếu tiêu đề hoặc URL' });
    if (title.length > 50) return res.json({ success: false, msg: 'Tiêu đề quá 50 ký tự' });
    if (links.some(l => l.url.toLowerCase() === url.toLowerCase())) {
        return res.json({ success: false, msg: 'URL đã tồn tại' });
    }
    links.push({ title, url, date: new Date().toLocaleString(), postedBy: user.user });
    res.json({ success: true, msg: 'Đăng link thành công' });
});

// TÌM KIẾM
app.get('/api/search', (req, res) => {
    const keyword = req.query.k?.toLowerCase() || '';
    const filtered = links.filter(l => l.title.toLowerCase().includes(keyword));
    res.json(filtered);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
