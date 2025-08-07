import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../../validations/auth.validation';


export const registerUser = async (data: RegisterDto) => {

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }


  const hashedPassword = await hashPassword(data.password);


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


  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });


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


export const loginUser = async (data: LoginDto) => {

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {

    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Authentication failed');
  }


  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) {

    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Authentication failed');
  }


  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });


  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });


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


export const refreshUserToken = async (data: RefreshTokenDto) => {
  try {

    const decoded = verifyRefreshToken(data.refreshToken);


    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: data.refreshToken },
      include: { user: true },
    });


    if (!storedToken || storedToken.expiresAt < new Date()) {

      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('Authentication failed');
    }

    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });
    const newRefreshToken = generateRefreshToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });


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

    throw new Error('Authentication failed');
  }
};


export const logoutUser = async (userId: string) => {

  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};
