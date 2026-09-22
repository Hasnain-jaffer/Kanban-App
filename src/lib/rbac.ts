export type Role = "SUPER_ADMIN" | "SUB_ADMIN" | "PROJECT_MANAGER" | "MEMBER" | "VIEWER";

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  MEMBER: 1,
  PROJECT_MANAGER: 2,
  SUB_ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}

export function can(
  userRole: Role | undefined,
  action:
    | "create_project"
    | "create_board"
    | "manage_workspace_users"
    | "manage_platform" // super admin only — create sub admins
    | "delete_task"
    | "view_only"
): boolean {
  if (!userRole) return false;

  switch (action) {
    case "manage_platform":
      return userRole === "SUPER_ADMIN";
    case "manage_workspace_users":
      return hasMinRole(userRole, "SUB_ADMIN");
    case "create_project":
      return hasMinRole(userRole, "PROJECT_MANAGER");
    case "create_board":
      return hasMinRole(userRole, "PROJECT_MANAGER");
    case "delete_task":
      return hasMinRole(userRole, "MEMBER");
    case "view_only":
      return true;
    default:
      return false;
  }
}