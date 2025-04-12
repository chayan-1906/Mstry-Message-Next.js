const apis = {
    checkUniqueUsernameApi: (username: string) => `/api/check-username-unique?username=${username}`,
    signUpApi: () => '/api/sign-up',
}

export default apis;
