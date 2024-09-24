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

export const getModulePermissions = (processPermissionsMatrix: any, moduleName: string): { [key: string]: any } | null => {
    const module = processPermissionsMatrix && processPermissionsMatrix.find((m: any) => Object.keys(m)[0] === moduleName);
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
    const modulePermissions = processPermissionsMatrix && getModulePermissions(processPermissionsMatrix, parentModule);

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