import { call, put, takeLatest, takeEvery } from "redux-saga/effects";
import axios from "axios";
import { baseUrl } from "../../../utils/ConfigUrl";

import {
    signupStart, signupSuccess, signupFailed,
    loginStart, loginSuccess, loginFailed,
    fetchProfileStart, fetchProfileSuccess, fetchProfileFailed,
    updateProfileStart, updateProfileSuccess, updateProfileFailed,
    fetchServiceTypesStart, fetchServiceTypesSuccess, fetchServiceTypesFailed,
    fetchOpenHousesStart, fetchOpenHousesSuccess, fetchOpenHousesFailed,
    createOpenHouseStart, createOpenHouseSuccess, createOpenHouseFailed,
    updateOpenHouseStart, updateOpenHouseSuccess, updateOpenHouseFailed,

    fetchQuotesStart, fetchQuotesSuccess, fetchQuotesFailed,
    fetchIncomingQuotesStart, fetchIncomingQuotesSuccess, fetchIncomingQuotesFailed,
    fetchQuoteDetailStart, fetchQuoteDetailSuccess, fetchQuoteDetailFailed,
    createQuoteStart, createQuoteSuccess, createQuoteFailed,
    updateQuoteStart, updateQuoteSuccess, updateQuoteFailed,
    updateQuoteResponseStart, updateQuoteResponseSuccess, updateQuoteResponseFailed,
    addQuoteResponseStart, addQuoteResponseSuccess, addQuoteResponseFailed,

    fetchConversationsStart, fetchConversationsSuccess, fetchConversationsFailed,
    fetchMessagesStart, fetchMessagesSuccess, fetchMessagesFailed,
    sendMessageStart, sendMessageSuccess, sendMessageFailed,

    fetchProjectsStart, fetchProjectsSuccess, fetchProjectsFailed,
    createProjectStart, createProjectSuccess, createProjectFailed,
    updateProjectStart, updateProjectSuccess, updateProjectFailed,

    fetchProvidersStart, fetchProvidersSuccess, fetchProvidersFailed,
    fetchProviderDetailStart, fetchProviderDetailSuccess, fetchProviderDetailFailed,

    fetchReviewsStart, fetchReviewsSuccess, fetchReviewsFailed,
    createReviewStart, createReviewSuccess, createReviewFailed,

    fetchFavoritesStart, fetchFavoritesSuccess, fetchFavoritesFailed,
    addFavoriteStart, addFavoriteSuccess, addFavoriteFailed,
    removeFavoriteStart, removeFavoriteSuccess, removeFavoriteFailed,

    fetchShowRequestsStart, fetchShowRequestsSuccess, fetchShowRequestsFailed,
    createShowRequestStart, createShowRequestSuccess, createShowRequestFailed,
    claimShowRequestStart, claimShowRequestSuccess, claimShowRequestFailed,
    completeShowRequestStart, completeShowRequestSuccess, completeShowRequestFailed,

    fetchNotificationsStart, fetchNotificationsSuccess, fetchNotificationsFailed,
    markNotificationReadStart, markNotificationReadSuccess, markNotificationReadFailed,
    markAllNotificationsReadStart, markAllNotificationsReadSuccess, markAllNotificationsReadFailed,
    deleteNotificationStart, deleteNotificationSuccess, deleteNotificationFailed,

    createAttendanceStart, createAttendanceSuccess, createAttendanceFailed,

    forgotPasswordStart, forgotPasswordSuccess, forgotPasswordFailed,
    changePasswordStart, changePasswordSuccess, changePasswordFailed,

    verifyEmailStart, verifyEmailSuccess, verifyEmailFailed,
    resendVerificationStart, resendVerificationSuccess, resendVerificationFailed,

    fetchAdminStatsStart, fetchAdminStatsSuccess, fetchAdminStatsFailed,
    fetchPendingApprovalsStart, fetchPendingApprovalsSuccess, fetchPendingApprovalsFailed,
    setApprovalStart, setApprovalSuccess, setApprovalFailed,

    submitContactStart, submitContactSuccess, submitContactFailed,
    fetchContactMessagesStart, fetchContactMessagesSuccess, fetchContactMessagesFailed,
    updateContactStatusStart, updateContactStatusSuccess, updateContactStatusFailed,
    deleteContactMessageStart, deleteContactMessageSuccess, deleteContactMessageFailed
} from "../../Features/Authentication/authslice";


