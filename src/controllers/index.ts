// Export all controllers as single array to import in App.module.

import { AuthenticationController } from './authentication/authentication.controller';
import { UserController } from './user/user.controller';

export default [UserController, AuthenticationController];
