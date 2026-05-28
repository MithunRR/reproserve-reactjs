import { createSlice } from "@reduxjs/toolkit";
import { toAssetUrl } from "../../../utils/ConfigUrl";

// A JSON column may come back as a real array (POST response — a live
// Sequelize instance) or as a JSON-encoded string (GET response — read back
// from the DB). Coerce either form into an array.
const toArray = (value) => {
    let result = value;
    if (typeof result === 'string') {
        try { result = JSON.parse(result); } catch { result = []; }
    }
    return Array.isArray(result) ? result : [];
};

// Maps a backend open-house record to the shape the UI already speaks.
const normalizeOpenHouse = (record) => {
    if (!record || typeof record !== 'object') return record;

    const photos = toArray(record.photos).map(toAssetUrl);
    const video = record.video ? toAssetUrl(record.video) : null;
    const specs = toArray(record.specs);

    return {
        ...record,
        photos,
        video,
        specs,
        type: record.type || record.propertyType || 'residential',
        fromDate: record.fromDate || record.fromDateAndTime || '',
        toDate: record.toDate || record.toDateAndTime || '',
        createdBy: record.createdBy || record.userId
    };
};

// Resolves any `photos` JSON column to absolute URLs. Used by quotes,
// projects and show-my-property records.
const normalizePhotos = (record) => {
    if (!record || typeof record !== 'object') return record;
    return { ...record, photos: toArray(record.photos).map(toAssetUrl) };
};

// Pulls the list/object payload out of the backend's { success, data } envelope.
const unwrap = (payload) => payload?.data ?? payload;
const unwrapList = (payload) => {
    const list = payload?.data ?? payload ?? [];
    return Array.isArray(list) ? list : [];
};

const initialState = {
    loading: false,
    error: null,
    message: null,
    userCreate: false,
    isLoggedIn: false,
    loginData: {},

    profileLoading: false,
    profileError: null,
    profileData: null,

    updateProfileLoading: false,
    updateProfileError: null,
    updateProfileSuccess: false,

    serviceTypes: [],
    serviceTypesLoading: false,
    serviceTypesError: null,

    openHouses: [],
    openHousesLoading: false,
    openHousesError: null,

    createOpenHouseLoading: false,
    createOpenHouseError: null,
    createOpenHouseSuccess: false,

    updateOpenHouseLoading: false,
    updateOpenHouseError: null,
    updateOpenHouseSuccess: false,

    // ── Quotes ──────────────────────────────────────────────
    quotes: [],
    quotesLoading: false,
    quotesError: null,
    createQuoteLoading: false,
    createQuoteError: null,
    createQuoteSuccess: false,
    quoteResponseLoading: false,
    quoteResponseError: null,
    quoteResponseSuccess: false,

    // Incoming requests directed at a provider/realtor (/quotes?providerId=).
    incomingQuotes: [],
    incomingQuotesLoading: false,
    incomingQuotesError: null,

    // A single quote/meeting request loaded for the details modal.
    quoteDetail: null,
    quoteDetailLoading: false,
    quoteDetailError: null,

    // Quote lifecycle updates (status, completion handshake) + provider bids.
    updateQuoteLoading: false,
    updateQuoteError: null,
    updateQuoteSuccess: false,
    updateQuoteResponseLoading: false,
    updateQuoteResponseError: null,
    updateQuoteResponseSuccess: false,

    // ── Messages ────────────────────────────────────────────
    conversations: [],
    conversationsLoading: false,
    messages: [],
    messagesLoading: false,
    messagesError: null,
    sendMessageLoading: false,
    sendMessageError: null,
    sendMessageSuccess: false,

    // ── Projects ────────────────────────────────────────────
    projects: [],
    projectsLoading: false,
    projectsError: null,
    createProjectLoading: false,
    createProjectError: null,
    createProjectSuccess: false,
    updateProjectLoading: false,
    updateProjectError: null,
    updateProjectSuccess: false,

    // ── Providers / Realtors listing ────────────────────────
    providers: [],
    providersLoading: false,
    providersError: null,
    providerDetail: null,
    providerDetailLoading: false,
    providerDetailError: null,

    // ── Reviews ─────────────────────────────────────────────
    reviews: [],
    reviewsLoading: false,
    reviewsError: null,
    reviewsAverage: 0,
    createReviewLoading: false,
    createReviewError: null,
    createReviewSuccess: false,

    // ── Favorites ───────────────────────────────────────────
    favorites: [],
    favoritesLoading: false,
    favoritesError: null,
    favoriteActionLoading: false,
    favoriteActionError: null,

    // ── Show My Property ────────────────────────────────────
    showRequests: [],
    showRequestsLoading: false,
    showRequestsError: null,
    createShowRequestLoading: false,
    createShowRequestError: null,
    createShowRequestSuccess: false,
    claimShowRequestLoading: false,
    claimShowRequestError: null,
    claimShowRequestSuccess: false,
    completeShowRequestLoading: false,
    completeShowRequestError: null,
    completeShowRequestSuccess: false,

    // ── Notifications ───────────────────────────────────────
    notifications: [],
    notificationsLoading: false,
    notificationsError: null,
    unreadCount: 0,

    // ── Open House attendance ───────────────────────────────
    attendances: [],
    createAttendanceLoading: false,
    createAttendanceError: null,
    createAttendanceSuccess: false,

    // ── Admin dashboard ────────────────────────────────────
    adminStats: null,
    adminStatsLoading: false,
    adminStatsError: null,

    // Provider/realtor accounts awaiting admin approval.
    pendingProviders: [],
    pendingRealtors: [],
    pendingApprovalsLoading: false,
    pendingApprovalsError: null,
    setApprovalLoadingId: null,
    setApprovalError: null,

    // ── Contact form ───────────────────────────────────────
    submitContactLoading: false,
    submitContactSuccess: false,
    submitContactError: null,
    contactMessages: [],
    contactMessagesLoading: false,
    contactMessagesError: null,

    // ── Email verification link ─────────────────────────────
    requiresEmailVerification: false,
    pendingVerificationEmail: null,
    verifyEmailLoading: false,
    verifyEmailError: null,
    verifyEmailSuccess: false,
    verifyEmailExpired: false,
    resendVerificationLoading: false,
    resendVerificationError: null,
    resendVerificationSuccess: false,

    // ── Forgot / Change password ────────────────────────────
    forgotPasswordLoading: false,
    forgotPasswordError: null,
    forgotPasswordSuccess: false,
    forgotPasswordMessage: null,
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false
};