const extractErrorMessage = (error, fallback) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

const isOk = (response) => response.status >= 200 && response.status < 300;

// A create/update payload may be a FormData (has file uploads) or a plain
// object. Pick the matching Content-Type so axios serialises it correctly.
const bodyHeaders = (payload) => ({
    headers: {
        'Content-Type': (typeof FormData !== 'undefined' && payload instanceof FormData)
            ? 'multipart/form-data'
            : 'application/json'
    }
});

const jsonHeaders = { headers: { 'Content-Type': 'application/json' } };


// ── Auth ────────────────────────────────────────────────────────────

function* signupSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/auth/register`, action.payload, jsonHeaders);
        if (isOk(response)) {
            yield put(signupSuccess(response.data));
        } else {
            yield put(signupFailed(response.data?.message || 'Signup failed'));
        }
    } catch (error) {
        yield put(signupFailed(extractErrorMessage(error, 'Signup failed')));
    }
}

// VerifyEmailPage hits this on mount with the token from the URL.
function* verifyEmailSaga(action) {
    try {
        const token = action.payload?.token || action.payload;
        const response = yield call(axios.get, `${baseUrl}/auth/verify-email/${token}`);
        if (response.status === 200) {
            yield put(verifyEmailSuccess(response.data));
        } else {
            yield put(verifyEmailFailed(response.data));
        }
    } catch (error) {
        // Forward the server's structured error so the UI can show the
        // "expired link" branch and offer a resend.
        const payload = error?.response?.data || { message: extractErrorMessage(error, 'Verification failed') };
        yield put(verifyEmailFailed(payload));
    }
}

function* resendVerificationSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/auth/resend-verification`, action.payload, jsonHeaders);
        if (response.status === 200) {
            yield put(resendVerificationSuccess(response.data));
        } else {
            yield put(resendVerificationFailed(response.data?.message || 'Could not resend verification email'));
        }
    } catch (error) {
        yield put(resendVerificationFailed(extractErrorMessage(error, 'Could not resend verification email')));
    }
}

// AdminDashboard pulls counts + recent activity from /api/admin/stats.
// Authorisation header is taken from localStorage (the same place LoginPage
// stores the JWT on successful login).
function* fetchAdminStatsSaga() {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const response = yield call(axios.get, `${baseUrl}/admin/stats`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        if (response.status === 200) {
            yield put(fetchAdminStatsSuccess(response.data));
        } else {
            yield put(fetchAdminStatsFailed(response.data?.message || 'Failed to load admin stats'));
        }
    } catch (error) {
        yield put(fetchAdminStatsFailed(extractErrorMessage(error, 'Failed to load admin stats')));
    }
}

// Pending provider/realtor approvals — admin only.
function* fetchPendingApprovalsSaga() {
    try {
        const response = yield call(axios.get, `${baseUrl}/admin/pending-approvals`, authHeaders());
        if (response.status === 200) {
            yield put(fetchPendingApprovalsSuccess(response.data));
        } else {
            yield put(fetchPendingApprovalsFailed(response.data?.message || 'Failed to load pending approvals'));
        }
    } catch (error) {
        yield put(fetchPendingApprovalsFailed(extractErrorMessage(error, 'Failed to load pending approvals')));
    }
}

