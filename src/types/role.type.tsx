// type for role

export type Role = {

    /** The unique identifier for the role option */
    id: number,

    /** The name of the role option */
    name: "ROLE_USER" | "ROLE_MODERATOR" | "ROLE_ADMIN"
};

export type RoleEnum = "ROLE_USER" | "ROLE_MODERATOR" | "ROLE_ADMIN"; // possible user role values
