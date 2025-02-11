export function getAvatarUrl(userid: string) {
  return getUsersOnServer()[userid]?.avatarUrl || "";
}

export function getDisplayName(userid: string) {
  return getUsersOnServer()[userid]?.displayName || "";
}
