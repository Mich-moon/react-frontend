// TokenService provides get, set, remove methods to work with Token and User Data stored on Browser.

// types and interfaces
type RoleEnum = "ROLE_USER" | "ROLE_MODERATOR" | "ROLE_ADMIN"

type IUser = {
    message: string,
    tokenType: "Bearer",
    accessToken: string,
    refreshToken: string,
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    roles : RoleEnum[],
}

class TokenService {

    // setters
    setUser(user: IUser) {
        //console.log(JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
    }

    // getters
    getLocalRefreshToken() {
        const userStr = localStorage.getItem("user");

        if (userStr) {
            const user = JSON.parse(userStr);
            return user.refreshToken;
        }
        return null;
    }

    getLocalAccessToken() {
        const userStr = localStorage.getItem("user");

        if (userStr) {
            const user = JSON.parse(userStr);
            return user.accessToken;
        }
        return null;
    }

    updateLocalAccessToken(token: string) {
        const userStr = localStorage.getItem("user");

        if (userStr) {
            const user = JSON.parse(userStr);
            user.accessToken = token;
            localStorage.setItem("user", JSON.stringify(user));
        }
        return null;
    }

    getUser() {
        const userStr = localStorage.getItem("user");

        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;

    }

    removeUser() {
        localStorage.removeItem("user");
    }

}

export default new TokenService();