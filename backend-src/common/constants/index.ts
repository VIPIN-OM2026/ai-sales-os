export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

export const JWT_STRATEGY = 'jwt';
export const LOCAL_STRATEGY = 'local';

export const QUEUE_NAMES = {
  WORKFLOW: 'workflow-engine',
  EMAIL: 'email-sender',
  WHATSAPP: 'whatsapp-sender',
  AI_SCORING: 'ai-scoring',
  REMINDERS: 'reminders',
};

export const CACHE_TTL = {
  SHORT: 60,         // 1 min
  MEDIUM: 300,       // 5 min
  LONG: 3600,        // 1 hour
  DAY: 86400,        // 24 hours
};

export const WORKFLOW_EVENTS = {
  LEAD_CREATED: 'lead.created',
  LEAD_STAGE_CHANGED: 'lead.stage_changed',
  LEAD_ASSIGNED: 'lead.assigned',
  INVOICE_DUE: 'invoice.due',
  APPOINTMENT_UPCOMING: 'appointment.upcoming',
};
