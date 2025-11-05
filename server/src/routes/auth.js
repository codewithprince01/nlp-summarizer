router.post('/signup', async (req, res) => {
  try {
    console.log('📩 Signup request body:', req.body);
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log('❌ Validation failed:', parsed.error);
      return res.status(400).json({ message: 'Invalid input' });
    }

    const { name, email, password } = parsed.data;
    console.log('✅ Parsed input:', { name, email });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    console.log('🔐 Password hashed');

    const user = await User.create({ name, email, passwordHash });
    console.log('✅ User created:', user._id);

    const payload = { id: user._id.toString(), email: user.email, name: user.name };
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);
    console.log('🎟️ Tokens generated');

    res.cookie(cookieNames.access, access, cookieOptions);
    res.cookie(cookieNames.refresh, refresh, cookieOptions);
    return res.status(201).json({ user: payload, access, refresh });
  } catch (e) {
    console.error('❌ Signup error:', e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
});