const authSlice = createSlice({
    name: 'authentication',
    initialState,

    reducers: {
        signupStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        signupSuccess: (state, action) => {
            state.loading = false;
            state.userCreate = true;
            state.message = action.payload?.message;
            state.loginData = action.payload;
            // With email-link verification the signup response has NO accessToken;
            // we only mark the user logged in if a token was returned (e.g. a
            // future direct-signup path).
            const tok = action.payload?.data?.accessToken || action.payload?.accessToken;
            state.isLoggedIn = !!tok;
            state.requiresEmailVerification = !!action.payload?.requiresEmailVerification;
            state.pendingVerificationEmail = action.payload?.data?.email
                || action.payload?.email
                || state.pendingVerificationEmail
                || null;
        },
        signupFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.userCreate = false;
        },

        resetSignupFlag: (state) => {
            state.userCreate = false;
            state.requiresEmailVerification = false;
            state.pendingVerificationEmail = null;
        },

        // ── Email verification link ────────────────────────────
        verifyEmailStart: (state) => {
            state.verifyEmailLoading = true;
            state.verifyEmailError = null;
            state.verifyEmailSuccess = false;
            state.verifyEmailExpired = false;
        },
        verifyEmailSuccess: (state, action) => {
            state.verifyEmailLoading = false;
            state.verifyEmailSuccess = true;
            state.isLoggedIn = true;
            state.loginData = action.payload;
            state.message = action.payload?.message;
        },
        verifyEmailFailed: (state, action) => {
            state.verifyEmailLoading = false;
            state.verifyEmailError = action.payload?.message || action.payload;
            state.verifyEmailExpired = !!action.payload?.expired;
            state.pendingVerificationEmail = action.payload?.email || state.pendingVerificationEmail;
        },
        resetVerifyEmailFlag: (state) => {
            state.verifyEmailSuccess = false;
            state.verifyEmailError = null;
            state.verifyEmailExpired = false;
        },

        resendVerificationStart: (state) => {
            state.resendVerificationLoading = true;
            state.resendVerificationError = null;
            state.resendVerificationSuccess = false;
        },
        resendVerificationSuccess: (state, action) => {
            state.resendVerificationLoading = false;
            state.resendVerificationSuccess = true;
            state.message = action.payload?.message;
        },
        resendVerificationFailed: (state, action) => {
            state.resendVerificationLoading = false;
            state.resendVerificationError = action.payload;
            state.resendVerificationSuccess = false;
        },
        resetResendVerificationFlag: (state) => {
            state.resendVerificationSuccess = false;
            state.resendVerificationError = null;
        },

        // ── Admin dashboard ────────────────────────────────
        fetchAdminStatsStart: (state) => {
            state.adminStatsLoading = true;
            state.adminStatsError = null;
        },
        fetchAdminStatsSuccess: (state, action) => {
            state.adminStatsLoading = false;
            state.adminStats = action.payload?.data || action.payload;
        },
        fetchAdminStatsFailed: (state, action) => {
            state.adminStatsLoading = false;
            state.adminStatsError = action.payload;
        },

        // Pending provider/realtor approvals.
        fetchPendingApprovalsStart: (state) => {
            state.pendingApprovalsLoading = true;
            state.pendingApprovalsError = null;
        },
        fetchPendingApprovalsSuccess: (state, action) => {
            state.pendingApprovalsLoading = false;
            const data = action.payload?.data || action.payload || {};
            state.pendingProviders = Array.isArray(data.serviceProviders) ? data.serviceProviders : [];
            state.pendingRealtors  = Array.isArray(data.realtors) ? data.realtors : [];
        },
        fetchPendingApprovalsFailed: (state, action) => {
            state.pendingApprovalsLoading = false;
            state.pendingApprovalsError = action.payload;
        },

        setApprovalStart: (state, action) => {
            state.setApprovalLoadingId = action.payload?.id ?? null;
            state.setApprovalError = null;
        },
        setApprovalSuccess: (state, action) => {
            state.setApprovalLoadingId = null;
            const updated = action.payload?.data || action.payload;
            if (updated?.id) {
                state.pendingProviders = state.pendingProviders.filter((u) => u.id !== updated.id);
                state.pendingRealtors  = state.pendingRealtors.filter((u) => u.id !== updated.id);
            }
        },
        setApprovalFailed: (state, action) => {
            state.setApprovalLoadingId = null;
            state.setApprovalError = action.payload;
        },

        // ── Contact form ───────────────────────────────────
        submitContactStart: (state) => {
            state.submitContactLoading = true;
            state.submitContactError = null;
            state.submitContactSuccess = false;
        },
        submitContactSuccess: (state) => {
            state.submitContactLoading = false;
            state.submitContactSuccess = true;
        },
        submitContactFailed: (state, action) => {
            state.submitContactLoading = false;
            state.submitContactError = action.payload;
            state.submitContactSuccess = false;
        },
        resetSubmitContactFlag: (state) => {
            state.submitContactSuccess = false;
            state.submitContactError = null;
        },

        // Admin-only: list / mark-read / delete contact messages.
        fetchContactMessagesStart: (state) => {
            state.contactMessagesLoading = true;
            state.contactMessagesError = null;
        },
        fetchContactMessagesSuccess: (state, action) => {
            state.contactMessagesLoading = false;
            state.contactMessages = action.payload?.data || action.payload || [];
        },
        fetchContactMessagesFailed: (state, action) => {
            state.contactMessagesLoading = false;
            state.contactMessagesError = action.payload;
        },
        updateContactStatusStart: () => {},
        updateContactStatusSuccess: (state, action) => {
            const updated = action.payload?.data || action.payload;
            if (updated?.id) {
                state.contactMessages = state.contactMessages.map((m) =>
                    m.id === updated.id ? updated : m
                );
            }
        },
        updateContactStatusFailed: () => {},
        deleteContactMessageStart: () => {},
        deleteContactMessageSuccess: (state, action) => {
            const id = action.payload?.id;
            if (id) {
                state.contactMessages = state.contactMessages.filter((m) => m.id !== id);
            }
        },
        deleteContactMessageFailed: () => {},

        loginStart: (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
            state.isLoggedIn = false;
            state.loginData = {};
            state.profileData = null;
            state.profileError = null;
            state.updateProfileSuccess = false;
            state.updateProfileError = null;
        },

        logout: () => initialState,

        loginSuccess: (state, action) => {
            state.loading = false;
            state.isLoggedIn = true;
            state.message = action.payload.message;
            state.loginData = action.payload;
        },

        loginFailed: (state, action) => {
            state.loading = false;
            state.isLoggedIn = false;
            state.error = action.payload;
        },

        fetchProfileStart: (state) => {
            state.profileLoading = true;
            state.profileError = null;
        },

        fetchProfileSuccess: (state, action) => {
            state.profileLoading = false;
            state.profileData = action.payload?.data || action.payload;
        },

        fetchProfileFailed: (state, action) => {
            state.profileLoading = false;
            state.profileError = action.payload;
        },

        updateProfileStart: (state) => {
            state.updateProfileLoading = true;
            state.updateProfileError = null;
            state.updateProfileSuccess = false;
        },

        updateProfileSuccess: (state, action) => {
            state.updateProfileLoading = false;
            state.updateProfileSuccess = true;
            state.profileData = action.payload?.data || action.payload;
            state.message = action.payload?.message;
        },

        updateProfileFailed: (state, action) => {
            state.updateProfileLoading = false;
            state.updateProfileError = action.payload;
            state.updateProfileSuccess = false;
        },

        resetUpdateProfileFlag: (state) => {
            state.updateProfileSuccess = false;
            state.updateProfileError = null;
        },

        fetchServiceTypesStart: (state) => {
            state.serviceTypesLoading = true;
        },

        fetchServiceTypesSuccess: (state, action) => {
            state.serviceTypesLoading = false;
            state.serviceTypes = action.payload?.data || action.payload || [];
        },

        fetchServiceTypesFailed: (state, action) => {
            state.serviceTypesLoading = false;
            state.serviceTypesError = action.payload;
        },

        fetchOpenHousesStart: (state) => {
            state.openHousesLoading = true;
            state.openHousesError = null;
        },
        fetchOpenHousesSuccess: (state, action) => {
            state.openHousesLoading = false;
            const list = action.payload?.data || action.payload || [];
            state.openHouses = Array.isArray(list) ? list.map(normalizeOpenHouse) : [];
        },
        fetchOpenHousesFailed: (state, action) => {
            state.openHousesLoading = false;
            state.openHousesError = action.payload;
        },

        createOpenHouseStart: (state) => {
            state.createOpenHouseLoading = true;
            state.createOpenHouseError = null;
            state.createOpenHouseSuccess = false;
        },
        createOpenHouseSuccess: (state, action) => {
            state.createOpenHouseLoading = false;
            state.createOpenHouseSuccess = true;
            const item = action.payload?.data || action.payload;
            if (item && typeof item === 'object') {
                state.openHouses = [normalizeOpenHouse(item), ...state.openHouses];
            }
        },
        createOpenHouseFailed: (state, action) => {
            state.createOpenHouseLoading = false;
            state.createOpenHouseError = action.payload;
            state.createOpenHouseSuccess = false;
        },
        resetCreateOpenHouseFlag: (state) => {
            state.createOpenHouseSuccess = false;
            state.createOpenHouseError = null;
        },

        updateOpenHouseStart: (state) => {
            state.updateOpenHouseLoading = true;
            state.updateOpenHouseError = null;
            state.updateOpenHouseSuccess = false;
        },
        updateOpenHouseSuccess: (state, action) => {
            state.updateOpenHouseLoading = false;
            state.updateOpenHouseSuccess = true;
            const item = action.payload?.data || action.payload;
            if (item && typeof item === 'object') {
                const normalized = normalizeOpenHouse(item);
                state.openHouses = state.openHouses.map((h) =>
                    h.id === normalized.id ? normalized : h
                );
            }
        },
        updateOpenHouseFailed: (state, action) => {
            state.updateOpenHouseLoading = false;
            state.updateOpenHouseError = action.payload;
            state.updateOpenHouseSuccess = false;
        },
        resetUpdateOpenHouseFlag: (state) => {
            state.updateOpenHouseSuccess = false;
            state.updateOpenHouseError = null;
        },

        // ── Quotes ──────────────────────────────────────────
        fetchQuotesStart: (state) => {
            state.quotesLoading = true;
            state.quotesError = null;
        },
        fetchQuotesSuccess: (state, action) => {
            state.quotesLoading = false;
            state.quotes = unwrapList(action.payload).map(normalizePhotos);
        },
        fetchQuotesFailed: (state, action) => {
            state.quotesLoading = false;
            state.quotesError = action.payload;
        },
        createQuoteStart: (state) => {
            state.createQuoteLoading = true;
            state.createQuoteError = null;
            state.createQuoteSuccess = false;
        },
        createQuoteSuccess: (state, action) => {
            state.createQuoteLoading = false;
            state.createQuoteSuccess = true;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object') {
                state.quotes = [normalizePhotos(item), ...state.quotes];
            }
        },
        createQuoteFailed: (state, action) => {
            state.createQuoteLoading = false;
            state.createQuoteError = action.payload;
            state.createQuoteSuccess = false;
        },
        resetCreateQuoteFlag: (state) => {
            state.createQuoteSuccess = false;
            state.createQuoteError = null;
        },
        updateQuoteStart: (state) => {
            state.updateQuoteLoading = true;
            state.updateQuoteError = null;
            state.updateQuoteSuccess = false;
        },
        updateQuoteSuccess: (state) => {
            state.updateQuoteLoading = false;
            state.updateQuoteSuccess = true;
        },
        updateQuoteFailed: (state, action) => {
            state.updateQuoteLoading = false;
            state.updateQuoteError = action.payload;
        },
        resetUpdateQuoteFlag: (state) => {
            state.updateQuoteSuccess = false;
            state.updateQuoteError = null;
        },
        updateQuoteResponseStart: (state) => {
            state.updateQuoteResponseLoading = true;
            state.updateQuoteResponseError = null;
            state.updateQuoteResponseSuccess = false;
        },
        updateQuoteResponseSuccess: (state) => {
            state.updateQuoteResponseLoading = false;
            state.updateQuoteResponseSuccess = true;
        },
        updateQuoteResponseFailed: (state, action) => {
            state.updateQuoteResponseLoading = false;
            state.updateQuoteResponseError = action.payload;
        },
        resetUpdateQuoteResponseFlag: (state) => {
            state.updateQuoteResponseSuccess = false;
            state.updateQuoteResponseError = null;
        },
        addQuoteResponseStart: (state) => {
            state.quoteResponseLoading = true;
            state.quoteResponseError = null;
            state.quoteResponseSuccess = false;
        },
        addQuoteResponseSuccess: (state) => {
            state.quoteResponseLoading = false;
            state.quoteResponseSuccess = true;
        },
        addQuoteResponseFailed: (state, action) => {
            state.quoteResponseLoading = false;
            state.quoteResponseError = action.payload;
            state.quoteResponseSuccess = false;
        },
        resetQuoteResponseFlag: (state) => {
            state.quoteResponseSuccess = false;
            state.quoteResponseError = null;
        },
        fetchIncomingQuotesStart: (state) => {
            state.incomingQuotesLoading = true;
            state.incomingQuotesError = null;
        },
        fetchIncomingQuotesSuccess: (state, action) => {
            state.incomingQuotesLoading = false;
            state.incomingQuotes = unwrapList(action.payload).map(normalizePhotos);
        },
        fetchIncomingQuotesFailed: (state, action) => {
            state.incomingQuotesLoading = false;
            state.incomingQuotesError = action.payload;
        },
        fetchQuoteDetailStart: (state) => {
            state.quoteDetailLoading = true;
            state.quoteDetailError = null;
            state.quoteDetail = null;
        },
        fetchQuoteDetailSuccess: (state, action) => {
            state.quoteDetailLoading = false;
            const item = unwrap(action.payload);
            state.quoteDetail = (item && typeof item === 'object') ? normalizePhotos(item) : item;
        },
        fetchQuoteDetailFailed: (state, action) => {
            state.quoteDetailLoading = false;
            state.quoteDetailError = action.payload;
        },

        // ── Messages ────────────────────────────────────────
        fetchConversationsStart: (state) => {
            state.conversationsLoading = true;
        },
        fetchConversationsSuccess: (state, action) => {
            state.conversationsLoading = false;
            state.conversations = unwrapList(action.payload);
        },
        fetchConversationsFailed: (state) => {
            state.conversationsLoading = false;
        },
        fetchMessagesStart: (state) => {
            state.messagesLoading = true;
            state.messagesError = null;
        },
        fetchMessagesSuccess: (state, action) => {
            state.messagesLoading = false;
            state.messages = unwrapList(action.payload);
        },
        fetchMessagesFailed: (state, action) => {
            state.messagesLoading = false;
            state.messagesError = action.payload;
        },
        sendMessageStart: (state) => {
            state.sendMessageLoading = true;
            state.sendMessageError = null;
            state.sendMessageSuccess = false;
        },
        sendMessageSuccess: (state, action) => {
            state.sendMessageLoading = false;
            state.sendMessageSuccess = true;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object') {
                state.messages = [...state.messages, item];
            }
        },
        sendMessageFailed: (state, action) => {
            state.sendMessageLoading = false;
            state.sendMessageError = action.payload;
            state.sendMessageSuccess = false;
        },
        resetSendMessageFlag: (state) => {
            state.sendMessageSuccess = false;
            state.sendMessageError = null;
        },

        // ── Projects ────────────────────────────────────────
        fetchProjectsStart: (state) => {
            state.projectsLoading = true;
            state.projectsError = null;
        },
        fetchProjectsSuccess: (state, action) => {
            state.projectsLoading = false;
            state.projects = unwrapList(action.payload).map(normalizePhotos);
        },
        fetchProjectsFailed: (state, action) => {
            state.projectsLoading = false;
            state.projectsError = action.payload;
        },
        createProjectStart: (state) => {
            state.createProjectLoading = true;
            state.createProjectError = null;
            state.createProjectSuccess = false;
        },
        createProjectSuccess: (state, action) => {
            state.createProjectLoading = false;
            state.createProjectSuccess = true;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object') {
                state.projects = [normalizePhotos(item), ...state.projects];
            }
        },
        createProjectFailed: (state, action) => {
            state.createProjectLoading = false;
            state.createProjectError = action.payload;
            state.createProjectSuccess = false;
        },
        resetCreateProjectFlag: (state) => {
            state.createProjectSuccess = false;
            state.createProjectError = null;
        },
        updateProjectStart: (state) => {
            state.updateProjectLoading = true;
            state.updateProjectError = null;
            state.updateProjectSuccess = false;
        },
        updateProjectSuccess: (state, action) => {
            state.updateProjectLoading = false;
            state.updateProjectSuccess = true;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object') {
                const normalized = normalizePhotos(item);
                state.projects = state.projects.map((p) =>
                    p.id === normalized.id ? normalized : p
                );
            }
        },
        updateProjectFailed: (state, action) => {
            state.updateProjectLoading = false;
            state.updateProjectError = action.payload;
            state.updateProjectSuccess = false;
        },
        resetUpdateProjectFlag: (state) => {
            state.updateProjectSuccess = false;
            state.updateProjectError = null;
        },

        // ── Providers / Realtors listing ────────────────────
        fetchProvidersStart: (state) => {
            state.providersLoading = true;
            state.providersError = null;
        },
        fetchProvidersSuccess: (state, action) => {
            state.providersLoading = false;
            state.providers = unwrapList(action.payload);
        },
        fetchProvidersFailed: (state, action) => {
            state.providersLoading = false;
            state.providersError = action.payload;
        },
        fetchProviderDetailStart: (state) => {
            state.providerDetailLoading = true;
            state.providerDetailError = null;
            state.providerDetail = null;
        },
        fetchProviderDetailSuccess: (state, action) => {
            state.providerDetailLoading = false;
            state.providerDetail = unwrap(action.payload);
        },
        fetchProviderDetailFailed: (state, action) => {
            state.providerDetailLoading = false;
            state.providerDetailError = action.payload;
        },

        // ── Reviews ─────────────────────────────────────────
        fetchReviewsStart: (state) => {
            state.reviewsLoading = true;
            state.reviewsError = null;
        },
        fetchReviewsSuccess: (state, action) => {
            state.reviewsLoading = false;
            state.reviews = unwrapList(action.payload);
            state.reviewsAverage = action.payload?.averageRating || 0;
        },
        fetchReviewsFailed: (state, action) => {
            state.reviewsLoading = false;
            state.reviewsError = action.payload;
        },
        createReviewStart: (state) => {
            state.createReviewLoading = true;
            state.createReviewError = null;
            state.createReviewSuccess = false;
        },
        createReviewSuccess: (state) => {
            state.createReviewLoading = false;
            state.createReviewSuccess = true;
        },
        createReviewFailed: (state, action) => {
            state.createReviewLoading = false;
            state.createReviewError = action.payload;
            state.createReviewSuccess = false;
        },
        resetCreateReviewFlag: (state) => {
            state.createReviewSuccess = false;
            state.createReviewError = null;
        },

        // ── Favorites ───────────────────────────────────────
        fetchFavoritesStart: (state) => {
            state.favoritesLoading = true;
            state.favoritesError = null;
        },
        fetchFavoritesSuccess: (state, action) => {
            state.favoritesLoading = false;
            state.favorites = unwrapList(action.payload);
        },
        fetchFavoritesFailed: (state, action) => {
            state.favoritesLoading = false;
            state.favoritesError = action.payload;
        },
        addFavoriteStart: (state) => {
            state.favoriteActionLoading = true;
            state.favoriteActionError = null;
        },
        addFavoriteSuccess: (state, action) => {
            state.favoriteActionLoading = false;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object' && !state.favorites.some((f) => f.id === item.id)) {
                state.favorites = [item, ...state.favorites];
            }
        },
        addFavoriteFailed: (state, action) => {
            state.favoriteActionLoading = false;
            state.favoriteActionError = action.payload;
        },
        removeFavoriteStart: (state) => {
            state.favoriteActionLoading = true;
            state.favoriteActionError = null;
        },
        removeFavoriteSuccess: (state, action) => {
            state.favoriteActionLoading = false;
            const removedId = action.payload;
            state.favorites = state.favorites.filter(
                (f) => f.id !== removedId && f.providerId !== removedId
            );
        },
        removeFavoriteFailed: (state, action) => {
            state.favoriteActionLoading = false;
            state.favoriteActionError = action.payload;
        },

        // ── Show My Property ────────────────────────────────
        fetchShowRequestsStart: (state) => {
            state.showRequestsLoading = true;
            state.showRequestsError = null;
        },
        fetchShowRequestsSuccess: (state, action) => {
            state.showRequestsLoading = false;
            state.showRequests = unwrapList(action.payload).map(normalizePhotos);
        },
        fetchShowRequestsFailed: (state, action) => {
            state.showRequestsLoading = false;
            state.showRequestsError = action.payload;
        },
        createShowRequestStart: (state) => {
            state.createShowRequestLoading = true;
            state.createShowRequestError = null;
            state.createShowRequestSuccess = false;
        },
        createShowRequestSuccess: (state, action) => {
            state.createShowRequestLoading = false;
            state.createShowRequestSuccess = true;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object') {
                state.showRequests = [normalizePhotos(item), ...state.showRequests];
            }
        },
        createShowRequestFailed: (state, action) => {
            state.createShowRequestLoading = false;
            state.createShowRequestError = action.payload;
            state.createShowRequestSuccess = false;
        },
        resetCreateShowRequestFlag: (state) => {
            state.createShowRequestSuccess = false;
            state.createShowRequestError = null;
        },

        // Claim a pending listing (realtor action).
        claimShowRequestStart: (state) => {
            state.claimShowRequestLoading = true;
            state.claimShowRequestError = null;
            state.claimShowRequestSuccess = false;
        },
        claimShowRequestSuccess: (state, action) => {
            state.claimShowRequestLoading = false;
            state.claimShowRequestSuccess = true;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object') {
                state.showRequests = state.showRequests.map((r) =>
                    r.id === item.id ? normalizePhotos(item) : r
                );
            }
        },
        claimShowRequestFailed: (state, action) => {
            state.claimShowRequestLoading = false;
            state.claimShowRequestError = action.payload;
            state.claimShowRequestSuccess = false;
        },
        resetClaimShowRequestFlag: (state) => {
            state.claimShowRequestSuccess = false;
            state.claimShowRequestError = null;
        },

        // Mark an assigned showing complete (realtor action).
        completeShowRequestStart: (state) => {
            state.completeShowRequestLoading = true;
            state.completeShowRequestError = null;
            state.completeShowRequestSuccess = false;
        },
        completeShowRequestSuccess: (state, action) => {
            state.completeShowRequestLoading = false;
            state.completeShowRequestSuccess = true;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object') {
                state.showRequests = state.showRequests.map((r) =>
                    r.id === item.id ? normalizePhotos(item) : r
                );
            }
        },
        completeShowRequestFailed: (state, action) => {
            state.completeShowRequestLoading = false;
            state.completeShowRequestError = action.payload;
            state.completeShowRequestSuccess = false;
        },
        resetCompleteShowRequestFlag: (state) => {
            state.completeShowRequestSuccess = false;
            state.completeShowRequestError = null;
        },

        // ── Notifications ───────────────────────────────────
        fetchNotificationsStart: (state) => {
            state.notificationsLoading = true;
            state.notificationsError = null;
        },
        fetchNotificationsSuccess: (state, action) => {
            state.notificationsLoading = false;
            state.notifications = unwrapList(action.payload);
            state.unreadCount = action.payload?.unreadCount ?? 0;
        },
        fetchNotificationsFailed: (state, action) => {
            state.notificationsLoading = false;
            state.notificationsError = action.payload;
        },
        markNotificationReadStart: () => {},
        markNotificationReadSuccess: (state, action) => {
            const id = action.payload;
            state.notifications = state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            );
            state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
        },
        markNotificationReadFailed: () => {},
        markAllNotificationsReadStart: () => {},
        markAllNotificationsReadSuccess: (state) => {
            state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
            state.unreadCount = 0;
        },
        markAllNotificationsReadFailed: () => {},
        deleteNotificationStart: () => {},
        deleteNotificationSuccess: (state, action) => {
            const id = action.payload;
            state.notifications = state.notifications.filter((n) => n.id !== id);
            state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
        },
        deleteNotificationFailed: () => {},

        // ── Open House attendance ───────────────────────────
        createAttendanceStart: (state) => {
            state.createAttendanceLoading = true;
            state.createAttendanceError = null;
            state.createAttendanceSuccess = false;
        },
        createAttendanceSuccess: (state, action) => {
            state.createAttendanceLoading = false;
            state.createAttendanceSuccess = true;
            const item = unwrap(action.payload);
            if (item && typeof item === 'object') {
                state.attendances = [item, ...state.attendances];
            }
        },
        createAttendanceFailed: (state, action) => {
            state.createAttendanceLoading = false;
            state.createAttendanceError = action.payload;
            state.createAttendanceSuccess = false;
        },
        resetCreateAttendanceFlag: (state) => {
            state.createAttendanceSuccess = false;
            state.createAttendanceError = null;
        },

        // ── Forgot / Change password ────────────────────────
        forgotPasswordStart: (state) => {
            state.forgotPasswordLoading = true;
            state.forgotPasswordError = null;
            state.forgotPasswordSuccess = false;
            state.forgotPasswordMessage = null;
        },
        forgotPasswordSuccess: (state, action) => {
            state.forgotPasswordLoading = false;
            state.forgotPasswordSuccess = true;
            state.forgotPasswordMessage = action.payload?.message || 'A temporary password has been sent.';
        },
        forgotPasswordFailed: (state, action) => {
            state.forgotPasswordLoading = false;
            state.forgotPasswordError = action.payload;
            state.forgotPasswordSuccess = false;
        },
        resetForgotPasswordFlag: (state) => {
            state.forgotPasswordSuccess = false;
            state.forgotPasswordError = null;
            state.forgotPasswordMessage = null;
        },
        changePasswordStart: (state) => {
            state.changePasswordLoading = true;
            state.changePasswordError = null;
            state.changePasswordSuccess = false;
        },
        changePasswordSuccess: (state) => {
            state.changePasswordLoading = false;
            state.changePasswordSuccess = true;
        },
        changePasswordFailed: (state, action) => {
            state.changePasswordLoading = false;
            state.changePasswordError = action.payload;
            state.changePasswordSuccess = false;
        },
        resetChangePasswordFlag: (state) => {
            state.changePasswordSuccess = false;
            state.changePasswordError = null;
        }
    }
});