function* setApprovalSaga(action) {
    try {
        const { id, status } = action.payload || {};
        const response = yield call(
            axios.put,
            `${baseUrl}/admin/users/${id}/approval`,
            { status },
            authHeaders()
        );
        if (response.status === 200) {
            yield put(setApprovalSuccess(response.data));
        } else {
            yield put(setApprovalFailed(response.data?.message || 'Failed to update approval'));
        }
    } catch (error) {
        yield put(setApprovalFailed(extractErrorMessage(error, 'Failed to update approval')));
    }
}

// ── Contact form (public submit) ────────────────────────────────────
function* submitContactSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/contact`, action.payload, jsonHeaders);
        if (isOk(response)) {
            yield put(submitContactSuccess(response.data));
        } else {
            yield put(submitContactFailed(response.data?.message || 'Failed to send message'));
        }
    } catch (error) {
        yield put(submitContactFailed(extractErrorMessage(error, 'Failed to send message')));
    }
}

const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return { headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' } };
};

function* fetchContactMessagesSaga() {
    try {
        const response = yield call(axios.get, `${baseUrl}/contact`, authHeaders());
        if (response.status === 200) {
            yield put(fetchContactMessagesSuccess(response.data));
        } else {
            yield put(fetchContactMessagesFailed(response.data?.message || 'Failed to load messages'));
        }
    } catch (error) {
        yield put(fetchContactMessagesFailed(extractErrorMessage(error, 'Failed to load messages')));
    }
}

function* updateContactStatusSaga(action) {
    try {
        const { id, status } = action.payload || {};
        const response = yield call(axios.put, `${baseUrl}/contact/${id}`, { status }, authHeaders());
        if (response.status === 200) {
            yield put(updateContactStatusSuccess(response.data));
        } else {
            yield put(updateContactStatusFailed(response.data?.message || 'Failed to update message'));
        }
    } catch (error) {
        yield put(updateContactStatusFailed(extractErrorMessage(error, 'Failed to update message')));
    }
}

function* deleteContactMessageSaga(action) {
    try {
        const id = action.payload?.id ?? action.payload;
        const response = yield call(axios.delete, `${baseUrl}/contact/${id}`, authHeaders());
        if (response.status === 200) {
            yield put(deleteContactMessageSuccess({ id }));
        } else {
            yield put(deleteContactMessageFailed(response.data?.message || 'Failed to delete message'));
        }
    } catch (error) {
        yield put(deleteContactMessageFailed(extractErrorMessage(error, 'Failed to delete message')));
    }
}

function* loginSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/auth/login`, action.payload, jsonHeaders);
        if (response.status === 200) {
            yield put(loginSuccess(response.data));
        } else {
            yield put(loginFailed(response.data?.message || 'Login failed'));
        }
    } catch (error) {
        yield put(loginFailed(extractErrorMessage(error, 'Login failed')));
    }
}

function* fetchProfileSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/profile/${action.payload}`);
        if (response.status === 200) {
            yield put(fetchProfileSuccess(response.data));
        } else {
            yield put(fetchProfileFailed(response.data?.message || 'Failed to load profile'));
        }
    } catch (error) {
        yield put(fetchProfileFailed(extractErrorMessage(error, 'Failed to load profile')));
    }
}

function* updateProfileSaga(action) {
    try {
        const { id, payload } = action.payload;
        const response = yield call(axios.put, `${baseUrl}/profile/${id}`, payload, jsonHeaders);
        if (response.status === 200) {
            yield put(updateProfileSuccess(response.data));
        } else {
            yield put(updateProfileFailed(response.data?.message || 'Failed to update profile'));
        }
    } catch (error) {
        yield put(updateProfileFailed(extractErrorMessage(error, 'Failed to update profile')));
    }
}

function* fetchServiceTypesSaga() {
    try {
        const response = yield call(axios.get, `${baseUrl}/service-types`);
        if (response.status === 200) {
            yield put(fetchServiceTypesSuccess(response.data));
        } else {
            yield put(fetchServiceTypesFailed(response.data?.message || 'Failed to load service types'));
        }
    } catch (error) {
        yield put(fetchServiceTypesFailed(extractErrorMessage(error, 'Failed to load service types')));
    }
}

function* forgotPasswordSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/auth/forgot-password`, action.payload, jsonHeaders);
        if (response.status === 200) {
            yield put(forgotPasswordSuccess(response.data));
        } else {
            yield put(forgotPasswordFailed(response.data?.message || 'Request failed'));
        }
    } catch (error) {
        yield put(forgotPasswordFailed(extractErrorMessage(error, 'Request failed')));
    }
}

