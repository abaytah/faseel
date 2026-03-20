import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

// Initialize only if token is available
let isInitialized = false;

export const analytics = {
  init: () => {
    if (MIXPANEL_TOKEN && !isInitialized) {
      mixpanel.init(MIXPANEL_TOKEN, {
        track_pageview: true,
        persistence: 'localStorage',
      });
      isInitialized = true;
    }
  },

  track: (event: string, props?: Record<string, unknown>) => {
    if (!isInitialized) return;
    mixpanel.track(event, {
      ...props,
      timestamp: new Date().toISOString(),
    });
  },

  identify: (userId: string) => {
    if (!isInitialized) return;
    mixpanel.identify(userId);
  },

  setUserProps: (props: Record<string, unknown>) => {
    if (!isInitialized) return;
    mixpanel.people.set(props);
  },

  reset: () => {
    if (!isInitialized) return;
    mixpanel.reset();
  },

  trackPageView: (pageName: string, props?: Record<string, unknown>) => {
    if (!isInitialized) return;
    mixpanel.track('page_viewed', { page: pageName, ...props });
  },
};

// Pre-defined event names (snake_case, past tense)
export const EVENTS = {
  // Auth
  LOGIN_PAGE_VIEWED: 'login_page_viewed',
  OTP_REQUESTED: 'otp_requested',
  OTP_VERIFIED: 'otp_verified',
  OTP_FAILED: 'otp_failed',
  ROLE_SELECTED: 'role_selected',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGGED_OUT: 'logged_out',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  BUILDING_CREATED: 'building_created',
  UNIT_ADDED: 'unit_added',
  TENANT_INVITED: 'tenant_invited',
  ONBOARDING_COMPLETED: 'onboarding_completed',

  // Requests
  REQUEST_FORM_VIEWED: 'request_form_viewed',
  REQUEST_STARTED: 'request_started',
  REQUEST_SUBMITTED: 'request_submitted',
  REQUEST_STATUS_CHANGED: 'request_status_changed',
  REQUEST_COMPLETED: 'request_completed',
  REQUEST_RATED: 'request_rated',

  // Providers
  PROVIDER_ASSIGNED: 'provider_assigned',
  PROVIDER_LINKED: 'provider_linked',
  PROVIDER_PROFILE_VIEWED: 'provider_profile_viewed',

  // Upgrade/Payment
  PRICING_VIEWED: 'pricing_viewed',
  PLAN_SELECTED: 'plan_selected',
  CHECKOUT_STARTED: 'checkout_started',
  PAYMENT_COMPLETED: 'payment_completed',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',

  // Navigation
  DASHBOARD_VIEWED: 'dashboard_viewed',
  BUILDINGS_LIST_VIEWED: 'buildings_list_viewed',
  BUILDING_DETAIL_VIEWED: 'building_detail_viewed',
  REQUESTS_LIST_VIEWED: 'requests_list_viewed',
  REQUEST_DETAIL_VIEWED: 'request_detail_viewed',
  PROVIDERS_LIST_VIEWED: 'providers_list_viewed',
  REPORTS_VIEWED: 'reports_viewed',

  // Engagement
  LANGUAGE_CHANGED: 'language_changed',
  THEME_CHANGED: 'theme_changed',
  ANNOUNCEMENT_VIEWED: 'announcement_viewed',
  NOTIFICATION_CLICKED: 'notification_clicked',
  WHATSAPP_BUTTON_CLICKED: 'whatsapp_button_clicked',
} as const;
