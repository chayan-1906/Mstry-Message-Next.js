const routes = {
    homePath: '/',
    dashboardPath: '/dashboard',

    signUpPath: '/sign-up',
    signInPath: '/sign-in',
    verifyPath: (username?: string) => {
        let url = '/verify';
        if (username) {
            url = `${url}/${username}`;
        }
        return url;
    },
}

export default routes;