function* changePasswordSaga(action) {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const response = yield call(
            axios.post,
            `${baseUrl}/auth/change-password`,
            action.payload,
            { headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' } }
        );
        if (response.status === 200) {
            yield put(changePasswordSuccess(response.data));
        } else {
            yield put(changePasswordFailed(response.data?.message || 'Failed to change password'));
        }
    } catch (error) {
        yield put(changePasswordFailed(extractErrorMessage(error, 'Failed to change password')));
    }
}


// ── Open Houses ─────────────────────────────────────────────────────

function* fetchOpenHousesSaga() {
    try {
        const response = yield call(axios.get, `${baseUrl}/open-houses`);
        if (response.status === 200) {
            yield put(fetchOpenHousesSuccess(response.data));
        } else {
            yield put(fetchOpenHousesFailed(response.data?.message || 'Failed to load open houses'));
        }
    } catch (error) {
        yield put(fetchOpenHousesFailed(extractErrorMessage(error, 'Failed to load open houses')));
    }
}

function* createOpenHouseSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/open-houses`, action.payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (isOk(response)) {
            yield put(createOpenHouseSuccess(response.data));
        } else {
            yield put(createOpenHouseFailed(response.data?.message || 'Failed to create open house'));
        }
    } catch (error) {
        yield put(createOpenHouseFailed(extractErrorMessage(error, 'Failed to create open house')));
    }
}

function* updateOpenHouseSaga(action) {
    try {
        const { id, payload } = action.payload;
        const response = yield call(axios.put, `${baseUrl}/open-houses/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.status === 200) {
            yield put(updateOpenHouseSuccess(response.data));
        } else {
            yield put(updateOpenHouseFailed(response.data?.message || 'Failed to update open house'));
        }
    } catch (error) {
        yield put(updateOpenHouseFailed(extractErrorMessage(error, 'Failed to update open house')));
    }
}

function* createAttendanceSaga(action) {
    try {
        const { openHouseId, payload } = action.payload;
        const response = yield call(axios.post, `${baseUrl}/open-houses/${openHouseId}/attendances`, payload, jsonHeaders);
        if (isOk(response)) {
            yield put(createAttendanceSuccess(response.data));
        } else {
            yield put(createAttendanceFailed(response.data?.message || 'Failed to register attendance'));
        }
    } catch (error) {
        yield put(createAttendanceFailed(extractErrorMessage(error, 'Failed to register attendance')));
    }
}


// ── Quotes ──────────────────────────────────────────────────────────

function* fetchQuotesSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/quotes`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchQuotesSuccess(response.data));
        } else {
            yield put(fetchQuotesFailed(response.data?.message || 'Failed to load quotes'));
        }
    } catch (error) {
        yield put(fetchQuotesFailed(extractErrorMessage(error, 'Failed to load quotes')));
    }
}

function* fetchIncomingQuotesSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/quotes`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchIncomingQuotesSuccess(response.data));
        } else {
            yield put(fetchIncomingQuotesFailed(response.data?.message || 'Failed to load requests'));
        }
    } catch (error) {
        yield put(fetchIncomingQuotesFailed(extractErrorMessage(error, 'Failed to load requests')));
    }
}

function* fetchQuoteDetailSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/quotes/${action.payload}`);
        if (response.status === 200) {
            yield put(fetchQuoteDetailSuccess(response.data));
        } else {
            yield put(fetchQuoteDetailFailed(response.data?.message || 'Failed to load request'));
        }
    } catch (error) {
        yield put(fetchQuoteDetailFailed(extractErrorMessage(error, 'Failed to load request')));
    }
}

function* createQuoteSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/quotes`, action.payload, bodyHeaders(action.payload));
        if (isOk(response)) {
            yield put(createQuoteSuccess(response.data));
        } else {
            yield put(createQuoteFailed(response.data?.message || 'Failed to submit quote'));
        }
    } catch (error) {
        yield put(createQuoteFailed(extractErrorMessage(error, 'Failed to submit quote')));
    }
}

function* addQuoteResponseSaga(action) {
    try {
        const { quoteId, payload } = action.payload;
        const response = yield call(axios.post, `${baseUrl}/quotes/${quoteId}/responses`, payload, jsonHeaders);
        if (isOk(response)) {
            yield put(addQuoteResponseSuccess(response.data));
        } else {
            yield put(addQuoteResponseFailed(response.data?.message || 'Failed to submit response'));
        }
    } catch (error) {
        yield put(addQuoteResponseFailed(extractErrorMessage(error, 'Failed to submit response')));
    }
}

function* updateQuoteSaga(action) {
    try {
        const { id, payload } = action.payload;
        const response = yield call(axios.put, `${baseUrl}/quotes/${id}`, payload, jsonHeaders);
        if (response.status === 200) {
            yield put(updateQuoteSuccess(response.data));
        } else {
            yield put(updateQuoteFailed(response.data?.message || 'Failed to update quote'));
        }
    } catch (error) {
        yield put(updateQuoteFailed(extractErrorMessage(error, 'Failed to update quote')));
    }
}

function* updateQuoteResponseSaga(action) {
    try {
        const { id, payload } = action.payload;
        const response = yield call(axios.put, `${baseUrl}/quote-responses/${id}`, payload, jsonHeaders);
        if (response.status === 200) {
            yield put(updateQuoteResponseSuccess(response.data));
        } else {
            yield put(updateQuoteResponseFailed(response.data?.message || 'Failed to update response'));
        }
    } catch (error) {
        yield put(updateQuoteResponseFailed(extractErrorMessage(error, 'Failed to update response')));
    }
}


// ── Messages ────────────────────────────────────────────────────────

function* fetchConversationsSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/messages/conversations`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchConversationsSuccess(response.data));
        } else {
            yield put(fetchConversationsFailed(response.data?.message || 'Failed to load conversations'));
        }
    } catch (error) {
        yield put(fetchConversationsFailed(extractErrorMessage(error, 'Failed to load conversations')));
    }
}

function* fetchMessagesSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/messages`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchMessagesSuccess(response.data));
        } else {
            yield put(fetchMessagesFailed(response.data?.message || 'Failed to load messages'));
        }
    } catch (error) {
        yield put(fetchMessagesFailed(extractErrorMessage(error, 'Failed to load messages')));
    }
}

function* sendMessageSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/messages`, action.payload, jsonHeaders);
        if (isOk(response)) {
            yield put(sendMessageSuccess(response.data));
        } else {
            yield put(sendMessageFailed(response.data?.message || 'Failed to send message'));
        }
    } catch (error) {
        yield put(sendMessageFailed(extractErrorMessage(error, 'Failed to send message')));
    }
}


// ── Projects ────────────────────────────────────────────────────────

function* fetchProjectsSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/projects`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchProjectsSuccess(response.data));
        } else {
            yield put(fetchProjectsFailed(response.data?.message || 'Failed to load projects'));
        }
    } catch (error) {
        yield put(fetchProjectsFailed(extractErrorMessage(error, 'Failed to load projects')));
    }
}

function* createProjectSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/projects`, action.payload, bodyHeaders(action.payload));
        if (isOk(response)) {
            yield put(createProjectSuccess(response.data));
        } else {
            yield put(createProjectFailed(response.data?.message || 'Failed to create project'));
        }
    } catch (error) {
        yield put(createProjectFailed(extractErrorMessage(error, 'Failed to create project')));
    }
}

function* updateProjectSaga(action) {
    try {
        const { id, payload } = action.payload;
        const response = yield call(axios.put, `${baseUrl}/projects/${id}`, payload, bodyHeaders(payload));
        if (response.status === 200) {
            yield put(updateProjectSuccess(response.data));
        } else {
            yield put(updateProjectFailed(response.data?.message || 'Failed to update project'));
        }
    } catch (error) {
        yield put(updateProjectFailed(extractErrorMessage(error, 'Failed to update project')));
    }
}


// ── Providers / Realtors listing ────────────────────────────────────

function* fetchProvidersSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/providers`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchProvidersSuccess(response.data));
        } else {
            yield put(fetchProvidersFailed(response.data?.message || 'Failed to load providers'));
        }
    } catch (error) {
        yield put(fetchProvidersFailed(extractErrorMessage(error, 'Failed to load providers')));
    }
}

function* fetchProviderDetailSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/providers/${action.payload}`);
        if (response.status === 200) {
            yield put(fetchProviderDetailSuccess(response.data));
        } else {
            yield put(fetchProviderDetailFailed(response.data?.message || 'Failed to load provider'));
        }
    } catch (error) {
        yield put(fetchProviderDetailFailed(extractErrorMessage(error, 'Failed to load provider')));
    }
}


// ── Reviews ─────────────────────────────────────────────────────────

function* fetchReviewsSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/reviews`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchReviewsSuccess(response.data));
        } else {
            yield put(fetchReviewsFailed(response.data?.message || 'Failed to load reviews'));
        }
    } catch (error) {
        yield put(fetchReviewsFailed(extractErrorMessage(error, 'Failed to load reviews')));
    }
}

function* createReviewSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/reviews`, action.payload, jsonHeaders);
        if (isOk(response)) {
            yield put(createReviewSuccess(response.data));
        } else {
            yield put(createReviewFailed(response.data?.message || 'Failed to submit review'));
        }
    } catch (error) {
        yield put(createReviewFailed(extractErrorMessage(error, 'Failed to submit review')));
    }
}


// ── Favorites ───────────────────────────────────────────────────────

function* fetchFavoritesSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/favorites`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchFavoritesSuccess(response.data));
        } else {
            yield put(fetchFavoritesFailed(response.data?.message || 'Failed to load favorites'));
        }
    } catch (error) {
        yield put(fetchFavoritesFailed(extractErrorMessage(error, 'Failed to load favorites')));
    }
}

function* addFavoriteSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/favorites`, action.payload, jsonHeaders);
        if (isOk(response)) {
            yield put(addFavoriteSuccess(response.data));
        } else {
            yield put(addFavoriteFailed(response.data?.message || 'Failed to add favorite'));
        }
    } catch (error) {
        yield put(addFavoriteFailed(extractErrorMessage(error, 'Failed to add favorite')));
    }
}

function* removeFavoriteSaga(action) {
    try {
        const id = action.payload;
        const response = yield call(axios.delete, `${baseUrl}/favorites/${id}`);
        if (isOk(response)) {
            yield put(removeFavoriteSuccess(id));
        } else {
            yield put(removeFavoriteFailed(response.data?.message || 'Failed to remove favorite'));
        }
    } catch (error) {
        yield put(removeFavoriteFailed(extractErrorMessage(error, 'Failed to remove favorite')));
    }
}


// ── Show My Property ────────────────────────────────────────────────

function* fetchShowRequestsSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/show-my-property`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchShowRequestsSuccess(response.data));
        } else {
            yield put(fetchShowRequestsFailed(response.data?.message || 'Failed to load requests'));
        }
    } catch (error) {
        yield put(fetchShowRequestsFailed(extractErrorMessage(error, 'Failed to load requests')));
    }
}

