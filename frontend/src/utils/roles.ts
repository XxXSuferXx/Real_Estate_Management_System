export const ROLES = {
    ADMIN: "admin",
    AGENT: "agent",
    USER: "user"
}

export const PERMISSIONS = {
    VIEW_ADMINPANEL: "view_adminpanel",
    VIEW_DASHBOARD: "view_dashboard",
    EDIT_PROPERTY: "edit_property",
    DELETE_PROPERTY: "delete_property",
    VIEW_HOMEPAGE: "view_homepage"
}

export const ROLES_PERMISSIONS: Record<string, string[]> = {
    [ROLES.ADMIN]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_ADMINPANEL,
        PERMISSIONS.DELETE_PROPERTY,
        PERMISSIONS.EDIT_PROPERTY, 
        PERMISSIONS.VIEW_HOMEPAGE
    ],
    [ROLES.AGENT]: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_HOMEPAGE,
        PERMISSIONS.DELETE_PROPERTY,
        PERMISSIONS.EDIT_PROPERTY
    ],
    [ROLES.USER]: [
        PERMISSIONS.VIEW_HOMEPAGE
    ]
}