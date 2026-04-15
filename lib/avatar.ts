export const getAvatarUrl = (user?: any) => {
  if (!user) return fallbackAvatar("guest");

  // 1. User uploaded OR Google photo
  if (user.profilePhoto) return user.profilePhoto;

  // 2. Stable DiceBear avatar using seed
  const seed = user.avatarSeed || user._id;

  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
};

const fallbackAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
};
