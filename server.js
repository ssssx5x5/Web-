const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto'); // dùng tạo token ngẫu nhiên

// Dữ liệu lưu trong bộ nhớ (sẽ reset khi Render restart)
let users = [];
let links = [];

app.use(express.json());
app.use(express.static('.')); // phục vụ file index.html

// Hàm tạo token đơn giản
function generateToken() {
    return crypto.randomBytes(16).toString('hex');
}

// 1. Đăng ký tài khoản
app.post('/api/register', (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.json({ success: false, msg: "Thiếu thông tin" });

    // Kiểm tra user đã tồn tại chưa
    if (users.find(u => u.user === user)) {
        return res.json({ success: false, msg: "Tên người dùng đã tồn tại" });
    }

    users.push({ user, pass }); // chưa có token
    res.json({ success: true, msg: "Đăng ký thành công, hãy đăng nhập" });
});

// 2. Đăng nhập
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    const found = users.find(u => u.user === user && u.pass === pass);
    if (!found) {
        return res.json({ success: false, msg: "Sai tên đăng nhập hoặc mật khẩu" });
    }
    // Tạo token nếu chưa có (mỗi lần đăng nhập có thể cấp mới)
    const token = generateToken();
    found.token = token;
    res.json({ success: true, token, user: found.user });
});

// 3. Đăng link mới (yêu cầu token)
app.post('/api/add-link', (req, res) => {
    const { title, url, token } = req.body;

    // Kiểm tra thông tin cơ bản
    if (!title || !url) {
        return res.json({ success: false, msg: "Thiếu tiêu đề hoặc URL" });
    }
    if (title.length > 50) {
        return res.json({ success: false, msg: "Tiêu đề không được vượt quá 50 ký tự" });
    }

    // Xác thực token
    const user = users.find(u => u.token === token);
    if (!user) {
        return res.json({ success: false, msg: "Bạn cần đăng nhập để đăng link" });
    }

    // Kiểm tra trùng URL
    if (links.some(l => l.url.toLowerCase() === url.toLowerCase())) {
        return res.json({ success: false, msg: "URL này đã được đăng, vui lòng không đăng trùng" });
    }

    // Thêm link, kèm tên người đăng
    links.push({
        title,
        url,
        date: new Date().toLocaleString(),
        postedBy: user.user
    });

    res.json({ success: true, msg: "Đăng link thành công" });
});

// 4. Tìm kiếm link (công khai, không cần token)
app.get('/api/search', (req, res) => {
    const keyword = req.query.k ? req.query.k.toLowerCase() : "";
    const filtered = links.filter(l => l.title.toLowerCase().includes(keyword));
    res.json(filtered);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));
