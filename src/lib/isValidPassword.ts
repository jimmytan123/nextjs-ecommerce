export async function isVaildPassword(
  password: string,
  hasedPassword: string
): Promise<boolean> {
  return (await hashPassword(password)) === hasedPassword;
}

// Taking the plaintext password and passing it through a hashing function.(Encrypt is irreversible)
async function hashPassword(password: string) {
  const arrayBuffer = await crypto.subtle.digest(
    'SHA-512',
    new TextEncoder().encode(password)
  );

  return Buffer.from(arrayBuffer).toString('base64');
}
