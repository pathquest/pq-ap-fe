export const processPermissions = (data: any) => {
    const result: any = [];
    const permissionIds = new Set(data.PermissionIds);

    const processNode = (node: any) => {
        if (node.Children && node.Children.length > 0) {
            const childResults = node.Children.map(processNode).filter(Boolean);
            if (childResults.length > 0) {
                return { [node.Key]: childResults };
            }
        } else if (node.IsShowCheckBox && permissionIds.has(node.Id)) {
            return { [node.Key]: node.Value };
        }
        return null;
    }

    data.List.forEach((topLevelNode: any) => {
        const processedNode = processNode(topLevelNode);
        if (processedNode) {
            result.push(processedNode);
        }
    });

    return result;
}

// For Single Module
export const hasViewPermission = (processPermissionsMatrix: any, moduleName: string): boolean => {
    const module = processPermissionsMatrix.find((m: any) => Object.keys(m)[0] === moduleName)
    if (!module) {
        return false
    }
    const permissions = module[moduleName]
    const checkViewPermission = (obj: any): boolean => {
        if (typeof obj === 'object' && obj !== null) {
            if (obj.View === true) return true
            return Object.values(obj).some(value => checkViewPermission(value))
        }
        return false
    }

    return checkViewPermission(permissions)
}

export const hasImportPermission = (processPermissionsMatrix: any, moduleName: string): boolean => {
    const module = processPermissionsMatrix.find((m: any) => Object.keys(m)[0] === moduleName)
    if (!module) {
        return false
    }
    const permissions = module[moduleName]
    const checkImportPermission = (obj: any): boolean => {
        if (typeof obj === 'object' && obj !== null) {
            if (obj.Import === true) return true
            return Object.values(obj).some(value => checkImportPermission(value))
        }
        return false
    }

    return checkImportPermission(permissions)
}

export const hasCreatePermission = (processPermissionsMatrix: any, moduleName: string): boolean => {
    const module = processPermissionsMatrix.find((m: any) => Object.keys(m)[0] === moduleName)
    if (!module) {
        return false
    }
    const permissions = module[moduleName]
    const checkCreatePermission = (obj: any): boolean => {
        if (typeof obj === 'object' && obj !== null) {
            if (obj.Create === true) return true
            return Object.values(obj).some(value => checkCreatePermission(value))
        }
        return false
    }

    return checkCreatePermission(permissions)
}

export const hasEditPermission = (processPermissionsMatrix: any, moduleName: string): boolean => {
    const module = processPermissionsMatrix.find((m: any) => Object.keys(m)[0] === moduleName)
    if (!module) {
        return false
    }
    const permissions = module[moduleName]
    const checkEditPermission = (obj: any): boolean => {
        if (typeof obj === 'object' && obj !== null) {
            if (obj.Edit === true) return true
            return Object.values(obj).some(value => checkEditPermission(value))
        }
        return false
    }

    return checkEditPermission(permissions)
}

export const hasSyncPermission = (processPermissionsMatrix: any, moduleName: string): boolean => {
    const module = processPermissionsMatrix.find((m: any) => Object.keys(m)[0] === moduleName)
    if (!module) {
        return false
    }
    const permissions = module[moduleName]
    const checkSyncPermission = (obj: any): boolean => {
        if (typeof obj === 'object' && obj !== null) {
            if (obj.Sync === true) return true
            return Object.values(obj).some(value => checkSyncPermission(value))
        }
        return false
    }

    return checkSyncPermission(permissions)
}

export const getModulePermissions = (processPermissionsMatrix: any, moduleName: string): { [key: string]: any } | null => {
    const module = processPermissionsMatrix.find((m: any) => Object.keys(m)[0] === moduleName);
    if (!module) {
        return null;
    }

    const permissions = module[moduleName];

    const extractPermissions = (obj: any): { [key: string]: any } => {
        if (Array.isArray(obj)) {
            const result: { [key: string]: any } = {};
            obj.forEach((item, index) => {
                const key = Object.keys(item)[0];
                if (typeof key === 'string') {
                    result[key] = extractPermissions(item[key]);
                } else {
                    Object.assign(result, item);
                }
            });
            return result;
        } else if (typeof obj === 'object' && obj !== null) {
            const result: { [key: string]: any } = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = extractPermissions(value);
            }
            return result;
        } else {
            return obj;
        }
    };

    return extractPermissions(permissions);
};

export const hasSpecificPermission = (
    processPermissionsMatrix: any,
    parentModule: string,
    moduleName: string,
    submoduleName: string,
    permissionName: string
): boolean => {

    // Use the existing getModulePermissions function to get the module permissions
    const modulePermissions = getModulePermissions(processPermissionsMatrix, parentModule);

    if (!modulePermissions) {
        return false; // Return false if the module does not exist
    }

    // Drill down to the submodule and permission
    if (modulePermissions[moduleName]) {
        if (modulePermissions[moduleName][submoduleName]) {
            return modulePermissions[moduleName][submoduleName][permissionName] === true;
        }
        return modulePermissions[moduleName][permissionName] === true;
    }

    return false; // Return false if permission is not found
};

export const getNestedValue = (obj: any, path: string): any => {
    // Split the path string by dots to access nested keys
    const keys = path.split('.');

    // Use reduce to iterate through the keys and access the nested value
    return keys.reduce((acc, key) => {
        if (acc && acc[key] !== undefined) {
            return acc[key];
        }
        return undefined; // Return undefined if key does not exist
    }, obj);
};


// Navbar Permission Check
export const processNavbarPermissions = (settings: any) => {
    const result: any = {};

    const checkPermissions = (items: any[]) => {
        const itemPermissions: { [key: string]: boolean } = {};
        items.forEach(item => {
            const itemName = Object.keys(item)[0];
            itemPermissions[itemName] = Object.values(item[itemName]).some(value => value === true);
        });
        return itemPermissions;
    };

    settings.forEach((section: any) => {
        const sectionKey = Object.keys(section)[0];
        const sectionItems = section[sectionKey];

        result[sectionKey] = checkPermissions(sectionItems);
    });

    return result;
};

export const hasNavbarPermission = (processedPermissions: any, sectionName: string, itemName: string): boolean => {
    return processedPermissions[sectionName] && processedPermissions[sectionName][itemName] === true;
};