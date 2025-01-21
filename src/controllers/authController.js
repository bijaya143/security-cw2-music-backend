const { fetch, create } = require("../model/user");
const { sign } = require("../service/jwtService");
const { compare, hash } = require("../service/passwordService");
const { sendSMS } = require("../service/smsService");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [user] = await fetch({ email });
    if (!user) {
      throw new Error("User not found.");
    }

    const passwordCompare = await compare(password, user.password);
    if (!passwordCompare) {
      throw new Error("Password does not match");
    }

    const tokenDetails = {
      id: user._id,
      email: user.email,
      userType: user.userType,
    };

    const accessToken = await sign(tokenDetails, false);

    const data = { accessToken };

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(401).json({ success: false, data: error.message });
  }
};
const register = async (req, res, next) => {
  try {
    const hashedPassword = await hash(req.body.password);
    const otp = await generateOtp();
    const user = await create({
      ...req.body,
      password: hashedPassword,
      otp: otp,
    });
    const tokenDetails = {
      id: user._id,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
    };

    // sendSMS(user.phone, `You OTP is ${otp}`)
    //   .then((res) => {})
    //   .catch((error) => {});
    const accessToken = await sign(tokenDetails, false);
    const data = { accessToken };
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, data: error.message });
  }
};

const oauth = async (req, res, next) => {
  const { email } = req.body;
  const [existedUser] = await fetch({ email });
  if (!existedUser) {
    try {
      const hashedPassword = await hash(req.body.password);
      const user = await create({ ...req.body, password: hashedPassword });
      const tokenDetails = {
        id: user._id,
        email: user.email,
        userType: user.userType,
      };
      const accessToken = await sign(tokenDetails, false);
      const data = { accessToken };
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(400).json({ success: false, data: error.message });
    }
  } else {
    const tokenDetails = {
      id: existedUser._id,
      email: existedUser.email,
      userType: existedUser.userType,
    };
    const accessToken = await sign(tokenDetails, false);
    const data = { accessToken };
    return res.json({ success: true, data });
  }
};

const generateOtp = async (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

module.exports = {
  login,
  register,
  oauth,
};
