const apis = {
    checkUniqueUsernameApi: (username: string) => `/api/check-username-unique?username=${username}`,
    signUpApi: () => '/api/sign-up',
    verifyCodeApi: () => '/api/verify-code',

    getMessagesApi: () => `/api/get-messages`,
    acceptMessageApi: () => `/api/accept-messages`,
    deleteMessageApi: (messageId: string | any) => `/api/delete-messages/${messageId}`,
}

export default apis;
