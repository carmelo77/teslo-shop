import { applyDecorators } from "@nestjs/common";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { RoleProtected } from "./role-protected.decorator";
import { ValidRoles } from "../interfaces/valid-roles.interface";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";

export function Auth(...roles: ValidRoles[]) {
    return applyDecorators(
        RoleProtected( ...roles ),
        UseGuards(AuthGuard(), UserRoleGuard)
    );
}