function* createShowRequestSaga(action) {
    try {
        const response = yield call(axios.post, `${baseUrl}/show-my-property`, action.payload, bodyHeaders(action.payload));
        if (isOk(response)) {
            yield put(createShowRequestSuccess(response.data));
        } else {
            yield put(createShowRequestFailed(response.data?.message || 'Failed to create request'));
        }
    } catch (error) {
        yield put(createShowRequestFailed(extractErrorMessage(error, 'Failed to create request')));
    }
}

// Realtor claims an unassigned listing. Payload: { id, agentId }.
function* claimShowRequestSaga(action) {
    try {
        const { id, agentId } = action.payload || {};
        const response = yield call(
            axios.post,
            `${baseUrl}/show-my-property/${id}/claim`,
            { agentId },
            jsonHeaders
        );
        if (isOk(response)) {
            yield put(claimShowRequestSuccess(response.data));
        } else {
            yield put(claimShowRequestFailed(response.data?.message || 'Failed to claim showing'));
        }
    } catch (error) {
        yield put(claimShowRequestFailed(extractErrorMessage(error, 'Failed to claim showing')));
    }
}

// Realtor marks their assigned showing complete. Payload: { id, agentId }.
function* completeShowRequestSaga(action) {
    try {
        const { id, agentId } = action.payload || {};
        const response = yield call(
            axios.put,
            `${baseUrl}/show-my-property/${id}/complete`,
            { agentId },
            jsonHeaders
        );
        if (isOk(response)) {
            yield put(completeShowRequestSuccess(response.data));
        } else {
            yield put(completeShowRequestFailed(response.data?.message || 'Failed to complete showing'));
        }
    } catch (error) {
        yield put(completeShowRequestFailed(extractErrorMessage(error, 'Failed to complete showing')));
    }
}


// ── Notifications ───────────────────────────────────────────────────

function* fetchNotificationsSaga(action) {
    try {
        const response = yield call(axios.get, `${baseUrl}/notifications`, { params: action.payload || {} });
        if (response.status === 200) {
            yield put(fetchNotificationsSuccess(response.data));
        } else {
            yield put(fetchNotificationsFailed(response.data?.message || 'Failed to load notifications'));
        }
    } catch (error) {
        yield put(fetchNotificationsFailed(extractErrorMessage(error, 'Failed to load notifications')));
    }
}

function* markNotificationReadSaga(action) {
    try {
        const id = action.payload;
        const response = yield call(axios.put, `${baseUrl}/notifications/${id}/read`, {}, jsonHeaders);
        if (response.status === 200) {
            yield put(markNotificationReadSuccess(id));
        } else {
            yield put(markNotificationReadFailed(response.data?.message || 'Failed'));
        }
    } catch (error) {
        yield put(markNotificationReadFailed(extractErrorMessage(error, 'Failed')));
    }
}

function* markAllNotificationsReadSaga(action) {
    try {
        const response = yield call(axios.put, `${baseUrl}/notifications/read-all`, { userId: action.payload }, jsonHeaders);
        if (response.status === 200) {
            yield put(markAllNotificationsReadSuccess());
        } else {
            yield put(markAllNotificationsReadFailed(response.data?.message || 'Failed'));
        }
    } catch (error) {
        yield put(markAllNotificationsReadFailed(extractErrorMessage(error, 'Failed')));
    }
}

function* deleteNotificationSaga(action) {
    try {
        const id = action.payload;
        const response = yield call(axios.delete, `${baseUrl}/notifications/${id}`);
        if (isOk(response)) {
            yield put(deleteNotificationSuccess(id));
        } else {
            yield put(deleteNotificationFailed(response.data?.message || 'Failed to delete notification'));
        }
    } catch (error) {
        yield put(deleteNotificationFailed(extractErrorMessage(error, 'Failed to delete notification')));
    }
}


