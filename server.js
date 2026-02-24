const express = require('express');
const app = express();
let users = []; 
let links = []; 

app.use(express.json());
app.use(express.static('.')); 

// 1. API Đăng ký (Lưu user/pass)
app.post('/api/register', (req, res) => {
    const { user, pass } = req.body;
    if (users.find(u => u.user === user)) return res.json({ s: false, m: "Tên này có người dùng rồi!" });
    users.push({ user, pass });
    res.json({ s: true });
});

// 2. API Đăng link (PHẢI kiểm tra tài khoản)
app.post('/api/add-link', (req, res) => {
    const { title, url, user, pass } = req.body;
    // Tìm trong danh sách xem có ai khớp cả user và pass không
    const isMember = users.find(u => u.user === user && u.pass === pass);
    
    if (!isMember) {
        return res.json({ s: false, m: "Lỗi: Bạn cần tài khoản chính xác để đăng link!" });
    }

    links.push({ title, url, user, date: new Date().toLocaleString() });
    res.json({ s: true });
});

app.get('/api/search', (req, res) => {
    const k = req.query.k ? req.query.k.toLowerCase() : "";
    res.json(links.filter(l => l.title.toLowerCase().includes(k)));
});

app.listen(process.env.PORT || 3000);
