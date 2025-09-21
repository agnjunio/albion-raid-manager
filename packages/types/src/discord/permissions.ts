export const PERMISSIONS: {
  [permission: string]: bigint;
} = {
  ADMINISTRATOR: BigInt(1 << 3), // 0x00000008
  MANAGE_GUILD: BigInt(1 << 5), // 0x00000020
  MANAGE_ROLES: BigInt(1 << 28), // 0x10000000
};

export function hasPermissions(permissions: string | bigint = 0n, requiredPermissions: bigint[]): boolean {
  const permissionBits = BigInt(permissions);
  return requiredPermissions.every((perm) => (permissionBits & perm) !== 0n);
}