function* watchAuth() {
    yield takeLatest(signupStart.type, signupSaga);
    yield takeLatest(loginStart.type, loginSaga);
    yield takeLatest(fetchProfileStart.type, fetchProfileSaga);
    yield takeLatest(updateProfileStart.type, updateProfileSaga);
    yield takeLatest(fetchServiceTypesStart.type, fetchServiceTypesSaga);
    yield takeLatest(forgotPasswordStart.type, forgotPasswordSaga);
    yield takeLatest(changePasswordStart.type, changePasswordSaga);
    yield takeLatest(verifyEmailStart.type, verifyEmailSaga);
    yield takeLatest(resendVerificationStart.type, resendVerificationSaga);
    yield takeLatest(fetchAdminStatsStart.type, fetchAdminStatsSaga);
    yield takeLatest(fetchPendingApprovalsStart.type, fetchPendingApprovalsSaga);
    yield takeEvery(setApprovalStart.type, setApprovalSaga);
    yield takeLatest(submitContactStart.type, submitContactSaga);
    yield takeLatest(fetchContactMessagesStart.type, fetchContactMessagesSaga);
    yield takeLatest(updateContactStatusStart.type, updateContactStatusSaga);
    yield takeLatest(deleteContactMessageStart.type, deleteContactMessageSaga);

    yield takeLatest(fetchOpenHousesStart.type, fetchOpenHousesSaga);
    yield takeLatest(createOpenHouseStart.type, createOpenHouseSaga);
    yield takeLatest(updateOpenHouseStart.type, updateOpenHouseSaga);
    yield takeLatest(createAttendanceStart.type, createAttendanceSaga);

    yield takeLatest(fetchQuotesStart.type, fetchQuotesSaga);
    yield takeLatest(fetchIncomingQuotesStart.type, fetchIncomingQuotesSaga);
    yield takeLatest(fetchQuoteDetailStart.type, fetchQuoteDetailSaga);
    yield takeLatest(createQuoteStart.type, createQuoteSaga);
    yield takeLatest(addQuoteResponseStart.type, addQuoteResponseSaga);
    yield takeLatest(updateQuoteStart.type, updateQuoteSaga);
    yield takeLatest(updateQuoteResponseStart.type, updateQuoteResponseSaga);

    yield takeLatest(fetchConversationsStart.type, fetchConversationsSaga);
    yield takeLatest(fetchMessagesStart.type, fetchMessagesSaga);
    yield takeLatest(sendMessageStart.type, sendMessageSaga);

    yield takeLatest(fetchProjectsStart.type, fetchProjectsSaga);
    yield takeLatest(createProjectStart.type, createProjectSaga);
    yield takeLatest(updateProjectStart.type, updateProjectSaga);

    yield takeLatest(fetchProvidersStart.type, fetchProvidersSaga);
    yield takeLatest(fetchProviderDetailStart.type, fetchProviderDetailSaga);

    yield takeLatest(fetchReviewsStart.type, fetchReviewsSaga);
    yield takeLatest(createReviewStart.type, createReviewSaga);

    yield takeLatest(fetchFavoritesStart.type, fetchFavoritesSaga);
    yield takeLatest(addFavoriteStart.type, addFavoriteSaga);
    yield takeLatest(removeFavoriteStart.type, removeFavoriteSaga);

    yield takeLatest(fetchShowRequestsStart.type, fetchShowRequestsSaga);
    yield takeLatest(createShowRequestStart.type, createShowRequestSaga);
    yield takeLatest(claimShowRequestStart.type, claimShowRequestSaga);
    yield takeLatest(completeShowRequestStart.type, completeShowRequestSaga);

    yield takeLatest(fetchNotificationsStart.type, fetchNotificationsSaga);
    yield takeLatest(markNotificationReadStart.type, markNotificationReadSaga);
    yield takeLatest(markAllNotificationsReadStart.type, markAllNotificationsReadSaga);
    yield takeEvery(deleteNotificationStart.type, deleteNotificationSaga);
}

export default watchAuth;
