const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

// --- THÔNG TIN KẾT NỐI SUPABASE CỦA BẠN ---
const SUPABASE_URL = 'https://okmbzndituubcsambxrx.supabase.co';
const SUPABASE_KEY = 'sb_secret_mTTn7heVIQ_egTy8AlK11w_QLiUsnTB'; 
// ---------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static('.'));

// API Đăng ký & Đăng nhập (Lưu vào bảng profiles)
app.post('/api/auth', async (req, res) => {
    const { user, pass } = req.body;
    const { data: existing } = await supabase.from('profiles').select('*').eq('user', user).single();
    
    if (existing) {
        if (existing.pass === pass) return res.json({ s: true, m: "Đăng nhập thành công" });
        return res.json({ s: false, m: "Sai mật khẩu!" });
    }
    
    const { error } = await supabase.from('profiles').insert([{ user, pass }]);
    if (error) return res.json({ s: false, m: "Lỗi đăng ký" });
    res.json({ s: true, m: "Đăng ký thành công" });
});

// API Đăng link (Lưu vào bảng links)
app.post('/api/add-link', async (req, res) => {
    const { title, url, user, pass } = req.body;
    // Kiểm tra tài khoản trước khi cho đăng link
    const { data: userDB } = await supabase.from('profiles').select('*').eq('user', user).eq('pass', pass).single();
    
    if (!userDB) return res.json({ s: false, m: "Lỗi xác thực tài khoản!" });

    const { error } = await supabase.from('links').insert([{ title, url, user }]);
    if (error) return res.json({ s: false, m: "Lỗi lưu link" });
    res.json({ s: true });
});

// API Lấy danh sách link để hiển thị
app.get('/api/search', async (req, res) => {
    const k = req.query.k || "";
    const { data } = await supabase.from('links')
        .select('*')
        .ilike('title', `%${k}%`)
        .order('id', { ascending: false });
    res.json(data || []);
});

app.listen(process.env.PORT || 3000);
