
const carliError = require('../../CARLI/Error');
const auth = require('../../CARLI/Auth');
const userRepository = require('../../CARLI/Entity/UserRepository');
const userWorkaround = require('../components/user');

function shouldPreserveRole(oldRole, masqueradingRole) {
    return !(oldRole.indexOf("vendor") === 0 || oldRole.indexOf("library") === 0);
}

function updateSelfForMasquerading(masqueradingRole, id) {
    return auth.getSession()
        .then((userCtx) => {
            Logger.log("User Context:");
            Logger.log(userCtx);
            return userCtx.name;
        })
        .then(userRepository.load)
        .catch(() => {
            throw carliError("Failed to load user", 500);
        })
        .then((u) => {
            if (u.roles.indexOf("staff") !== 0)
                throw carliError("Not authorized", 403);
            return u;
        })
        .then((u) => {
            const oldRoles = u.roles;

            u.roles = [];
            oldRoles.forEach((oldRole) => {
                if (shouldPreserveRole(oldRole, masqueradingRole))
                    u.roles.push(oldRole);
            });

            u.roles.push(masqueradingRole);
            u.roles.push(`${masqueradingRole}-${id}`);

            u[masqueradingRole] = id;

            return userWorkaround.update(u);
        })
        .then((username) => {
            return { ok: true, message: `Updated user ${username}` };
        })
        .catch((e) => {
            throw carliError({ error: e, message: "Failed to update user" }, 500);
        });
}

module.exports = {
    updateSelfForMasquerading: updateSelfForMasquerading,
};
