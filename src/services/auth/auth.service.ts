import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../../validations/auth.validation';

// User registration function
export const registerUser = async (data: RegisterDto) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// User login function
export const loginUser = async (data: LoginDto) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Single session policy: Delete all existing refresh tokens for this user
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Save new refresh token to database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
};

// Refresh token function
export const refreshUserToken = async (data: RefreshTokenDto) => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(data.refreshToken);

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: data.refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }


    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });
    const newRefreshToken = generateRefreshToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });

    // Delete old refresh token and create new one (Token Rotation)
    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { token: data.refreshToken },
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
    ]);

    return {
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
      },
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Logout function - now uses userId from access token
export const logoutUser = async (userId: string) => {
  // Delete all refresh tokens for this user (logout from all devices)
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};
