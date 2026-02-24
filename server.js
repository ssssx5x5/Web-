const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

const SUPABASE_URL = 'https://okmbzndituubcsambxrx.supabase.co';
const SUPABASE_KEY = 'sb_secret_mTTn7heVIQ_egTy8AlK11w_QLiUsnTB'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static('.'));

app.post('/api/auth', async (req, res) => {
    const { user, pass } = req.body;
    // Sửa cột 'user' thành 'username'
    const { data: existing } = await supabase.from('profiles').select('*').eq('username', user).single();
    if (existing) {
        if (existing.pass === pass) return res.json({ s: true });
        return res.json({ s: false, m: "Sai mật khẩu!" });
    }
    await supabase.from('profiles').insert([{ username: user, pass }]);
    res.json({ s: true });
});

app.post('/api/add-link', async (req, res) => {
    const { title, url, user, pass } = req.body;
    const { data: userDB } = await supabase.from('profiles').select('*').eq('username', user).eq('pass', pass).single();
    if (!userDB) return res.json({ s: false, m: "Lỗi tài khoản!" });

    await supabase.from('links').insert([{ title, url, username: user }]);
    res.json({ s: true });
});

app.get('/api/search', async (req, res) => {
    const { data } = await supabase.from('links').select('*').order('id', { ascending: false });
    res.json(data || []);
});

app.listen(process.env.PORT || 3000);