export const {
    signupStart, signupSuccess, signupFailed, resetSignupFlag,
    verifyEmailStart, verifyEmailSuccess, verifyEmailFailed, resetVerifyEmailFlag,
    resendVerificationStart, resendVerificationSuccess, resendVerificationFailed, resetResendVerificationFlag,
    fetchAdminStatsStart, fetchAdminStatsSuccess, fetchAdminStatsFailed,
    fetchPendingApprovalsStart, fetchPendingApprovalsSuccess, fetchPendingApprovalsFailed,
    setApprovalStart, setApprovalSuccess, setApprovalFailed,
    submitContactStart, submitContactSuccess, submitContactFailed, resetSubmitContactFlag,
    fetchContactMessagesStart, fetchContactMessagesSuccess, fetchContactMessagesFailed,
    updateContactStatusStart, updateContactStatusSuccess, updateContactStatusFailed,
    deleteContactMessageStart, deleteContactMessageSuccess, deleteContactMessageFailed,
    loginStart, loginSuccess, loginFailed,
    logout,
    fetchProfileStart, fetchProfileSuccess, fetchProfileFailed,
    updateProfileStart, updateProfileSuccess, updateProfileFailed,
    resetUpdateProfileFlag,
    fetchServiceTypesStart, fetchServiceTypesSuccess, fetchServiceTypesFailed,
    fetchOpenHousesStart, fetchOpenHousesSuccess, fetchOpenHousesFailed,
    createOpenHouseStart, createOpenHouseSuccess, createOpenHouseFailed, resetCreateOpenHouseFlag,
    updateOpenHouseStart, updateOpenHouseSuccess, updateOpenHouseFailed, resetUpdateOpenHouseFlag,

    fetchQuotesStart, fetchQuotesSuccess, fetchQuotesFailed,
    fetchIncomingQuotesStart, fetchIncomingQuotesSuccess, fetchIncomingQuotesFailed,
    fetchQuoteDetailStart, fetchQuoteDetailSuccess, fetchQuoteDetailFailed,
    createQuoteStart, createQuoteSuccess, createQuoteFailed, resetCreateQuoteFlag,
    updateQuoteStart, updateQuoteSuccess, updateQuoteFailed, resetUpdateQuoteFlag,
    updateQuoteResponseStart, updateQuoteResponseSuccess, updateQuoteResponseFailed, resetUpdateQuoteResponseFlag,
    addQuoteResponseStart, addQuoteResponseSuccess, addQuoteResponseFailed, resetQuoteResponseFlag,

    fetchConversationsStart, fetchConversationsSuccess, fetchConversationsFailed,
    fetchMessagesStart, fetchMessagesSuccess, fetchMessagesFailed,
    sendMessageStart, sendMessageSuccess, sendMessageFailed, resetSendMessageFlag,

    fetchProjectsStart, fetchProjectsSuccess, fetchProjectsFailed,
    createProjectStart, createProjectSuccess, createProjectFailed, resetCreateProjectFlag,
    updateProjectStart, updateProjectSuccess, updateProjectFailed, resetUpdateProjectFlag,

    fetchProvidersStart, fetchProvidersSuccess, fetchProvidersFailed,
    fetchProviderDetailStart, fetchProviderDetailSuccess, fetchProviderDetailFailed,

    fetchReviewsStart, fetchReviewsSuccess, fetchReviewsFailed,
    createReviewStart, createReviewSuccess, createReviewFailed, resetCreateReviewFlag,

    fetchFavoritesStart, fetchFavoritesSuccess, fetchFavoritesFailed,
    addFavoriteStart, addFavoriteSuccess, addFavoriteFailed,
    removeFavoriteStart, removeFavoriteSuccess, removeFavoriteFailed,

    fetchShowRequestsStart, fetchShowRequestsSuccess, fetchShowRequestsFailed,
    createShowRequestStart, createShowRequestSuccess, createShowRequestFailed, resetCreateShowRequestFlag,
    claimShowRequestStart, claimShowRequestSuccess, claimShowRequestFailed, resetClaimShowRequestFlag,
    completeShowRequestStart, completeShowRequestSuccess, completeShowRequestFailed, resetCompleteShowRequestFlag,

    fetchNotificationsStart, fetchNotificationsSuccess, fetchNotificationsFailed,
    markNotificationReadStart, markNotificationReadSuccess, markNotificationReadFailed,
    markAllNotificationsReadStart, markAllNotificationsReadSuccess, markAllNotificationsReadFailed,
    deleteNotificationStart, deleteNotificationSuccess, deleteNotificationFailed,

    createAttendanceStart, createAttendanceSuccess, createAttendanceFailed, resetCreateAttendanceFlag,

    forgotPasswordStart, forgotPasswordSuccess, forgotPasswordFailed, resetForgotPasswordFlag,
    changePasswordStart, changePasswordSuccess, changePasswordFailed, resetChangePasswordFlag
} = authSlice.actions;

export default authSlice.reducer;
